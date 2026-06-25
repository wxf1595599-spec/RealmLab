package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/textproto"
	"path/filepath"
	"strings"
	"time"

	"reasonix/internal/config"
	"reasonix/internal/netclient"
)

const voiceInputMaxBytes = 32 << 20

// VoiceInputRequest is sent by the desktop composer after recording microphone
// audio in the webview. The backend owns transcription so macOS, Windows, and
// Linux use the same provider contract instead of relying on Web Speech support.
type VoiceInputRequest struct {
	DataURL  string `json:"dataUrl"`
	MimeType string `json:"mimeType"`
	Locale   string `json:"locale"`
}

type VoiceInputResult struct {
	Text     string `json:"text"`
	Provider string `json:"provider,omitempty"`
	Model    string `json:"model,omitempty"`
}

type VoiceInputCapabilities struct {
	TranscriptionConfigured bool   `json:"transcriptionConfigured"`
	Provider                string `json:"provider,omitempty"`
	Model                   string `json:"model,omitempty"`
}

type voiceTranscriptionTarget struct {
	Provider string
	BaseURL  string
	Model    string
	APIKey   string
}

// VoiceInputCapabilities reports whether the current workspace has a configured
// ASR/Whisper transcription target. The frontend uses this to avoid preferring
// recorded-audio transcription over Web Speech when no backend ASR exists.
func (a *App) VoiceInputCapabilities() VoiceInputCapabilities {
	cfg, err := config.LoadForRoot(a.activeWorkspaceRoot())
	if err != nil {
		return VoiceInputCapabilities{}
	}
	target, ok := selectVoiceTranscriptionTarget(cfg)
	if !ok {
		return VoiceInputCapabilities{}
	}
	return VoiceInputCapabilities{TranscriptionConfigured: true, Provider: target.Provider, Model: target.Model}
}

// TranscribeVoiceInput transcribes recorded composer audio through a configured
// OpenAI-compatible ASR provider.
func (a *App) TranscribeVoiceInput(input VoiceInputRequest) (VoiceInputResult, error) {
	root := a.activeWorkspaceRoot()
	cfg, err := config.LoadForRoot(root)
	if err != nil {
		return VoiceInputResult{}, err
	}
	target, ok := selectVoiceTranscriptionTarget(cfg)
	if !ok {
		return VoiceInputResult{}, errors.New("no configured voice transcription provider; add an ASR/Whisper provider such as MiMo mimo-v2.5-asr or OpenAI whisper-1")
	}
	client, err := netclient.NewHTTPClient(cfg.NetworkProxySpec(), netclient.TransportOptions{
		DialTimeout:           30 * time.Second,
		TLSHandshakeTimeout:   20 * time.Second,
		ResponseHeaderTimeout: 120 * time.Second,
	})
	if err != nil {
		return VoiceInputResult{}, err
	}
	ctx := a.bootContext()
	if ctx == nil {
		ctx = context.Background()
	}
	ctx, cancel := context.WithTimeout(ctx, 2*time.Minute)
	defer cancel()
	return transcribeVoiceInputDataURL(ctx, client, target, input)
}

func selectVoiceTranscriptionTarget(cfg *config.Config) (voiceTranscriptionTarget, bool) {
	if cfg == nil {
		return voiceTranscriptionTarget{}, false
	}
	access := providerAccessSet(cfg.Desktop.ProviderAccess)
	for i := range cfg.Providers {
		p := &cfg.Providers[i]
		if !voiceTranscriptionProviderUsable(p, access) {
			continue
		}
		for _, model := range p.ModelList() {
			if isLikelyVoiceTranscriptionModel(model) {
				return voiceTranscriptionTarget{Provider: p.Name, BaseURL: p.BaseURL, Model: strings.TrimSpace(model), APIKey: p.APIKey()}, true
			}
		}
	}
	for i := range cfg.Providers {
		p := &cfg.Providers[i]
		if !voiceTranscriptionProviderUsable(p, access) {
			continue
		}
		if model := defaultVoiceTranscriptionModel(p); model != "" {
			return voiceTranscriptionTarget{Provider: p.Name, BaseURL: p.BaseURL, Model: model, APIKey: p.APIKey()}, true
		}
	}
	return voiceTranscriptionTarget{}, false
}

func voiceTranscriptionProviderUsable(p *config.ProviderEntry, access map[string]bool) bool {
	return p != nil &&
		strings.EqualFold(strings.TrimSpace(p.Kind), "openai") &&
		strings.TrimSpace(p.BaseURL) != "" &&
		modelProviderAccessAllowed(access, p.Name) &&
		p.Configured()
}

func defaultVoiceTranscriptionModel(p *config.ProviderEntry) string {
	host := officialProviderHost(p.BaseURL)
	switch host {
	case "api.xiaomimimo.com", "token-plan-cn.xiaomimimo.com":
		return "mimo-v2.5-asr"
	case "api.openai.com":
		return "whisper-1"
	default:
		return ""
	}
}

func isLikelyVoiceTranscriptionModel(model string) bool {
	lower := strings.ToLower(strings.TrimSpace(model))
	if lower == "" {
		return false
	}
	if strings.Contains(lower, "speech-to-text") || strings.Contains(lower, "transcription") {
		return true
	}
	tokens := strings.FieldsFunc(lower, func(r rune) bool {
		return r == '-' || r == '_' || r == '.' || r == '/' || r == ':'
	})
	for _, token := range tokens {
		switch token {
		case "asr", "stt", "whisper", "transcribe", "transcriptions":
			return true
		}
	}
	return false
}

