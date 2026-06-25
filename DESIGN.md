# RealmLab Design System

本文件记录 RealmLab IDE 当前已经确定的产品审美、品牌资产和界面规范。后续任何桌面端设计、视觉、交互或品牌改动，都应优先遵守本文件。

## Product Position

- RealmLab IDE 是桌面客户端优先的 AI coding agent 产品。
- 主产品体验是原生桌面客户端，不是 Web 端、营销站或浏览器 Demo。
- 设计目标是安静、专业、高密度、适合长时间扫描和操作。
- 视觉气质应接近成熟开发工具、专业工作台、轻量 IDE，而不是消费级落地页。

## Default Appearance

RealmLab 的默认外观必须保持：

- Theme: `light`
- Theme style: `slate`
- Accent: brand blue

这些默认值必须在以下位置保持一致：

- `internal/config/config.go`
- `desktop/frontend/src/lib/theme.ts`
- `reasonix.example.toml`

Slate 是 RealmLab 当前默认配色。浅色模式核心色值：

- App background: `#f5f6f9`
- Elevated surface: `#ffffff`
- Soft surface: `#eef0f4`
- Primary text: `#15181f`
- Secondary text: `#4a5160`
- Muted text: `#828a99`
- Brand accent: `#2f6fe0`
- Accent gradient: `linear-gradient(120deg, #2f6fe0, #3b82f6)`

深色 Slate 也必须保留完整适配，但第一启动、打包给别人、重新打开本地应用时，默认都应回到浅色 Slate。

## Brand Identity

用户可见品牌名称：

- Product name: `RealmLab IDE`
- Assistant and in-app product identity: `MicroRealm Lab`
- Do not show upstream `Reasonix` as a user-facing product name.

允许保留 `reasonix` 的地方：

- Go module path
- internal package path
- compatibility config key
- exact upstream repository URL
- legacy command or path when technical accuracy requires it

面向用户的标题、欢迎语、聊天提示、设置项、状态描述和模型响应中，应使用 `MicroRealm Lab` 或 `RealmLab IDE`。

## Logo Rules

### App Icon

- App 应用图标使用当前圆弧角黑底图标。
- 只改应用外部图标时，不要顺手替换应用内部 wordmark。
- 图标应保持圆角、黑色质感底、银色平台、橙色立方体的识别特征。

### Login / Welcome Logo

- 登录动画和欢迎页使用纯 `MicroRealm` wordmark。
- 不加星星。
- 不加 `Lab`。
- 当前文件: `desktop/frontend/src/assets/logo-wordmark-login.svg`

### Internal Sidebar Logo

- 侧边栏和工作台内部品牌使用 `MicroRealm` + blue four-point star + `Lab`。
- `MicroRealm` 必须遵守 Logo Kit 规则: `Micro` weight 600, `Realm` weight 200, tracking about `-0.05em`。
- 星标使用可控 SVG 几何图形，不使用 emoji，不依赖字体字符。
- `Lab` 是产品后缀，视觉音量应低于或等于主品牌，不要压过 `MicroRealm`。
- 当前文件: `desktop/frontend/src/assets/logo-wordmark.svg`

### Brand Asset Source

官方资产源是用户提供的 `MicroRealm_Logo_Kit.zip`。使用原则：

- `MicroRealm_Wordmark_Horizontal_Light.svg` 是浅底字标基础。
- `MicroRealm_M_Light.svg` 是浅底独立符号基础。
- 不得重建一个与 Logo Kit 风格冲突的临时字标。
- 不得重新引入 Reasonix wordmark。

## Typography

- 主 UI 使用现有项目字体栈，不为小范围改动引入新字体依赖。
- 品牌字标应优先使用 Geist 风格规则。
- 不对普通小写 UI 文本使用负 letter spacing。
- 工作台、侧栏、工具调用、状态栏等区域应使用紧凑但清晰的字级。
- 避免 hero-scale 字号出现在侧栏、工具栏、状态栏或紧凑控件中。

## Layout Principles

- 桌面端是高频工作台，优先考虑扫描效率和操作密度。
- 使用 4px / 8px 间距节奏。
- 相关内容靠近，不同区域用明确留白或轻分隔。
- 左侧栏品牌区应有足够呼吸感，不应与 macOS traffic lights、新建会话按钮或项目列表挤在一起。
- 固定格式元素必须有稳定尺寸，避免 hover、图标、状态文本导致布局跳动。
- 文本必须在所有常见窗口宽度下不重叠、不遮挡、不溢出按钮或卡片。

## Component Style

- App UI 应安静克制，少装饰，多结构。
- 避免营销页式 hero、过大的标语、装饰卡片堆叠。
- 不要在卡片里再套卡片。
- 只有重复列表项、modal、明确需要 framed tool 的地方使用 card。
- 页面区域优先使用全宽 band 或无框布局。
- 图标按钮优先使用 lucide 或现有图标库，不用 emoji 当结构图标。
- 按钮文字只用于明确命令；常见工具动作优先使用熟悉图标并配 tooltip。
- Hover、focus、active、disabled 状态必须清晰，但不能造成布局位移。

## Color Rules

- 默认 Slate 是冷灰工作台配品牌蓝。
- 不要把界面做成单一色相的主题。
- 避免大面积紫色、紫蓝渐变、米色、咖啡色、深蓝 slate 过度统治页面。
- Accent blue 用于选中、发送、主操作和关键状态，不要泛滥到所有装饰。
- 语义色保持一致: success green, warning amber, error red。
- 深色模式不是简单反色，必须保持层级、边框和文字对比。

## Motion

- 动效服务于状态变化、层级转换和反馈，不做纯装饰。
- 常规微动效控制在 150ms 到 300ms。
- 避免大面积宽高动画，优先使用 transform 和 opacity。
- 必须尊重 `prefers-reduced-motion`。

## Naming and Copy

- `Yolo` 的用户可见文案改为 `Soha`。
- 内部模式值可以继续使用 `yolo`，用于兼容配置和代码路径。
- 面向用户的权限文案应解释结果: 跳过工具审批，但 ask 问题和计划确认仍等待用户。
- 不要在 UI 里写功能说明式长文。工作台 UI 需要状态、对象、动作，不需要营销话术。

## Desktop-Only Product Boundary

- RealmLab 当前只要求桌面客户端应用。
- 不要为了产品体验去优先完善 Web 端、site 或 worker。
- Web/site/worker 可以保留用于上游兼容，但不得让 RealmLab 的核心体验依赖它们。

## Review Checklist

每次视觉或交互修改后，至少检查：

- 默认主题仍是 light + slate。
- 侧栏 logo 仍是 `MicroRealm` + star + `Lab`。
- 登录 logo 仍是纯 `MicroRealm`。
- 用户可见处没有重新出现 Reasonix。
- `Soha` 没有被改回 Yolo/YOLO。
- 文本没有重叠、裁切或挤压。
- 新样式在浅色和深色 Slate 中都可读。
- 前端构建通过。

