# Lux3D 官网 · 第一阶段实施计划（待确认）

> 依据：《Lux3D 官网 · 搭建规格说明》第 0–15 节。本轮只做第 13 节「第一阶段：骨架」。
> 确认本计划后再开始写代码。

## 1. 技术选型与版本（npm 当前稳定版，`package.json` 锁定精确版本）

| 包                                             | 版本                     | 备注                                                                              |
| ---------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------- |
| next                                           | 16.4.3                   | App Router，`app/[locale]`                                                        |
| react / react-dom                              | 19.3.1                   |                                                                                   |
| typescript                                     | 5.x 最新                 | npm 上 `latest` 已是 7.0（Go 原生版），Next 16 的类型检查链尚未确认兼容，先锁 5.x |
| tailwindcss                                    | 4.3.3                    | v4 用 CSS 的 `@theme` 直接映射 CSS 变量，正好符合「token 驱动」                   |
| next-intl                                      | 4.14.9                   | `/zh`、`/en`，middleware 按 `Accept-Language` 跳转                                |
| three / @react-three/fiber / @react-three/drei | 0.187.0 / 9.8.2 / 10.7.9 |                                                                                   |
| gsap（含 ScrollTrigger）                       | 3.15.0                   |                                                                                   |
| lenis                                          | 1.3.27                   | 可关闭；reduced-motion 时自动关闭                                                 |
| zustand                                        | 5.0.16                   | cursor / narrative / perf 三个 store                                              |
| next-mdx-remote                                | 6.0.0                    | 从 `content/` 读 MDX，接口抽象成 `lib/content.ts`，后续换 CMS 只改这一层          |
| eslint / prettier                              | 最新稳定                 | `eslint-config-next` + prettier                                                   |

## 2. 目录结构

```
/
├─ SPEC.md                         规格说明原文（随第一次提交放入）
├─ app/
│  ├─ layout.tsx                   根布局（html/body 交给 [locale]）
│  ├─ sitemap.ts  robots.ts
│  └─ [locale]/
│     ├─ layout.tsx                Header / Footer / CursorLayer / Providers / 主题脚本
│     ├─ page.tsx                  首页 = Narrative（上半）+ HomeSections（下半）
│     ├─ not-found.tsx
│     ├─ create/ page.tsx + [feature]/page.tsx        → FeaturePage（8 个，generateStaticParams）
│     ├─ developers/ page.tsx + quickstart|sdk|integrations|batch|changelog → DeveloperPage
│     ├─ use-cases/ page.tsx + [slug]/page.tsx         → UseCasePage（6 个）
│     ├─ gallery/ page.tsx + [id]/page.tsx
│     ├─ technology/page.tsx       锚点：materials / representations / data / benchmark / roadmap
│     ├─ pricing/page.tsx          Tab：创作者订阅 / API 按量 + PriceCalculator
│     ├─ resources/ page.tsx, blog/, blog/[slug], tutorials/, tutorials/[slug], tools/ + 4 个工具占位
│     ├─ about/ careers/ contact/ news/ trust/ legal/terms legal/privacy  → 通用 SimplePage
│     └─ dev/slice/page.tsx        仅 development 可见（生产环境 notFound()）
├─ components/
│  ├─ layout/   Header, MegaMenu, MobileNav, MobileCTA, Footer, LocaleSwitcher, ThemeToggle
│  ├─ three/    ModelStage, GenerationSlice, GaussianParticles, MaterialChannels, CompareSlider3D, AssetLoader
│  ├─ narrative/ NarrativeCanvas, NarrativeTimeline, ProgressRail, ProLens, StageExit, SkipLink,
│  │             stages/ Capture Lift Material Alive Garden World Endings YourTurn
│  ├─ templates/ FeaturePage, UseCasePage, DeveloperPage, SimplePage, ContentList, ContentArticle
│  ├─ home/     Split, GalleryWall, UseCaseStrip, Trust, Integrations, PricingPreview, FAQ
│  ├─ ui/       Button, Tabs, Accordion, Badge, Card, CodeBlock, LogoWall, PriceCalculator, UploadDropzone
│  └─ seo/      JsonLd, Meta（buildMetadata 工具：title/description/OG/hreflang）
├─ features/
│  ├─ cursor/     useCursorStore, CursorLayer, cursor shapes(SVG), useNativeCursorGuard
│  └─ narrative/  stages.ts（8 阶段注册表：id/vh/镜头/鼠标模式/出口/透镜数据）, useNarrativeStore
├─ config/   site.ts（外链、地区差异、按环境变量切换）, nav.ts, assets.ts, pricing.ts
├─ content/  blog/ tutorials/ changelog/ 各 1–2 篇占位 MDX
├─ messages/ zh.json, en.json
├─ lib/      perf.ts（设备分级 → usePerfStore）, content.ts, motion.ts（reduced-motion）, i18n 路由工具
├─ i18n/     routing.ts, request.ts, navigation.ts（next-intl）
├─ middleware.ts
├─ public/posters/   降级用静态海报（占位 SVG，每阶段 1 张）
└─ styles/   tokens.css（浅色 + [data-theme="dark"] + prefers-color-scheme）, globals.css
```

## 3. 任务顺序（每步完成后保证 `dev`/`build`/类型检查通过再继续，每步单独提交）

