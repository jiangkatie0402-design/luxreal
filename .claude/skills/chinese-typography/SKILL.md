---
name: chinese-typography
description: "制作中文网页、落地页、H5、后台界面时使用。约束中文字体栈、字号行高、中英文混排、断行标点和界面文案，避免出现英文站直译过来的排版问题。与 frontend-design、ui-ux-pro-max 等设计 skill 搭配使用，本 skill 只管中文排版，不管风格和配色。"
---

# 中文网页排版规则

通用设计 skill 给出的字体搭配、行高和字距大多按英文设计。页面主要内容是中文时，以本文件为准；风格、配色、布局仍按设计 skill 的方向走。

## 1. 基础设置

- `<html lang="zh-CN">` 必须写，否则部分系统会用日文字形渲染汉字。
- 页面里有繁体内容时用 `zh-TW` / `zh-HK`，并按语言切换字体栈。
- 西文字体放在字体栈最前面，中文字体紧随其后，这样字母和数字用设计选定的西文字体，汉字回退到中文字体。

## 2. 字体栈

```css
:root {
  /* 无衬线：西文字体写在最前，之后是各平台中文字体 */
  --font-sans: "你选定的西文字体", "PingFang SC", "HarmonyOS Sans SC", "MiSans",
    "Noto Sans SC", "Noto Sans CJK SC", "Source Han Sans SC",
    "Microsoft YaHei", system-ui, sans-serif;

  /* 衬线：适合长文、editorial 风格；Windows 上宋体小字号发虚，只用于标题或大字号 */
  --font-serif: "你选定的西文衬线", "Songti SC", "Noto Serif SC",
    "Source Han Serif SC", "SimSun", serif;

  /* 等宽：代码、数据 */
  --font-mono: "JetBrains Mono", "SF Mono", Menlo, Consolas,
    "PingFang SC", "Microsoft YaHei", monospace;
}
```

- 苹果设备有 PingFang，Windows 和多数安卓没有，所以必须写 Noto Sans SC、微软雅黑等回退，写完要能在无 PingFang 的环境下正常显示。
- 默认用系统字体。中文字体文件动辄几 MB，不要直接引 Google Fonts 的中文字体，国内访问慢且不稳定。
- 确实需要自定义中文字体时：只用于标题，使用子集化后的 woff2 自托管，加 `font-display: swap`，并保留上面的回退栈。
- 不要给中文正文设置 `-webkit-font-smoothing: antialiased`，在 Mac 上会让汉字明显变细。

## 3. 字号、行高、行宽

| 场景 | 字号 | 行高 |
|---|---|---|
| 正文（桌面） | 16px（不低于 15px） | 1.75 |
| 正文（手机） | 16px | 1.7–1.8 |
| 辅助说明 / 标注 | 13–14px（不低于 12px） | 1.6 |
| 小标题 | 18–24px | 1.4 |
| 大标题 / Hero | 32px 以上 | 1.2–1.3 |

- 中文方块字密度高，行高要比英文更松，正文别沿用英文页面的 1.4–1.5。
- 衬线正文行高再加 0.05–0.1。
- 每行控制在 30–40 个汉字，用 `max-width: 36em` 之类限制，不要照搬"80 字符"的英文标准。
- 段间距用 `margin-block: 1em` 左右，长文可用 `text-indent: 2em` 首行缩进，二选一，不要同时用。

## 4. 字重与字距

- 正文 400，标题 600–700。中文字体的 100–300 细体在小字号下笔画会断，正文不要用。
- 中文没有真正的斜体，`font-style: italic` 只会得到假斜体，一律不用。要强调就用加粗、颜色或下划线。
- 正文 `letter-spacing: 0`。标题最多 `0.02em`。
- 英文大标题常用的负字距（如 `-0.03em`）会让汉字挤在一起，中文标题不要用。可以用 `:lang(zh)` 单独覆盖。
- `text-transform: uppercase` 只对西文有效，不要依赖它做视觉层级。

## 5. 中英文混排与标点

- 中文与英文、数字之间加一个半角空格（如 `使用 Claude 生成 3 张图`），并加上 `text-autospace: normal` 作为浏览器层面的补充。
- 中文句子用全角标点（，。；：？！" "），数字、英文单词、代码内部用半角。
- 省略号用 `……`（两个），破折号用 `——`，不要用 `...` 和 `--`。
- 相邻全角标点用 `text-spacing-trim: space-first` 压缩多余空白。
- 数字对齐的地方（价格、表格、数据）加 `font-variant-numeric: tabular-nums`。
- 日期写 `2026 年 9 月 21 日` 或 `2026-09-21`，金额写 `¥1,234.00`，同一页面格式统一。

## 6. 断行

```css
body {
  line-break: strict;          /* 避免标点出现在行首 */
  overflow-wrap: break-word;   /* 长链接、长英文串不撑破布局 */
}
h1, h2, h3 { text-wrap: balance; }  /* 标题两行时均衡断行，避免末行只剩一两个字 */
p { text-wrap: pretty; }            /* 减少段末孤字 */
```

- 不要对中文用 `text-align: justify`，容易出现字距忽大忽小。确实要用，加 `text-justify: inter-character`。
- 不要用 `word-break: keep-all` 处理中文。
- 卡片、按钮、导航里的中文文案要考虑两行、三行的情况，不要写死单行高度。

## 7. 界面文案

- 用简体中文自然表达，不要逐词直译英文。
- 按钮用「动词 + 名词」，2–4 个字，如「保存修改」「发布」「立即购买」。同一个动作全流程叫同一个名字。
- 报错说明发生了什么和怎么解决，不道歉、不卖萌。
- 常见的英文站残留要删掉：
  - 中文标题上方再加一行英文小标签（如 FEATURES、ABOUT US），没有实际信息量时不要加。
  - 标题里只给一个词换颜色或加粗。
  - 全大写、字距很大的英文小标签。
  - 用 emoji 代替图标。
- 需要中英双语时，英文作为副信息，字号更小、字重更轻，且要有实际信息，不能只是装饰。

## 8. 交付前自检

- [ ] 已声明 `lang="zh-CN"`
- [ ] 字体栈里有 Windows / 安卓可用的中文字体回退
- [ ] 正文行高 ≥ 1.7，每行不超过 40 字
- [ ] 没有中文斜体、没有负字距、没有过细字重
- [ ] 中英文之间有空格，标点全角半角使用正确
- [ ] 375px 宽度下没有单字成行、按钮文字不溢出
- [ ] 标题使用了 `text-wrap: balance`，段落末行没有孤字
