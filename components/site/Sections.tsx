'use client';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/ui/button';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';
import { AgentCapabilities } from './AgentCapabilities';
import { AgentMcp } from './AgentMcp';

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

/** One testimonial: who said it on top, their words below. Placeholder until real quotes exist. */
function VoiceCard({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <figure className="flex w-[340px] shrink-0 flex-col gap-4 rounded-[20px] border border-white/[0.07] bg-[linear-gradient(160deg,rgba(40,34,72,0.55),rgba(18,17,26,0.7))] p-6 backdrop-blur-sm">
      <figcaption className="flex items-center gap-3">
        <span className="size-10 shrink-0 rounded-full bg-[linear-gradient(135deg,#4a3f86,#1b1830)] ring-1 ring-white/15" />
        <span className="min-w-0 truncate text-[15px] font-semibold">
          {t('name')} <span className="px-1 text-white/40">|</span> {t('role')}
        </span>
      </figcaption>
      <blockquote className="t-small line-clamp-3 text-pretty leading-relaxed text-foreground/80">
        {t('quote')}
      </blockquote>
    </figure>
  );
}

/**
 * 六、用户证言 — dotted backdrop with a soft violet glow, a centred title with
 * the brand highlighted, and two rows of testimonial cards drifting in
 * opposite directions, fading at both edges. Quotes are placeholders.
 */
export function Testimonials() {
  const t = useTranslations('site.voices');
  const title = t('a.title');
  const [before, after] = title.split('Aholo 3D');
  const row = (reverse: boolean) => (
    <div
      className="voices-row flex w-max gap-5"
      style={reverse ? { animationDirection: 'reverse' } : undefined}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <VoiceCard key={i} t={t} />
      ))}
    </div>
  );
  return (
    <section
      aria-labelledby="voices-title"
      id="voices"
      className="relative isolate scroll-mt-20 overflow-hidden py-20 md:py-28"
    >
      {/* dotted grid + soft glows */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(circle,rgba(255,255,255,0.09)_1px,transparent_1.5px)_0_0/22px_22px] [mask-image:radial-gradient(70%_80%_at_50%_45%,#000_30%,transparent_85%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(35%_45%_at_15%_35%,rgba(110,98,163,0.28),transparent_70%),radial-gradient(30%_40%_at_85%_30%,rgba(139,92,246,0.14),transparent_70%)]"
      />
      <h2 id="voices-title" className="t-h2 container-x text-center">
        {after !== undefined ? (
          <>
            {before}
            <span className="bg-[linear-gradient(100deg,#e2daff,#a996ff)] bg-clip-text text-transparent [-webkit-text-stroke:0]">
              Aholo 3D
            </span>
            {after}
          </>
        ) : (
          title
        )}
      </h2>
      <div className="mt-12 grid gap-5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] md:mt-16">
        {row(false)}
        <div className="pl-[170px]">{row(true)}</div>
      </div>
    </section>
  );
}

export { Community } from './CommunityWall';

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
            <span className="brand-ring">
              <ButtonLink href={site.links.app} size="lg" className="brand-fill">
                <span className="brand-label">{c('startCreating')}</span>
                <ArrowRight aria-hidden />
              </ButtonLink>
            </span>
          </div>
          {/* Agent install guide: copy not decided yet */}
          <Slot className="mx-auto mt-8 h-24 max-w-2xl" />
        </div>
      </div>
    </section>
  );
}
