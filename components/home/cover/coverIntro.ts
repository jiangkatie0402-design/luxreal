/**
 * Cover dialog intro.
 * 1. The submit icon fades in at the centre and gathers light (its own glow brightens).
 * 2. Glint: the icon dissolves into its four-point star, which flares into a sharp
 *    star glint with long, hair-thin anamorphic rays and a few fine sparkles.
 * 3. A light frame (the icon's violet stroke) unfolds from the glint — out to both
 *    sides, then to full height — carrying the dialog with it; the frame then settles
 *    into the dialog's own hairline and the contents fade in.
 * Returns a cleanup that ends the intro immediately.
 */
export function playCoverIntro(box: HTMLElement, iconSrc: string): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const D = 52; // visible circle of the icon, px
  const R = 24; // dialog corner radius
  const PILL = 2; // height of the line the dialog opens from, px
  const ease = 'cubic-bezier(.22,1,.36,1)';
  const easeInOut = 'cubic-bezier(.65,0,.35,1)';
  const r = box.getBoundingClientRect();
  const { width: W, height: H } = r;
  const cx = r.left + scrollX + W / 2;
  const cy = r.top + scrollY + H / 2;
  const clip = (h: number, w: number, rad: number) =>
    `inset(${(H - h) / 2}px ${(W - w) / 2}px round ${rad}px)`;

  const layer = document.createElement('div');
  Object.assign(layer.style, {
    position: 'absolute',
    left: `${cx}px`,
    top: `${cy}px`,
    width: '0',
    height: '0',
    zIndex: '60',
    pointerEvents: 'none',
  });
  const add = (css: Partial<CSSStyleDeclaration>, tag = 'div') => {
    const el = document.createElement(tag);
    Object.assign(el.style, { position: 'absolute', left: '0', top: '0', opacity: '0' }, css);
    layer.appendChild(el);
    return el;
  };
  const centred = (w: number, h: number) => ({
    width: `${w}px`,
    height: `${h}px`,
    margin: `${-h / 2}px 0 0 ${-w / 2}px`,
  });

  // The svg is 90×90 with its 51px circle centred at (44.9, 36.9).
  const s = D / 51;
  const icon = add(
    {
      width: `${90 * s}px`,
      height: 'auto',
      maxWidth: 'none', // the page caps images at their parent's (zero) width
      marginLeft: `${-44.9 * s}px`,
      marginTop: `${-36.9 * s}px`,
      transformOrigin: `${44.9 * s}px ${36.9 * s}px`,
    },
    'img',
  ) as HTMLImageElement;
  icon.src = iconSrc;
  icon.alt = '';

  // The icon's own four-point star, reused as the glint.
  const star = add({
    ...centred(30, 30),
    filter: 'drop-shadow(0 0 6px #fff) drop-shadow(0 0 16px #9d95ff)',
  });
  star.innerHTML =
    '<svg viewBox="31.6 23.7 26.5 26.5" width="30" height="30"><path fill="#fff" d="M57.7049 36.8926C57.7485 36.9087 57.7485 36.9702 57.7049 36.9864L56.9948 37.2492C51.5204 39.2749 47.2042 43.5911 45.1784 49.0655L44.9157 49.7757C44.8995 49.8192 44.838 49.8192 44.8219 49.7757L44.5591 49.0655C42.5334 43.5911 38.2172 39.2749 32.7428 37.2492L32.0326 36.9864C31.9891 36.9703 31.9891 36.9088 32.0326 36.8926L32.7428 36.6298C38.2172 34.6041 42.5334 30.2879 44.5591 24.8135L44.8219 24.1033C44.838 24.0598 44.8995 24.0598 44.9157 24.1033L45.1785 24.8135C47.2042 30.2879 51.5204 34.6041 56.9948 36.6298L57.7049 36.8926Z"/></svg>';

  // Hair-thin anamorphic rays: a long horizontal one, a short vertical one.
  const ray = (w: number, h: number, dir: string) =>
    add({
      ...centred(w, h),
      background: `linear-gradient(${dir}, transparent, rgba(207,215,255,.55) 35%, #fff 50%, rgba(207,215,255,.55) 65%, transparent)`,
    });
  const rayH = ray(W * 1.1, 1, '90deg');
  const rayV = ray(1, 120, '180deg');
  // A small, tight core of light (no wide haze).
  const core = add({
    ...centred(18, 18),
    borderRadius: '50%',
    background:
      'radial-gradient(circle, #fff 0, #fff 25%, rgba(207,215,255,.6) 50%, transparent 72%)',
  });
  // A few fine sparkles that drift along the horizon.
  const sparks = Array.from({ length: 10 }, (_, i) => {
    const side = i % 2 ? 1 : -1;
    const el = add({
      ...centred(2, 2),
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 0 6px #cfd7ff',
    });
    return { el, x: side * (W * 0.12 + Math.random() * W * 0.32), y: (Math.random() - 0.5) * 36 };
  });

  // The light frame that unfolds the dialog, in the icon's stroke colours.
  const frame = add({
    ...centred(D, D),
    borderRadius: `${D / 2}px`,
    border: '1px solid rgba(220,224,255,.9)',
    boxShadow: '0 0 16px -2px rgba(142,151,255,.85), inset 0 0 10px -4px rgba(207,215,255,.7)',
    boxSizing: 'border-box',
  });
  document.body.appendChild(layer);

  const kids = [...box.children] as HTMLElement[];
  kids.forEach((k) => (k.style.opacity = '0'));
  box.style.clipPath = clip(PILL, 0, 1);
  box.style.opacity = '0';

  const anims: Animation[] = [];
  const run = (el: Element, kf: Keyframe[], opts: KeyframeAnimationOptions) => {
    const a = el.animate(kf, { easing: ease, fill: 'both', ...opts });
    anims.push(a);
    return a.finished;
  };
  let alive = true;
  const finish = () => {
    box.style.clipPath = '';
    box.style.opacity = '';
    kids.forEach((k) => (k.style.opacity = ''));
    anims.forEach((a) => a.cancel());
    layer.remove();
  };
  const size = (w: number, h: number, rad: number) => ({
    width: `${w}px`,
    height: `${h}px`,
    marginLeft: `${-w / 2}px`,
    marginTop: `${-h / 2}px`,
    borderRadius: `${rad}px`,
  });

  (async () => {
    try {
      // 1) the icon arrives and gathers light
      await run(
        icon,
        [
          { opacity: 0, transform: 'scale(.6)', filter: 'blur(6px) brightness(1)' },
          { opacity: 1, transform: 'scale(1)', filter: 'blur(0) brightness(1)' },
        ],
        { duration: 900, delay: 400 },
      );
      await run(
        icon,
        [
          { transform: 'scale(1)', filter: 'brightness(1) drop-shadow(0 0 0 rgba(157,149,255,0))' },
          {
            transform: 'scale(.94)',
            filter: 'brightness(1.5) drop-shadow(0 0 12px rgba(157,149,255,.9))',
          },
        ],
        { duration: 650, easing: easeInOut },
      );

      // 2) glint: the circle falls away, its star flares with thin rays
      run(
        icon,
        [
          { opacity: 1, transform: 'scale(.94)' },
          { opacity: 0, transform: 'scale(.7)' },
        ],
        {
          duration: 220,
          easing: 'ease-in',
        },
      );
      run(
        star,
        [
          { opacity: 0, transform: 'scale(.55) rotate(0deg)' },
          { opacity: 1, transform: 'scale(1.5) rotate(45deg)', offset: 0.3 },
          { opacity: 0, transform: 'scale(.2) rotate(90deg)' },
        ],
        { duration: 1000, easing: easeInOut },
      );
      run(
        core,
        [
          { opacity: 0, transform: 'scale(.4)' },
          { opacity: 1, transform: 'scale(1.4)', offset: 0.25 },
          { opacity: 0, transform: 'scale(.6)' },
        ],
        { duration: 900 },
      );
      run(
        rayH,
        [
          { opacity: 0, transform: 'scaleX(.05)' },
          { opacity: 1, transform: 'scaleX(1)', offset: 0.35 },
          { opacity: 0, transform: 'scaleX(1)' },
        ],
        { duration: 1200, easing: 'cubic-bezier(.2,.8,.2,1)' },
      );
      run(
        rayV,
        [
          { opacity: 0, transform: 'scaleY(.1)' },
          { opacity: 0.9, transform: 'scaleY(1)', offset: 0.3 },
          { opacity: 0, transform: 'scaleY(.4)' },
        ],
        { duration: 800 },
      );
      sparks.forEach(({ el, x, y }, i) =>
        run(
          el,
          [
            { opacity: 0, transform: 'translate(0,0) scale(.5)' },
            { opacity: 1, transform: `translate(${x * 0.4}px,${y * 0.4}px) scale(1)`, offset: 0.3 },
            { opacity: 0, transform: `translate(${x}px,${y}px) scale(.5)` },
          ],
          {
            duration: 1300 + (i % 4) * 150,
            delay: 120 + (i % 3) * 60,
            easing: 'cubic-bezier(.2,.7,.3,1)',
          },
        ),
      );
      await new Promise((ok) => setTimeout(ok, 380));

      // 3) the light frame unfolds sideways, then to full height, opening the dialog
      run(frame, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
      run(box, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'ease-out' });
      run(frame, [size(D * 0.4, PILL, 1), size(W, PILL, 1)], { duration: 950, easing: easeInOut });
      await run(box, [{ clipPath: clip(PILL, D * 0.4, 1) }, { clipPath: clip(PILL, W, 1) }], {
        duration: 950,
        easing: easeInOut,
      });
      kids.forEach((k, i) =>
        run(
          k,
          [
            { opacity: 0, transform: 'translateY(8px)' },
            { opacity: 1, transform: 'none' },
          ],
          {
            duration: 700,
            delay: 320 + i * 110,
          },
        ),
      );
      run(frame, [size(W, PILL, 1), size(W, H, R)], { duration: 850 });
      await run(box, [{ clipPath: clip(PILL, W, 1) }, { clipPath: clip(H, W, R) }], {
        duration: 850,
      });
      // the frame's light settles into the dialog's own hairline
      await run(frame, [{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: 'ease-out' });
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
