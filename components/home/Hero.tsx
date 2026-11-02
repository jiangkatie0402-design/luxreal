import { useTranslations } from 'next-intl';
import { HeroInput } from './HeroInput';
import { HeroStage } from './HeroStage';

export function Hero() {
  const t = useTranslations('home.hero');
  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-hero pt-[var(--header-h)]"
    >
      <div className="container-x relative grid flex-1 items-center gap-6 py-8 lg:grid-cols-2 lg:py-12">
        <div className="relative z-10 max-w-xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs font-medium text-muted">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            {t('eyebrow')}
          </p>
          <h1
            id="hero-title"
            className="font-display text-display font-semibold leading-[1.02] tracking-tight"
          >
            <span className="block text-balance">{t('titleA')}</span>
            <span className="block text-balance text-accent">{t('titleB')}</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">{t('subtitle')}</p>
          <div className="mt-8">
            <HeroInput />
          </div>
          <p className="mt-4 text-xs text-subtle">{t('perks')}</p>
        </div>
        <div className="relative -mx-4 h-[52svh] min-h-[360px] md:mx-0 lg:absolute lg:inset-y-0 lg:left-1/2 lg:right-[calc(50%-50vw)] lg:mx-0 lg:h-auto">
          <HeroStage
            labels={{
              stageLabel: t('stageLabel'),
              generating: t('statusGenerating'),
              done: t('statusDone'),
              chipInput: t('chipInput'),
              chipFaces: t('chipFaces'),
              chipMaterial: t('chipMaterial'),
            }}
          />
        </div>
      </div>
      <a
        href="#how"
        className="mx-auto mb-6 hidden items-center gap-2 text-sm text-muted hover:text-text md:inline-flex"
      >
        {t('scroll')}
        <span aria-hidden className="animate-bounce">
          ↓
        </span>
      </a>
    </section>
  );
}
