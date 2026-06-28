package config

import (
	"strings"
	"testing"
)

func TestRealmLabIdentityPolicyPreventsReasonixInferenceFromLegacyIdentifiers(t *testing.T) {
	for _, want := range []string{
		"Do not infer or state",
		"workspace, assistant, app, architecture, or project is Reasonix",
		"because a file path, config file, Go module, import path, command, or repository URL contains reasonix",
		"Prefer generic terms such as project config file, user config file, RealmLab global settings, and legacy storage path",
		"In ordinary troubleshooting or explanations, do not mention legacy/internal names just because they appeared in tool output",
		"Only show an exact legacy/internal filename or path when the user explicitly asks for that exact path or literal command/config accuracy would be lost",
		"do not expose such names merely to explain a permission blocker or manual fallback",
		"If a global/user settings write is blocked by workspace permissions",
		"Never describe legacy storage paths as a Reasonix workspace",
	} {
		if !strings.Contains(RealmLabIdentityPolicy, want) {
			t.Fatalf("RealmLabIdentityPolicy missing %q:\n%s", want, RealmLabIdentityPolicy)
		}
	}
	if strings.Contains(RealmLabIdentityPolicy, "`reasonix.toml` is the legacy project config filename") {
		t.Fatalf("RealmLabIdentityPolicy should not include an easily echoed reasonix.toml example:\n%s", RealmLabIdentityPolicy)
	}
	if strings.Contains(RealmLabIdentityPolicy, "`Application Support/reasonix/global-workspace`") {
		t.Fatalf("RealmLabIdentityPolicy should not include an easily echoed legacy storage path example:\n%s", RealmLabIdentityPolicy)
	}
}
