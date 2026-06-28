# Windows Desktop QA

RealmLab is developed mostly on macOS, so Windows parity is protected by a
dedicated GitHub Actions smoke workflow plus a short manual checklist for the
parts that only a real Windows desktop can prove.

## Automated Gate

Workflow: `.github/workflows/windows-desktop-smoke.yml`

Run it manually from GitHub Actions whenever a desktop change needs Windows
confidence, and keep it green for PRs that touch:

- `desktop/**`
- `internal/**`
- `scripts/desktop-build.sh`
- the workflow itself

The workflow runs on both `windows-latest` and `windows-11-arm`:

- `go test ./...` in the desktop module, so Windows-only files and tests execute
  on a native Windows runner.
- `corepack pnpm --dir desktop/frontend build`.
- Windows-relevant frontend contract tests:
  - `composer-voice-input.test.tsx`
  - `app-chrome-tabs.test.ts`
- `scripts/desktop-build.sh windows/<arch> ...`, which exercises Wails,
  WebView2 embedding, NSIS packaging, and portable zip creation.
- A portable `RealmLab.exe` launch smoke. The app must stay alive for 12 seconds
  before the workflow kills it.
- Artifact checks for:
  - `RealmLab-windows-<arch>-installer.exe`
  - `RealmLab-windows-<arch>.zip`
  - `RealmLab.exe` inside the portable zip

## Manual Windows Acceptance

Automated smoke proves buildability and basic launch. Before a public desktop
release, do one manual pass on Windows 11:

1. Install `RealmLab-windows-amd64-installer.exe`.
2. Launch RealmLab from Start Menu or the desktop shortcut.
3. Confirm the default appearance is light Slate.
4. Confirm user-visible product identity is `MicroRealm Lab` / `RealmLab IDE`;
   no normal UI label should show `Reasonix`.
5. Confirm the sidebar wordmark is `MicroRealm` + blue star + `Lab`.
6. Confirm welcome/login branding uses pure `MicroRealm` where specified.
7. Confirm the all-in approval mode label is `Soha`, not `Yolo`.
8. Open Settings -> Software update and check the page renders with RealmLab
   wording. Legacy config paths may remain only when explicitly labeled as
   compatibility paths.
9. Voice input:
   - Configure a real ASR provider.
   - Click the microphone button.
   - Allow the Windows microphone permission prompt.
   - Record a short Chinese sentence, stop, and confirm text is inserted.
   - Deny permission once and confirm the composer remains editable with a clear
     warning.
10. Check high-DPI scaling at 125% and 150%: sidebar logo, composer, prompt
    cards, bottom status bar, and Settings panels must not overlap or clip text.
11. Check file actions: drag a file into the composer, reveal a file in Explorer,
    and open a workspace folder.
12. Run an update dry check against the current channel if a signed build is
    available.

## Parity Definition

Windows does not need to be pixel-identical to macOS. Native title bars, fonts,
shortcut labels, and permission dialogs are expected to follow each OS. The
required parity is:

- same product identity and default RealmLab customization,
- same core chat/composer behavior,
- same voice input architecture,
- same update channel semantics,
- no Windows-only layout breakage.
