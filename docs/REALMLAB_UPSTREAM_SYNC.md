# RealmLab Upstream Sync Policy

RealmLab is a long-lived product fork of
`esengine/DeepSeek-Reasonix`. The goal is to keep taking upstream fixes and new
capabilities from `main-v2` while preserving RealmLab's desktop-first product
identity and custom behavior.

## Branch Roles

- `upstream/main-v2`: read-only mirror of `esengine/DeepSeek-Reasonix`.
- `origin/main-v2`: RealmLab product baseline.
- `codex/sync-upstream-YYYY-MM-DD`: temporary branch for one upstream sync.
- Feature branches: RealmLab-only product work. Use the `codex/` prefix for
  agent-created branches.

Do not develop RealmLab features directly on `upstream/main-v2`. Do not rebase
published RealmLab history onto upstream; use merge commits so the upstream
integration point remains visible.

## Protected RealmLab Customizations

These changes are product decisions and must survive every upstream merge:

- Desktop product name and bundle identity stay `RealmLab`.
- Desktop output bundle stays `RealmLab.app` for local/user-facing builds.
- User-facing desktop brand copy stays `MicroRealm Lab`; upstream `Reasonix`
  wording may remain only in internal compatibility paths, module names, or
  source comments where renaming would create unnecessary merge risk.
- Internal desktop logo assets use the official `MicroRealm_Logo_Kit` as their
  base: the `MicroRealm` wordmark follows `MicroRealm_Wordmark_Horizontal_Light.svg`
  and symbol marks follow `MicroRealm_M_Light.svg`. The desktop wordmark must
  keep RealmLab's product extension: `MicroRealm` + blue four-point star + `Lab`.
  Do not reintroduce upstream Reasonix-derived wordmarks during merges.
- Default desktop appearance stays `light` theme + `slate` visual style. This
  is RealmLab's current palette and must remain the first-run/package default.
- CLI build output stays `bin/realmlab` unless a dedicated rename plan changes
  it.
- The Go module path may remain `reasonix` until a dedicated import migration is
  planned and tested.
- `internal/config.RealmLabIdentityPolicy` must remain in the boot system
  prompt before generic upstream policies.
- Desktop product work belongs primarily under `desktop/` and, when practical,
  under `desktop/frontend/src/custom/`.
- Web/site/worker code can remain in the repository for upstream compatibility,
  but RealmLab's product target is the desktop client unless a product decision
  says otherwise.
- `REALMLAB.md` and this document are RealmLab-owned files.

## Sync Procedure

Run the sync from a clean worktree except ignored local app/runtime artifacts.

```sh
git checkout main-v2
git fetch https://github.com/esengine/DeepSeek-Reasonix.git \
  refs/heads/main-v2:refs/remotes/upstream/main-v2
git checkout -b codex/sync-upstream-YYYY-MM-DD
git merge --no-edit upstream/main-v2
```

If the normal `upstream` remote is healthy, this shorter form is fine:

```sh
git fetch upstream
git checkout -b codex/sync-upstream-YYYY-MM-DD main-v2
git merge --no-edit upstream/main-v2
```

## Conflict Rules

When conflicts appear, classify each file before editing:

- Upstream kernel changes usually win in `internal/agent`, `internal/provider`,
  `internal/tool`, `internal/plugin`, and shared tests unless they break a
  protected RealmLab customization.
- RealmLab product identity wins in `desktop/wails.json`, `desktop/main.go`,
  `internal/config/config.go`, `Makefile`, packaging scripts, and docs.
- For `desktop/frontend/src/App.tsx`, `useController.ts`, and shared UI state,
  merge behavior carefully instead of choosing either side wholesale.
- Do not delete upstream web/site/worker directories just because RealmLab is
  desktop-first; deletion increases future merge cost.

## Required Verification

At minimum, run:

```sh
go test ./...
cd desktop/frontend && ./node_modules/.bin/tsc --noEmit
cd ../.. && cd desktop
tmpnpmrc=$(mktemp)
npm_config_userconfig="$tmpnpmrc" COREPACK_ENABLE_DOWNLOAD_PROMPT=0 CI=1 \
  go run github.com/wailsapp/wails/v2/cmd/wails@v2.12.0 build -clean \
  -ldflags "-X main.version=sync-upstream-YYYY-MM-DD -X main.channel=local"
rm -f "$tmpnpmrc"
```

On macOS, if Wails finishes packaging but self-signing fails with resource-fork
metadata, recover the local build with:

```sh
app="desktop/build/bin/realmlab-desktop.app"
xattr -cr "$app"
xattr -d com.apple.FinderInfo "$app" 2>/dev/null || true
xattr -d 'com.apple.fileprovider.fpfs#P' "$app" 2>/dev/null || true
codesign --force --deep -s - "$app"
codesign --verify --deep --strict --verbose=2 "$app"
```

Strict verification is a pre-open packaging check. After macOS LaunchServices
opens a local `.app`, it may attach Finder metadata to the bundle root again.
For the already-running local development copy, use non-strict
`codesign --verify --deep --verbose=2 .local-app/RealmLab.app` plus process
verification.

Then refresh the local desktop app copy:

```sh
osascript -e 'tell application "RealmLab" to quit' 2>/dev/null || true
pkill -x RealmLab 2>/dev/null || true
mkdir -p .local-app
rm -rf .local-app/RealmLab.app
cp -R desktop/build/bin/realmlab-desktop.app .local-app/RealmLab.app
xattr -cr .local-app/RealmLab.app
xattr -d com.apple.FinderInfo .local-app/RealmLab.app 2>/dev/null || true
xattr -d 'com.apple.fileprovider.fpfs#P' .local-app/RealmLab.app 2>/dev/null || true
open .local-app/RealmLab.app
```

## Merge Acceptance Checklist

- `git rev-list --left-right --count main-v2...upstream/main-v2` was reviewed
  before merging.
- Upstream merge commit is present on the sync branch.
- `go test ./...` passes.
- Desktop frontend typecheck passes.
- The desktop app builds and opens locally.
- RealmLab identity is still visible in:
  - `desktop/wails.json`
  - `desktop/main.go`
  - `internal/config/config.go`
  - local `.local-app/RealmLab.app`
- RealmLab default appearance is still `light` + `slate` in:
  - `internal/config/config.go`
  - `desktop/frontend/src/lib/theme.ts`
  - `reasonix.example.toml`
- The sync result does not introduce product reliance on the browser `serve`
  frontend, `site/`, or `workers/`.

## Current Sync Record

- Date: 2026-06-25
- Upstream branch: `esengine/DeepSeek-Reasonix main-v2`
- Latest upstream commit merged: `6bbb66efe7c7251885e80f243421e38305de32af`
- RealmLab sync branch: `codex/sync-upstream-2026-06-25`
- Local merge commit: `dda0be31`
