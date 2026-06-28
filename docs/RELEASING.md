# Releasing

RealmLab releases are desktop-first. A release should publish source code plus
verified macOS and Windows packages from the same commit.

## Branch And Tag Model

- `main` is the public source branch for RealmLab.
- Stable desktop releases use tags named `realmlab-vX.Y.Z`.
- The tag points at the exact source commit used for both macOS and Windows
  packages.

## Release Workflow

The `Publish installers` workflow runs on `realmlab-v*` tags and can also be
started manually.

Each release build:

1. Checks out the tagged source.
2. Installs Go, Node, pnpm, Wails, and platform packaging tools.
3. Runs the RealmLab design contract tests on both macOS and Windows runners.
4. Builds platform packages with `scripts/desktop-build.sh`.
5. Runs post-build UI parity tests.
6. Verifies installer artifacts exist and are non-empty.
7. Uploads the packages to the GitHub Release.

## Expected Assets

| Platform | Asset |
| --- | --- |
| macOS | `RealmLab-darwin-universal.dmg` |
| macOS | `RealmLab-darwin-arm64.zip` |
| macOS | `RealmLab-darwin-amd64.zip` |
| Windows | `RealmLab-windows-amd64-installer.exe` |
| Windows | `RealmLab-windows-amd64.zip` |

## Cut A Release

```sh
git tag -f realmlab-v0.1.0 HEAD
git push --force github-new refs/tags/realmlab-v0.1.0
gh run watch --repo wxf1595599-spec/RealmLab --workflow publish-installers.yml
gh release view realmlab-v0.1.0 --repo wxf1595599-spec/RealmLab
```

## UI Parity Requirement

macOS and Windows packages must use the same frontend source and pass the same
design contract tests. Any release that changes desktop layout, branding,
theme, app chrome, installer identity, or the context/status surfaces should be
checked on both platforms before promotion.

## Local Verification

```sh
corepack pnpm --dir desktop/frontend install --frozen-lockfile
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/realmlab-design-contract.test.ts
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/context-panel-breakdown.test.ts
```

For packaged builds:

```sh
scripts/desktop-build.sh darwin/universal v0.1.0 stable
scripts/desktop-build.sh windows/amd64 v0.1.0 stable
```
