'use client';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';

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

function TextCard({ title, intro, label }: { title: string; intro: string; label?: string }) {
  return (
    <div className="flex h-full flex-col rounded-[22px] border bg-card p-6 shadow-card md:p-8">
      {label && <p className="t-label text-primary">{label}</p>}
      <h3 className={cn('t-title', label && 'mt-2')}>{title}</h3>
      <p className="t-body mt-2 text-muted-foreground">{intro}</p>
    </div>
  );
}

const AGENT_ITEMS = ['gen', 'material', 'format', 'batch', 'track', 'scene'] as const;
const CASES = ['props', 'print', 'film'] as const;

/** 四、专为 Agent 设计 */
export function ForAgents() {
  const t = useTranslations('site.agents');
  return (
    <Section id="agents" title={t('title')} lead={t('lead')}>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {AGENT_ITEMS.map((k) => (
          <li key={k}>
            <TextCard
              label={t(`items.${k}.label`)}
              title={t(`items.${k}.t`)}
              intro={t(`items.${k}.d`)}
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** 应用案例 — its own section so it shares the standard section rhythm. */
export function AgentCases() {
  const t = useTranslations('site.agents');
  return (
    <Section id="cases" title={t('casesTitle')}>
      <h3 className="t-h3 mt-16 text-center md:mt-24">{t('casesTitle')}</h3>
      <ul className="grid gap-6 md:grid-cols-3">
        {CASES.map((k) => (
          <li
            key={k}
            className="flex flex-col overflow-hidden rounded-[22px] border bg-card shadow-card"
          >
            <Slot className="aspect-[4/3] rounded-none border-0 border-b" />
            <div className="p-6 md:p-8">
              <p className="t-label text-primary">{t(`cases.${k}.label`)}</p>
              <h4 className="t-title mt-2">{t(`cases.${k}.t`)}</h4>
              <p className="t-body mt-2 text-muted-foreground">{t(`cases.${k}.d`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

const WHY = ['cost', 'easy', 'quality'] as const;

/** 五、为什么选择 Aholo 3D? */
export function WhyUs() {
  const t = useTranslations('site.why');
  return (
    <Section id="why" title={t('title')}>
      <ul className="grid gap-6 md:grid-cols-3">
        {WHY.map((k, i) => (
          <li
            key={k}
            className="flex flex-col overflow-hidden rounded-[22px] border bg-card shadow-card"
          >
            <Slot className="aspect-[16/10] rounded-none border-0 border-b" />
            <div className="p-6 md:p-8">
              <p className="t-label font-mono text-primary">
                0{i + 1} · {t(`items.${k}.label`)}
              </p>
              <h3 className="t-title mt-2">{t(`items.${k}.t`)}</h3>
              <p className="t-body mt-2 text-muted-foreground">{t(`items.${k}.d`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** 六、用户证言 — content not decided; empty quote frames. */
export function Testimonials() {
  const t = useTranslations('site.voices');
  return (
    <Section id="voices" title={t('title')}>
      <div className="grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Slot key={i} className="min-h-56" />
        ))}
      </div>
    </Section>
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
