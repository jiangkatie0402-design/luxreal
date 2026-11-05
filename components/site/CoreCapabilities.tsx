'use client';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/ui/button';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';

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
      <p className="t-lead mt-4 max-w-[30rem] text-muted-foreground">{intro}</p>
      <ul className="mt-8 grid max-w-[30rem] gap-2">
        {points.map((p) => {
          const [lead, rest] = splitPoint(p);
          return (
            <li key={p} className="t-small text-muted-foreground">
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
}: {
  ns: string;
  id: string;
  items: readonly string[];
  cta?: boolean;
  footer?: string;
  /** keep the h2 for screen readers / outline but don't show it */
  hideTitle?: boolean;
}) {
  const t = useTranslations(ns);
  const c = useTranslations('common');
  const ITEMS = items;
  return (
    <section
      aria-labelledby={`${id}-title`}
      id={id}
      className="relative isolate flex min-h-[100svh] scroll-mt-0 flex-col justify-center pb-6 pt-[calc(var(--header-h)+24px)] md:pb-8"
    >
      {/* ambient glow behind the tabs and card */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[80%] [background:radial-gradient(45%_55%_at_50%_35%,rgba(110,98,163,0.16),transparent_70%)]"
      />
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8 xl:px-12">
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
                <div className="grid lg:h-[max(520px,calc(100svh-var(--header-h)-24px-44px-24px-32px-12px-120px))] lg:grid-cols-[minmax(440px,5fr)_minmax(0,7fr)]">
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
                      <ButtonLink
                        href={site.links.app}
                        size="lg"
                        className="mt-10 w-full max-w-[20rem] bg-[linear-gradient(135deg,#8576c4,#564b8c)] text-white hover:brightness-110 lg:mt-auto"
                      >
                        {c('startCreating')}
                        <ArrowRight aria-hidden />
                      </ButtonLink>
                    )}
                  </div>

                  {/* app-window media frame, bleeding off the right/bottom edge */}
                  <div className="relative min-h-[300px] pl-6 pt-2 md:pl-8 lg:pl-0 lg:pt-12">
                    <div
                      aria-hidden
                      className="absolute bottom-6 left-6 right-6 top-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c] shadow-[0_30px_80px_rgba(0,0,0,0.6)] md:bottom-8 md:left-8 md:right-8 lg:bottom-12 lg:left-0 lg:right-12 lg:top-12"
                    >
                      <div className="flex h-10 items-center gap-2 border-b px-4">
                        <span className="size-2.5 rounded-full bg-white/15" />
                        <span className="size-2.5 rounded-full bg-white/15" />
                        <span className="size-2.5 rounded-full bg-white/15" />
                        <span className="ml-3 h-5 w-48 max-w-[40%] rounded-md bg-white/[0.06]" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 top-10 overflow-hidden [background:radial-gradient(60%_60%_at_55%_50%,rgba(110,98,163,0.14),transparent_70%)]">
                        <span className="absolute inset-x-[-30%] bottom-0 h-[50%] [background:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)_0_0/44px_44px,linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)_0_0/44px_44px] [mask-image:radial-gradient(60%_90%_at_50%_100%,#000,transparent)] [transform:perspective(600px)_rotateX(62deg)] [transform-origin:bottom]" />
                        <span className="absolute bottom-[12%] left-1/2 h-[10%] w-[52%] -translate-x-[40%] rounded-[50%] border border-white/10 [background:radial-gradient(closest-side,rgba(110,98,163,0.22),transparent)]" />
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
  return <Showcase ns="site.core" id="core" items={['image', 'text', 'agent']} cta hideTitle />;
}
