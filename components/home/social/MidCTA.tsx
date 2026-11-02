import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { href } from '@/config/pages';
import { site } from '@/config/site';

const FLOAT = [
  { src: '/community/cat.webp', cls: 'left-[2%] top-[14%] w-[16%] -rotate-6' },
  { src: '/community/chest.webp', cls: 'left-[10%] bottom-[6%] w-[15%] rotate-3' },
  { src: '/community/sneaker.webp', cls: 'right-[3%] top-[10%] w-[17%] rotate-6' },
  { src: '/core/robot-model-cut.webp', cls: 'right-[12%] bottom-[4%] w-[12%] -rotate-3' },
];

/** The big call to action between testimonials and community. */
export function MidCTA() {
  const t = useTranslations('home.midCta');
  return (
    <section aria-labelledby="midcta-title" className="bg-[#03060d] px-4 md:px-8">
      <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[32px] border border-white/10 px-6 py-20 text-center text-white [background:radial-gradient(80%_120%_at_50%_120%,#2f6bff,transparent_60%),radial-gradient(60%_80%_at_50%_-20%,rgba(94,168,255,0.35),transparent_60%),#060c1c] md:py-28">
        {FLOAT.map((f) => (
          <div
            key={f.src}
            aria-hidden
            className={`absolute hidden aspect-square opacity-90 md:block ${f.cls}`}
          >
            <Image
              src={f.src}
              alt=""
              fill
              sizes="240px"
              className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
            />
          </div>
        ))}
        <div className="relative mx-auto max-w-2xl">
          <h2
            id="midcta-title"
            className="text-balance font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl"
          >
            {t('title')}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-white/75">
            {t('subtitle')}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={site.links.app}
              className="inline-flex h-13 items-center gap-2 rounded-full bg-white px-8 text-base font-medium text-[#07112a] transition-transform hover:scale-[1.03]"
            >
              {t('primary')} →
            </a>
            <a
              href={href('developers')}
              className="inline-flex h-13 items-center rounded-full border border-white/30 px-8 text-base text-white transition-colors hover:bg-white/10"
            >
              {t('secondary')}
            </a>
          </div>
          <p className="mt-5 text-sm text-white/55">{t('note')}</p>
        </div>
      </div>
    </section>
  );
}
