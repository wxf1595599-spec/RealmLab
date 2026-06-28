package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestCleanSummaryTitle(t *testing.T) {
	cases := []struct{ in, want string }{
		{"  合肥今日天气查询  ", "合肥今日天气查询"},
		{`"Weather in Hefei"`, "Weather in Hefei"},
		{"合肥今日天气查询。", "合肥今日天气查询"},
		{"晴天\n（备注：仅供参考）", "晴天"},
		{"Project   setup   help", "Project setup help"},
		{"「修复登录问题」", "修复登录问题"},
		{"", ""},
	}
	for _, c := range cases {
		if got := cleanSummaryTitle(c.in); got != c.want {
			t.Errorf("cleanSummaryTitle(%q) = %q, want %q", c.in, got, c.want)
		}
	}
}

func TestCleanSummaryTitleCapsLength(t *testing.T) {
	long := strings.Repeat("标", 40)
	got := cleanSummaryTitle(long)
	if n := len([]rune(got)); n != 24 {
		t.Fatalf("expected 24 runes after cap, got %d", n)
	}
}

func TestFirstExchangeForTitle(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "session.jsonl")
	lines := []string{
		`{"role":"system","content":"you are an assistant"}`,
		`{"role":"user","content":"你好啊，今天合肥天气怎么样"}`,
		`{"role":"assistant","content":""}`,
		`{"role":"assistant","content":"合肥今天天气不错——晴天，气温约 26℃。"}`,
		`{"role":"user","content":"那适合出门吗"}`,
	}
	if err := os.WriteFile(path, []byte(strings.Join(lines, "\n")+"\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	user, assistant := firstExchangeForTitle(path)
	if !strings.Contains(user, "合肥天气") {
		t.Errorf("user text = %q, want it to contain the first question", user)
	}
	if !strings.HasPrefix(assistant, "合肥今天天气不错") {
		t.Errorf("assistant text = %q, want the first non-empty assistant reply", assistant)
	}
}

func TestFirstExchangeForTitleNoAssistant(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "session.jsonl")
	lines := []string{
		`{"role":"user","content":"你好啊，今天合肥天气怎么样"}`,
	}
	if err := os.WriteFile(path, []byte(strings.Join(lines, "\n")+"\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	user, assistant := firstExchangeForTitle(path)
	if user == "" {
		t.Error("expected non-empty user text")
	}
	if assistant != "" {
		t.Errorf("expected empty assistant text when no reply yet, got %q", assistant)
	}
}
