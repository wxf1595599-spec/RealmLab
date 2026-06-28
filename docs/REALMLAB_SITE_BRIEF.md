# RealmLab Site Brief

最后更新：2026-06-25

本文定义 `site/`、`workers/` 和未来 RealmLab 官网工作的产品边界。它补充 `DESIGN.md`，不替代桌面端设计宪法。

## Current Boundary

- RealmLab 当前产品重心是桌面客户端：`RealmLab IDE` / `MicroRealm Lab`。
- `site/` 是上游兼容 marketing surface 和未来官网实验层，不是当前产品体验中心。
- `workers/` 保留上游兼容和部署能力，不应反向决定桌面端 UI、品牌或默认主题。
- 现有 `site/` 样式可继续维持可构建、可浏览，但不能继续以 Reasonix marketing site 作为 RealmLab 设计说明。

## If We Build A RealmLab Site

正式做 RealmLab 官网前，必须先补一版 site-specific brief，至少回答：

- 受众：本地开发者、AI coding power users、团队管理者还是上游迁移用户。
- North star：官网如何证明“让本地代码工作变得可控、可见、可恢复”。
- 页面结构：首页、下载、文档、更新日志、上游兼容说明、隐私/安全，而不是泛 SaaS landing page。
- 真实素材：优先使用桌面产品截图、会话恢复、工具调用审计、项目树、context panel，不用抽象 AI 插画。
- 品牌分工：官网可以介绍 `RealmLab IDE`，桌面内仍使用 `MicroRealm Lab` 作为 assistant/app identity。

## Visual Direction

可以：

- 安静、清晰、开发者工具感。
- 浅色 Slate / 冷灰纸面与品牌蓝呼应。
- 使用真实桌面截图、短流程、状态图和审计路径。
- 用简短文案说明本地、可恢复、可审计、多会话、多项目。

不要：

- 复制上游 Reasonix 的 Google-style landing page。
- 使用大面积紫蓝渐变、漂浮球、AI 霓虹、伪科技轨道或装饰粒子。
- 把桌面 workbench 改成官网 hero 风格。
- 在用户可见标题、CTA、logo 或 meta 中把 Reasonix 当作产品名。
- 让官网 CSS token、字体、hero 或 card 规则流入 `desktop/frontend/src/styles.css`。

## CSS Rules For `site/`

- `site/src/styles/global.css` 可以保留独立 token，不与桌面 styles 共用。
- 新增样式必须局部 scope 到页面或组件区域，不用裸 `section`、`.card`、`.hero` 做无边界覆盖。
- 改 site 时不修改 desktop 默认 theme、sidebar logo、welcome logo、app icon、Soha 文案。
- 改 desktop 时不借 site 的 global CSS、radius、hero、gradient 或 nav 结构。

## Verification

文档或注释改动：

```sh
rg -n "REALMLAB_SITE_BRIEF|Reasonix marketing site|RealmLab-compatible" DESIGN.md AGENTS.md site/src/styles/global.css docs/REALMLAB_SITE_BRIEF.md
```

未来正式 site UI 改动：

```sh
cd site
npm run build
```

同时至少浏览检查 1440px 桌面和 390px 移动端，确认没有横向滚动、控制台错误、用户可见 Reasonix 品牌回流或桌面产品默认视觉被污染。