func transcribeVoiceInputDataURL(ctx context.Context, client *http.Client, target voiceTranscriptionTarget, input VoiceInputRequest) (VoiceInputResult, error) {
	if client == nil {
		client = http.DefaultClient
	}
	audio, mediaType, err := decodeVoiceInputDataURL(input.DataURL)
	if err != nil {
		return VoiceInputResult{}, err
	}
	if len(audio) == 0 {
		return VoiceInputResult{}, errors.New("voice input recording was empty")
	}
	if len(audio) > voiceInputMaxBytes {
		return VoiceInputResult{}, fmt.Errorf("voice input recording is too large: %d bytes", len(audio))
	}
	if mt := strings.TrimSpace(input.MimeType); mt != "" {
		mediaType = mt
	}
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	if err := writer.WriteField("model", target.Model); err != nil {
		return VoiceInputResult{}, err
	}
	if language := voiceInputLanguage(input.Locale); language != "" {
		if err := writer.WriteField("language", language); err != nil {
			return VoiceInputResult{}, err
		}
	}
	if err := writeVoiceInputFilePart(writer, mediaType, audio); err != nil {
		return VoiceInputResult{}, err
	}
	if err := writer.Close(); err != nil {
		return VoiceInputResult{}, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, voiceTranscriptionEndpoint(target.BaseURL), body)
	if err != nil {
		return VoiceInputResult{}, err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())
	if key := strings.TrimSpace(target.APIKey); key != "" {
		req.Header.Set("Authorization", "Bearer "+key)
	}
	resp, err := client.Do(req)
	if err != nil {
		return VoiceInputResult{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		b, _ := io.ReadAll(io.LimitReader(resp.Body, 8<<10))
		return VoiceInputResult{}, fmt.Errorf("voice transcription failed: %s: %s", resp.Status, strings.TrimSpace(string(b)))
	}
	var parsed struct {
		Text string `json:"text"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return VoiceInputResult{}, fmt.Errorf("decode voice transcription response: %w", err)
	}
	text := strings.TrimSpace(parsed.Text)
	if text == "" {
		return VoiceInputResult{}, errors.New("voice transcription returned no text")
	}
	return VoiceInputResult{Text: text, Provider: target.Provider, Model: target.Model}, nil
}

func decodeVoiceInputDataURL(dataURL string) ([]byte, string, error) {
	if !strings.HasPrefix(dataURL, "data:") {
		return nil, "", errors.New("voice input must be an audio data URL")
	}
	meta, payload, ok := strings.Cut(strings.TrimPrefix(dataURL, "data:"), ",")
	if !ok {
		return nil, "", errors.New("voice input data URL is malformed")
	}
	if !strings.Contains(meta, ";base64") {
		return nil, "", errors.New("voice input data URL must be base64 encoded")
	}
	mediaType := strings.TrimSuffix(meta, ";base64")
	if strings.Contains(mediaType, ";") {
		mediaType = strings.Split(mediaType, ";")[0]
	}
	if !strings.HasPrefix(mediaType, "audio/") {
		return nil, "", fmt.Errorf("voice input media type %q is not audio", mediaType)
	}
	audio, err := base64.StdEncoding.DecodeString(payload)
	if err != nil {
		return nil, "", fmt.Errorf("decode voice input audio: %w", err)
	}
	return audio, mediaType, nil
}

func writeVoiceInputFilePart(writer *multipart.Writer, mediaType string, audio []byte) error {
	header := textproto.MIMEHeader{}
	header.Set("Content-Disposition", fmt.Sprintf(`form-data; name="file"; filename="voice-input%s"`, voiceInputExtension(mediaType)))
	header.Set("Content-Type", mediaType)
	part, err := writer.CreatePart(header)
	if err != nil {
		return err
	}
	_, err = part.Write(audio)
	return err
}

func voiceInputExtension(mediaType string) string {
	switch strings.ToLower(strings.TrimSpace(mediaType)) {
	case "audio/webm", "audio/webm;codecs=opus":
		return ".webm"
	case "audio/mp4", "audio/mpeg4-generic":
		return ".mp4"
	case "audio/mpeg", "audio/mp3":
		return ".mp3"
	case "audio/wav", "audio/wave", "audio/x-wav":
		return ".wav"
	case "audio/ogg", "audio/ogg;codecs=opus":
		return ".ogg"
	default:
		ext := filepath.Ext(mediaType)
		if ext != "" && len(ext) <= 8 {
			return ext
		}
		return ".webm"
	}
}

func voiceInputLanguage(locale string) string {
	locale = strings.ToLower(strings.TrimSpace(locale))
	switch {
	case strings.HasPrefix(locale, "zh"):
		return "zh"
	case strings.HasPrefix(locale, "en"):
		return "en"
	case strings.Contains(locale, "-"):
		return strings.Split(locale, "-")[0]
	default:
		return locale
	}
}

func voiceTranscriptionEndpoint(baseURL string) string {
	return strings.TrimRight(strings.TrimSpace(baseURL), "/") + "/audio/transcriptions"
}
