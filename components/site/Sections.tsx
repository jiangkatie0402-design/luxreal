'use client';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';
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

/** One quiet quote card; text stays as skeleton lines until real quotes exist. */
function QuoteCard() {
  return (
    <figure className="flex w-[300px] shrink-0 flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <blockquote aria-hidden className="grid gap-2">
        <span className="h-2 w-full rounded-full bg-white/[0.07]" />
        <span className="h-2 w-[86%] rounded-full bg-white/[0.07]" />
        <span className="h-2 w-[62%] rounded-full bg-white/[0.07]" />
      </blockquote>
      <figcaption aria-hidden className="flex items-center gap-2.5">
        <span className="size-6 rounded-full bg-white/[0.08]" />
        <span className="h-2 w-20 rounded-full bg-white/[0.07]" />
      </figcaption>
    </figure>
  );
}

/**
 * 六、用户证言 — kept deliberately quiet: a small heading and two slow rows of
 * compact quote cards drifting in opposite directions, faded at both edges.
 * Quotes are empty until real ones are collected.
 */
export function Testimonials() {
  const t = useTranslations('site.voices');
  const row = (reverse: boolean) => (
    <div
      className="flex w-max gap-4 voices-row"
      style={reverse ? { animationDirection: 'reverse' } : undefined}
    >
      {Array.from({ length: 12 }, (_, i) => (
        <QuoteCard key={i} />
      ))}
    </div>
  );
  return (
    <section aria-labelledby="voices-title" id="voices" className="scroll-mt-20 py-16 md:py-20">
      <h2
        id="voices-title"
        className="text-center font-display text-xl font-semibold text-muted-foreground md:text-2xl"
      >
        {t('title')}
      </h2>
      <div className="mt-8 grid gap-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] md:mt-10">
        {row(false)}
        {row(true)}
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
