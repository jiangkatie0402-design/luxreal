/**
 * Cover dialog intro, "draw then fill":
 * 1. A hairline violet outline of the dialog is drawn, starting at the top centre and
 *    running out to both sides until it meets at the bottom.
 * 2. Inside it, the buttons, icons and every line of text are drawn as outlines too.
 * 3. The real dialog then fills in underneath while the outlines fade away.
 * Works on whatever the dialog contains (text nodes, buttons, svg icons), so copy
 * and layout changes need no change here. Returns a cleanup.
 */
const NS = 'http://www.w3.org/2000/svg';
const LINE = 'rgba(180,170,255,1)';

export function playCoverIntro(box: HTMLElement): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const easeInOut = 'cubic-bezier(.65,0,.35,1)';
  const ease = 'cubic-bezier(.22,1,.36,1)';
  const b = box.getBoundingClientRect();
  const { width: W, height: H } = b;
  const R = parseFloat(getComputedStyle(box).borderTopLeftRadius) || 24;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(W));
  svg.setAttribute('height', String(H));
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  Object.assign(svg.style, {
    position: 'absolute',
    left: `${b.left + scrollX}px`,
    top: `${b.top + scrollY}px`,
    zIndex: '60',
    pointerEvents: 'none',
    overflow: 'visible',
    filter: 'drop-shadow(0 0 3px rgba(140,128,255,.55))',
  });
  const el = (tag: string, attrs: Record<string, string | number>, parent: Element = svg) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, String(attrs[k]));
    parent.appendChild(n);
    return n as SVGGraphicsElement;
  };
  const stroke = {
    fill: 'none',
    stroke: LINE,
    'stroke-width': 1,
    'vector-effect': 'non-scaling-stroke',
  };

  // 1) the dialog's outline as two halves from the top centre to the bottom centre
  const h = 0.5; // keep the hairline on the pixel grid
  const half = (dir: 1 | -1) => {
    const x0 = W / 2;
    const xe = dir === 1 ? W - h : h; // outer edge
    const xc = dir === 1 ? W - h - R : h + R; // corner start
    const sw = dir === 1 ? 1 : 0;
    return `M${x0},${h} H${xc} A${R},${R} 0 0 ${sw} ${xe},${h + R} V${H - h - R} A${R},${R} 0 0 ${sw} ${xc},${H - h} H${x0}`;
  };
  const shell = [1, -1].map((d) => el('path', { ...stroke, d: half(d as 1 | -1), pathLength: 1 }));

  // 2) inner outlines: buttons, icons and text
  const inner: SVGGraphicsElement[] = [];
  const at = (r: DOMRect) => ({ x: r.left - b.left, y: r.top - b.top });
  box.querySelectorAll('button').forEach((btn) => {
    const r = btn.getBoundingClientRect();
    if (!r.width) return;
    const { x, y } = at(r);
    const rad = Math.min(parseFloat(getComputedStyle(btn).borderTopLeftRadius) || 0, r.height / 2);
    // the hero CTA sits inside a 1px ring; outline the ring
    const ring = btn.parentElement?.classList.contains('brand-hero') ? 1 : 0;
    inner.push(
      el('rect', {
        ...stroke,
        x: x - ring + h,
        y: y - ring + h,
        width: r.width + ring * 2 - 1,
        height: r.height + ring * 2 - 1,
        rx: rad + ring,
        pathLength: 1,
      }),
    );
  });
  box.querySelectorAll('svg').forEach((icon) => {
    const r = icon.getBoundingClientRect();
    if (!r.width) return;
    const { x, y } = at(r);
    const g = el('g', { transform: `translate(${x},${y})` });
    const copy = icon.cloneNode(true) as SVGSVGElement;
    copy.setAttribute('x', '0');
    copy.setAttribute('y', '0');
    copy.setAttribute('width', String(r.width));
    copy.setAttribute('height', String(r.height));
    copy.style.color = LINE;
    copy.removeAttribute('class');
    g.appendChild(copy);
    copy.querySelectorAll('path,line,circle,rect,polyline,polygon,ellipse').forEach((p) => {
      p.setAttribute('pathLength', '1');
      inner.push(p as SVGGraphicsElement);
    });
  });
  const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent?.trim();
    const host = n.parentElement;
    if (!text || !host || host.closest('svg')) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const r = range.getBoundingClientRect();
    if (!r.width) continue;
    const cs = getComputedStyle(host);
    const { x, y } = at(r);
    const t = el('text', {
      x,
      y: y + r.height / 2,
      'dominant-baseline': 'central',
      fill: 'none',
      stroke: LINE,
      'stroke-width': 0.7,
      'font-family': cs.fontFamily,
      'font-size': cs.fontSize,
      'font-weight': cs.fontWeight,
      'letter-spacing': cs.letterSpacing === 'normal' ? '0' : cs.letterSpacing,
    });
    t.textContent = text;
    inner.push(t);
  }
  // A dark glass base behind the outlines, so they read on a bright cover video.
  const base = document.createElement('div');
  Object.assign(base.style, {
    position: 'absolute',
    left: svg.style.left,
    top: svg.style.top,
    width: `${W}px`,
    height: `${H}px`,
    zIndex: '59',
    pointerEvents: 'none',
    borderRadius: `${R}px`,
    background: 'linear-gradient(180deg, rgba(14,10,30,.78), rgba(10,8,22,.86))',
    backdropFilter: 'blur(16px) saturate(1.2)',
    boxShadow: '0 24px 60px -24px rgba(0,0,0,.6)',
  });
  document.body.appendChild(base);
  document.body.appendChild(svg);

  const kids = [...box.children] as HTMLElement[];
  box.style.opacity = '0';

  const anims: Animation[] = [];
  const run = (n: Element, kf: Keyframe[], opts: KeyframeAnimationOptions) => {
    const a = n.animate(kf, { easing: ease, fill: 'both', ...opts });
    anims.push(a);
    return a.finished;
  };
  let alive = true;
  const finish = () => {
    box.style.opacity = '';
    anims.forEach((a) => a.cancel());
    svg.remove();
    base.remove();
  };

  // Text has no pathLength, so its dash length is set from a generous estimate.
  const dash = (n: SVGGraphicsElement) => (n.tagName === 'text' ? 2400 : 1);
  [...shell, ...inner].forEach((n) => {
    const d = dash(n);
    n.style.strokeDasharray = `${d} ${d}`;
    n.style.strokeDashoffset = String(d);
  });
  const draw = (n: SVGGraphicsElement, duration: number, delay: number, easing = easeInOut) => {
    const d = dash(n);
    return run(n, [{ strokeDashoffset: d }, { strokeDashoffset: 0 }], { duration, delay, easing });
  };

  (async () => {
    try {
      run(svg, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 300 });
      // the dark base opens from the centre with the outline
      run(
        base,
        [
          { opacity: 0, clipPath: `inset(0 50% 0 50% round ${R}px)` },
          { opacity: 1, clipPath: `inset(0 0 0 0 round ${R}px)` },
        ],
        { duration: 1700, delay: 300, easing: easeInOut },
      );
      // 1) outline from the top centre to both sides
      shell.forEach((p) => draw(p, 1700, 300));
      // 2) contents traced inside it (text draws slower: its dash runs along every glyph)
      inner.forEach((n, i) =>
        draw(
          n,
          n.tagName === 'text' ? 2200 : 1300,
          900 + i * 140,
          n.tagName === 'text' ? 'cubic-bezier(.4,0,.2,1)' : easeInOut,
        ),
      );
      await new Promise((ok) => setTimeout(ok, 300 + 2600));
      // 3) the real dialog fills in, the outlines fade
      kids.forEach((k, i) =>
        run(k, [{ opacity: 0 }, { opacity: 1 }], {
          duration: 900,
          delay: 150 + i * 60,
          easing: 'ease-out',
        }),
      );
      run(box, [{ opacity: 0 }, { opacity: 1 }], {
        duration: 1000,
        easing: 'ease-out',
      });
      run(base, [{ opacity: 1 }, { opacity: 0 }], {
        duration: 900,
        delay: 700,
        easing: 'ease-in-out',
      });
      await run(svg, [{ opacity: 1 }, { opacity: 0 }], {
        duration: 1200,
        delay: 250,
        easing: 'ease-in-out',
      });
      await Promise.all(anims.map((a) => a.finished));
    } catch {
      // cancelled
    }
    if (alive) finish();
  })();

  return () => {
    alive = false;
    finish();
  };
}
