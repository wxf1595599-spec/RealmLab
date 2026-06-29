# RealmLab Design Constitution

最后更新：2026-06-25

本文件记录 RealmLab IDE 当前已经确定的产品审美、品牌资产和界面规范。后续任何桌面端设计、视觉、交互或品牌改动，都应优先遵守本文件。

本文是 RealmLab 的设计单一事实源。它不是灵感参考，而是产品边界、视觉判断、CSS 维护和验收的共同约束。

## How Agents Must Use This File

开始非平凡设计或 UI 改动前：

- 先确认真实项目目录是 `/Users/ustinian/Documents/RealmLab IDE/RealmLab`。
- 先判断改动属于桌面 shell、会话工作台、项目/会话树、设置/弹窗、官网兼容层还是上游同步，不要因为一个区域的问题顺手重做其它区域。
- 如果用户提供截图，优先处理截图里指出的具体问题；不要借题发挥，不要把局部修复扩展成品牌、logo、主题、站点或导航重做。
- 任何视觉建议都必须能落到本文件中的系统边界、页面职责、CSS 规则或验收项；不能只说“更现代”。
- 更改 logo 前先确认目标是 app icon、login / welcome logo、internal sidebar logo 还是 site logo。四者不得混改。

交付前：

- 文档-only 改动要用 `rg` 或等价方式确认新增规则确实写入。
- CSS / React UI 改动至少跑相关 contract test；影响桌面体验时优先跑 `cd desktop/frontend && corepack pnpm test` 中相关条目。
- 视觉改动如未做浏览器截图或像素级验收，必须明确说明本轮未做像素级验收。
- 上游同步后若出现与本文件冲突，以 RealmLab 产品决策为准，除非用户明确要求临时回滚。

## Product Position

- RealmLab IDE 是桌面客户端优先的 AI coding agent 产品。
- 主产品体验是原生桌面客户端，不是 Web 端、营销站或浏览器 Demo。
- 设计目标是安静、专业、高密度、适合长时间扫描和操作。
- 视觉气质应接近成熟开发工具、专业工作台、轻量 IDE，而不是消费级落地页。

## Product North Star

RealmLab 的产品北极星：

> 让本地代码工作变得可控、可见、可恢复的 AI 工作台。

所有桌面端设计都应帮助用户更清楚地理解三件事：

- 当前 AI 正在做什么、卡在哪里、下一步会发生什么。
- 本地项目、会话、工具调用、文件上下文和长期记忆之间是什么关系。
- 用户能如何暂停、回看、恢复、审计或接管一次代码工作。

因此 RealmLab 应保留并强化：

- 高密度但可扫描的信息结构。
- 清晰的项目/会话/上下文边界。
- 可回放、可恢复、可审计的执行痕迹。
- 低噪声、低营销感、长期使用不疲劳的视觉环境。

RealmLab 不应追求：

- 为了“炫技”牺牲可读性和稳定尺寸。
- 把工具界面做成落地页或概念展厅。
- 用大面积装饰、渐变、粒子或夸张动效掩盖信息结构。
- 让上游 `Reasonix` 或内部 legacy 名称重新成为用户认知对象。

## System Layers

RealmLab 不是一个单页 UI，而是几个边界清楚的产品层：

- Desktop shell: macOS / Windows / Linux 原生窗口、标题栏、菜单、托盘、启动画面、更新和崩溃报告。职责是让应用可靠启动、恢复和退出。
- Workbench: 侧栏、项目树、会话区、composer、工具调用、状态栏。职责是高频代码工作，不承担营销表达。
- Execution model: approval mode、Plan / Normal、Soha、ask、background jobs、memory、MCP 和 tools。职责是把 AI 行为解释清楚，并保留用户选择权。
- Context surfaces: workspace preview、文件树、context panel、设置页、能力面板。职责是让上下文可检查、可调整、可回收。
- Brand surfaces: app icon、login / welcome logo、internal sidebar logo、startup splash。职责是稳定识别，不承担功能说明。
- Upstream compatibility surfaces: `site/`、`workers/`、legacy docs、internal `reasonix` module path。职责是兼容和迁移，不定义当前桌面产品体验。

