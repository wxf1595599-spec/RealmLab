package main

import (
	"context"
	"encoding/json"
	"os"
	"strings"
	"time"

	"reasonix/internal/agent"
	"reasonix/internal/config"
	"reasonix/internal/control"
	"reasonix/internal/provider"
)

// topicTitleSummaryPrompt asks a lightweight model to summarize the opening
// exchange of a conversation into a short title. It must stay language-neutral
// so a Chinese chat gets a Chinese title.
const topicTitleSummaryPrompt = `Write a very short title (3-5 words) that summarizes what this conversation is about, based on the user's question and the assistant's answer. Reply with ONLY the title — no quotes, no trailing punctuation — in the same language as the conversation.`

// maybeSummarizeTopicTitle upgrades a truncated auto topic title to a
// flash-model summary of the opening exchange, once, asynchronously.
//
// It is a no-op unless the title is still auto-sourced and a complete first
// exchange (user question + assistant answer) exists. A successful summary is
// persisted under topicTitleSourceAutoSummary so it is frozen against the
// truncation path on later saves and restarts. Manual renames are never
// overwritten; any failure leaves the truncated title in place.
func (a *App) maybeSummarizeTopicTitle(titleRoot, topicID, sessionPath string) {
	topicID = strings.TrimSpace(topicID)
	if topicID == "" || strings.TrimSpace(sessionPath) == "" {
		return
	}
	key := titleRoot + "\x00" + topicID

	a.titleSumMu.Lock()
	if a.titleSumInflight == nil {
		a.titleSumInflight = map[string]bool{}
	}
	inflight := a.titleSumInflight[key]
	a.titleSumMu.Unlock()
	if inflight {
		return
	}
	if loadTopicTitleSource(titleRoot, topicID) != topicTitleSourceAuto {
		return // manual rename or already summarized — frozen
	}
	userText, assistantText := firstExchangeForTitle(sessionPath)
	if userText == "" || assistantText == "" {
		return // no complete first exchange yet
	}

	a.titleSumMu.Lock()
	if a.titleSumInflight[key] {
		a.titleSumMu.Unlock()
		return
	}
	a.titleSumInflight[key] = true
	a.titleSumMu.Unlock()

	go func() {
		defer func() {
			a.titleSumMu.Lock()
			delete(a.titleSumInflight, key)
			a.titleSumMu.Unlock()
		}()
		prov := titleSummaryProvider()
		if prov == nil {
			return
		}
		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()
		title := generateSummaryTitle(ctx, prov, userText, assistantText)
		if title == "" {
			return
		}
		// Re-check: the user may have renamed the topic while we summarized.
		if loadTopicTitleSource(titleRoot, topicID) != topicTitleSourceAuto {
			return
		}
		if title == loadTopicTitle(titleRoot, topicID) {
			return
		}
		if err := setTopicTitleWithSource(titleRoot, topicID, title, topicTitleSourceAutoSummary); err != nil {
			return
		}
		a.updateOpenTopicTitle(topicID, title)
		a.updateTopicSessionTitles(topicID, title)
		a.emitProjectTreeChanged()
	}()
}

// firstExchangeForTitle reads the first user message and the first non-empty
// assistant reply from a saved session file. Either may be empty if absent.
func firstExchangeForTitle(path string) (userText, assistantText string) {
	f, err := os.Open(path)
	if err != nil {
		return "", ""
	}
	defer f.Close()
	dec := json.NewDecoder(f)
	for {
		var msg struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		}
		if err := dec.Decode(&msg); err != nil {
			break
		}
		switch msg.Role {
		case "user":
			if userText == "" {
				userText = topicTitleCleanUser(msg.Content)
			}
		case "assistant":
			if assistantText == "" {
				assistantText = strings.TrimSpace(msg.Content)
			}
		}
		if userText != "" && assistantText != "" {
			break
		}
	}
	return userText, assistantText
}

func topicTitleCleanUser(content string) string {
	content = agent.UserPreviewText(content)
	content = control.StripComposePrefixes(content)
	content = control.StripReferencedContextPrefix(content)
	return strings.TrimSpace(content)
}

// titleSummaryProvider builds the lightweight flash provider used solely for
// session-title summarization. Returns nil when unavailable — callers fall back
// to the truncated first-message title. Mirrors the serve frontend's
// initTitleProvider so both frontends use the same lightweight model.
func titleSummaryProvider() provider.Provider {
	cfg, err := config.Load()
	if err != nil {
		return nil
	}
	entry, ok := cfg.ResolveModel("deepseek-flash")
	if !ok {
		return nil
	}
	prov, err := provider.New(entry.Kind, provider.Config{
		Name:    entry.Name,
		BaseURL: entry.BaseURL,
		Model:   entry.Model,
		APIKey:  entry.APIKey(),
		Extra:   map[string]any{"effort": "off"},
	})
	if err != nil {
		return nil
	}
	return prov
}

// generateSummaryTitle asks the model for a short title summarizing the opening
// exchange. Returns "" on any error.
func generateSummaryTitle(ctx context.Context, prov provider.Provider, userText, assistantText string) string {
	if prov == nil {
		return ""
	}
	body := "User: " + clampTitleInput(userText, 400) + "\nAssistant: " + clampTitleInput(assistantText, 600)
	ch, err := prov.Stream(ctx, provider.Request{
		Messages: []provider.Message{
			{Role: provider.RoleSystem, Content: topicTitleSummaryPrompt},
			{Role: provider.RoleUser, Content: body},
		},
		Temperature: 0,
		MaxTokens:   24,
	})
	if err != nil {
		return ""
	}
	var b strings.Builder
	for chunk := range ch {
		switch chunk.Type {
		case provider.ChunkText:
			b.WriteString(chunk.Text)
		case provider.ChunkError:
			return ""
		}
	}
	return cleanSummaryTitle(b.String())
}

func clampTitleInput(s string, n int) string {
	r := []rune(strings.TrimSpace(s))
	if len(r) > n {
		return string(r[:n])
	}
	return string(r)
}

// cleanSummaryTitle normalizes a model title reply: first line only, collapsed
// whitespace, stripped wrapping quotes/punctuation, capped length.
func cleanSummaryTitle(raw string) string {
	t := strings.TrimSpace(raw)
	if i := strings.IndexAny(t, "\r\n"); i >= 0 {
		t = strings.TrimSpace(t[:i])
	}
	t = strings.Join(strings.Fields(t), " ")
	t = strings.Trim(t, " \t`\"'“”‘’「」『』《》()（）[]【】.。!！?？;；:：,，、")
	const maxRunes = 24
	if r := []rune(t); len(r) > maxRunes {
		t = strings.TrimSpace(string(r[:maxRunes]))
	}
	return t
}
