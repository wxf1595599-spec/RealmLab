<p align="center">
  <img src="desktop/frontend/src/assets/logo-wordmark.svg" alt="MicroRealm Lab" width="560"/>
</p>

<p align="center">
  <strong>English</strong>
  &nbsp;.&nbsp;
  <a href="./README.zh-CN.md">简体中文</a>
  &nbsp;.&nbsp;
  <a href="./desktop/README.md">Desktop guide</a>
  &nbsp;.&nbsp;
  <a href="./docs/WINDOWS_DESKTOP_QA.md">Windows QA</a>
  &nbsp;.&nbsp;
  <a href="https://github.com/wxf1595599-spec/RealmLab/releases">Releases</a>
</p>

# RealmLab

RealmLab is a local AI coding workspace for macOS and Windows. It wraps a
coding agent, project sessions, tool permissions, context usage, and workspace
history in a desktop experience designed to make local code work controlled,
visible, and recoverable.

The desktop product identity is **MicroRealm Lab**. Public documentation,
release notes, installer names, and user-facing UI should use RealmLab /
MicroRealm Lab consistently.

## Download

Installers are published on the GitHub Releases page:

- macOS: `RealmLab-darwin-universal.dmg`
- Windows: `RealmLab-windows-amd64-installer.exe`
- Portable archives are also attached for both platforms.

[Download the latest RealmLab release](https://github.com/wxf1595599-spec/RealmLab/releases)

## What It Does

- Keeps project sessions, context state, model output, and tool activity in one
  desktop workspace.
- Uses explicit tool permission modes so local edits and shell commands remain
  auditable.
- Shows context-window usage, runtime metrics, cost signals, and session status
  without burying them in terminal output.
- Preserves a consistent MicroRealm Lab UI across macOS and Windows through
  shared frontend source and release-time design contract tests.
- Supports rewind/checkpoint workflows so risky edits can be inspected and
  recovered.

## Quick Start

1. Download the installer for your platform from Releases.
2. Launch RealmLab.
3. Connect a model provider in onboarding or Settings.
4. Open a project folder and start a new session.

## Build From Source

Requirements:

- Go 1.25+
- Node.js 22+
- pnpm 10 via Corepack
- Wails CLI for desktop packaging

Common commands:

```sh
corepack pnpm --dir desktop/frontend install --frozen-lockfile
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/realmlab-design-contract.test.ts
scripts/desktop-build.sh darwin/universal v0.1.0 stable
scripts/desktop-build.sh windows/amd64 v0.1.0 stable
```

The release workflow runs the same design contract tests on macOS and Windows
before packaging, then verifies platform-specific installer artifacts.

## Repository Map

| Path | Purpose |
| --- | --- |
| `desktop/` | Wails desktop shell, packaging, platform assets |
| `desktop/frontend/` | React UI, design system, desktop tests |
| `internal/` | Agent runtime, tools, providers, sessions, permissions |
| `docs/` | Product, release, QA, and engineering notes |
| `.github/workflows/publish-installers.yml` | Cross-platform installer publishing |

## Brand Guard

RealmLab public surfaces should not drift back to legacy upstream naming.
Before publishing, run:

```sh
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/realmlab-design-contract.test.ts
```

## License

MIT. See [LICENSE](./LICENSE).
