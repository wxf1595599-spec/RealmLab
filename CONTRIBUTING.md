# Contributing to RealmLab

Thank you for helping improve RealmLab. This project is focused on the
MicroRealm Lab desktop experience: a local, inspectable AI coding workspace for
macOS and Windows.

## Prerequisites

- Go 1.25+
- Node.js 22+
- pnpm 10 via Corepack
- Git
- Wails CLI when working on desktop packaging

## Getting Started

```sh
git clone https://github.com/wxf1595599-spec/RealmLab.git
cd RealmLab
corepack pnpm --dir desktop/frontend install --frozen-lockfile
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/realmlab-design-contract.test.ts
```

## Project Structure

| Directory | Purpose |
| --- | --- |
| `desktop/` | Wails desktop shell, native assets, packaging scripts |
| `desktop/frontend/` | React UI, desktop design system, frontend tests |
| `internal/agent` | Agent loop, sessions, coordination |
| `internal/control` | Transport-agnostic controller |
| `internal/config` | Configuration loading and identity policy |
| `internal/tool` | Built-in and external tool plumbing |
| `internal/provider` | Model-provider abstraction |
| `internal/plugin` | MCP client transports |
| `internal/event` | Typed event stream |
| `internal/memory` | Project and long-term memory |
| `internal/sandbox` | OS-level sandboxing |
| `docs/` | Product, release, QA, and engineering notes |

## Development Workflow

```sh
go test ./...
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/realmlab-design-contract.test.ts
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/context-panel-breakdown.test.ts
```

For desktop packages:

```sh
scripts/desktop-build.sh darwin/universal v0.1.0 stable
scripts/desktop-build.sh windows/amd64 v0.1.0 stable
```

## Brand And UI Rules

- Public copy should use RealmLab or MicroRealm Lab.
- Do not introduce legacy upstream product names into README files, release
  notes, issue templates, installer metadata, or normal UI labels.
- macOS and Windows UI changes must share the same frontend source and pass the
  design contract tests.
- Keep the default desktop identity, app icon, sidebar wordmark, welcome logo,
  Soha approval label, light theme, and Slate palette unless a product decision
  explicitly changes them.

## Code Style

- Use existing package patterns and helper APIs.
- Keep changes scoped to the requested behavior.
- Prefer focused tests near the changed surface.
- Format Go with `gofmt`.
- Keep UI CSS scoped to the component or page being changed.

## Pull Requests

Include:

- A short summary of the user-facing behavior changed.
- Verification commands and results.
- Notes on macOS/Windows parity when the desktop UI or packaging changes.
- Cache-impact metadata when provider-visible prompts, tool schemas, or memory
  prefix behavior changes.

## License

By contributing, you agree that your contributions will be licensed under the
same license as the project.
