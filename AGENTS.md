# RealmLab Agent Instructions

本文件是 RealmLab 仓库的 Agent 工作规范，作用范围为整个仓库。任何 Codex、Claude Code 或其他 coding agent 在本项目中工作前，都应先阅读本文件。

## Project Identity

RealmLab 是 `esengine/DeepSeek-Reasonix` 的长期产品 fork。目标是持续合并上游能力，同时保留 RealmLab 自己的桌面端产品身份和定制体验。

当前产品边界：

- 用户要的是桌面客户端应用。
- 桌面端品牌是 `RealmLab IDE` 和 `MicroRealm Lab`。
- 不要把上游 `Reasonix` 作为用户可见产品名、助手名、标题或默认称呼。
- Web/site/worker 目录为上游兼容而保留，不是当前产品体验重心。
- RealmLab 官网工作必须先遵守 `docs/REALMLAB_SITE_BRIEF.md`，不要把上游 Reasonix marketing site 视觉或 CSS 反向带入桌面端。

## Required Reads Before Meaningful Changes

开始非平凡修改前，先阅读：

- `DESIGN.md`
- `docs/REALMLAB_UPSTREAM_SYNC.md`
- 与任务直接相关的源码和测试

如果涉及桌面 UI，还要阅读：

- `desktop/README.md`
- `desktop/frontend/src/lib/theme.ts`
- `desktop/frontend/src/styles.css` 中相关区域

如果涉及 `site/`、`workers/`、官网文案或上游 marketing surface，还要阅读：

- `docs/REALMLAB_SITE_BRIEF.md`

## Protected RealmLab Decisions

以下是产品定制，不得在上游合并或普通改动中丢失：

- 默认桌面外观必须是 `light` + `slate`。
- 打包或重新打开本地应用后，也应默认保持当前 Slate 配色。
- 用户可见品牌必须是 `MicroRealm Lab` 或 `RealmLab IDE`。
- 内部 sidebar logo: `MicroRealm` + blue four-point star + `Lab`。
- 登录动画和欢迎页 logo: 纯 `MicroRealm`，不要星星，不要 `Lab`。
- App icon 使用当前圆弧角黑底图标。
- 用户可见权限模式文案使用 `Soha`，不要显示 `Yolo` 或 `YOLO`。
- `internal/config.RealmLabIdentityPolicy` 必须保留，并继续约束模型输出品牌名。
- 桌面语音输入必须优先走 RealmLab 自己的录音 + 后端转写链路；Web Speech 只能作为 fallback，不能作为 Windows/macOS/Linux 可用性的唯一依据。
- Go module path 和部分内部 legacy key 可以继续叫 `reasonix`，除非有专门迁移计划。

## Upstream Sync Rules

上游源：

- Upstream repo: `git@github.com:esengine/DeepSeek-Reasonix.git`
- Upstream branch: `main-v2`
- RealmLab product remote: `origin`

合并上游更新时，以 `docs/REALMLAB_UPSTREAM_SYNC.md` 为准。核心原则：

- 不要在 `upstream/main-v2` 上做 RealmLab 功能开发。
- 不要把 RealmLab 历史 rebase 到上游。
- 用 merge commit 保留上游集成点。
- 合并冲突时，内核能力通常接受上游，产品身份和桌面体验由 RealmLab 定制优先。
- 不要因为当前只做桌面端而删除上游 Web/site/worker 目录。

## Desktop Development Workflow

本项目桌面端位于 `desktop/`，前端位于 `desktop/frontend/`。

常用验证：

```sh
cd desktop/frontend
corepack pnpm build
```

类型检查可直接运行：

```sh
cd desktop/frontend
./node_modules/.bin/tsc --noEmit
```

桌面打包：

```sh
cd desktop
go run github.com/wailsapp/wails/v2/cmd/wails@v2.12.0 build
```

macOS 上 Wails 打包经常已生成 `.app` 但自动签名失败，错误通常是 resource fork、Finder information 或 provenance metadata。可使用下面的恢复流程：

