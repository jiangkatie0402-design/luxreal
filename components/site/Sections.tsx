'use client';
import { ArrowRight, Quote } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';
import { create } from 'zustand';
import { AgentCapabilities } from './AgentCapabilities';
import { AgentMcp } from './AgentMcp';

/** Shared section shell: centred h2 (+ optional lead) and content. */
function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-title`} id={id} className="section-y scroll-mt-20">
      <div className="container-x">
        <h2 id={`${id}-title`} className="t-h2 text-center">
          {title}
        </h2>
        {lead && (
          <p className="t-lead mx-auto mt-4 max-w-2xl text-center text-muted-foreground">{lead}</p>
        )}
        <div className="mt-8 md:mt-12">{children}</div>
      </div>
    </section>
  );
}

/** Empty media slot, kept until assets are decided. */
function Slot({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'rounded-2xl border border-dashed border-border-strong bg-secondary/40',
        className,
      )}
    />
  );
}

/**
 * 四、专为 Agent 设计 — the capability orbit, then the MCP install strip.
 */
export function ForAgents() {
  const t = useTranslations('site.agents');
  return (
    <section aria-labelledby="agents-title" id="agents" className="section-y scroll-mt-20">
      <div className="container-x">
        <AgentCapabilities
          heading={
            <div className="flex flex-col items-center text-center">
              <h2 id="agents-title" className="t-h2">
                {t('title')}
              </h2>
              <p className="t-lead mt-4 max-w-[60rem] text-balance text-muted-foreground">
                {t('lead')}
              </p>
            </div>
          }
        />

        {/* MCP install */}
        <div id="agents-mcp" className="mt-12 md:mt-16">
          <AgentMcp />
        </div>
      </div>
    </section>
  );
}

export { WhyUs } from './WhyRing';

/** Preview-only: testimonial layouts for review. */
export const VOICE_VARIANTS = ['A 作品+评价卡', 'B 分领域大引用', 'C 社交动态墙'] as const;
export const useVoiceVariant = create<{ v: number; set: (v: number) => void }>((setState) => ({
  v: 0,
  set: (v) => setState({ v }),
}));

const FIELDS = ['print', 'game', 'film'] as const;

function Person({ t, size = 'size-9' }: { t: ReturnType<typeof useTranslations>; size?: string }) {
  return (
    <span className="flex items-center gap-3">
      <span
        className={cn(
          size,
          'shrink-0 rounded-full bg-[linear-gradient(135deg,#3a3060,#1b1830)] ring-1 ring-white/10',
        )}
      />
      <span className="text-left leading-tight">
        <span className="block text-sm font-medium">{t('name')}</span>
        <span className="t-small block text-muted-foreground">{t('role')}</span>
      </span>
    </span>
  );
}

/** Section header shared by the variants: small eyebrow, then the title. */
function VoicesHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <p className="t-label font-mono text-primary">{eyebrow}</p>
      <h2 id="voices-title" className="t-h2 mt-3">
        {title}
      </h2>
    </div>
  );
}

/**
 * 六、用户证言 — three layouts for review. Quotes, names and media stay as
 * explicit placeholders until real ones are collected.
 */
export function Testimonials() {
  const t = useTranslations('site.voices');
  const s = useTranslations('site.scenes');
  const v = useVoiceVariant((st) => st.v);

  return (
    <section aria-labelledby="voices-title" id="voices" className="section-y scroll-mt-20">
      <div className="container-x">
        {/* A — the work first: a media slot, the quote, who said it and their field */}
        {v === 0 && (
          <>
            <VoicesHead eyebrow={t('a.eyebrow')} title={t('a.title')} />
            <ul className="mt-10 grid gap-6 md:mt-14 md:grid-cols-3">
              {FIELDS.map((f, i) => (
                <li
                  key={f}
                  className={cn(
                    'flex flex-col rounded-[22px] border border-white/[0.08] bg-[#111114] p-3',
                    i === 1 && 'md:translate-y-8',
                  )}
                >
                  <Slot className="aspect-[16/10] rounded-2xl" />
                  <div className="flex flex-1 flex-col p-3 pt-5">
                    <p className="t-body text-pretty text-foreground/90">“{t('quote')}”</p>
                    <div className="mt-6 flex items-end justify-between gap-3 border-t border-white/[0.06] pt-4">
                      <Person t={t} />
                      <span className="rounded-full bg-[#6e62a3]/20 px-2.5 py-1 text-xs text-[#d6ccff]">
                        {s(`${f}.tab`)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* B — one large quote at a time, switched by field, matching the use cases above */}
        {v === 1 && (
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div className="text-center lg:text-left">
              <p className="t-label font-mono text-primary">{t('b.eyebrow')}</p>
              <h2 id="voices-title" className="t-h2 mt-3 text-balance">
                {t('b.title')}
              </h2>
              <div className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">
                {FIELDS.map((f, i) => (
                  <span
                    key={f}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm',
                      i === 0
                        ? 'border-[#c4b5fd]/50 bg-[#6e62a3]/30 text-white'
                        : 'border-white/10 text-muted-foreground',
                    )}
                  >
                    {s(`${f}.tab`)}
                  </span>
                ))}
              </div>
            </div>
            <figure className="relative rounded-[28px] border border-white/[0.08] bg-[radial-gradient(80%_120%_at_0%_0%,rgba(110,98,163,0.22),transparent_60%),#0f0e13] p-8 md:p-12">
              <Quote
                aria-hidden
                className="absolute -top-5 left-8 size-10 fill-[#b8a6ff] text-[#b8a6ff] md:left-12"
              />
              <blockquote className="text-balance font-display text-2xl font-medium leading-[1.5] md:text-3xl">
                {t('quote')}
              </blockquote>
              <figcaption className="mt-10 flex items-center justify-between gap-4">
                <Person t={t} size="size-11" />
                <span className="flex gap-1.5">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className={cn(
                        'h-1 rounded-full',
                        d === 0 ? 'w-6 bg-[#c4b5fd]' : 'w-2 bg-white/20',
                      )}
                    />
                  ))}
                </span>
              </figcaption>
            </figure>
          </div>
        )}

        {/* C — a wall of short posts of varying length, fading out with a "see more" */}
        {v === 2 && (
          <>
            <VoicesHead eyebrow={t('c.eyebrow')} title={t('c.title')} />
            <div className="relative mt-10 md:mt-14">
              <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
                {['X', 'Discord', '小红书', 'Reddit', 'X', 'Discord'].map((src, i) => (
                  <figure
                    key={i}
                    className="break-inside-avoid rounded-2xl border border-white/[0.08] bg-[#111114] p-5"
                  >
                    <figcaption className="flex items-center justify-between gap-3">
                      <Person t={t} size="size-8" />
                      <span className="rounded-md bg-white/[0.05] px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                        {src}
                      </span>
                    </figcaption>
                    <blockquote className="t-body mt-4 text-pretty text-foreground/85">
                      {i % 3 === 1 ? t('quoteShort') : t('quote')}
                      {i % 3 === 2 && <> {t('quote')}</>}
                    </blockquote>
                    {i % 2 === 0 && <Slot className="mt-4 aspect-[16/9] rounded-xl" />}
                  </figure>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
            </div>
            <div className="relative -mt-6 text-center">
              <span className="inline-flex h-10 items-center rounded-btn border border-white/15 px-5 text-sm text-muted-foreground">
                {t('c.more')}
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/** 七、社区作品 — gallery tiles empty until real works are chosen. */
export function Community() {
  const t = useTranslations('site.community');
  return (
    <Section id="community" title={t('title')} lead={t('lead')}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {Array.from({ length: 8 }, (_, i) => (
          <Slot
            key={i}
            className={cn('aspect-square', i === 0 && 'md:col-span-2 md:row-span-2 md:aspect-auto')}
          />
        ))}
      </div>
    </Section>
  );
}

/** 八、收尾引导 — create entry + (empty) agent install slot. */
export function FinalCta() {
  const t = useTranslations('site.final');
  const c = useTranslations('common');
  return (
    <section aria-labelledby="final-title" id="start" className="scroll-mt-20 pb-16 md:pb-24">
      <div className="container-x">
        <div className="relative isolate overflow-hidden rounded-[32px] border border-border-strong px-6 py-16 text-center [background:var(--card-bg)] md:py-24">
          <h2 id="final-title" className="t-h2">
            {t('title')}
          </h2>
          <p className="t-lead mx-auto mt-4 max-w-xl text-muted-foreground">{t('lead')}</p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href={site.links.app} size="lg">
              {c('startCreating')}
              <ArrowRight aria-hidden />
            </ButtonLink>
          </div>
          {/* Agent install guide: copy not decided yet */}
          <Slot className="mx-auto mt-8 h-24 max-w-2xl" />
        </div>
      </div>
    </section>
  );
}
