# Aholo 3D 官网首页 · 开发交接文档

更新：2026-11-16　|　代码分支：`claude/kind-einstein-v3cbd3`　|　设计预览：https://claude.ai/artifact/4c1ZxTY3cMVedGqukgsETL

---

## 0. 先读这里

### 以哪份为准

| 来源 | 内容 | 用法 |
|---|---|---|
| **代码仓库**（本分支） | Next.js 16 App Router + next-intl，首页所有板块的正式实现 | **开发以此为准**，可直接合并或对照 |
| **设计预览页**（上面的链接） | 静态 HTML，在仓库构建产物上叠加了若干 CSS/JS 补丁 | 看最终视觉和动效；有一部分只在预览里，见第 4 节 |
| 本文档 | 改动说明、规格、待定项 | 对照用 |

### 本地运行

```bash
npm install
```

```bash
npm run build && npx next start -p 3000
```

页面地址是 `/zh` 和 `/en`（`localePrefix: 'always'`）。

提交前请跑这几项检查：`npx prettier --check .`、`npx tsc --noEmit`、`npx eslint .`、`node scripts/check-messages.mjs`（检查中英文案 key 是否对齐）。

### 文件地图

| 内容 | 文件 |
|---|---|
| 首页板块顺序 | `app/[locale]/page.tsx` |
| 顶部导航 | `components/site/SiteHeader.tsx`、`components/site/LangMenu.tsx` |
| 首屏 | `components/home/viewport/ViewportHero.tsx`、`components/home/cover/CoverUpload.tsx`、`components/home/cover/coverIntro.ts` |
| 核心能力 | `components/site/CoreCapabilities.tsx`、`AgentMcp.tsx`、`AgentMarquee.tsx` |
| 专为 Agent 设计 | `components/site/AgentsShowcase.tsx`（由 `Sections.tsx › ForAgents` 挂载） |
| 应用场景 | `components/site/UseCaseStack.tsx` |
| 为什么选择 | `components/site/WhyStack.tsx` |
| 用户证言 / 收尾引导 | `components/site/Sections.tsx`、`FinalReveal.tsx` |
| 社区作品 | `components/site/CommunityWall.tsx` |
| 全部文案（中 / 英） | `messages/zh.json`、`messages/en.json` |
| 字体 | `components/site/fonts.ts` |
| 样式、动效 | `styles/globals.css` |
| 外链配置 | `config/site.ts`（`links.app`、`links.login` 等，由环境变量覆盖） |

---

## 1. 首屏：对照截图的改动

截图里的版本：导航右侧是 `Connect Your Agent` 和 `Sign Up / Log In`；标题是 “AI 3D for You and Your Agents”，“for You and Your Agents” 整段粉色。

| # | 位置 | 截图里 | 现在 | 实现位置 |
|---|---|---|---|---|
| 1 | 导航右侧主按钮 | Sign Up / Log In | **开始创作 / Start creating**，跳 `site.links.app`（创作平台首页） | `SiteHeader.tsx`，文案 `common.startCreating` |
| 2 | 导航右侧次按钮 | Connect Your Agent | **接入 Agent / Connect agent**（描边按钮），跳 `/for-agent` | `SiteHeader.tsx`，文案 `common.connectAgent`。英文措辞待定，见第 5 节 |
| 3 | 主标题文案 | AI 3D for You and Your Agents | 中：`AI 3D，为你和你的 <Agent>`；英：`AI 3D for You and Your <Agents>`，带尖括号 | `messages/*.json › home.viewport.titleA / titleYou / titleB` |
| 4 | 主标题配色 | 后半段整段粉色 | 三段颜色：`AI 3D for` 用白色；`You and Your`（中文「你和你的」）是白 → `#e4dbff` 的轻微渐变；`<Agents>` 是 `#d6c8ff` → `#a684ff`（70%）的渐变，是唯一的重点 | `globals.css` 里的 `#hero-title .ht-you` 和 `.ht-word` |
| 5 | 吉祥物 | 无 | 紫色小精灵从右侧抱住 `<Agents>`，手臂搭在 `>` 上 | 见下面 1.1 |
| 6 | 英文标题字体 | — | 英文标题用 **Pontano Sans**，中文用 Geist（中文字回退到苹方 / MiSans）。仓库里之前漏加载了 Pontano Sans，已修复（提交 `2423a2c`） | `components/site/fonts.ts` |

