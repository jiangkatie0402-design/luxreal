'use client';
import { useTranslations } from 'next-intl';
import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { site } from '@/config/site';
import { create } from 'zustand';
import { cn } from '@/lib/utils';
import { PanelGlow } from './PanelGlow';

/** Split "Lead：rest" points (full-width colon or ": "). */
function splitPoint(text: string): [string | null, string] {
  const m = text.match(/^(.+?)(?:：|: )(.+)$/);
  return m ? [m[1], m[2]] : [null, text];
}

const IDS = ['print', 'game', 'film'] as const;
/** Public asset base: "/" in the app, overridable for static previews. */
const BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? '/';
/** Media per field and point (image paths); fields without media show empty slots. */
const MEDIA: Partial<Record<(typeof IDS)[number], string[]>> = {
  print: [1, 2, 3].map((k) => `${BASE}works/scene-print-${k}.webp`),
};

/** Preview-only: panel layouts for review. */
export const SCENE_LAYOUTS = [
  '原版',
  '原版·间距微调',
  'B 左文右图',
  'D 图上叠字',
  'E 横向手风琴',
  'F 拼贴',
  'G 列表',
  'H 轮播',
  'I 时间线',
] as const;
export const useSceneLayout = create<{ v: number; set: (v: number) => void }>((setState) => ({
  v: 1,
  set: (v) => setState({ v }),
}));
type T = ReturnType<typeof useTranslations>;

/** Empty media slot (image / video per point, not decided yet). */
function Slot({
  bg,
  className,
  n,
  src,
  fit = 'cover',
}: {
  bg: string;
  className?: string;
  n?: number;
  src?: string;
  fit?: 'cover' | 'contain';
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'relative overflow-hidden rounded-[20px] border border-[var(--line)]',
        className,
      )}
      style={{ background: src ? `${bg} url(${src}) center/${fit} no-repeat` : bg }}
    >
      {n !== undefined && (
        <span className="absolute left-4 top-4 font-mono text-xs text-[var(--muted)]">
          0{n + 1}
        </span>
      )}
    </div>
  );
}

function FieldName({
  id,
  children,
  className,
}: {
  id: string;
  children: string;
  className?: string;
}) {
  return (
    <h3
      id={`scene-${id}`}
      className={cn(
        'font-display text-[2.5rem] font-semibold leading-[1.1] tracking-[0.02em] md:text-7xl',
        className,
      )}
    >
      {children}
    </h3>
  );
}

/** Copy + three media columns for one panel. */
/** Jump to a field's panel (anchors sit in normal flow, unlike the sticky panels). */
function goTo(id: string) {
  const a = document.getElementById(`scene-${id}-anchor`);
  if (!a) return;
  const header =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
  window.scrollTo({
    top: a.getBoundingClientRect().top + window.scrollY - header,
    behavior: 'smooth',
  });
}

