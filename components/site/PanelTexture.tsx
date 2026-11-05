/**
 * Background treatments for the use-case panels. All of them stay off the copy:
 * they live at the edges / over the (empty) media area and fade out under text.
 *  - dots:  fine dot grid fading in from the bottom-right
 *  - theme: field-specific interface line art (slicer / game HUD / camera viewfinder)
 *  - glow:  soft blurred tints of the panel colour, no lines at all
 */
export type TextureKind = 'dots' | 'theme' | 'glow';
type Field = 'print' | 'game' | 'film';

const FADE = 'radial-gradient(110% 95% at 100% 100%, #000 35%, transparent 80%)';

export function PanelTexture({
  kind,
  field,
  ink,
  tint,
}: {
  kind: TextureKind;
  field: Field;
  /** line / dot colour */
  ink: string;
  /** [lighter, deeper] tints of the panel colour for the glow option */
  tint: [string, string];
}) {
  if (kind === 'dots')
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${ink} 1.2px, transparent 1.6px)`,
          backgroundSize: '22px 22px',
          opacity: 0.38,
          maskImage: FADE,
          WebkitMaskImage: FADE,
        }}
      />
    );

  if (kind === 'glow')
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <span
          className="absolute -right-[10%] -top-[20%] size-[60vw] max-w-[900px] rounded-full blur-[120px]"
          style={{ background: tint[0], opacity: 0.55 }}
        />
        <span
          className="absolute -bottom-[25%] left-[20%] size-[55vw] max-w-[820px] rounded-full blur-[120px]"
          style={{ background: tint[1], opacity: 0.55 }}
        />
      </div>
    );

  return <ThemeArt field={field} ink={ink} />;
}

/** Corner brackets shared by the HUD / viewfinder frames. */
function Corners({ ink }: { ink: string }) {
  const c = 'absolute size-8 border-[1.5px]';
  return (
    <>
      <span
        className={`${c} left-4 top-4 border-b-0 border-r-0 md:left-6 md:top-6`}
        style={{ borderColor: ink }}
      />
      <span
        className={`${c} right-4 top-4 border-b-0 border-l-0 md:right-6 md:top-6`}
        style={{ borderColor: ink }}
      />
      <span
        className={`${c} bottom-4 left-4 border-r-0 border-t-0 md:bottom-6 md:left-6`}
        style={{ borderColor: ink }}
      />
      <span
        className={`${c} bottom-4 right-4 border-l-0 border-t-0 md:bottom-6 md:right-6`}
        style={{ borderColor: ink }}
      />
    </>
  );
}

function ThemeArt({ field, ink }: { field: Field; ink: string }) {
  const mono = 'absolute font-mono text-[11px] tracking-wider';
  if (field === 'print')
    // slicer view: a sliced form built from layer lines on a build plate
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ color: ink }}
      >
        <svg
          className="absolute bottom-0 right-[4%] h-[62%] w-auto opacity-30"
          viewBox="0 0 400 420"
          fill="none"
          stroke="currentColor"
        >
          {Array.from({ length: 34 }, (_, i) => {
            const y = 360 - i * 9;
            const t = i / 33;
            const w = 70 + 80 * Math.sin(t * Math.PI) + 26 * Math.sin(t * Math.PI * 3);
            return <line key={i} x1={200 - w} x2={200 + w} y1={y} y2={y} strokeWidth="1.4" />;
          })}
          {/* build plate */}
          <path d="M10 372 L390 372 L350 410 L50 410 Z" strokeWidth="1.4" />
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={i}
              x1={50 + i * 37.5}
              y1="410"
              x2={22 + i * 44.5}
              y2="372"
              strokeWidth="0.8"
            />
          ))}
          {/* nozzle */}
          <path d="M188 40 h24 v18 l-12 12 l-12 -12 Z" strokeWidth="1.4" />
        </svg>
        <span className={`${mono} bottom-6 right-6 opacity-50`}>LAYER 34 / 120 · 0.08 mm</span>
      </div>
    );

  if (field === 'game')
    // game HUD
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-35"
        style={{ color: ink }}
      >
        <Corners ink={ink} />
        {/* minimap */}
        <svg
          className="absolute right-8 top-8 size-24 md:right-12 md:top-12"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="50" cy="50" r="46" strokeWidth="1.4" />
          <circle cx="50" cy="50" r="28" strokeWidth="0.8" />
          <path d="M50 4 V96 M4 50 H96" strokeWidth="0.6" />
          <path d="M50 42 l6 14 h-12 Z" fill="currentColor" stroke="none" />
        </svg>
        {/* crosshair over the media area */}
        <svg
          className="absolute bottom-[22%] left-1/2 size-16 -translate-x-1/2"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="32" cy="32" r="14" strokeWidth="1.4" />
          <path d="M32 4 V20 M32 44 V60 M4 32 H20 M44 32 H60" strokeWidth="1.4" />
        </svg>
        {/* segmented health bar */}
        <div className="absolute bottom-8 left-8 flex gap-1 md:bottom-12 md:left-12">
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className="h-2 w-5"
              style={{ background: i < 7 ? ink : 'transparent', border: `1px solid ${ink}` }}
            />
          ))}
        </div>
        <span className={`${mono} bottom-12 right-12 hidden md:block`}>
          LV 42 · ASSET 128 / 256
        </span>
      </div>
    );

  // film: camera viewfinder
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-35"
      style={{ color: ink }}
    >
      <Corners ink={ink} />
      {/* rule of thirds over the lower (media) area */}
      <div className="absolute inset-x-[8%] bottom-[6%] top-[52%]">
        <span
          className="absolute inset-y-0 left-1/3 w-px"
          style={{ background: ink, opacity: 0.6 }}
        />
        <span
          className="absolute inset-y-0 left-2/3 w-px"
          style={{ background: ink, opacity: 0.6 }}
        />
        <span
          className="absolute inset-x-0 top-1/3 h-px"
          style={{ background: ink, opacity: 0.6 }}
        />
        <span
          className="absolute inset-x-0 top-2/3 h-px"
          style={{ background: ink, opacity: 0.6 }}
        />
        <span className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute inset-x-0 top-1/2 h-px" style={{ background: ink }} />
          <span className="absolute inset-y-0 left-1/2 w-px" style={{ background: ink }} />
        </span>
      </div>
      <span className={`${mono} right-12 top-10 flex items-center gap-2 md:right-14 md:top-12`}>
        <span className="size-2 rounded-full bg-[#ff5a5a]" /> REC
      </span>
      <span className={`${mono} bottom-10 right-12 md:bottom-12 md:right-14`}>00:00:12:08</span>
      <span className={`${mono} bottom-10 left-12 hidden md:bottom-12 md:left-14 md:block`}>
        35mm · f/2.8 · 24fps
      </span>
    </div>
  );
}
