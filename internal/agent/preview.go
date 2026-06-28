package agent

import (
	"encoding/json"
	"regexp"
	"strings"
)

var reTransientUserBlock = regexp.MustCompile(`(?s)^\s*<(?:reasoning-language|memory-update|background-jobs|memory-compiler-execution)>.*?</(?:reasoning-language|memory-update|background-jobs|memory-compiler-execution)>\s*\n?`)
var reMemoryCompilerExecutionBlock = regexp.MustCompile(`(?s)^\s*<memory-compiler-execution>\s*(.*?)\s*</memory-compiler-execution>`)

// StripTransientUserBlocks removes controller-injected transient XML blocks
// from persisted user messages before deriving display text, previews, or
// titles. The blocks are sent in user turns so they never affect the stable
// prompt prefix, but they should not become user-facing text later.
func StripTransientUserBlocks(content string) string {
	s := content
	for {
		next := reTransientUserBlock.ReplaceAllStringFunc(s, func(string) string {
			return ""
		})
		if next == s {
			break
		}
		s = next
	}
	return strings.TrimLeft(s, " \t\r\n")
}

func memoryCompilerSourceEvent(content string) (string, bool) {
	match := reMemoryCompilerExecutionBlock.FindStringSubmatch(content)
	if len(match) != 2 {
		return "", false
	}
	var payload struct {
		PlannerIR struct {
			SourceEvent string `json:"source_event"`
		} `json:"planner_ir"`
	}
	if err := json.Unmarshal([]byte(match[1]), &payload); err != nil {
		return "", false
	}
	source := strings.TrimSpace(payload.PlannerIR.SourceEvent)
	if source == "" {
		return "", false
	}
	return source, true
}

// UserPreviewText returns the user-authored part of a persisted user message.
func UserPreviewText(content string) string {
	if source, ok := memoryCompilerSourceEvent(content); ok {
		content = source
	}
	s := StripTransientUserBlocks(content)
	s = HandoffTask(s)
	if source, ok := memoryCompilerSourceEvent(s); ok {
		s = source
	}
	s = StripTransientUserBlocks(s)
	return strings.TrimSpace(s)
}
