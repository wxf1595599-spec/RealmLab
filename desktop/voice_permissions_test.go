package main

import (
	"os"
	"regexp"
	"testing"
)

func TestDarwinInfoPlistDeclaresVoiceInputPermissions(t *testing.T) {
	data, err := os.ReadFile("build/darwin/Info.plist")
	if err != nil {
		t.Fatal(err)
	}
	body := string(data)

	assertPlistString(t, body, "NSMicrophoneUsageDescription")
	assertPlistString(t, body, "NSSpeechRecognitionUsageDescription")
}

func assertPlistString(t *testing.T, body, key string) {
	t.Helper()

	re := regexp.MustCompile(`<key>` + regexp.QuoteMeta(key) + `</key>\s*<string>[^<]*MicroRealm Lab[^<]+</string>`)
	if !re.MatchString(body) {
		t.Fatalf("build/darwin/Info.plist must declare %s with a MicroRealm Lab usage description", key)
	}
}
