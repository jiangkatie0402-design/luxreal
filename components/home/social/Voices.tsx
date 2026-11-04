import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { testimonials } from '@/config/community';

/** User testimonials, each paired with the model that user made. */
export function Voices() {
  const t = useTranslations('home.voices');
  return (
    <section aria-labelledby="voices-title" className="bg-[#03060d] py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1320px] px-4 md:px-8">
        <div className="text-center">
          <p className="mb-3 text-sm font-medium tracking-wide text-primary">{t('eyebrow')}</p>
          <h2
            id="voices-title"
            className="text-balance font-display text-3xl font-semibold tracking-tight text-white md:text-[2.75rem]"
          >
            {t('title')}
          </h2>
        </div>
        <ul className="mt-12 columns-1 gap-4 md:columns-2 lg:columns-3">
          {testimonials.map((v, i) => (
            <li key={v.id} className="mb-4 break-inside-avoid">
              <figure className="overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] text-white">
                {i % 2 === 0 && (
                  <div className="relative h-44 bg-[radial-gradient(60%_70%_at_50%_60%,rgba(77,141,255,0.22),transparent_70%)]">
                    <Image src={v.work} alt="" fill sizes="400px" className="object-contain p-4" />
                    <span className="absolute left-4 top-4 rounded-full bg-black/50 px-2.5 py-1 text-[11px] text-white/75 backdrop-blur-md">
                      {t(`fields.${v.field}`)}
                    </span>
                  </div>
                )}
                <div className="p-6">
                  <blockquote className="text-[17px] leading-relaxed text-white/90">
                    “{t(`items.${v.id}.quote`)}”
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    {i % 2 === 1 ? (
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-white/10">
                        <Image
                          src={v.work}
                          alt=""
                          fill
                          sizes="44px"
                          className="object-contain p-1"
                        />
                      </span>
                    ) : (
                      <span
                        aria-hidden
                        className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/20 font-semibold text-primary"
                      >
                        {t(`items.${v.id}.name`).slice(0, 1)}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{t(`items.${v.id}.name`)}</span>
                      <span className="block text-sm text-white/50">{t(`items.${v.id}.role`)}</span>
                    </span>
                  </figcaption>
                </div>
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-xs text-white/35">{t('note')}</p>
      </div>
    </section>
  );
}
