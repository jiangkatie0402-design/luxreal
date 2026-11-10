/**
 * Cover dialog intro, "pill → dialog":
 * 1. The dialog first appears in its minimal state: a single-row pill in the middle of where
 *    the dialog will be — a round "+" on the left, the prompt line, the sparkle icon on the
 *    right. Colours, type and border follow the full dialog.
 * 2. The sparkle twinkles once, then the pill grows out to the full dialog (both sides, then
 *    up and down); the pill's contents fade as the dialog's own contents arrive.
 * Returns a cleanup. Overlays follow the dialog if the layout shifts, and the intro restarts
 * at the new size if the dialog is resized mid-way.
 */
export function playCoverIntro(box: HTMLElement, iconSrc = '/brand/spark-icon.svg'): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const ease = 'cubic-bezier(.22,1,.36,1)';
  const easeInOut = 'cubic-bezier(.65,0,.35,1)';
  const b = box.getBoundingClientRect();
  const { width: W, height: H } = b;
  const R = parseFloat(getComputedStyle(box).borderTopLeftRadius) || 24;
  // minimal state: one row, 64px tall, about 3/4 of the width (narrower screens use more)
  const PH = 64;
  const PW = Math.min(W, Math.max(W * 0.74, Math.min(W, 340)));
  const pt = (H - PH) / 2;
  const ps = (W - PW) / 2;
  const clip = (t: number, s: number, r: number) => `inset(${t}px ${s}px round ${r}px)`;

  // overlay layer in the dialog's own coordinates
  const layer = document.createElement('div');
  Object.assign(layer.style, {
    position: 'absolute',
    left: `${b.left + scrollX}px`,
    top: `${b.top + scrollY}px`,
    width: `${W}px`,
    height: `${H}px`,
    zIndex: '60',
    pointerEvents: 'none',
  });
  const add = (css: Partial<CSSStyleDeclaration>, tag = 'div', parent: HTMLElement = layer) => {
    const n = document.createElement(tag);
    Object.assign(n.style, { position: 'absolute' }, css);
    parent.appendChild(n);
    return n;
  };
  // the pill's border (the dialog's own border is cut by the clip while it is small)
  const frame = add({
    left: `${ps}px`,
    top: `${pt}px`,
    width: `${PW}px`,
    height: `${PH}px`,
    borderRadius: `${PH / 2}px`,
    border: '1px solid rgba(255,255,255,.16)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.12)',
    boxSizing: 'border-box',
  });
  const row = add({
    left: `${ps}px`,
    top: `${pt}px`,
    width: `${PW}px`,
    height: `${PH}px`,
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '0 10px',
    boxSizing: 'border-box',
  });
  const plus = add(
    {
      position: 'relative',
      flex: '0 0 auto',
      width: '64px',
      height: '44px',
      borderRadius: '22px',
      border: '1px solid rgba(255,255,255,.16)',
      background: 'rgba(255,255,255,.06)',
      display: 'grid',
      placeItems: 'center',
      color: 'rgba(255,255,255,.9)',
    },
    'div',
    row,
  );
  plus.innerHTML =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  const label = box.querySelector('label');
  const text = add(
    {
      position: 'relative',
      flex: '1 1 auto',
      minWidth: '0',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      color: 'rgba(255,255,255,.9)',
      fontSize: '16px',
      lineHeight: '24px',
    },
    'div',
    row,
  );
  text.textContent = (label?.textContent || '').trim();
  const spark = add(
    {
      position: 'relative',
      flex: '0 0 auto',
      width: '44px',
      height: '44px',
      display: 'grid',
      placeItems: 'center',
      overflow: 'visible',
    },
    'div',
    row,
  );
  const img = document.createElement('img');
  img.src = iconSrc;
  img.alt = '';
  // the svg is 90×90 with its 51px circle centred at (44.9, 36.9): show that circle at 44px
  const s = 44 / 51;
  Object.assign(img.style, {
    position: 'absolute',
    width: `${90 * s}px`,
    maxWidth: 'none',
    height: 'auto',
    left: `${22 - 44.9 * s}px`,
    top: `${22 - 36.9 * s}px`,
  });
  spark.appendChild(img);
  document.body.appendChild(layer);

  const kids = [...box.children] as HTMLElement[];
  kids.forEach((k) => (k.style.opacity = '0'));
  box.style.clipPath = clip(pt, ps, PH / 2);
  box.style.opacity = '0';

  // keep the overlay glued to the dialog; restart at the new size if it is resized
  let raf = 0;
  let restart = 0;
  let next: (() => void) | null = null;
  const follow = () => {
    const now = box.getBoundingClientRect();
    if (Math.abs(now.width - W) > 2 || Math.abs(now.height - H) > 2) {
      alive = false;
      finish();
      box.style.opacity = '0';
      restart = window.setTimeout(() => {
        box.style.opacity = '';
        if (box.isConnected) next = playCoverIntro(box, iconSrc);
      }, 200);
      return;
    }
    layer.style.left = `${now.left + scrollX}px`;
    layer.style.top = `${now.top + scrollY}px`;
    raf = requestAnimationFrame(follow);
  };
  raf = requestAnimationFrame(follow);

  const anims: Animation[] = [];
  const run = (n: Element, kf: Keyframe[], opts: KeyframeAnimationOptions) => {
    const a = n.animate(kf, { easing: ease, fill: 'both', ...opts });
    anims.push(a);
    return a.finished;
  };
  let alive = true;
  const finish = () => {
    cancelAnimationFrame(raf);
    box.style.clipPath = '';
    box.style.opacity = '';
    kids.forEach((k) => (k.style.opacity = ''));
    anims.forEach((a) => a.cancel());
    layer.remove();
  };
  const at = (t: number, s2: number, w: number, h: number, r: number) => ({
    left: `${s2}px`,
    top: `${t}px`,
    width: `${w}px`,
    height: `${h}px`,
    borderRadius: `${r}px`,
  });

  (async () => {
    try {
      // 1) the pill appears
      run(box, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 250 });
      run(frame, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 250 });
      [plus, text, spark].forEach((n, i) =>
        run(
          n,
          [
            { opacity: 0, transform: 'translateY(6px)' },
            { opacity: 1, transform: 'none' },
          ],
          {
            duration: 520,
            delay: 380 + i * 90,
          },
        ),
      );
      await run(
        img,
        [
          { transform: 'scale(.6) rotate(-40deg)', opacity: 0 },
          { transform: 'scale(1.12) rotate(8deg)', opacity: 1, offset: 0.6 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: 700, delay: 560 },
      );
      // a short twinkle, then hold
      await run(
        img,
        [{ filter: 'brightness(1)' }, { filter: 'brightness(1.7)' }, { filter: 'brightness(1)' }],
        {
          duration: 600,
          easing: 'ease-in-out',
        },
      );
      await new Promise((ok) => setTimeout(ok, 250));

      // 2) grow into the full dialog: sideways first, then up and down
      [plus, text, spark].forEach((n) =>
        run(n, [{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-in' }),
      );
      run(frame, [at(pt, ps, PW, PH, PH / 2), at(pt, 0, W, PH, PH / 2)], {
        duration: 520,
        easing: easeInOut,
      });
      await run(box, [{ clipPath: clip(pt, ps, PH / 2) }, { clipPath: clip(pt, 0, PH / 2) }], {
        duration: 520,
        easing: easeInOut,
      });
      kids.forEach((k, i) =>
        run(
          k,
          [
            { opacity: 0, transform: 'translateY(6px)' },
            { opacity: 1, transform: 'none' },
          ],
          {
            duration: 520,
            delay: 200 + i * 80,
          },
        ),
      );
      run(frame, [at(pt, 0, W, PH, PH / 2), at(0, 0, W, H, R)], { duration: 560 });
      await run(box, [{ clipPath: clip(pt, 0, PH / 2) }, { clipPath: clip(0, 0, R) }], {
        duration: 560,
      });
      await run(frame, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
      await Promise.all(anims.map((a) => a.finished));
    } catch {
      // cancelled
    }
    if (alive) finish();
  })();

  return () => {
    alive = false;
    clearTimeout(restart);
    next?.();
    finish();
  };
}
