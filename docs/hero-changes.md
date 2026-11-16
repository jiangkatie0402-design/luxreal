# 首屏改动规范

预览：https://claude.ai/artifact/4c1ZxTY3cMVedGqukgsETL ，本文档和预览不一致时，以预览为准。

只涉及首屏的三处改动，其他部分保持现状。

---

## 1. 导航右侧按钮

|            | 改前               | 改后                                            |
| ---------- | ------------------ | ----------------------------------------------- |
| 主按钮文案 | Sign Up / Log In   | 中：**开始创作**　英：**Start creating**        |
| 主按钮链接 | 登录页             | 创作平台首页（原先「开始创作」按钮用的链接）    |
| 次按钮文案 | Connect Your Agent | 中：**接入 Agent**　英：**Use with Your Agent** |
| 次按钮链接 | —                  | `/for-agent`（不变）                            |

按钮样式不变。下面是参考值，现有样式已经一致的话可以忽略：

|        | 高   | 字号 | 圆角 | 底 / 边                                             | 字色      |
| ------ | ---- | ---- | ---- | --------------------------------------------------- | --------- |
| 主按钮 | 32px | 13px | 9px  | `linear-gradient(90deg, #a684ff, #fff)`，带扫光动效 | `#171717` |
| 次按钮 | 32px | 13px | 9px  | 透明底，`1px solid rgba(255,255,255,.16)`           | `#fff`    |

---

## 2. 主标题

### 文案

|     | 第 1 段（白） | 第 2 段（浅紫渐变） | 第 3 段（紫色渐变 + 小精灵） |
| --- | ------------- | ------------------- | ---------------------------- |
| 中  | `AI 3D，为`   | `你和你的`          | `<Agent>`                    |
| 英  | `AI 3D for `  | `You and Your`      | `<Agents>`                   |

- 尖括号 `<` `>` 是标题文字的一部分，要显示出来。
- 英文第 1 段末尾有一个空格。
- 第 2、3 段之间也有一个空格（中英相同）。

### 颜色

| 段      | 颜色                                                                  |
| ------- | --------------------------------------------------------------------- |
| 第 1 段 | `#fff`                                                                |
| 第 2 段 | 文字渐变 `linear-gradient(90deg, #fff, #e4dbff)`，只做轻微区分        |
| 第 3 段 | 文字渐变 `linear-gradient(90deg, #d6c8ff, #a684ff 70%)`，是唯一的重点 |

字体、字号、字重、行高都沿用现有首屏标题，不改。

---

## 3. 小精灵抱住 `<Agents>`

素材：`hero-mascot.webp`（470×426，透明底）。

做法：同一张图放两份。

- 一份在文字**后面**，露出身体；
- 一份在文字**前面**，只保留左侧 37%，也就是搭在 `>` 上的手臂。

看起来就是“手臂压在字上、身体在字后”。

### 结构

```html
<h1 id="hero-title">
  <span class="ht-l1">AI 3D for <span class="ht-you">You and Your</span></span>
  <span class="ht-ag">
    <img class="ht-m ht-hug back" src="/works/hero-mascot.webp" alt="" aria-hidden="true" />
    <span class="ht-word">&lt;Agents&gt;</span>
    <img class="ht-m ht-hug front" src="/works/hero-mascot.webp" alt="" aria-hidden="true" />
  </span>
</h1>
```

### 样式

尺寸都用 em，会跟着标题字号缩放。

```css
#hero-title .ht-l1 {
  white-space: nowrap;
}

#hero-title .ht-you {
  background: linear-gradient(90deg, #fff, #e4dbff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

#hero-title .ht-ag {
  position: relative;
  display: inline-block;
  white-space: nowrap;
  isolation: isolate;
  margin-right: 1.1em; /* 给右侧的小精灵留位置，保证整行居中 */
}

#hero-title .ht-word {
  position: relative;
  z-index: 1;
  background: linear-gradient(90deg, #d6c8ff, #a684ff 70%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

#hero-title .ht-m {
  position: absolute;
  height: 1.12em;
  width: auto;
  max-width: none;
  right: -1.06em;
  bottom: -0.1em;
  pointer-events: none;
  user-select: none;
  /* 比原图提亮约 45%，饱和度略降，带淡紫投影 */
  filter: brightness(1.45) saturate(0.85) drop-shadow(0 6px 14px rgba(80, 30, 160, 0.3));
}
#hero-title .ht-hug.back {
  z-index: 0;
}
#hero-title .ht-hug.front {
  z-index: 2;
  clip-path: inset(0 63% 0 0);
}
```

### 注意

- 窄屏放不下一行时，`<Agents>` 会连同小精灵整体换到第二行。第 1、2 段不会被拆开。
- 两张图都是装饰，加 `alt=""` 和 `aria-hidden`，读屏只读标题文字。
- 小精灵没有动画。