### 1.1 抱住 `<Agents>` 的小精灵

- **图片**：`public/works/hero-mascot.webp`，470×426，透明底，已抠干净。
- **结构**：

  ```html
  <h1 id="hero-title">
    <span class="ht-l1">AI 3D for <span class="ht-you">You and Your</span></span>
    <span class="ht-ag">
      <img class="ht-m ht-hug back" src="/works/hero-mascot.webp" alt="" aria-hidden>
      <span class="ht-word">&lt;Agents&gt;</span>
      <img class="ht-m ht-hug front" src="/works/hero-mascot.webp" alt="" aria-hidden>
    </span>
  </h1>
  ```

  同一张图放两份：
  - `back`（z-index 0）放在文字后面；
  - `front`（z-index 2）用 `clip-path: inset(0 63% 0 0)` 只露出左侧 37%，也就是手臂。这样看起来是“手臂压在字上、身体在字后”。
- **尺寸和位置**（单位 em，跟着标题字号缩放）：
  - `height: 1.12em; right: -1.06em; bottom: -0.1em`；
  - `.ht-ag { margin-right: 1.1em }`，给小精灵留出位置。
- **颜色**：`filter: brightness(1.45) saturate(0.85) drop-shadow(0 6px 14px rgba(80,30,160,.3))`。这是设计确认过的版本，比原图亮约 45%、略降饱和，好和 `<Agents>` 的浅紫搭。
- `ht-l1` 设了 `white-space: nowrap`，窄屏时 `<Agents>` 和小精灵会整体换到第二行。

### 1.2 首屏其余部分（相对更早版本已改，截图里已经是这样）

- **背景**：全屏循环视频，白模过渡到成片。移动端用 `hero-final-hold-720.mp4`，桌面用 `hero-final-hold.mp4`。开启“减少动态效果”时只显示海报图。
- **上传对话框的入场动画**（`coverIntro.ts`）：
  - 先显示一个单行药丸（左边 “+”，中间提示文字，右边闪光图标），图标闪一下；
  - 然后先向两侧、再向上下展开成完整对话框，原内容依次淡入；
  - 总长约 5.4 秒；
  - 对话框进入视口一半以上、而且标签页可见时播放，离开视口后再回来会重播；
  - 中途窗口尺寸变化会按新尺寸重来。
- **对话框右下角提交按钮**（`.brand-hero`）：黑色药丸，紫色细边；按钮内有一道波形动效（`media/hero-cta-fill.svg`）；外圈是银紫色流光边，`conic-gradient` 每 6 秒转一圈。

---

## 2. 全站规则

### 2.1 字体

| | 标题 | 正文 |
|---|---|---|
| 中文页 `/zh` | Geist（西文和数字）+ 苹方（中文） | Geist + 苹方，非苹果系统回退 MiSans |
| 英文页 `/en` | **Pontano Sans** | **Geist** |

- 首屏主标题字重 600，`letter-spacing: -0.02em`。
- 中文主标题字号 `clamp(2.4rem, 4.45vw, 4rem)`，全宽时约 64px。

### 2.2 字号（首屏以下各板块统一，只用三档，全是偶数）

| 用途 | 字号 / 行高 |
|---|---|
| 板块大标题 | **50 / 56**（英文 40 / 48） |
| 卡片标题 | **18 / 26** |
| 说明文字（含板块副标题、卡片说明） | **16 / 28** |

间距只用这几档：48、32、24、20、16、8。

### 2.3 按钮

