# Lux3D 官网

Next.js 16 (App Router) · TypeScript · Tailwind v4 (token 驱动) · next-intl (`/zh`, `/en`) · three.js / R3F

```bash
npm install
npm run dev            # http://localhost:3000 → /zh
npm run build
npm run lint && npm run typecheck && npm run check:messages
```

## 结构

- `app/[locale]/page.tsx` 首页：满屏 Hero（上传/文字输入 + 生成切面 3D 展台）→ 怎么做 → 优势 → 用户证言 → 社群作品 → CTA → FAQ
- `app/[locale]/[...slug]` 所有内页（由 `config/pages.ts` 注册，按模板渲染）；`gallery`、`pricing` 为独立页面
- `app/[locale]/dev/slice` 生成切面测试页（仅开发环境）
- `styles/tokens.css` 全部设计 token（明暗两套），Tailwind 主题只引用这些变量
- `messages/zh.json` / `en.json` 全部文案
- `config/` 站点外链与地区差异（环境变量切换）、导航、资产表、价格、作品数据
- `components/three/` `ModelStage`（统一展台）、`AssetLoader`（占位几何体 ↔ glTF）、`GenerationSlice`、`GaussianParticles`

## 环境变量

`NEXT_PUBLIC_SITE_URL`、`NEXT_PUBLIC_APP_URL`、`NEXT_PUBLIC_CONSOLE_URL`、`NEXT_PUBLIC_DOCS_URL`、`NEXT_PUBLIC_HELP_URL`、`NEXT_PUBLIC_REGION`（`cn` / 默认 global）、`NEXT_PUBLIC_ICP`

调试：`?perf=high|mid|low` 强制设备性能档位。

`legacy/ads-generator.html` 是仓库原有的广告生成器页面，未参与构建。
