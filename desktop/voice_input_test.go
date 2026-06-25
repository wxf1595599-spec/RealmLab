package main

import (
	"context"
	"encoding/base64"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"reasonix/internal/config"
)

func TestSelectVoiceTranscriptionTargetPrefersConfiguredASRModel(t *testing.T) {
	cfg := config.Default()
	cfg.Desktop.ProviderAccess = []string{"chat", "speech"}
	cfg.Providers = []config.ProviderEntry{
		{
			Name:    "chat",
			Kind:    "openai",
			BaseURL: "http://127.0.0.1:65531/v1",
			Models:  []string{"deepseek-v4-flash"},
		},
		{
			Name:    "speech",
			Kind:    "openai",
			BaseURL: "http://127.0.0.1:65532/v1",
			Models:  []string{"mimo-v2.5-pro", "mimo-v2.5-asr"},
		},
	}

	target, ok := selectVoiceTranscriptionTarget(cfg)
	if !ok {
		t.Fatal("selectVoiceTranscriptionTarget returned no target")
	}
	if target.Provider != "speech" || target.Model != "mimo-v2.5-asr" {
		t.Fatalf("target = %+v, want speech/mimo-v2.5-asr", target)
	}
}

func TestTranscribeVoiceInputPostsOpenAICompatibleMultipart(t *testing.T) {
	var sawRequest bool
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sawRequest = true
		if r.URL.Path != "/v1/audio/transcriptions" {
			t.Errorf("path = %q, want /v1/audio/transcriptions", r.URL.Path)
		}
		if got := r.Header.Get("Authorization"); got != "Bearer test-key" {
			t.Errorf("Authorization = %q, want bearer key", got)
		}
		if err := r.ParseMultipartForm(4 << 20); err != nil {
			t.Errorf("ParseMultipartForm: %v", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if got := r.FormValue("model"); got != "mimo-v2.5-asr" {
			t.Errorf("model = %q, want mimo-v2.5-asr", got)
		}
		if got := r.FormValue("language"); got != "zh" {
			t.Errorf("language = %q, want zh", got)
		}
		file, header, err := r.FormFile("file")
		if err != nil {
			t.Errorf("FormFile: %v", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		defer file.Close()
		if !strings.HasSuffix(header.Filename, ".webm") {
			t.Errorf("filename = %q, want .webm", header.Filename)
		}
		body, _ := io.ReadAll(file)
		if string(body) != "voice-bytes" {
			t.Errorf("file body = %q, want voice-bytes", string(body))
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"text":"你好，MicroRealm Lab"}`))
	}))
	defer srv.Close()

	audio := "data:audio/webm;base64," + base64.StdEncoding.EncodeToString([]byte("voice-bytes"))
	result, err := transcribeVoiceInputDataURL(context.Background(), srv.Client(), voiceTranscriptionTarget{
		Provider: "speech",
		BaseURL:  srv.URL + "/v1",
		Model:    "mimo-v2.5-asr",
		APIKey:   "test-key",
	}, VoiceInputRequest{DataURL: audio, MimeType: "audio/webm", Locale: "zh-CN"})
	if err != nil {
		t.Fatalf("transcribeVoiceInputDataURL: %v", err)
	}
	if !sawRequest {
		t.Fatal("server did not receive transcription request")
	}
	if result.Text != "你好，MicroRealm Lab" {
		t.Fatalf("transcript = %q, want 你好，MicroRealm Lab", result.Text)
	}
}