设计改动必须先定位所属层。Workbench 的密度不要灌进 login / welcome；官网兼容层的 landing page 风格不要反向污染桌面；上游同步不能覆盖 Brand surfaces 和 Default Appearance。

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
- `MicroRealm` 字标: `Micro` weight 600；`Realm` weight ~380（在 Logo Kit 200 基础上提重，使其在约 40px 侧栏尺寸下与 `Micro` 读成一个词，不再发丝塌陷）；tracking 约 `-0.05em`；用 SVG `textLength` 锁定 `MicroRealm` 宽度，保证星标/`Lab` 在不同系统字体下的字偶距一致。
- 星标使用可控 SVG 四角星几何，填充 brand accent `#2f6fe0`，不使用 emoji，不依赖字体字符。
- `Lab` 是产品后缀（当前 weight ~500、灰 `#3F3F46`），视觉音量必须低于主品牌，不要压过 `MicroRealm`。
- 当前文件: `desktop/frontend/src/assets/logo-wordmark.svg`

### Student Mode Logo

- 学生版（`app--student-mode`）欢迎页 hero 使用专属字标，是 `MicroRealm` 的童趣变体：圆润字重（`ui-rounded` 字体栈，无新字体依赖）、brand blue 渐变 `#2f6fe0 → #3b82f6`、品牌四角星 + 两侧轻盈浅蓝 sparkle。
- 不引入 `Reasonix` 字标，不使用绿色翅膀等上游/第三方视觉。
- 当前文件: `desktop/frontend/src/assets/logo-wordmark-student.svg`；配套装饰星空底 `desktop/frontend/src/assets/student-welcome-bg.svg`。

### Brand Asset Source

官方资产源是用户提供的 `MicroRealm_Logo_Kit.zip`。使用原则：

- `MicroRealm_Wordmark_Horizontal_Light.svg` 是浅底字标基础。
- `MicroRealm_M_Light.svg` 是浅底独立符号基础。
- 不得重建一个与 Logo Kit 风格冲突的临时字标。
- 不得重新引入 Reasonix wordmark。

## Borrow Without Riffing

RealmLab 可以借鉴 MicroRealm 项目的执行颗粒度，但不能复制它的视觉气质。

可以借鉴：

- 把设计规则写成可执行边界，而不是抽象审美偏好。
- 每个区域先声明职责，再讨论布局、文案、颜色和动效。
- 用反模式清单阻止常见漂移。
- 用 contract tests 锁住品牌、默认主题、logo 分工、关键文案和 CSS 边界。
- 验收时明确“已验证”和“未做像素级验收”。

不要借鉴：

- MicroRealm 官网的艺术科研感、电影感、公开页留白节奏。
- 创意实验场的暗色沉浸和作品社群表达。
- 面向儿童 AI 创作的文案、叙事和温度。
- 官网 hero、partners marquee、机构页、社群雷达等页面形态。

RealmLab 的对应判断是：如果一个改动不能增强“本地代码工作可控、可见、可恢复”，就不应该进入桌面工作台。

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

## Page and Region Responsibilities

### Sidebar

- 展示品牌、全局入口、项目、topic、session 和运行状态。
- 侧栏不是广告位，不放长说明、营销语或大号 hero 文案。
- Topic / session 标题必须来自用户可理解文本，不显示内部 XML、memory compiler、JSON、UUID 或临时调试标记。
- 选中、运行、错误、等待确认状态要可扫描，但不能让行高跳动。

### Composer

- Composer 是命令入口，不是设置页。
- 关键状态包括模型、effort、approval mode、plan mode、附件、引用上下文和发送可用性。
- Soha 文案必须解释运行结果：跳过工具审批，但 ask 问题和计划确认仍等待用户。
- 输入区、modebar、更多菜单都必须在高文字缩放下保持可用。
- 语音输入是桌面端正式能力，不是浏览器 demo：优先使用 MediaRecorder 捕获麦克风音频，再通过 Wails 后端统一调用 ASR/Whisper 类 provider 转写。Web Speech Recognition 只能作为备用路径。
- 语音输入按钮必须与发送按钮保持同一操作区；权限拒绝、录音失败、转写失败都必须恢复输入区可编辑状态，不得让 composer 卡在 listening 状态。
- macOS 打包必须声明麦克风权限；Windows/Linux 不得依赖某个 WebView 恰好支持 SpeechRecognition 才算可用。