function PanelBody({
  id,
  t,
  slot,
  dark,
  cta,
}: {
  id: string;
  t: T;
  slot: string;
  dark: boolean;
  cta: string;
}) {
  const points = (t.raw(`${id}.points`) as string[]).map(splitPoint);
  const subtitle = (
    <p className="text-balance font-display text-2xl font-semibold leading-[1.35] tracking-[0.02em]">
      {t(`${id}.title`)}
    </p>
  );

  const WIDE =
    'relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center px-4 pb-12 pt-12 md:px-12 md:pb-14 md:pt-14 xl:px-20';

  const v = useSceneLayout((st) => st.v);
  const media = MEDIA[id as (typeof IDS)[number]];
  const [active, setActive] = useState(0);
  // B and C show one point at a time and step through them
  useEffect(() => {
    if (![2, 4, 7, 8].includes(v)) return;
    const t = window.setInterval(() => setActive((a) => (a + 1) % points.length), 4000);
    return () => window.clearInterval(t);
  }, [v, points.length, active]);

  const nav = (
    <nav aria-label={t('title')} className="flex justify-center">
      <div
        className={cn(
          'inline-flex rounded-full p-1',
          dark ? 'bg-white/[0.08]' : 'bg-[rgba(22,18,31,0.08)]',
        )}
      >
        {IDS.map((f) => (
          <button
            key={f}
            type="button"
            aria-current={f === id ? 'true' : undefined}
            onClick={() => goTo(f)}
            className={cn(
              'h-9 rounded-full px-5 text-sm font-medium transition-colors',
              f === id
                ? dark
                  ? 'bg-white text-[#16121f] shadow-sm'
                  : 'bg-white text-[#16121f] shadow-[0_2px_8px_rgba(22,18,31,0.12)]'
                : 'text-[var(--muted)] hover:text-[var(--ink)]',
            )}
          >
            {t(`${f}.tab`)}
          </button>
        ))}
      </div>
    </nav>
  );
  const button = (
    <ButtonLink
      href={site.links.app}
      className={cn(
        'h-11 shrink-0 rounded-[12px] px-6',
        dark
          ? 'brand-fill'
          : 'bg-[linear-gradient(135deg,#2a2346,#14111f)] text-[#d6ccff] hover:brightness-125',
      )}
    >
      {cta}
      <ArrowRight aria-hidden />
    </ButtonLink>
  );
  const num = (k: number) => (
    <span className="font-mono text-xs text-[var(--muted)]">0{k + 1}</span>
  );

  const desc = (rest: string) => rest.charAt(0).toUpperCase() + rest.slice(1);

  // Original layout: header (name + subtitle | intro + button), three images with title and text.
  if (v === 0)
    return (
      <div className={WIDE}>
        <div className="mb-8 md:mb-10">{nav}</div>
        <div className="grid gap-4 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <FieldName id={id}>{t(`${id}.tab`)}</FieldName>
            <div className="mt-4">{subtitle}</div>
          </div>
          <div className="max-w-[36rem] lg:justify-self-end">
            <p className="t-lead leading-[1.9] text-[var(--muted)]">{t(`${id}.intro`)}</p>
            <div className="mt-5">{button}</div>
          </div>
        </div>
        <ul className="mt-8 grid gap-6 md:mt-10 md:grid-cols-3 md:gap-8">
          {points.map(([lead, rest], k) => (
            <li key={k} className="flex flex-col">
              <Slot bg={slot} src={media?.[k]} className="aspect-[4/3] w-full" />
              <p className="t-title mt-5 flex items-baseline gap-2">
                {num(k)}
                {lead}
              </p>
              <p className="t-body mt-3 max-w-[30rem] leading-[1.9] text-[var(--muted)]">
                {desc(rest)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );

  // Same layout, calmer rhythm: clearer groups, smaller quieter copy, a little more air
  // between images and their text, and the intro kept narrow beside the title.
  if (v === 1)
    return (
      <div className={WIDE}>
        <div className="mb-10 md:mb-12">{nav}</div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-end lg:gap-20">
          <div>
            <FieldName id={id}>{t(`${id}.tab`)}</FieldName>
            <div className="mt-5">{subtitle}</div>
          </div>
          <div>
            <p className="text-[15px] leading-[1.85] text-[var(--muted)]">{t(`${id}.intro`)}</p>
            <div className="mt-6">{button}</div>
          </div>
        </div>
        <ul className="mt-12 grid gap-8 md:mt-14 md:grid-cols-3 md:gap-10">
          {points.map(([lead, rest], k) => (
            <li key={k} className="flex flex-col">
              <Slot bg={slot} src={media?.[k]} className="aspect-[16/11] w-full" />
              <p className="mt-6 flex items-baseline gap-2 text-[17px] font-semibold leading-snug">
                {num(k)}
                {lead}
              </p>
              <p className="mt-2.5 text-sm leading-[1.8] text-[var(--muted)] opacity-90">
                {desc(rest)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );

  // B — copy and a short list on the left, one large image on the right that follows the list.
  if (v === 2)
    return (
      <div className={WIDE}>
        {nav}
        <div className="mt-10 grid items-center gap-10 md:mt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <FieldName id={id}>{t(`${id}.tab`)}</FieldName>
            <div className="mt-4">{subtitle}</div>
            <ul className="mt-8 grid gap-1 border-l border-[var(--line)]">
              {points.map(([lead, rest], k) => (
                <li key={k}>
                  <button
                    type="button"
                    onClick={() => setActive(k)}
                    className={cn(
                      '-ml-px block w-full border-l-2 py-3 pl-5 text-left transition-colors',
                      active === k
                        ? 'border-[var(--ink)]'
                        : 'border-transparent opacity-50 hover:opacity-80',
                    )}
                  >
                    <span className="t-title flex items-baseline gap-2">
                      {num(k)}
                      {lead}
                    </span>
                    {active === k && (
                      <span className="t-desc mt-2 block max-w-[30rem] text-[var(--muted)]">
                        {rest.charAt(0).toUpperCase() + rest.slice(1)}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-8">{button}</div>
          </div>
          <Slot
            key={active}
            bg={slot}
            src={media?.[active]}
            className="core-panel aspect-[4/3] w-full"
          />
        </div>
      </div>
    );

  // shared header for D/E/F: name + subtitle left, short intro + button right
  const header = (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-end lg:gap-20">
      <div>
        <FieldName id={id}>{t(`${id}.tab`)}</FieldName>
        <div className="mt-5">{subtitle}</div>
      </div>
      <div>
        <p className="text-[15px] leading-[1.85] text-[var(--muted)]">{t(`${id}.intro`)}</p>
        <div className="mt-6">{button}</div>
      </div>
    </div>
  );
  const glass = dark
    ? 'bg-black/45 text-white backdrop-blur-md'
    : 'bg-white/65 text-[#16121f] backdrop-blur-md';

  // D — captions sit on the images in a frosted strip; the text reveals on hover.
  if (v === 3)
    return (
      <div className={WIDE}>
        <div className="mb-10 md:mb-12">{nav}</div>
        {header}
        <ul className="mt-12 grid gap-6 md:mt-14 md:grid-cols-3 md:gap-8">
          {points.map(([lead, rest], k) => (
            <li key={k} className="group relative">
              <Slot bg={slot} src={media?.[k]} className="aspect-[4/3] w-full" />
              <div
                className={cn(
                  'absolute inset-x-3 bottom-3 rounded-[14px] px-4 py-3 transition-all',
                  glass,
                )}
              >
                <p className="flex items-baseline gap-2 text-[15px] font-semibold">
                  {num(k)}
                  {lead}
                </p>
                <p className="grid grid-rows-[0fr] text-[13px] leading-[1.7] opacity-80 transition-[grid-template-rows] duration-300 group-hover:grid-rows-[1fr]">
                  <span className="overflow-hidden">
                    <span className="block pt-1.5">{desc(rest)}</span>
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );

  // E — the three images as an accordion: the active one widens and shows its text.
  if (v === 4)
    return (
      <div className={WIDE}>
        <div className="mb-10 md:mb-12">{nav}</div>
        {header}
        <ul className="mt-12 flex h-[clamp(260px,34vh,360px)] gap-4 md:mt-14">
          {points.map(([lead, rest], k) => (
            <li
              key={k}
              onMouseEnter={() => setActive(k)}
              className={cn(
                'relative min-w-0 overflow-hidden rounded-[20px] transition-[flex-grow] duration-500 ease-out',
                active === k ? 'grow-[3]' : 'grow',
              )}
              style={{ flexBasis: 0 }}
            >
              <Slot
                bg={slot}
                src={media?.[k]}
                fit="contain"
                className="absolute inset-0 rounded-[20px]"
              />
              <div className={cn('absolute inset-x-3 bottom-3 rounded-[14px] px-4 py-3', glass)}>
                <p className="flex items-baseline gap-2 truncate text-[15px] font-semibold">
                  {num(k)}
                  {lead}
                </p>
                {active === k && (
                  <p
                    className="core-panel mt-1.5 text-[13px] leading-[1.7] opacity-80"
                    data-state="active"
                  >
                    {desc(rest)}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );

  // F — bento: the first point large on the left, the other two stacked on the right.
  if (v === 5)
    return (
      <div className={WIDE}>
        <div className="mb-10 md:mb-12">{nav}</div>
        {header}
        <div className="mt-12 grid h-[clamp(300px,38vh,400px)] grid-cols-[3fr_2fr] grid-rows-2 gap-4 md:mt-14">
          {points.map(([lead, rest], k) => (
            <div key={k} className={cn('relative', k === 0 && 'row-span-2')}>
              <Slot bg={slot} src={media?.[k]} fit="contain" className="absolute inset-0" />
              <div className={cn('absolute inset-x-3 bottom-3 rounded-[14px] px-4 py-3', glass)}>
                <p className="flex items-baseline gap-2 text-[15px] font-semibold">
                  {num(k)}
                  {lead}
                </p>
                {k === 0 && (
                  <p className="mt-1.5 max-w-[34rem] text-[13px] leading-[1.7] opacity-80">
                    {desc(rest)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  // G — header left; the three points as a tidy list with thumbnails on the right.
  if (v === 6)
    return (
      <div className={WIDE}>
        <div className="mb-10 md:mb-12">{nav}</div>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            <FieldName id={id}>{t(`${id}.tab`)}</FieldName>
            <div className="mt-5">{subtitle}</div>
            <p className="mt-6 max-w-[28rem] text-[15px] leading-[1.85] text-[var(--muted)]">
              {t(`${id}.intro`)}
            </p>
            <div className="mt-8">{button}</div>
          </div>
          <ul className="grid gap-3">
            {points.map(([lead, rest], k) => (
              <li
                key={k}
                className={cn(
                  'flex items-center gap-5 rounded-[18px] p-3 pr-6',
                  dark ? 'bg-white/[0.04]' : 'bg-white/40',
                )}
              >
                <Slot
                  bg={slot}
                  src={media?.[k]}
                  className="aspect-[4/3] w-[32%] shrink-0 rounded-[14px]"
                />
                <div className="min-w-0">
                  <p className="flex items-baseline gap-2 text-[17px] font-semibold">
                    {num(k)}
                    {lead}
                  </p>
                  <p className="mt-2 text-sm leading-[1.75] text-[var(--muted)]">{desc(rest)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );

  // H — a carousel: one point large in the centre, its neighbours peeking either side.
  if (v === 7)
    return (
      <div className={WIDE}>
        <div className="mb-10 md:mb-12">{nav}</div>
        {header}
        <div className="relative mt-12 h-[clamp(280px,36vh,380px)] md:mt-14">
          {points.map(([lead, rest], k) => {
            const off = ((k - active + points.length + 1) % points.length) - 1; // -1, 0, 1
            return (
              <button
                key={k}
                type="button"
                onClick={() => setActive(k)}
                aria-current={off === 0}
                className="absolute top-0 h-full w-[56%] text-left transition-all duration-500 ease-out"
                style={{
                  left: `${22 + off * 46}%`,
                  transform: `scale(${off === 0 ? 1 : 0.86})`,
                  opacity: off === 0 ? 1 : 0.45,
                  zIndex: off === 0 ? 2 : 1,
                }}
              >
                <Slot bg={slot} src={media?.[k]} fit="contain" className="absolute inset-0" />
                <span
                  className={cn('absolute inset-x-4 bottom-4 rounded-[14px] px-5 py-3.5', glass)}
                >
                  <span className="flex items-baseline gap-2 text-[16px] font-semibold">
                    {num(k)}
                    {lead}
                  </span>
                  {off === 0 && (
                    <span className="mt-1.5 block text-[13px] leading-[1.7] opacity-80">
                      {desc(rest)}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );

  // I — a timeline: three images above a line with numbered stops; the active stop shows its text.
  if (v === 8)
    return (
      <div className={WIDE}>
        <div className="mb-10 md:mb-12">{nav}</div>
        {header}
        <ul className="mt-12 grid grid-cols-3 gap-8 md:mt-14">
          {points.map((_, k) => (
            <li key={k}>
              <button type="button" onClick={() => setActive(k)} className="block w-full">
                <Slot
                  bg={slot}
                  src={media?.[k]}
                  className={cn(
                    'aspect-[16/10] w-full transition-all duration-500',
                    active === k ? 'opacity-100' : 'scale-[0.94] opacity-50',
                  )}
                />
              </button>
            </li>
          ))}
        </ul>
        <div className="relative mt-6">
          <span className="absolute inset-x-0 top-[7px] h-px bg-[var(--line)]" />
          <span
            className="absolute left-0 top-[7px] h-px bg-[var(--ink)] transition-all duration-500"
            style={{ width: `${(active / points.length) * 100 + 4}%` }}
          />
          <ul className="relative grid grid-cols-3 gap-8">
            {points.map(([lead, rest], k) => (
              <li key={k}>
                <button type="button" onClick={() => setActive(k)} className="w-full text-left">
                  <span
                    className={cn(
                      'block size-[15px] rounded-full border-2 transition-colors',
                      active >= k
                        ? 'border-[var(--ink)] bg-[var(--ink)]'
                        : 'border-[var(--line)] bg-transparent',
                    )}
                  />
                  <span
                    className={cn(
                      'mt-4 flex items-baseline gap-2 text-[16px] font-semibold transition-opacity',
                      active === k ? 'opacity-100' : 'opacity-50',
                    )}
                  >
                    {num(k)}
                    {lead}
                  </span>
                  <span
                    className={cn(
                      'mt-2 block text-[13px] leading-[1.75] text-[var(--muted)] transition-opacity',
                      active === k ? 'opacity-100' : 'opacity-0',
                    )}
                  >
                    {desc(rest)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );

  return null;
}

type Panel = {
  bg: string;
  ink: string;
  muted: string;
  line: string;
  slot: string;
  edge: string;
  tint: [string, string];
  /** glow strength (default 0.55) */
  glow?: number;
  /** colour of a soft light beam from the top centre */
  beam?: string;
};

/** Light panel: dark ink. */
const light = (bg: string, tint: [string, string]): Panel => ({
  bg,
  ink: '#16121f',
  muted: 'rgba(22,18,31,0.68)',
  line: 'rgba(22,18,31,0.16)',
  slot: 'rgba(22,18,31,0.07)',
  edge: 'transparent',
  tint,
});
/** Dark panel: white ink; optional coloured top edge. */
const dark = (bg: string, tint: [string, string], edge = 'transparent'): Panel => ({
  bg,
  ink: '#ffffff',
  muted: 'rgba(255,255,255,0.72)',
  line: 'rgba(255,255,255,0.16)',
  slot: 'rgba(255,255,255,0.06)',
  edge,
  tint,
});

/** Preview-only: colour schemes for the three field panels (3D 打印, 游戏, 影视). */
const BEAM_W = 'rgba(255,255,255,0.55)';
const BEAM_V = 'rgba(196,181,253,0.3)';

/** M1: mist violet (lit edge, white beam) / black (violet beam) / mid violet. */
const m1 = (bgs: [string, string, string], extra: Partial<Panel> = {}): [Panel, Panel, Panel] => [
  { ...light(bgs[0], ['#f3eeff', '#b3a2ef']), beam: BEAM_W, ...extra },
  { ...dark(bgs[1], ['#3a2f66', '#14111f']), beam: BEAM_V, ...extra },
  { ...light(bgs[2], ['#ece5ff', '#9c88e6']), beam: BEAM_W, ...extra },
];
/** light → dark → light, each with a top-to-bottom gradient base. */
const PANELS = m1([
  'linear-gradient(180deg,#ece5ff 0%,#cdbdff 100%)',
  'linear-gradient(180deg,#221c3e 0%,#0a0910 70%)',
  'linear-gradient(180deg,#d9ccff 0%,#b29ef5 100%)',
]);

/**
 * 应用场景: full-height colour panels that stack on scroll — each panel is
 * sticky, so the next field slides up over the previous one. Media slots empty.
 * A panel taller than the screen gets a negative sticky top, so it first scrolls
 * through to its bottom and only then holds while the next one slides over.
 */
export function UseCaseStack() {
  const t = useTranslations('site.scenes');
  const c = useTranslations('common');
  const panels = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const fit = () => {
      const header =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
      // the last panel isn't sticky (top would just shift it)
      panels.current.slice(0, -1).forEach((el) => {
        if (el) el.style.top = `${Math.min(header, window.innerHeight - el.offsetHeight)}px`;
      });
    };
    fit();
    const ro = new ResizeObserver(fit);
    panels.current.forEach((el) => el && ro.observe(el));
    window.addEventListener('resize', fit);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, []);

  return (
    <section aria-labelledby="scenes-title" id="scenes" className="scroll-mt-20">
      {/* section name lives in each panel's label; h2 kept for the outline */}
      <h2 id="scenes-title" className="sr-only">
        {t('title')}
      </h2>

      {IDS.map((id, i) => {
        const p = PANELS[i];
        return (
          <Fragment key={id}>
            <div id={`scene-${id}-anchor`} aria-hidden />
            <article
              ref={(el) => {
                panels.current[i] = el;
              }}
              aria-labelledby={`scene-${id}`}
              className={cn(
                'relative isolate flex min-h-[calc(100svh-var(--header-h))] flex-col overflow-hidden rounded-t-[32px] text-[var(--ink)]',
                // the last panel scrolls away normally so what follows never covers it
                i < IDS.length - 1 && 'sticky top-[var(--header-h)]',
              )}
              style={
                {
                  background: p.bg,
                  boxShadow: `inset 0 1px 0 ${p.edge}, 0 -24px 60px rgba(0,0,0,0.35)`,
                  '--ink': p.ink,
                  '--muted': p.muted,
                  '--line': p.line,
                } as CSSProperties
              }
            >
              <PanelGlow tint={p.tint} strength={p.glow} />
              {p.beam && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
                  style={{
                    background: `radial-gradient(40% 75% at 50% 0%, ${p.beam}, transparent 72%)`,
                  }}
                />
              )}
              <PanelBody
                id={id}
                t={t}
                slot={p.slot}
                dark={p.ink === '#ffffff'}
                cta={c('startCreating')}
              />
            </article>
            {/* hold: the panel stays fully in view for a stretch before the next one slides over */}
            {i < IDS.length - 1 && <div aria-hidden className="h-[45svh]" />}
          </Fragment>
        );
      })}

      <div className="relative bg-background">
        <p className="t-small container-x py-8 text-center text-muted-foreground md:py-12">
          {t('more')}
        </p>
      </div>
    </section>
  );
}
