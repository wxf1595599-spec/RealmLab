<p align="center">
  <img src="desktop/frontend/src/assets/logo-wordmark.svg" alt="MicroRealm Lab" width="560"/>
</p>

<p align="center">
  <a href="#english">English</a>
  &nbsp;.&nbsp;
  <a href="#中文">中文</a>
  &nbsp;.&nbsp;
  <a href="https://github.com/wxf1595599-spec/RealmLab/releases">Download</a>
  &nbsp;.&nbsp;
  <a href="./desktop/README.md">Desktop guide</a>
  &nbsp;.&nbsp;
  <a href="./docs/WINDOWS_DESKTOP_QA.md">Windows QA</a>
</p>

# RealmLab

## English

RealmLab is a local AI coding workspace for macOS and Windows. It brings an
agent runtime, project sessions, tool permissions, context usage, checkpoints,
and workspace history into a desktop product called **MicroRealm Lab**.

The goal is simple: make local code work controlled, visible, and recoverable.
You should be able to see what the assistant is doing, decide when tools are
allowed, inspect context and cost signals, and keep a stable workspace across
long coding sessions.

### Download

Installers and portable builds are published on GitHub Releases:

[Download RealmLab](https://github.com/wxf1595599-spec/RealmLab/releases)

| Platform | Recommended file | When to use it |
| --- | --- | --- |
| macOS Apple Silicon or Intel | `RealmLab-darwin-universal.dmg` | Normal macOS install. Drag RealmLab into Applications. |
| macOS Apple Silicon | `RealmLab-darwin-arm64.zip` | Portable archive for Apple Silicon Macs. |
| macOS Intel | `RealmLab-darwin-amd64.zip` | Portable archive for Intel Macs. |
| Windows 11 / 10 | `RealmLab-windows-amd64-installer.exe` | Normal Windows install. |
| Windows portable | `RealmLab-windows-amd64.zip` | Run without the installer. Useful for testing or restricted machines. |

The GitHub "Packages" panel is separate from Releases. It is for package
registries such as npm or container images. RealmLab desktop installers live in
the Release assets above.

### What RealmLab Provides

- **Project sessions**: keep conversations, project context, and workspace state
  together instead of scattering work across terminal windows.
- **Visible tool activity**: file reads, edits, shell commands, approvals, and
  runtime status are presented as part of the desktop workflow.
- **Permission modes**: use ask-first, automatic, or trusted local workflows
  depending on the risk of the task.
- **Context awareness**: inspect context-window usage, session token counts,
  runtime metrics, and cost signals without digging through raw logs.
- **Checkpoints and rewind**: review risky changes and recover from unwanted
  edits.
- **Provider setup**: connect a model provider from onboarding or Settings.
  Provider keys are stored locally and are not bundled into public releases.
- **macOS and Windows parity**: both platforms are built from the same commit
  and pass the same frontend design contract tests before packaging.

### Privacy And API Keys

RealmLab releases do not include your provider API keys. The public build
workflow only uses GitHub's release token to upload installer assets.

Provider credentials are user-local runtime data. They are read from local
configuration or credential storage after you install and launch the app. Do not
commit real keys to this repository.

### Quick Start

1. Download the installer for your platform from Releases.
2. Launch RealmLab.
3. Connect a model provider in onboarding or Settings.
4. Open a project folder.
5. Start a session and choose the permission mode that fits the task.

### Cross-Platform Release Contract

Every desktop release is expected to keep macOS and Windows visually and
behaviorally aligned:

- The macOS and Windows packages are built from the same source commit.
- Both runners execute the same frontend design contract tests before packaging.
- Post-build UI checks run after native bindings are generated.
- Release verification confirms that the expected installer files exist and are
  non-empty.

### Update And Upstream Strategy

RealmLab keeps a long-lived product line while still absorbing improvements
from the official upstream agent runtime. The rule is to merge capabilities
carefully while protecting RealmLab-owned product decisions.

Protected RealmLab decisions include:

- Public product identity: RealmLab and MicroRealm Lab.
- Desktop app bundle and installer identity.
- Sidebar logo, welcome logo, app icon, and default light/slate appearance.
- User-facing approval and settings language.
- README, release notes, issue templates, and installer metadata.
- The macOS and Windows UI parity contract.

Some internal compatibility names may remain in source paths until a dedicated
module migration is planned and tested. They should not become public product
language.

### Build From Source

Requirements:

- Go 1.25+
- Node.js 22+
- pnpm 10 through Corepack
- Wails CLI for desktop packaging

Install frontend dependencies and run the design contract:

```sh
corepack pnpm --dir desktop/frontend install --frozen-lockfile
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/realmlab-design-contract.test.ts
```

Build desktop packages:

```sh
scripts/desktop-build.sh darwin/universal v0.1.0 stable
scripts/desktop-build.sh windows/amd64 v0.1.0 stable
```

### Repository Map

| Path | Purpose |
| --- | --- |
| `desktop/` | Wails desktop shell, native assets, packaging scripts |
| `desktop/frontend/` | React UI, design system, desktop tests |
| `internal/` | Agent runtime, tools, providers, sessions, permissions |
| `docs/` | Product, release, QA, and engineering notes |
| `.github/workflows/publish-installers.yml` | Cross-platform installer publishing |

### Verification

Useful checks before publishing:

```sh
git diff --check
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/realmlab-design-contract.test.ts
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/context-panel-breakdown.test.ts
```

The design contract also protects public README/security/contribution surfaces
from drifting back to legacy upstream branding.

### License

MIT. See [LICENSE](./LICENSE).

---

## 中文

RealmLab 是面向 macOS 和 Windows 的本地 AI 编码工作台。它把智能体运行时、
项目会话、工具权限、上下文占用、checkpoint 和工作区历史放进一个桌面产品：
**MicroRealm Lab**。

我们的目标很清楚：让本地代码工作变得可控、可见、可恢复。你应该能看到助手
正在做什么，决定什么时候允许工具执行，检查上下文和成本信号，并在长时间编码
会话里保持稳定的工作区。

### 下载

安装包和便携版发布在 GitHub Releases：

[下载 RealmLab](https://github.com/wxf1595599-spec/RealmLab/releases)

| 平台 | 推荐文件 | 什么时候用 |
| --- | --- | --- |
| macOS Apple Silicon 或 Intel | `RealmLab-darwin-universal.dmg` | 正常 macOS 安装，打开 DMG 后拖到 Applications。 |
| macOS Apple Silicon | `RealmLab-darwin-arm64.zip` | Apple Silicon Mac 的便携压缩包。 |
| macOS Intel | `RealmLab-darwin-amd64.zip` | Intel Mac 的便携压缩包。 |
| Windows 11 / 10 | `RealmLab-windows-amd64-installer.exe` | 正常 Windows 安装。 |
| Windows 便携版 | `RealmLab-windows-amd64.zip` | 不走安装器，适合测试或受限机器。 |

GitHub 右侧的 "Packages" 和 Releases 不是一回事。"Packages" 是 npm、
容器镜像等包仓库入口。RealmLab 桌面安装包在 Releases 的 assets 里。

### RealmLab 提供什么

- **项目会话**：把对话、项目上下文和工作区状态放在一起，不再散落在多个终端窗口里。
- **工具活动可见**：读文件、改文件、shell 命令、审批和运行状态都会进入桌面工作流。
- **权限模式**：按任务风险选择询问、自动或受信任的本地执行方式。
- **上下文感知**：直接查看上下文窗口占用、会话 token、运行指标和成本信号。
- **Checkpoint 与 rewind**：检查高风险修改，并从不想要的编辑中恢复。
- **Provider 设置**：在引导页或 Settings 中连接模型 provider。Provider key
  只作为本地运行时数据保存，不会被打进公开安装包。
- **macOS / Windows 一致性**：两个平台从同一个 commit 构建，打包前跑同一套
  前端设计契约测试。

### 隐私与 API Key

RealmLab 的公开 release 不包含你的 provider API key。发布 workflow 只使用
GitHub 自带的 release token 来上传安装包。

Provider 凭据属于用户本地运行时数据。安装并启动应用后，RealmLab 才会从你的
本地配置或凭据存储中读取。不要把真实 key 提交到仓库。

### 快速开始

1. 从 Releases 下载对应平台安装包。
2. 启动 RealmLab。
3. 在引导页或 Settings 里连接模型 provider。
4. 打开项目文件夹。
5. 新建会话，并根据任务风险选择合适的权限模式。

### 跨平台发布契约

每个桌面端 release 都要保护 macOS 和 Windows 的视觉与行为一致性：

- macOS 和 Windows 安装包来自同一个源码 commit。
- 两个平台的 runner 在打包前运行同一套前端设计契约测试。
- 原生绑定生成后继续运行 post-build UI 检查。
- 发布校验会确认预期安装包存在且非空。

### 更新与上游同步策略

RealmLab 保持自己的长期产品线，同时持续吸收官方上游智能体运行时的改进。
原则是：能力谨慎合并，RealmLab 自己的产品决策必须被保护。

需要保护的 RealmLab 决策包括：

- 公开产品身份：RealmLab 和 MicroRealm Lab。
- 桌面 app bundle 与安装包身份。
- 侧边栏 logo、欢迎页 logo、app icon、默认 light/slate 外观。
- 用户可见的审批、设置和说明文案。
- README、Release notes、issue templates、安装器 metadata。
- macOS 和 Windows UI 一致性契约。

部分内部兼容名称可能会暂时保留在源码路径里，直到我们专门规划并测试模块迁移。
它们不应该变成公开产品语言。

### 从源码构建

需要：

- Go 1.25+
- Node.js 22+
- 通过 Corepack 使用 pnpm 10
- Wails CLI 用于桌面端打包

安装前端依赖并运行设计契约：

```sh
corepack pnpm --dir desktop/frontend install --frozen-lockfile
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/realmlab-design-contract.test.ts
```

构建桌面安装包：

```sh
scripts/desktop-build.sh darwin/universal v0.1.0 stable
scripts/desktop-build.sh windows/amd64 v0.1.0 stable
```

### 仓库结构

| 路径 | 职责 |
| --- | --- |
| `desktop/` | Wails 桌面壳、原生资源、打包脚本 |
| `desktop/frontend/` | React UI、设计系统、桌面端测试 |
| `internal/` | 智能体运行时、工具、provider、会话、权限 |
| `docs/` | 产品、发布、QA 和工程说明 |
| `.github/workflows/publish-installers.yml` | 跨平台安装包发布 |

### 发布前检查

常用检查：

```sh
git diff --check
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/realmlab-design-contract.test.ts
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/context-panel-breakdown.test.ts
```

设计契约也会保护 README、security、contribution 等公开入口，避免回流历史上游品牌。

### 许可证

MIT。见 [LICENSE](./LICENSE)。
