import { Caveat, Ma_Shan_Zheng } from 'next/font/google';
import { useTranslations } from 'next-intl';
import { CoverStage } from './CoverStage';
import { CoverUpload } from './CoverUpload';

const brushZh = Ma_Shan_Zheng({ weight: '400', preload: false, display: 'swap' });
const brushEn = Caveat({ weight: '700', subsets: ['latin'], display: 'swap' });

/** Homepage cover: brand + "create your world" over the story slideshow, upload box below. */
export function CoverHero({ locale }: { locale: string }) {
  const t = useTranslations('home.cover');
  const brush = locale === 'zh' ? brushZh : brushEn;
  const title = (
    <div className="text-white">
      <p className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight lg:text-2xl">
        <svg width="30" height="30" viewBox="0 0 26 26" aria-hidden>
          <path
            d="M13 2 23 7.5v11L13 24 3 18.5v-11Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M3 13.5 13 19l10-5.5"
            fill="none"
            stroke="var(--slice-color)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d="M13 13v11" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        Lux3D
      </p>
      <h1 id="hero-title" className="mt-6 lg:mt-8">
        <span className="block font-display text-[clamp(2.75rem,6.2vw,6.25rem)] font-bold leading-[1.02] tracking-tight">
          {t('titleA')}
        </span>
        <span
          className={`${brush.className} -mt-1 block whitespace-nowrap text-[clamp(3.25rem,7.4vw,7.75rem)] leading-[1.05] text-[#8fb8ff] [text-shadow:0_0_18px_rgba(77,141,255,0.85),0_0_48px_rgba(77,141,255,0.55)] lg:-ml-1 lg:-rotate-3`}
        >
          {t('titleB')}
        </span>
      </h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-white/70 lg:text-lg">
        {t('subtitle')}
      </p>
    </div>
  );
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-[#03060d] pb-20 pt-[calc(var(--header-h)+1.25rem)] md:pb-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[80%] bg-[radial-gradient(60%_60%_at_60%_30%,rgba(56,116,255,0.22),transparent_70%)]"
      />
      <div className="relative mx-auto w-full max-w-[1480px] px-4 md:px-8">
        <CoverStage title={title} />
        <div className="relative z-10 mx-auto -mt-6 max-w-[860px] lg:-mt-20">
          <CoverUpload />
        </div>
      </div>
    </section>
  );
}