### Transcript

- 以阅读和审计为优先，消息分组、工具调用、diff、代码块、markdown table 都要能回看。
- 不用装饰性气泡和聊天软件式强拟物。
- 工具结果可以折叠、归档、摘要，但不能让用户失去追踪执行链路的能力。

### Context and Settings Panels

- Context panel 用来解释当前项目、文件、token、memory 和运行环境。
- Settings 是密集工具界面，禁用 landing page 式插画和大标题堆叠。
- 密钥、provider、bot、hooks、MCP、skills 等区域必须优先可读、可恢复、错误态清楚。

### Welcome, Login, Startup

- Welcome / Login 是低频入口，允许更多留白，但仍属于工具产品，不做营销站 hero。
- Welcome logo 使用纯 `MicroRealm`，不加 star，不加 `Lab`。
- Startup splash 可以显示 `MicroRealm Lab`，但不要引入 Reasonix 或多套品牌锁定。

### Website / Site

- `site/` 是上游兼容和未来官网实验层，不是当前桌面产品体验。
- 如果要正式做 RealmLab 官网，必须先写独立 site brief，不得直接沿用上游 Reasonix marketing site 的视觉语言。
- Site 的视觉和桌面 workbench 可以共享品牌事实，但不共享 CSS、布局节奏或组件规则。

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

## Student Mode 视觉语言

学生版（顶栏学士帽开关，`app--student-mode`）是面向学生/初学者的**有意例外**：它可以使用本文件在正常工作台中禁止的童趣、明亮、轻装饰风格。这一例外是产品决策，不是 drift，未来的设计/上游同步不得把它当普通冲突“修”回 Slate 工作台，也不得反向把学生版风格溢出到正常模式。

边界与规则：

- **作用域唯一**：学生版的所有童趣样式必须挂在 `.app--student-mode` 下（并可用 `.welcome--brand` 等区域 class 抬高优先级压过 `:root[data-theme-style]` 覆盖）。正常模式的 light + slate 专业工作台一个像素都不受影响。
- **允许**：浅色天空渐变背景、克制的星球/四角星 sparkle 装饰层、`MicroRealm` 童趣字标 hero、圆润字体（`ui-rounded` 栈）、白色圆角建议卡 + 每卡彩色图标徽标、轻盈 hover 上浮。
- **仍然禁止**：用户可见 `Reasonix`/`Yolo`（权限文案仍为 `Soha`）、emoji 当结构图标、文本溢出或布局跳动、把装饰做到掩盖信息结构、引入新字体依赖、改 `:root` token。
- **动效**：hover/装饰动效控制在 150–760ms，必须有 `prefers-reduced-motion` 退路。学生版和默认工作台之间的切换由 `StudentModeTransition` 独立组件负责：它必须是全屏独立转场层，并借用登录/启动动画的视觉语言做短版变体（轻遮罩、中心 MicroRealm symbol、玻璃 mark、三点节奏、工作台/学士帽 glyph morph），形成明确但短促的页面转场记忆点；禁止仅做按钮附近小徽章、全屏高透明彩色 wash/sheen、curtain wipe、页面整体 settle、夸张弹跳和常驻状态 pill。切换动画只动 `opacity`/`transform`，overlay 必须 `pointer-events: none`，结束后清理临时状态。
- **主题**：学生版当前面向默认 light slate；深色主题下其浅底 hero 为已知 v1 取舍。
- **相关资产/选择器**：`logo-wordmark-student.svg`、`student-welcome-bg.svg`、`.app--student-mode .transcript--empty`、`.app--student-mode .welcome--brand …`。
- **后端**：学生版会在 system prompt 追加 `config.StudentModeEducationPolicy`（师生语气），切换走 `SetStudentMode` 并重建 controller；视觉改动不应破坏该行为或 `topicTitleSourceAuto` 等护栏。

## Desktop-Only Product Boundary

- RealmLab 当前只要求桌面客户端应用。
- 不要为了产品体验去优先完善 Web 端、site 或 worker。
- Web/site/worker 可以保留用于上游兼容，但不得让 RealmLab 的核心体验依赖它们。

## Website Boundary

RealmLab 的官网边界写在 `docs/REALMLAB_SITE_BRIEF.md`。

