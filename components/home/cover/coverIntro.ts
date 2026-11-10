/**
 * Cover dialog intro.
 * 1. The submit icon fades in at the centre and charges up (a soft pulsing glow).
 * 2. It flashes and bursts: a white flash, a shock ring, a horizontal light streak and
 *    sparks scatter outward while the icon itself vanishes.
 * 3. From the burst the dialog opens: centre → out to both sides as a thin pill,
 *    then up and down to full height; the contents fade in last.
 * Returns a cleanup that ends the intro immediately.
 */
export function playCoverIntro(box: HTMLElement, iconSrc: string): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const D = 52; // visible circle of the icon, px
  const R = 24; // dialog corner radius
  const ease = 'cubic-bezier(.22,1,.36,1)';
  const r = box.getBoundingClientRect();
  const { width: W, height: H } = r;
  const cx = r.left + scrollX + W / 2;
  const cy = r.top + scrollY + H / 2;
  const top = H / 2 - D / 2;
  const side = (W - D) / 2;
  const clip = (t: number, s: number, rad: number) => `inset(${t}px ${s}px round ${rad}px)`;

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
    Object.assign(el.style, { position: 'absolute', left: '0', top: '0' }, css);
    layer.appendChild(el);
    return el;
  };

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
      opacity: '0',
    },
    'img',
  ) as HTMLImageElement;
  icon.src = iconSrc;
  icon.alt = '';
  const halo = add({
    width: '160px',
    height: '160px',
    margin: '-80px 0 0 -80px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(167,150,255,.55), rgba(120,100,255,.18) 45%, transparent 70%)',
    opacity: '0',
  });
  const flash = add({
    width: '60px',
    height: '60px',
    margin: '-30px 0 0 -30px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, #fff, rgba(214,204,255,.9) 30%, rgba(140,120,255,.35) 60%, transparent 72%)',
    opacity: '0',
  });
  const ring = add({
    width: '56px',
    height: '56px',
    margin: '-28px 0 0 -28px',
    borderRadius: '50%',
    border: '1.5px solid rgba(220,212,255,.9)',
    boxShadow: '0 0 18px rgba(167,150,255,.8), inset 0 0 12px rgba(167,150,255,.6)',
    opacity: '0',
  });
  const streak = add({
    width: `${W}px`,
    height: '2px',
    margin: `-1px 0 0 ${-W / 2}px`,
    borderRadius: '2px',
    background:
      'linear-gradient(90deg, transparent, rgba(196,186,255,.9) 30%, #fff 50%, rgba(196,186,255,.9) 70%, transparent)',
    boxShadow: '0 0 14px rgba(196,186,255,.9)',
    opacity: '0',
  });
  const sparks = Array.from({ length: 22 }, (_, i) => {
    const size = 2 + Math.random() * 3;
    const el = add({
      width: `${size}px`,
      height: `${size}px`,
      margin: `${-size / 2}px 0 0 ${-size / 2}px`,
      borderRadius: '50%',
      background: i % 3 ? '#fff' : '#c4b5fd',
      boxShadow: `0 0 ${size * 3}px ${i % 3 ? 'rgba(255,255,255,.9)' : 'rgba(167,139,250,.9)'}`,
      opacity: '0',
    });
    const a = (i / 22) * Math.PI * 2 + Math.random() * 0.4;
    // spread wider sideways, following the dialog's shape
    const d = 60 + Math.random() * 120;
    return { el, x: Math.cos(a) * d * 2.2, y: Math.sin(a) * d * 0.7 };
  });
  document.body.appendChild(layer);

  const kids = [...box.children] as HTMLElement[];
  kids.forEach((k) => (k.style.opacity = '0'));
  box.style.clipPath = clip(top, side, D / 2);
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

  (async () => {
    try {
      // 1) appear and charge up
      run(
        halo,
        [
          { opacity: 0, transform: 'scale(.4)' },
          { opacity: 1, transform: 'scale(1)' },
        ],
        {
          duration: 900,
          delay: 400,
        },
      );
      await run(
        icon,
        [
          { opacity: 0, transform: 'scale(.3) rotate(-60deg)', filter: 'brightness(1)' },
          { opacity: 1, transform: 'scale(1) rotate(0deg)', filter: 'brightness(1)' },
        ],
        { duration: 900, delay: 400 },
      );
      run(
        halo,
        [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(.9)' }],
        {
          duration: 700,
          easing: 'ease-in-out',
        },
      );
      await run(
        icon,
        [
          { transform: 'scale(1)', filter: 'brightness(1) drop-shadow(0 0 0 rgba(167,150,255,0))' },
          {
            transform: 'scale(1.08)',
            filter: 'brightness(1.4) drop-shadow(0 0 14px rgba(167,150,255,.9))',
            offset: 0.5,
          },
          {
            transform: 'scale(.9)',
            filter: 'brightness(1.8) drop-shadow(0 0 22px rgba(200,190,255,1))',
          },
        ],
        { duration: 700, easing: 'ease-in-out' },
      );

      // 2) flash and burst; the icon is gone before the dialog opens
      run(
        icon,
        [
          { opacity: 1, transform: 'scale(.9)', filter: 'brightness(1.8)' },
          { opacity: 0, transform: 'scale(1.6)', filter: 'brightness(4)' },
        ],
        { duration: 260, easing: 'ease-out' },
      );
      run(halo, [{ opacity: 1 }, { opacity: 0, transform: 'scale(2.2)' }], { duration: 700 });
      run(
        flash,
        [
          { opacity: 0, transform: 'scale(.4)' },
          { opacity: 1, transform: 'scale(2.6)', offset: 0.18 },
          { opacity: 0, transform: 'scale(5)' },
        ],
        { duration: 900, easing: 'ease-out' },
      );
      run(
        ring,
        [
          { opacity: 1, transform: 'scale(.6)' },
          { opacity: 0, transform: 'scale(7)' },
        ],
        {
          duration: 1100,
        },
      );
      run(
        streak,
        [
          { opacity: 0, transform: 'scaleX(0)' },
          { opacity: 1, transform: 'scaleX(.6)', offset: 0.35 },
          { opacity: 0, transform: 'scaleX(1.1)' },
        ],
        { duration: 1300 },
      );
      sparks.forEach(({ el, x, y }) =>
        run(
          el,
          [
            { opacity: 0, transform: 'translate(0,0) scale(1)' },
            {
              opacity: 1,
              transform: `translate(${x * 0.25}px,${y * 0.25}px) scale(1.3)`,
              offset: 0.15,
            },
            { opacity: 0, transform: `translate(${x}px,${y}px) scale(.4)` },
          ],
          {
            duration: 1100 + Math.random() * 700,
            delay: Math.random() * 120,
            easing: 'cubic-bezier(.2,.7,.3,1)',
          },
        ),
      );

      // 3) the dialog opens from the burst: sideways first, then to full height
      run(box, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 120, easing: 'ease-out' });
      await run(box, [{ clipPath: clip(top, side, D / 2) }, { clipPath: clip(top, 0, D / 2) }], {
        duration: 1000,
        delay: 120,
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
            delay: 380 + i * 110,
          },
        ),
      );
      await run(box, [{ clipPath: clip(top, 0, D / 2) }, { clipPath: clip(0, 0, R) }], {
        duration: 850,
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