- **主按钮**（导航「开始创作」等）：
  - 底色是 `linear-gradient(90deg, #a684ff, #fff)`，字色 `#171717`，圆角 9px，高 32px，字号 13px；
  - 扫光动效 `.btn-sheen`：一道白色高光从右扫到左，周期 3.6 秒，每个周期前 55% 的时间停住不动。
- **页面中段浅底的号召按钮**：延用首屏按钮的配色，圆角 10px，同样带扫光。
- **描边按钮**（「接入 Agent」）：透明底，`border: 1px solid rgba(255,255,255,.16)`，hover 时底色 `white/8%`。

---

## 3. 各板块规格（自上而下）

板块顺序见 `app/[locale]/page.tsx`：

| 顺序 | 板块 | 组件 |
|---|---|---|
| 1 | 首屏 | `ViewportHero` |
| 2 | 核心能力 | `CoreCapabilities`（`#core`） |
| 3 | 专为 Agent 设计 | `ForAgents`（`#agents`） |
| 4 | 应用场景 | `UseCaseStack`（`#scenes`） |
| 5 | 为什么选择 Aholo 3D | `WhyUs`（`#why`） |
| 6 | 用户证言 | `Testimonials`（`#voices`） |
| 7 | 社区作品 | `Community`（`#community`） |
| 8 | 收尾引导 | `FinalCta`（`#start`） |

### 3.1 顶部导航 `SiteHeader`

- **布局**：
  - 桌面端三栏网格 `grid-cols-[1fr_auto_1fr]`：Logo 在左，菜单居中，操作区在右（参考 Meshy）；
  - 移动端用汉堡菜单打开侧边抽屉。
- **菜单树**：下拉面板是毛玻璃样式，菜单项不带图标。

  | 一级 | 二级 | 链接 |
  |---|---|---|
  | Products 产品 | Editor 编辑器 | `/editor` |
  | | For Agents 面向 Agent | `/for-agent` |
  | Features 功能 | Image to 3D 图生 3D | `/features/image-to-3d` |
  | | Retexture 重新贴图 | `/features/retexture` |
  | | Animate 动画 | `/features/animate` |
  | Solutions 解决方案 | Game 游戏 | `/solutions/game` |
  | | Film 影视 | `/solutions/film` |
  | | Printing 3D 打印 | `/solutions/printing` |
  | | Architecture 建筑 | `/solutions/architecture` |
  | Community 社区 | Gallery 作品库 | `/workspace/gallery` |
  | | Discord / 社群 | 暂无链接（不可点击） |
  | Pricing 定价 | — | `/pricing` |

  以上子页面都还没建，目前点进去是 404。
- **右侧操作区**，从左到右：
  1. 「接入 Agent」描边按钮；
  2. 「开始创作」主按钮；
  3. 一条竖分隔线：`mx-2 h-3.5 w-px bg-white/18%`；
  4. 地球图标（32×32），点开是语言下拉（中文 / English），切换时停在当前页面。
- 移动端抽屉底部放「接入 Agent」和「开始创作」两个按钮。

### 3.2 核心能力 `CoreCapabilities`

- **标签顺序**：Agent 接入 → 图生 3D → 文生 3D。每个标签对应一张大卡片：左侧是标题、说明和要点，右侧是演示窗口，窗口溢出卡片右下边缘。
- **Agent 接入**：右侧用 iframe 嵌入 `public/agent-demo/index.html`。演示内容是：对话 → MCP 调用步骤 → 3D 体育场模型。
- **图生 3D**：模拟工作台，把一张 2D 图拖进上传区，然后播放 `videos/core-image.mp4`。
- **文生 3D**：
  - 提示词逐字打进一张玻璃卡片，发送按钮按下后播放 `videos/core-text.mp4`；
  - 每次滚动进入视口都重播；
  - 视频只播一次，停在最后一帧（成品模型）。
