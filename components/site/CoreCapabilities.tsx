'use client';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { ArrowRight, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';

/** Public asset base: "/" in the app, overridable for static previews. */
const BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? '/';

/**
 * Left side of the app window for image-to-3D: the generation panel (design
 * draft) with a 2D picture being dragged into its upload area, as in a real
 * workspace. Positions are % of the panel's own 360x1140 artboard.
 */
function Workspace() {
  return (
    <div className="absolute inset-y-0 left-0 z-10 w-[min(34%,250px)] border-r border-white/[0.06] bg-[#141416] p-2.5">
      <div className="relative aspect-[360/1140] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${BASE}works/turbo-panel.webp`} alt="" className="absolute inset-0 size-full" />
        {/* the picture being added */}
        <span className="core-drop absolute left-[46%] top-[21%] w-[66%] overflow-hidden rounded-[14px] border border-white/25 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BASE}works/rabbit-input.webp`}
            alt=""
            className="block aspect-square w-full"
          />
          <span className="absolute left-[7%] top-[7%] grid size-[22%] place-items-center rounded-lg bg-[#1d2742] text-white ring-1 ring-white/20">
            <Plus className="size-[70%]" strokeWidth={2.4} />
          </span>
        </span>
        {/* pointer */}
        <svg
          viewBox="0 0 24 24"
          className="absolute left-[40%] top-[19%] w-[10%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
        >
          <path
            d="M4 2l15 11-6.5 1.2L16 21l-3 1.4-3.4-6.9L4 20z"
            fill="#fff"
            stroke="#111"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

/**
 * Plays the clip once when it scrolls into view, then rests on its last frame
 * (the finished model). Plays again from the start each time it comes back
 * into view. Reduced motion shows the poster only.
 */
function PlayOnce({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          v.currentTime = 0;
          void v.play().catch(() => {});
        }
      },
      { threshold: 0.5 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);
  return (
    <video
      ref={ref}
      aria-hidden
      muted
      playsInline
      preload="auto"
      poster={poster}
      src={src}
      className={className}
    />
  );
}

/** Split "Lead：rest" points (zh full-width colon or en ": "). */
function splitPoint(text: string): [string | null, string] {
  const m = text.match(/^(.+?)(?:\uFF1A|: )(.+)$/);
  return m ? [m[1], m[2]] : [null, text];
}

/** Copy column: large airy title, intro, points as small muted lines (no checkmarks). */
function Copy({ title, intro, points }: { title: string; intro: string; points: string[] }) {
  return (
    <>
      <h3 className="text-balance font-display text-2xl font-semibold leading-[1.25] tracking-[0.02em] md:text-3xl">
        {title}
      </h3>
      <p className="mt-4 max-w-[30rem] text-[16px] leading-[28px] text-muted-foreground">{intro}</p>
      <ul className="mt-4 grid max-w-[30rem] gap-1">
        {points.map((p) => {
          const [lead, rest] = splitPoint(p);
          return (
            <li key={p} className="text-[16px] leading-[28px] text-muted-foreground">
              {lead && <span className="text-foreground/90">{lead}：</span>}
              {rest}
            </li>
          );
        })}
      </ul>
    </>
  );
}

/**
 * Pill tabs above one large glowing card. Text (and optional primary action) on
 * the left; an app-window media frame bleeds off the card's right/bottom edge.
 * The window is empty until assets are decided.
 */
export function Showcase({
  ns,
  id,
  items,
  cta = false,
  footer,
  hideTitle = false,
  media,
}: {
  ns: string;
  id: string;
  items: readonly string[];
  cta?: boolean;
  footer?: string;
  /** keep the h2 for screen readers / outline but don't show it */
  hideTitle?: boolean;
  /** per-item looping clip in the window: path without extension (".mp4", "-poster.jpg") */
  media?: Partial<Record<string, string>>;
}) {
  const t = useTranslations(ns);
  const c = useTranslations('common');
  const ITEMS = items;
  return (
    <section
      aria-labelledby={`${id}-title`}
      id={id}
      className="relative isolate flex min-h-[100svh] scroll-mt-0 flex-col justify-center pb-16 pt-[calc(var(--header-h)+24px)] md:pb-24"
    >
      {/* ambient glow behind the tabs and card */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[80%] [background:radial-gradient(45%_55%_at_50%_35%,rgba(110,98,163,0.16),transparent_70%)]"
      />
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8 lg:px-[7vw]">
        <h2 id={`${id}-title`} className={hideTitle ? 'sr-only' : 't-h2 text-center'}>
          {t('title')}
        </h2>

        <TabsPrimitive.Root
          defaultValue={items[0]}
          className={cn('flex flex-col items-center', !hideTitle && 'mt-8 md:mt-12')}
        >
          <TabsPrimitive.List
            aria-label={t('title')}
            className="inline-flex max-w-full rounded-btn-outer bg-[#141417] p-1"
          >
            {ITEMS.map((id) => (
              <TabsPrimitive.Trigger
                key={id}
                value={id}
                className={cn(
                  'whitespace-nowrap font-medium outline-none transition-[color,background-color] duration-[var(--dur-fast)] focus-visible:ring-1 focus-visible:ring-ring/60',
                  'h-11 rounded-btn px-6 text-base text-muted-foreground hover:text-foreground',
                  'data-[state=active]:bg-[linear-gradient(135deg,#6e62a3,#4b4277)] data-[state=active]:text-white',
                )}
              >
                {t(`${id}.tab`)}
              </TabsPrimitive.Trigger>
            ))}
          </TabsPrimitive.List>

          {ITEMS.map((id) => (
            <TabsPrimitive.Content
              key={id}
              value={id}
              className="core-panel mt-6 w-full outline-none"
            >
              <div className="relative isolate overflow-hidden rounded-[28px] border border-white/10 before:pointer-events-none before:absolute before:inset-x-[12%] before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(196,186,255,0.35),transparent)] [background:radial-gradient(70%_65%_at_0%_100%,rgba(110,98,163,0.32),transparent_62%),linear-gradient(180deg,#0b0b0d,#060607)]">
                <div className="grid lg:h-[max(520px,calc(100svh-var(--header-h)-24px-44px-24px-32px-12px-8px))] lg:grid-cols-[minmax(440px,5fr)_minmax(0,7fr)]">
                  {/* copy + action */}
                  <div className="flex flex-col p-6 md:p-8 lg:p-12">
                    <div>
                      <Copy
                        title={t(`${id}.title`)}
                        intro={t(`${id}.intro`)}
                        points={t.raw(`${id}.points`) as string[]}
                      />
                    </div>
                    {cta && (
                      <span className="brand-ring mt-10 w-full max-w-[20rem] lg:mt-auto">
                        <ButtonLink href={site.links.app} size="lg" className="brand-fill w-full">
                          <span className="brand-label">{c('startCreating')}</span>
                          <ArrowRight aria-hidden />
                        </ButtonLink>
                      </span>
                    )}
                  </div>

                  {/* app-window media frame, bleeding off the right/bottom edge */}
                  <div className="relative min-h-[300px] pl-6 pt-2 md:pl-8 lg:pl-0 lg:pt-12">
                    <div
                      aria-hidden
                      className="absolute inset-y-0 left-6 right-0 top-2 overflow-hidden rounded-tl-2xl border-l border-t border-white/10 bg-[#0a0a0c] shadow-[0_30px_80px_rgba(0,0,0,0.6)] md:left-8 lg:left-0 lg:top-12"
                    >
                      <div className="flex h-10 items-center gap-2 border-b px-4">
                        {/* macOS window controls */}
                        <span className="size-3 rounded-full bg-[#ff5f57] ring-1 ring-inset ring-black/20" />
                        <span className="size-3 rounded-full bg-[#febc2e] ring-1 ring-inset ring-black/20" />
                        <span className="size-3 rounded-full bg-[#28c840] ring-1 ring-inset ring-black/20" />
                        {/* app header: brand + current tool, like a real workspace */}
                        <span className="ml-3 flex items-center gap-2 text-[13px] font-semibold text-white/90">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`${BASE}aholo-mark.svg`} alt="" className="size-5" />
                          Aholo 3D
                          <span className="font-normal text-white/25">/</span>
                          <span className="font-normal text-white/55">{t(`${id}.tab`)}</span>
                        </span>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 top-10 overflow-hidden">
                        {media?.[id] && <Workspace />}
                        <div
                          className={cn(
                            'absolute inset-y-0 right-0 [background:radial-gradient(60%_60%_at_55%_50%,rgba(110,98,163,0.14),transparent_70%)]',
                            media?.[id] ? 'left-[min(34%,250px)]' : 'left-0',
                          )}
                        >
                          <span className="absolute inset-x-[-30%] bottom-0 h-[50%] [background:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)_0_0/44px_44px,linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)_0_0/44px_44px] [mask-image:radial-gradient(60%_90%_at_50%_100%,#000,transparent)] [transform:perspective(600px)_rotateX(62deg)] [transform-origin:bottom]" />
                          {media?.[id] && (
                            <>
                              {/* spotlight from above onto the stage */}
                              <span className="absolute inset-x-0 top-0 h-[88%] blur-xl [background:conic-gradient(from_180deg_at_50%_-8%,transparent_162deg,rgba(214,204,255,0.22)_172deg,rgba(240,236,255,0.38)_180deg,rgba(214,204,255,0.22)_188deg,transparent_198deg)] [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]" />
                              <span className="absolute bottom-[9%] left-1/2 h-[18%] w-[46%] -translate-x-1/2 rounded-[50%] [background:radial-gradient(closest-side,rgba(214,204,255,0.3),transparent)]" />
                            </>
                          )}
                          <span
                            className={cn(
                              'absolute bottom-[12%] left-1/2 h-[10%] w-[52%] rounded-[50%] border border-white/10 [background:radial-gradient(closest-side,rgba(110,98,163,0.22),transparent)]',
                              media?.[id] ? '-translate-x-1/2' : '-translate-x-[40%]',
                            )}
                          />
                          {media?.[id] && (
                            <PlayOnce
                              poster={`${BASE}${media[id]}-poster.jpg`}
                              src={`${BASE}${media[id]}.mp4`}
                              className="absolute bottom-[8%] left-1/2 h-[88%] w-auto -translate-x-1/2 mix-blend-lighten"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsPrimitive.Content>
          ))}
        </TabsPrimitive.Root>
        {footer && (
          <p className="t-small mx-auto mt-8 max-w-2xl text-center text-muted-foreground">
            {footer}
          </p>
        )}
      </div>
    </section>
  );
}

/** 核心能力 */
export function CoreCapabilities() {
  return (
    <Showcase
      ns="site.core"
      id="core"
      items={['image', 'text', 'agent']}
      media={{ image: 'videos/core-image' }}
      cta
      hideTitle
    />
  );
}
