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
export function playCoverIntro(box: HTMLElement): () => void {
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
  // a light sparkle (the two stars from the brand icon, no disc), with a soft violet-pink glow
  const img = document.createElement('div');
  Object.assign(img.style, {
    width: '22px',
    height: '22px',
    opacity: '0.75',
    filter: 'drop-shadow(0 0 3px rgba(196,181,253,.6)) drop-shadow(0 0 8px rgba(250,110,255,.25))',
  });
  img.innerHTML =
    '<svg viewBox="31 23 28 28" width="22" height="22" fill="#fff"><path d="M57.7049 36.8926C57.7485 36.9087 57.7485 36.9702 57.7049 36.9864L56.9948 37.2492C51.5204 39.2749 47.2042 43.5911 45.1784 49.0655L44.9157 49.7757C44.8995 49.8192 44.838 49.8192 44.8219 49.7757L44.5591 49.0655C42.5334 43.5911 38.2172 39.2749 32.7428 37.2492L32.0326 36.9864C31.9891 36.9703 31.9891 36.9088 32.0326 36.8926L32.7428 36.6298C38.2172 34.6041 42.5334 30.2879 44.5591 24.8135L44.8219 24.1033C44.838 24.0598 44.8995 24.0598 44.9157 24.1033L45.1785 24.8135C47.2042 30.2879 51.5204 34.6041 56.9948 36.6298L57.7049 36.8926Z"/><path d="M57.7998 26.9795C57.8107 26.9835 57.8107 26.999 57.7998 27.0031C56.4233 27.5124 55.3381 28.5977 54.8287 29.9741C54.8247 29.9851 54.8092 29.9851 54.8052 29.9741C54.2958 28.5977 53.2106 27.5124 51.8341 27.0031C51.8232 26.999 51.8232 26.9836 51.8341 26.9795C53.2106 26.4702 54.2958 25.3849 54.8052 24.0084C54.8092 23.9975 54.8247 23.9975 54.8287 24.0084C55.3381 25.3849 56.4233 26.4702 57.7998 26.9795Z"/></svg>';
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
        if (box.isConnected) next = playCoverIntro(box);
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
      run(box, [{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 400 });
      run(frame, [{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 400 });
      [plus, text, spark].forEach((n, i) =>
        run(
          n,
          [
            { opacity: 0, transform: 'translateY(6px)' },
            { opacity: 1, transform: 'none' },
          ],
          {
            duration: 700,
            delay: 600 + i * 120,
          },
        ),
      );
      await run(
        img,
        [
          { transform: 'scale(.6) rotate(-40deg)', opacity: 0 },
          { transform: 'scale(1.12) rotate(8deg)', opacity: 0.85, offset: 0.6 },
          { transform: 'none', opacity: 0.75 },
        ],
        { duration: 900, delay: 800 },
      );
      // a short twinkle, then hold
      await run(
        img,
        [{ filter: 'brightness(1)' }, { filter: 'brightness(1.3)' }, { filter: 'brightness(1)' }],
        {
          duration: 900,
          easing: 'ease-in-out',
        },
      );
      await new Promise((ok) => setTimeout(ok, 600));

      // 2) grow into the full dialog: sideways first, then up and down
      [plus, text, spark].forEach((n) =>
        run(n, [{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: 'ease-in' }),
      );
      run(frame, [at(pt, ps, PW, PH, PH / 2), at(pt, 0, W, PH, PH / 2)], {
        duration: 900,
        easing: easeInOut,
      });
      await run(box, [{ clipPath: clip(pt, ps, PH / 2) }, { clipPath: clip(pt, 0, PH / 2) }], {
        duration: 900,
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
            duration: 700,
            delay: 300 + i * 120,
          },
        ),
      );
      run(frame, [at(pt, 0, W, PH, PH / 2), at(0, 0, W, H, R)], { duration: 900 });
      await run(box, [{ clipPath: clip(pt, 0, PH / 2) }, { clipPath: clip(0, 0, R) }], {
        duration: 900,
      });
      await run(frame, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 });
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