- **卡片下方附加两块内容**：
  - **MCP 接入条** `AgentMcp`：
    - 左边标题，右边是命令、复制按钮和「MCP 接入指南」链接；
    - 外圈有流光边框；
    - 命令是 `npx add-mcp @aholo/mcp-server --env AHOLO_API_KEY=YOUR_API_KEY`，**包名待确认**。
  - **支持的 Agent 滚动条** `AgentMarquee`：
    - 慢速横向循环滚动；
    - 当前列表：Claude Code、Codex、Cursor、OpenClaw、Manus、ZCode、Pi、OpenCode、WorkBuddy；
    - 仓库里还是文字字形，要换成官方 logo（预览里已有）。

### 3.3 专为 Agent 设计 `AgentsShowcase`（方案：便签散落）

- **背景**：点阵。
- **标题**：居中大标题「专为 Agent 设计」/「Built for Agents.」，旁边贴着两个小精灵贴纸：`works/agent-sticker-1.webp`、`agent-sticker-2.webp`。
- **便签**：滚动到这里时，五张紫色便签依次弹出，散落在标题周围。每张便签是一句加粗标题加一段说明，文案见 `site.agents.items`。
- **便签位置**：格式是 [左 %, 上 %, 旋转角度]，从第 1 张到第 5 张依次为：

  ```
  [36, 26, -3]
  [61, 30, 4]
  [48, 64, -1.5]
  [22, 60, 5]
  [76, 64, -4]
  ```

- 窄屏或开启“减少动态效果”时，改成普通的静态列表。
- 文案在服务端渲染，SEO 能抓到。

### 3.4 应用场景 `UseCaseStack`

- **布局**：三个全屏色块面板，依次是 3D 打印 → 游戏资产 → 影视创作预演。
- **滚动效果**：
  - 面板是 sticky 的，下一块从下方推上来，盖住上一块；
  - 被盖住的那块缩小到 94%，并压暗 55%。
- **切换器**：面板顶部有一个领域切换器，白色药丸先滑到点击的项，然后页面再滚动过去。
- **版式**：「S 单图·左文右图」，对应 `useSceneLayout` 的默认值 18。
  - `SCENE_LAYOUTS` 里的其余版式只是评审用的备选，上线前可以删掉，只保留 S。
- **配图**：
  - 3D 打印面板用 `works/scene-print-1~3.webp`；
  - 另外两个领域的配图在预览里已有，见第 4 节。
- **按钮**：右侧只留一个「开始创作」按钮。
- **中文标题**：
  - 3D 打印：把照片和创意做成手办、摆件与定制物品；
  - 游戏：生成资产更快更省；
  - 影视：先预演，再成片。

### 3.5 为什么选择 Aholo 3D `WhyStack`

- **滚动动画**，三张卡片，按滚动进度（0 到 1）推进：

  | 滚动进度 | 发生什么 |
  |---|---|
  | .10–.27 | 第一张卡片左移 |
  | .27–.44 | 第二张卡片进到中间，停住 |
  | .56–.76 | 第三张卡片直接进到右边的位置 |
  | .86–.96 | 只有遮罩和文案变化，变成最终的三栏 |

- 宽度不到 560px 或开启“减少动态效果”时，改成静态堆叠。
- **卡片宽度**：

  ```css
  --w: min(1100px, calc(100vw - 64px), max(720px, calc((100svh - var(--header-h, 64px) - 400px) / .27)));
  ```

  这样在较矮的窗口里，卡片也不会缩得太小。
- **其他**：
  - 背景是点阵；
  - 每张卡片左上角有一个小标签（`.tile-tag`：制作成本 / 制作简便 / 生成质量），不带数字。
- **配图**：`works/why-game-1~3.webp`。

### 3.6 用户证言 `Testimonials`

- 两排卡片，朝相反方向缓慢漂移，周期 90 秒，两侧边缘渐隐，鼠标悬停时暂停。
- ⚠️ **现在的 10 条证言是占位草稿，不是真实用户**。上线前必须换成真实内容，或者删掉这个板块。

