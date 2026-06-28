<p align="center">
  <img src="desktop/frontend/src/assets/logo-wordmark.svg" alt="MicroRealm Lab" width="560"/>
</p>

<p align="center">
  <a href="./README.md">中英双语 README</a>
  &nbsp;.&nbsp;
  <a href="https://github.com/wxf1595599-spec/RealmLab/releases">下载安装包</a>
  &nbsp;.&nbsp;
  <a href="./desktop/README.md">桌面端指南</a>
  &nbsp;.&nbsp;
  <a href="./docs/WINDOWS_DESKTOP_QA.md">Windows QA</a>
</p>

# RealmLab

RealmLab 是面向 macOS 和 Windows 的本地 AI 编码工作台。它把智能体运行时、
项目会话、工具权限、上下文占用、checkpoint 和工作区历史放进一个桌面产品：
**MicroRealm Lab**。

我们的目标是让本地代码工作变得可控、可见、可恢复。你可以看到助手正在做什么，
决定什么时候允许工具执行，检查上下文和成本信号，并在长时间编码会话里保持稳定
的工作区。

## 下载

[下载 RealmLab](https://github.com/wxf1595599-spec/RealmLab/releases)

| 平台 | 推荐文件 | 说明 |
| --- | --- | --- |
| macOS Apple Silicon 或 Intel | `RealmLab-darwin-universal.dmg` | 正常 macOS 安装。 |
| macOS Apple Silicon | `RealmLab-darwin-arm64.zip` | Apple Silicon Mac 便携版。 |
| macOS Intel | `RealmLab-darwin-amd64.zip` | Intel Mac 便携版。 |
| Windows 11 / 10 | `RealmLab-windows-amd64-installer.exe` | 正常 Windows 安装。 |
| Windows 便携版 | `RealmLab-windows-amd64.zip` | 不走安装器，适合测试或受限机器。 |

GitHub 右侧的 "Packages" 是包仓库入口，不等于 Releases。RealmLab 桌面安装包
都在 Release assets 里。

## 核心能力

- 项目会话：把对话、项目上下文和工作区状态放在一起。
- 工具活动可见：读文件、改文件、shell 命令、审批和运行状态都会进入桌面工作流。
- 权限模式：按任务风险选择询问、自动或受信任的本地执行方式。
- 上下文感知：查看上下文窗口占用、会话 token、运行指标和成本信号。
- Checkpoint 与 rewind：检查高风险修改，并从不想要的编辑中恢复。
- Provider 设置：在引导页或 Settings 中连接模型 provider。
- 跨平台一致性：macOS 和 Windows 从同一个 commit 构建，打包前跑同一套设计契约测试。

## 隐私与 API Key

RealmLab 的公开 release 不包含你的 provider API key。发布 workflow 只使用
GitHub 自带的 release token 来上传安装包。

Provider 凭据属于用户本地运行时数据。安装并启动应用后，RealmLab 才会从你的
本地配置或凭据存储中读取。不要把真实 key 提交到仓库。

## 快速开始

1. 从 Releases 下载对应平台安装包。
2. 启动 RealmLab。
3. 在引导页或 Settings 里连接模型 provider。
4. 打开项目文件夹。
5. 新建会话，并根据任务风险选择合适的权限模式。

## 跨平台发布契约

- macOS 和 Windows 安装包来自同一个源码 commit。
- 两个平台的 runner 在打包前运行同一套前端设计契约测试。
- 原生绑定生成后继续运行 post-build UI 检查。
- 发布校验会确认预期安装包存在且非空。

## 更新与上游同步策略

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

## 从源码构建

需要：

- Go 1.25+
- Node.js 22+
- 通过 Corepack 使用 pnpm 10
- Wails CLI 用于桌面端打包

```sh
corepack pnpm --dir desktop/frontend install --frozen-lockfile
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/realmlab-design-contract.test.ts
scripts/desktop-build.sh darwin/universal v0.1.0 stable
scripts/desktop-build.sh windows/amd64 v0.1.0 stable
```

## 仓库结构

| 路径 | 职责 |
| --- | --- |
| `desktop/` | Wails 桌面壳、原生资源、打包脚本 |
| `desktop/frontend/` | React UI、设计系统、桌面端测试 |
| `internal/` | 智能体运行时、工具、provider、会话、权限 |
| `docs/` | 产品、发布、QA 和工程说明 |
| `.github/workflows/publish-installers.yml` | 跨平台安装包发布 |

## 发布前检查

```sh
git diff --check
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/realmlab-design-contract.test.ts
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/context-panel-breakdown.test.ts
```

设计契约也会保护 README、security、contribution 等公开入口，避免回流历史上游品牌。

## 许可证

MIT。见 [LICENSE](./LICENSE)。
