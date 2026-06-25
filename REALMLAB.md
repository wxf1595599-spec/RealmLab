# RealmLab Baseline

RealmLab is based on the latest default branch of
`esengine/DeepSeek-Reasonix` cloned on 2026-06-25.

## Upstream Baseline

- Repository: https://github.com/esengine/DeepSeek-Reasonix
- Branch: `main-v2`
- Initial RealmLab fork commit: `b193d42`
- Latest merged upstream commit: `6bbb66e`
- Local project root: `/Users/ustinian/Documents/RealmLab IDE/RealmLab`

The upstream module path is intentionally still `reasonix` for now. It is used
throughout Go `internal` imports and should only be renamed as a dedicated
migration after the first RealmLab product requirements are clear.

## Current Project Identity

- CLI build output: `bin/realmlab`
- Cross-platform CLI artifacts: `dist/realmlab-<os>-<arch>`
- Desktop Wails product name: `RealmLab`
- Desktop output filename: `RealmLab`
- Default desktop appearance: `auto` theme with `graphite` visual style

## Build Targets

The upstream project already supports the CLI on macOS, Linux, and Windows via
static Go builds. The desktop app uses Wails and must be built on each target OS
because it depends on native webview libraries.

### CLI

```sh
make build
make cross
```

### Desktop

```sh
cd desktop
wails build
```

## Local Prerequisites

This machine currently has Node/npm available, but the shell does not have these
required tools on `PATH`:

- Go toolchain: the root `go.mod` requests toolchain `go1.26.4`
- pnpm
- Wails CLI

Once they are installed, the first verification commands should be:

```sh
make test
cd desktop/frontend && pnpm install && pnpm test && pnpm build
cd ../.. && cd desktop && wails build
```

## Development Notes

Keep early RealmLab changes small and reversible:

- Preserve the Reasonix kernel until RealmLab-specific behavior is defined.
- Avoid broad package-path renames before tests and release packaging are green.
- Treat macOS and Windows packaging as release targets, not cross-compiled Wails
  artifacts.
- Follow `docs/REALMLAB_UPSTREAM_SYNC.md` for every upstream merge.
