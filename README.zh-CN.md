<p align="center">
  <img src="desktop/frontend/src/assets/logo-wordmark.svg" alt="MicroRealm Lab" width="560"/>
</p>

<p align="center">
  <a href="./README.md">English</a>
  &nbsp;.&nbsp;
  <strong>简体中文</strong>
  &nbsp;.&nbsp;
  <a href="./desktop/README.md">桌面端指南</a>
  &nbsp;.&nbsp;
  <a href="./docs/WINDOWS_DESKTOP_QA.md">Windows QA</a>
  &nbsp;.&nbsp;
  <a href="https://github.com/wxf1595599-spec/RealmLab/releases">下载安装包</a>
</p>

# RealmLab

RealmLab 是面向 macOS 和 Windows 的本地 AI 编码工作台。它把编码智能体、
项目会话、工具权限、上下文占用和工作区历史放进一个桌面体验里，让本地代码
工作变得可控、可见、可恢复。

桌面端产品身份是 **MicroRealm Lab**。公开文档、发布说明、安装包名称和用户
可见 UI 都应该统一使用 RealmLab / MicroRealm Lab。

## 下载

安装包发布在 GitHub Releases：

- macOS：`RealmLab-darwin-universal.dmg`
- Windows：`RealmLab-windows-amd64-installer.exe`
- 两个平台也提供便携 zip 包。

[下载最新 RealmLab 版本](https://github.com/wxf1595599-spec/RealmLab/releases)

## 它解决什么

- 把项目会话、上下文状态、模型输出和工具活动收进同一个桌面工作区。
- 用明确的工具权限模式管理本地编辑和 shell 命令，方便审计和回放。
- 直接展示上下文窗口占用、运行指标、成本信号和会话状态，不再埋在终端输出里。
- macOS 与 Windows 共用同一套前端源码，并在发布前跑设计契约测试，保护
  MicroRealm Lab UI 一致性。
- 支持 rewind/checkpoint 工作流，方便检查和恢复高风险修改。

## 快速开始

1. 从 Releases 下载当前平台安装包。
2. 启动 RealmLab。
3. 在引导页或设置里连接模型 provider。
4. 打开项目文件夹，新建会话开始工作。

## 从源码构建

需要：

- Go 1.25+
- Node.js 22+
- 通过 Corepack 使用 pnpm 10
- Wails CLI 用于桌面端打包

常用命令：

```sh
corepack pnpm --dir desktop/frontend install --frozen-lockfile
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/realmlab-design-contract.test.ts
scripts/desktop-build.sh darwin/universal v0.1.0 stable
scripts/desktop-build.sh windows/amd64 v0.1.0 stable
```

发布 workflow 会在 macOS 和 Windows 上运行同一套设计契约测试，再分别校验
平台安装包产物。

## 仓库结构

| 路径 | 职责 |
| --- | --- |
| `desktop/` | Wails 桌面壳、打包、平台资源 |
| `desktop/frontend/` | React UI、设计系统、桌面端测试 |
| `internal/` | 智能体运行时、工具、provider、会话、权限 |
| `docs/` | 产品、发布、QA 和工程说明 |
| `.github/workflows/publish-installers.yml` | 跨平台安装包发布 |

## 品牌防线

RealmLab 的公开界面不应该回流历史上游命名。发布前运行：

```sh
corepack pnpm --dir desktop/frontend exec tsx src/__tests__/realmlab-design-contract.test.ts
```

## 许可证

MIT。见 [LICENSE](./LICENSE)。
