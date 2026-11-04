'use client';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { ArrowRight, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/ui/button';
import { site } from '@/config/site';

/** "Lead：rest" points render the lead in bold (zh full-width colon or en ": "). */
function Point({ text }: { text: string }) {
  const m = text.match(/^(.+?)(：|: )(.+)$/);
  if (!m) return <>{text}</>;
  return (
    <span>
      <strong className="font-semibold text-foreground">{m[1]}</strong>
      {m[2]}
      {m[3]}
    </span>
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
}: {
  ns: string;
  id: string;
  items: readonly string[];
  cta?: boolean;
  footer?: string;
}) {
  const t = useTranslations(ns);
  const c = useTranslations('common');
  const ITEMS = items;
  return (
    <section aria-labelledby={`${id}-title`} id={id} className="scroll-mt-20 py-24 md:py-32">
      <div className="container-x">
        <h2
          id={`${id}-title`}
          className="text-center font-display text-3xl font-semibold tracking-tight md:text-[2.5rem]"
        >
          {t('title')}
        </h2>

        <TabsPrimitive.Root
          defaultValue={items[0]}
          className="mt-8 flex flex-col items-center md:mt-10"
        >
          <TabsPrimitive.List
            aria-label={t('title')}
            className="grid w-full max-w-[420px] grid-cols-3 gap-1 rounded-full border bg-card/70 p-1 backdrop-blur"
          >
            {ITEMS.map((id) => (
              <TabsPrimitive.Trigger
                key={id}
                value={id}
                className="h-10 whitespace-nowrap rounded-full px-3 text-sm font-medium text-muted-foreground outline-none transition-[color,background-color] duration-[var(--dur-fast)] hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring/60 data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-[inset_0_0_0_1px_var(--border-strong)]"
              >
                {t(`${id}.tab`)}
              </TabsPrimitive.Trigger>
            ))}
          </TabsPrimitive.List>

          {ITEMS.map((id) => (
            <TabsPrimitive.Content
              key={id}
              value={id}
              className="core-panel mt-8 w-full outline-none md:mt-10"
            >
              <div className="relative isolate overflow-hidden rounded-[28px] border border-border-strong before:pointer-events-none before:absolute before:inset-x-[10%] before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(156,200,255,0.55),transparent)] [background:var(--card-bg)]">
                <div className="grid lg:min-h-[520px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                  {/* copy + action */}
                  <div className="flex flex-col justify-center p-7 md:p-10 lg:p-12">
                    <h3 className="text-balance font-display text-[1.75rem] font-semibold leading-[1.15] tracking-tight md:text-4xl">
                      {t(`${id}.title`)}
                    </h3>
                    <p className="mt-5 max-w-[30rem] text-[15px] leading-relaxed text-muted-foreground md:text-base">
                      {t(`${id}.intro`)}
                    </p>
                    <ul className="mt-6 grid max-w-[30rem] gap-3">
                      {(t.raw(`${id}.points`) as string[]).map((p) => (
                        <li
                          key={p}
                          className="flex gap-2.5 text-sm leading-relaxed text-foreground/85"
                        >
                          <Check className="mt-1 size-3.5 shrink-0 text-primary" aria-hidden />
                          <Point text={p} />
                        </li>
                      ))}
                    </ul>
                    {cta && (
                      <ButtonLink
                        href={site.links.app}
                        size="lg"
                        className="mt-10 w-full max-w-[18rem]"
                      >
                        {c('startCreating')}
                        <ArrowRight aria-hidden />
                      </ButtonLink>
                    )}
                  </div>

                  {/* app-window media frame, bleeding off the right/bottom edge */}
                  <div className="relative min-h-[300px] pl-7 pt-2 md:pl-10 lg:pl-0 lg:pt-12">
                    <div
                      aria-hidden
                      className="absolute inset-y-0 left-7 right-0 top-2 overflow-hidden rounded-tl-2xl border-l border-t border-border-strong bg-[#070b14] shadow-[0_30px_80px_rgba(0,0,0,0.55)] md:left-10 lg:left-0 lg:top-12"
                    >
                      <div className="flex h-10 items-center gap-2 border-b px-4">
                        <span className="size-2.5 rounded-full bg-white/15" />
                        <span className="size-2.5 rounded-full bg-white/15" />
                        <span className="size-2.5 rounded-full bg-white/15" />
                        <span className="ml-3 h-5 w-48 max-w-[40%] rounded-md bg-white/[0.06]" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 top-10 overflow-hidden [background:radial-gradient(60%_60%_at_55%_50%,rgba(47,107,255,0.2),transparent_70%)]">
                        <span className="absolute inset-x-[-30%] bottom-0 h-[50%] [background:linear-gradient(rgba(111,168,255,0.14)_1px,transparent_1px)_0_0/44px_44px,linear-gradient(90deg,rgba(111,168,255,0.14)_1px,transparent_1px)_0_0/44px_44px] [mask-image:radial-gradient(60%_90%_at_50%_100%,#000,transparent)] [transform:perspective(600px)_rotateX(62deg)] [transform-origin:bottom]" />
                        <span className="absolute bottom-[12%] left-1/2 h-[10%] w-[52%] -translate-x-[40%] rounded-[50%] border border-[#6FA8FF]/30 [background:radial-gradient(closest-side,rgba(47,107,255,0.25),transparent)]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsPrimitive.Content>
          ))}
        </TabsPrimitive.Root>
        {footer && <p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p>}
      </div>
    </section>
  );
}

/** 核心能力 */
export function CoreCapabilities() {
  return <Showcase ns="site.core" id="core" items={['image', 'text', 'agent']} cta />;
}

/** 应用场景 */
export function UseCases() {
  const t = useTranslations('site.scenes');
  return (
    <Showcase ns="site.scenes" id="scenes" items={['print', 'game', 'film']} footer={t('more')} />
  );
}