1. **脚手架**：Next + TS + Tailwind v4 + ESLint/Prettier，建目录；`SPEC.md` 入库；原有 `index.html` 按待确认 #1 处理。
2. **Token**：`tokens.css` 全量变量（占位但有层级：灰阶、强调色、字号阶梯、间距 1–12、圆角、缓动/时长）；Tailwind `@theme` 只引用变量；明暗模式默认跟随系统，`ThemeToggle` 可手动覆盖（无闪烁内联脚本）。
3. **i18n**：next-intl 路由、middleware、`zh.json`/`en.json`，组件内零硬编码文案（加一个简单脚本检查两份语言文件 key 一致）。
4. **布局**：Header（MegaMenu 每项带一句说明；首页叙事期间收起为 Logo + 两按钮，向上滚动展开）、MobileNav（汉堡）、底部常驻「开始创作」、Footer 六列 + 语言切换 + 社媒、LocaleSwitcher（保持当前路径）。
5. **路由 + 模板**：第 4.2 节全部路由，内页套 FeaturePage / UseCasePage / DeveloperPage（左侧二级导航、CodeBlock 语言 Tab + 复制）/ Gallery（筛选 + 瀑布流 + 无限加载占位）/ Technology（锚点导航）/ Pricing（Tab + 计算器读 `config/pricing.ts`）/ MDX 内容页（可嵌 `<ModelStage />`）。数据驱动：页面内容来自 `config` + 语言文件，模板不写死。
6. **AssetLoader + ModelStage**：`asset(id)` 统一接口；`config/assets.ts` 每项 `{ kind: 'placeholder' | 'gltf', ... }`；占位几何体：小狗（可分部件：身体/头/耳/尾/腿，方便后续绑骨占位动画）、树、长椅、灯、宝箱。ModelStage 固定灯光 / 地面 / 投影 / OrbitControls 交互。
7. **GenerationSlice**：clippingPlanes 双侧裁切（完成态 vs 颗粒 + 线框），表面高光环，GaussianParticles（顶点采样 + 抖动 + 圆形柔边贴图 + 颜色读 token + 向切面漂移），支持 x/y/z 轴与竖向「世界边缘」用法；`/dev/slice` 滑杆控制 progress/axis/direction/开关。
8. **首页叙事机制**：
   - `NarrativeCanvas`（sticky 全屏 Canvas）+ `NarrativeTimeline`（GSAP ScrollTrigger，按 `stages.ts` 的 vh 生成滚动段，输出全局 progress 与当前阶段到 store；镜头按阶段关键帧插值，由近到远）。
   - 8 个阶段各自占位画面 + 最小可用动作：快门闪光 / 拖动旋转 + 切面扫过 / 光源跟随 + 对比滑杆 + 通道爆炸 / 扔球追球 + 视线跟随 / 点击放置物体 + 地块扩展 / 框选批量生成 / 分屏分割线 / 上传校验 + 跳转 `app` 占位。
   - `ProgressRail`（桌面侧边 / 移动顶部，可点击跳转，hover 显示能力名，末节点「开始创作」）、常驻「跳过」、`ProLens`（默认收起，占位技术数据）、`StageExit`。
   - 每阶段文案同时渲染为 SSR 的 DOM 文本（SEO + 屏幕阅读器），画布 `aria-label`。
9. **鼠标系统**：6 种模式、阶段驱动、SVG 形状间过渡（形变/缩放过渡而非瞬切）、rAF + 缓动跟随、`select` 射线命中 `userData.interactive` 后吸附到屏幕投影包围盒四角；仅叙事画布隐藏系统指针，`a/button/input/[role=button]` 上强制 `native`；触屏不渲染；每阶段主动作提供可聚焦按钮替代。
10. **首页下半部**：分流双卡、作品墙、场景速览、信任、工作流集成（Logo + 代码片段）、定价预览、FAQ（JSON-LD）、页脚。
11. **降级框架**：`prefers-reduced-motion` → 叙事改为逐段静态画面 + 文字，关闭镜头运动与 Lenis；移动端 → 点按/长按、镜头幅度减小；`usePerfStore` high/mid/low（low 用海报图分段 + 少量交互；mid 降颗粒、关阴影）；首屏先出静态海报 + 文案，3D 就绪后淡入。
12. **SEO**：每页 `generateMetadata`（title/description/OG/hreflang alternates）、`sitemap.ts`（含双语）、`robots.ts`、`JsonLd`（Organization、Product、FAQPage、Article）。

最后：按第 13 节验收标准自检（`npm run build`、全部路由 200、中英文/明暗切换、Playwright 跑一遍首页滚动看阶段/鼠标模式切换、reduced-motion 模拟、375px 宽无横向滚动），推送到 `claude/kind-einstein-v3cbd3`。

## 4. 待确认

1. **仓库里已有 `index.html`（LuxReal — Ad Generator）**：建议移到 `legacy/ads-generator.html` 保留（不参与构建）。还是直接删除 / 原样保留在根目录？
2. **默认语言**：浏览器语言无法匹配时回落到 `zh` 还是 `en`？（计划默认 `zh`）
3. **资源路由**：站点地图里 blog / tutorials / tools 画在 `/resources` 之下，计划实现为 `/resources/blog`、`/resources/tutorials`、`/resources/tools/*`。是否改为顶级 `/blog` 等？
4. **免费工具页**属于第三阶段：第一阶段计划只建路由 + 「即将上线」占位，是否同意？
5. **明暗模式手动切换**：规格只写「默认跟随系统」，计划额外在页脚放一个切换按钮（系统 / 浅 / 深）。是否需要？
6. **`your-turn` 跳转 `app`**：跨域无法直接携带文件，第一阶段计划：校验通过后跳转 `${APP_URL}/create?mode=image|text&prompt=...`（图片仅做本地校验与预览）。外链地址先用 `https://app.lux3d.example` 之类占位，放在 `config/site.ts` 由环境变量覆盖。
7. **品牌名**：仓库叫 `luxreal`，网站统一显示「Lux3D」，是否正确？
8. **TypeScript 版本**：npm 最新已是 7.0，计划先锁 5.x 以保证 Next 16 工具链稳定，后续再升级。