### 3.7 社区作品 `CommunityWall`

- **布局**：三排作品卡片，每排 10 个，相邻两排反向横向漂移，边缘渐隐。
- **作品数据**：顺序固定，按设计稿排列。
- **悬停效果**：鼠标悬停（触屏是长按，键盘是聚焦）时显示白模，移开恢复渲染图。
- **图片**：
  - 渲染图：`works/<name>-render.webp`；
  - 白模：`works/<name>-clay.webp`，只有部分作品有。

### 3.8 收尾引导 `FinalCta` + `FinalReveal`

- 插画 `works/final-cta.webp`，进入视口就立刻展开：先在中间窄条里出现文案，然后图片向两侧铺满整屏，展开后没有边框。
- 按钮是「开始创作」，带箭头，跳 `site.links.app`。

---

## 4. 只在设计预览里、还没进仓库的部分

这些是另一个设计会话直接加在预览页上的，仓库里还没有对应实现。需要上线的话，请照着预览实现。

可以在预览页上按 F12 查看。部分补丁是单独的 CSS/JS 文件（通过 Artifact 的 files 列表能拿到）；另一部分直接内联在预览 HTML 里。

| 内容 | 预览里的样子 |
|---|---|
| 页脚 | 整站页脚 |
| 导航社区图标 | 位于地球图标左边：英文页是 Discord 链接（`DISCORD_URL` 还是占位）；中文页悬停弹出社群二维码卡片（`media/community-qr.svg`，二维码是占位） |
| 支持的 Agent 滚动条 | 换成了真实 logo |
| 文生 3D 面板 | 基于 `works/text-panel.svg` 的面板 |
| 图生 3D 面板 | 左侧拆件面板 `media/split-panel.svg` |
| 其他 | 首屏按钮填充 `media/hero-cta-fill.svg`；Why 区卡片发光；应用场景面板柔光；页面底色改为 `#08070c` |

---

## 5. 待定和需要确认

1. **「接入 Agent」的英文措辞**：截图里是 “Connect Your Agent”，仓库里是 “Connect agent”，预览里是 “Use with Your Agent”。请产品定一个，改 `messages/en.json › common.connectAgent`。
2. **英文副标题**：仓库里是 “Type text, add an image, or hand it to an AI agent — and get 3D models, fast.”，截图和预览里是 “Text or images to ready-to-use 3D in under a minute. Start for free.”。请定稿，改 `home.viewport.subtitle`。
3. **应用场景的英文标题**还是旧版，跟中文新标题不对应。
   - 游戏：中文「生成资产更快更省」，英文还是 “Generate characters, props and scenes to prototype games faster”；
   - 影视：中文「先预演，再成片」，英文还是 “Previs the scene and shots first, then generate AI video”。
4. **用户证言**是占位，见 3.6。
5. **MCP 包名和命令**（`@aholo/mcp-server`），以及「MCP 接入指南」的链接，需要确认。
6. **外链**：`config/site.ts` 里的 `app`、`login` 等域名还是 `*.lux3d.example` 占位，部署时通过环境变量 `NEXT_PUBLIC_APP_URL` 等设置真实域名。
7. **导航子页面**都还没建。
8. **Discord 链接和社群二维码**都是占位。
9. 导航上去掉「注册 / 登录」之后，登录入口靠创作平台承接。如果官网还需要单独的登录入口，需要另外设计。

---

## 6. 最近的相关提交（本分支）

| 提交 | 说明 |
|---|---|
| `2423a2c` | 加载 Pontano Sans，修复英文标题字体 |
| `4d5f242` | 标题 “You and Your” 轻微渐变 |
| `38005f4` | 导航主按钮改为「开始创作」 |
| `99db559` | 新主标题 + 抱住 `<Agents>` 的小精灵 |
| `113aa3d` 及更早 | 导航居中、菜单树、按钮扫光、各板块改版，可以用 `git log` 查看 |
