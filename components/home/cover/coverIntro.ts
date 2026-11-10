/**
 * Cover dialog intro: the submit icon appears in the middle, stretches out to both sides into a pill,
 * then opens to the full dialog while its contents fade in. Returns a cleanup.
 */
export function playCoverIntro(box: HTMLElement, iconSrc: string): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const D = 52; // visible circle of the icon, px
  const R = 24; // dialog corner radius
  const ease = 'cubic-bezier(.22,1,.36,1)';
  const r = box.getBoundingClientRect();
  const { width: W, height: H } = r;
  const top = H / 2 - D / 2;
  const side = (W - D) / 2;
  const clip = (t: number, rt: number, b: number, l: number, rad: number) =>
    `inset(${t}px ${rt}px ${b}px ${l}px round ${rad}px)`;

  // Icon overlay over the box's centre, outside the clip so its glow shows.
  // The svg is 90×90 with its 51px circle centred at (44.9, 36.9).
  const s = D / 51;
  const icon = document.createElement('img');
  icon.src = iconSrc;
  icon.alt = '';
  Object.assign(icon.style, {
    position: 'absolute',
    zIndex: '60',
    pointerEvents: 'none',
    width: `${90 * s}px`,
    height: 'auto',
    transformOrigin: '49.9% 41%',
    left: `${r.left + scrollX + W / 2 - 44.9 * s}px`,
    top: `${r.top + scrollY + H / 2 - 36.9 * s}px`,
  });
  document.body.appendChild(icon);

  const kids = [...box.children] as HTMLElement[];
  kids.forEach((k) => (k.style.opacity = '0'));
  box.style.clipPath = clip(top, side, top, side, D / 2);

  const anims: Animation[] = [];
  const run = (el: Element, kf: Keyframe[], opts: KeyframeAnimationOptions) => {
    const a = el.animate(kf, { easing: ease, fill: 'forwards', ...opts });
    anims.push(a);
    return a.finished;
  };
  let alive = true;
  const finish = () => {
    box.style.clipPath = '';
    kids.forEach((k) => (k.style.opacity = ''));
    anims.forEach((a) => a.cancel());
    icon.remove();
  };

  (async () => {
    try {
      await run(
        icon,
        [
          { opacity: 0, transform: 'scale(.4) rotate(-40deg)' },
          { opacity: 1, transform: 'scale(1.08) rotate(0deg)', offset: 0.7 },
          { opacity: 1, transform: 'scale(1)' },
        ],
        { duration: 520, delay: 500, fill: 'both' },
      );
      // 1) stretch from the middle out to both sides
      await run(
        box,
        [
          { clipPath: clip(top, side, top, side, D / 2) },
          { clipPath: clip(top, 0, top, 0, D / 2) },
        ],
        { duration: 620 },
      );
      // 2) open to full height; the icon dissolves and the contents arrive
      run(
        icon,
        [
          { opacity: 1, transform: `scale(1)` },
          { opacity: 0, transform: `scale(.6)` },
        ],
        { duration: 360, easing: 'ease-in' },
      );
      kids.forEach((k, i) =>
        run(
          k,
          [
            { opacity: 0, transform: 'translateY(6px)' },
            { opacity: 1, transform: 'none' },
          ],
          {
            duration: 480,
            delay: 220 + i * 70,
          },
        ),
      );
      await run(
        box,
        [{ clipPath: clip(top, 0, top, 0, D / 2) }, { clipPath: clip(0, 0, 0, 0, R) }],
        {
          duration: 560,
        },
      );
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