当前规则：

- `site/` 可以继续作为上游兼容 marketing surface 存在，但不能定义桌面产品默认审美。
- `site/src/styles/global.css` 不应继续自称 `Reasonix marketing site`。
- 以后若要做 RealmLab 正式官网，必须先明确 site north star、受众、信息架构、视觉系统和与桌面端的品牌分工。
- 官网可以展示桌面产品，但不能把桌面 UI 改成官网风格，也不能把上游 Reasonix 视觉带回桌面。

## Anti-Pattern Checklist

以下情况应直接打回或要求重新说明理由：

- 用户只指出局部问题，却顺手改 welcome logo、app icon、site、主题默认值或全局导航。
- 用户可见文案出现 `Reasonix`、`DeepSeek-Reasonix`、`Reasonix / RealmLab`、`Yolo` 或 `YOLO`。
- Topic / session / tab 标题显示内部 XML、JSON、memory compiler、MCP payload、UUID 或 debug label。
- 为了“更高级”引入大面积紫蓝渐变、漂浮图形、bokeh、粒子、伪科技轨道线或营销 hero（唯一例外：学生版 `app--student-mode`，见「Student Mode 视觉语言」；该例外不得溢出到正常模式）。
- 修改 `desktop/frontend/src/styles.css` 时用宽选择器覆盖共享组件，却没有局部 scope 和回归测试。
- 修改固定尺寸控件后 hover、active、running、error、loading 或长文案导致布局跳动。
- 把 dark creative / site / upstream 风格反向套到默认桌面 Slate。
- 将 `light + slate`、sidebar wordmark、login wordmark、Soha 文案或 `RealmLabIdentityPolicy` 当作普通上游冲突处理掉。

## CSS Maintenance Rules

`desktop/frontend/src/styles.css` 已经很大，新增样式必须局部 scope，并更硬地控制边界。

- 新样式优先挂在明确区域 class 下，例如 `.project-tree__...`、`.composer-...`、`.settings-...`，不要用裸 `button`、`section`、`.card`、`.title` 覆盖全局。
- 不随便改 `:root` token。只有默认主题、跨组件语义 token 或系统性无障碍修复才允许新增/修改 root token。
- 不用宽选择器覆盖共享组件来修局部问题。局部问题应靠局部 class、状态 class 或组件结构解决。
- 新增颜色优先复用现有 token；必须新增时写清它属于 surface、text、border、accent 还是 semantic state。
- 新增动效必须有 `prefers-reduced-motion` 退路，且不改变固定格式控件的最终尺寸。
- 对反复出问题的区域补 contract test，例如 sidebar title overflow、logo 分工、Soha 文案、theme defaults、statusbar height、composer compact controls。
- CSS 改动交付前至少跑 `cd desktop/frontend && corepack pnpm build`；只改文档时不需要。

## Visual QA Checklist

视觉或交互改动完成后，按影响范围选择验收：

- 桌面 shell / workbench：至少检查 1440px 和窄窗口，确认 sidebar、composer、statusbar、context panel 不重叠。
- 文本和控件：检查默认、hover、active、disabled、loading、error、running、waiting confirmation。
- 高密度列表：检查长项目名、长 topic、长 session、中文、英文、emoji-like 用户输入、内部 payload 被清理。
- 主题：默认 `light + slate` 必须可读；深色 Slate 不得断层。
- Logo：internal sidebar logo、welcome logo、app icon 分别检查，不用一个资产替换所有位置。
- 交付说明中写明跑过哪些验证；没有做浏览器截图时说明未做像素级验收。

## Design Contract Tests

RealmLab 使用 contract tests 锁住关键设计决策。

必须持续保护：

- 默认主题为 `light` + `slate`。
- 用户可见桌面品牌为 `MicroRealm Lab` / `RealmLab IDE`。
- Welcome logo 是纯 `MicroRealm`；internal sidebar logo 是 `MicroRealm` + star + `Lab`。
- Soha 是用户可见 approval mode 文案，`yolo` 只作为内部 legacy mode。
- `site/` 有独立边界，不能继续以 Reasonix marketing site 作为当前设计说明。
- `DESIGN.md` 必须保留 product north star、system layers、region responsibilities、anti-patterns、CSS maintenance 和 visual QA。

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
