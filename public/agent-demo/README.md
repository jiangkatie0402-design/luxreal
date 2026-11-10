# Aholo 3D · Agent 场景组合独立区块

这是从首页单独拆出的桌面端演示，不包含首页其他模块。

## 打开方式

1. 将整个文件夹解压到本地。
2. Windows 双击 `start-preview.bat`。
3. 浏览器会打开 `http://127.0.0.1:8123`。

需要 Python 3；当前电脑已有 Python 3。也可以使用任意静态 HTTP 服务器托管整个目录。

**不要直接双击 `index.html` 使用 file:// 打开。** 浏览器的 ES module、模型文件及 Worker 必须通过 HTTP 载入。

## 这版包含

- 开始时对话卡片占满宽度。
- 参考图、Agent 回复、MCP 示意步骤依次出现。
- 上下文以 1.2 倍速播放，展开前约 5.67 秒。
- 完成后左卡平滑收缩，完整边框和 Mac 标题栏保留，右侧展开球场模型。
- React Bits BorderGlow：边缘鼠标流光，以及开始 / 结果出现时的一次扫光。
- 用户提供的 Aholo SVG logo，用于窗口标题栏和 MCP 调用卡片。
- 可交互球场 Gaussian Splat 预览，支持拖动旋转、缩放、重置和全屏。
- “重播演示”重置演示，但不重新下载模型。
- 系统启用“减少动态效果”时直接显示完成布局。
- 仅针对桌面端制作。

## 模型与演示说明

右侧使用用户提供的 `球场.ply` 数据，共 654,560 个 Gaussian splats。

为了便于网页载入，将原始 44,510,496 字节 PLY 转换为标准 `.splat`：20,945,920 字节，保持全部高斯点和原始坐标轴，不修改原始文件。颜色、透明度和旋转按标准 splat 格式编码。

它是 **3D Gaussian Splat 场景，而不是可分件编辑的网格模型**。包内没有实时调用 Aholo 3D MCP、没有 API key，也没有模型生成后端。对话与执行步骤仅用于示意“资产生成 / 场景组合”的产品工作流。

独立预览中的“开始创作”链接指向页面底部的说明；接回产品时，把 `preview.js` 的 `ctaHref` 改为实际创作入口。

## 主要文件

- `index.html`：独立预览入口。
- `preview.css` / `preview.js`：独立预览页面的装配代码。
- `aholo-mark.svg`：用户指定的品牌 logo。
- `sections/agent-case/agent-case.js`：React 区块、对话文案、演示顺序及时间轴。
- `sections/agent-case/agent-case.css`：桌面布局与卡片收缩 / 展开动画。
- `sections/agent-case/border-glow.js` / `.css`：适配的 BorderGlow。
- `sections/agent-case/scene-viewer.html` / `.js` / `.css`：隔离的球场查看器。
- `sections/agent-case/assets/stadium.splat`：球场预览模型。
- `sections/agent-case/assets/stadium-reference.webp`：对话参考图。
- `sections/agent-case/assets/stadium-poster.webp`：加载及失败回退图。
- `fonts/`：此区块使用的现有字体资源。
- `vendor/`：独立预览使用的 React / ReactDOM。
- `sections/agent-case/vendor/`：本地 Three.js 与 GaussianSplats3D 查看器依赖。
- `start-preview.bat` / `serve.py`：Windows 本地预览。

## 接入现有 React 页面

区块复用现有 React 实例，不需要重复载入包内 React。按顺序载入两个组件脚本和对应 CSS，再创建区块组件：

```js
const BorderGlowFactory = window.__AHOLO_BORDER_GLOW_FACTORY__;
const AgentSceneCase = window.__AHOLO_AGENT_CASE_FACTORY__(React);

React.createElement(AgentSceneCase, {
  title: '让 AI Agent 帮你做 3D',
  lang: 'zh',
  ctaHref: '/your-create-page',
  ctaLabel: '开始创作'
});
```

先载入 `border-glow.js`，再载入 `agent-case.js`。保留 `sections/agent-case/` 相对根目录的位置，使 logo、iframe 和模型路径可正确解析。通过 `lang: 'en'` 可使用英文文案。

调速：`agent-case.js` 中的 `playbackRate = 1.2`。

左右比例：`agent-case.css` 中的 `--ac-left: 43%`。

展开速度：`.ac-context` 的 `transition: width 1.05s ...`。

默认模型视角：`scene-viewer.js` 的 `initialPosition` 与 `initialTarget`。

光效参数：调用 `BorderGlow` 时可调整 `glowColor`、`glowIntensity`、`colors`、`glowRadius`、`animated` 等。流光只绘制边缘，不拦截按钮或模型操作。

## 第三方许可

- React / ReactDOM：MIT，见 `vendor/licenses/react/LICENSE`。
- Three.js：MIT，见 `vendor/licenses/three/LICENSE`。
- GaussianSplats3D：MIT，见 `vendor/licenses/gaussian-splats-3d/LICENSE`。
- BorderGlow：根据用户提供的 React Bits 源码适配，见 `sections/agent-case/REACT-BITS-LICENSE.txt`；请保留其中的 MIT + Commons Clause 条款。
- 字体与 Aholo logo 来自用户现有工程，沿用原项目授权。
