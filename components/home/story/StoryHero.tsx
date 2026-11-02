import { useTranslations } from 'next-intl';
import { href } from '@/config/pages';
import { site } from '@/config/site';
import { ButtonLink } from '@/components/ui/Button';
import { StoryStage } from './StoryStage';

/** Homepage hero: the core idea, then the four-stage story right under it. */
export function StoryHero() {
  const t = useTranslations('home.story');
  const stages = ['capture', 'generate', 'print', 'game'] as const;
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden pb-16 pt-[calc(var(--header-h)+2.5rem)] [background:var(--hero-gradient)] md:pb-24 md:pt-[calc(var(--header-h)+4rem)]"
    >
      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs font-medium text-muted">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            {t('eyebrow')}
          </p>
          <h1
            id="hero-title"
            className="text-balance font-display text-display font-semibold leading-[1.05] tracking-tight"
          >
            {t('titleA')}
            <span className="inline-block text-accent">{t('titleB')}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg leading-relaxed text-muted">
            {t('subtitle')}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={site.links.app} size="lg">
              {t('primary')} →
            </ButtonLink>
            <ButtonLink href={href('developers')} variant="secondary" size="lg">
              {t('secondary')}
            </ButtonLink>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-[1100px]">
          <StoryStage />
        </div>
        {/* the story in text, for search engines and screen readers */}
        <ol className="sr-only">
          {stages.map((s) => (
            <li key={s}>
              {t(`stages.${s}.title`)}：{t(`stages.${s}.desc`)}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