```sh
cd desktop
rm -rf build/bin/realmlab-desktop-clean.app
ditto --noextattr build/bin/realmlab-desktop.app build/bin/realmlab-desktop-clean.app
xattr -d com.apple.FinderInfo build/bin/realmlab-desktop-clean.app 2>/dev/null || true
xattr -d com.apple.ResourceFork build/bin/realmlab-desktop-clean.app 2>/dev/null || true
codesign --force --deep --sign - build/bin/realmlab-desktop-clean.app
codesign --verify --deep --verbose=2 build/bin/realmlab-desktop-clean.app
```

替换并打开本地客户端：

```sh
cd ..
pids=$(pgrep -f '/.local-app/RealmLab.app/Contents/MacOS/RealmLab' || true)
if [ -n "$pids" ]; then
  kill $pids
  sleep 2
fi
rm -rf .local-app/RealmLab.app
ditto --noextattr desktop/build/bin/realmlab-desktop-clean.app .local-app/RealmLab.app
xattr -d com.apple.FinderInfo .local-app/RealmLab.app 2>/dev/null || true
codesign --verify --deep --verbose=2 .local-app/RealmLab.app
open .local-app/RealmLab.app
```

## UI and Design Rules

设计和 UI 修改必须遵守 `DESIGN.md`。高层原则：

- App UI 是专业工作台，不是 landing page。
- 视觉要克制、清晰、高密度。
- 不要做装饰性卡片堆叠、渐变背景、漂浮图形或营销英雄区。
- 不要使用 emoji 当结构图标。
- 不要让按钮、侧栏、工具条或状态栏中的文字溢出。
- 修改固定格式组件时，设置稳定尺寸，避免 hover 或动态文案造成布局跳动。
- 更改 logo 前先确认是 app icon、login logo 还是 internal sidebar logo，不要混改。

## Brand Text Rules

面向用户的文案：

- Use `MicroRealm Lab` for the assistant/app identity inside the desktop UI.
- Use `RealmLab IDE` when referring to the desktop product shell.
- Use `Soha` for the all-in tool approval mode.
- Do not use `Reasonix / RealmLab` as a heading.
- Do not let generated assistant answers introduce Reasonix as the product.

允许出现 `Reasonix` 的情况：

- 上游 README 或未定制的上游文档。
- 精确说明 GitHub upstream repo。
- 精确说明 Go module, package path, legacy command, config key, storage path。
- 这种情况下要把它称作 legacy/internal/upstream identifier。

## Editing Rules

- 保持改动范围小。
- 优先沿用现有架构和文件组织。
- 不要为小改动引入新的视觉系统、状态库或构建工具。
- 手工编辑文件使用 `apply_patch`。
- 不要回滚用户或其他 agent 的无关改动。
- 不要运行 destructive git 命令，除非用户明确要求。
- 如果工作区已有未提交改动，先判断是否相关；无关则避开，相关则读懂后一起工作。

## Testing and Verification Expectations

根据改动范围选择验证。

文案、SVG、CSS 小改：

```sh
git diff --check
cd desktop/frontend && corepack pnpm build
```

TypeScript/React 逻辑改动：

```sh
cd desktop/frontend && ./node_modules/.bin/tsc --noEmit
cd desktop/frontend && corepack pnpm build
```

Go/kernel/config 改动：

```sh
go test ./...
```

桌面交付或用户要求重新打开应用：

- 构建 Wails app。
- 完成 macOS 签名验证。
- 替换 `.local-app/RealmLab.app`。
- `open .local-app/RealmLab.app`。
- 用 `pgrep -fl '/.local-app/RealmLab.app/Contents/MacOS/RealmLab'` 确认进程已启动。

## Commit Guidance

- 每个独立产品修复单独提交。
- 不要把上游同步、品牌修复、UI polish、测试修复混在一个提交里。
- 提交前确认 `git status --short`。
- Stage 只包含本次任务相关文件。
- 提交信息用简短英文，例如:
  - `Polish MicroRealm Lab sidebar branding`
  - `Rename Yolo label to Soha`
  - `Preserve RealmLab light Slate defaults`

## Current Known Local Build Quirk

macOS 本地 Wails build 可能输出 `codesign failed`，但这通常发生在 `.app` 已经完成 packaging 后。不要直接判断构建完全失败。先检查 `desktop/build/bin/realmlab-desktop.app` 是否存在，再按本文件的 clean signing 流程恢复。
