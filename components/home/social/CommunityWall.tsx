import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { communityWorks } from '@/config/community';
import { Link } from '@/i18n/navigation';

/** Two full-bleed rows of community works drifting in opposite directions. */
export function CommunityWall() {
  const t = useTranslations('home.community2');
  const half = Math.ceil(communityWorks.length / 2);
  const rows = [communityWorks.slice(0, half), communityWorks.slice(half)];
  return (
    <section aria-labelledby="wall-title" className="overflow-hidden bg-[#03060d] py-20 md:py-28">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-4 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <p className="mb-3 text-sm font-medium tracking-wide text-accent">{t('eyebrow')}</p>
          <h2
            id="wall-title"
            className="text-balance font-display text-3xl font-semibold tracking-tight text-white md:text-[2.75rem]"
          >
            {t('title')}
          </h2>
          <p className="mt-3 max-w-xl text-white/60">{t('subtitle')}</p>
        </div>
        <Link
          href="/gallery"
          className="inline-flex h-11 w-fit items-center rounded-full border border-white/20 px-6 text-sm text-white hover:bg-white/10"
        >
          {t('viewAll')} →
        </Link>
      </div>
      <div className="mt-12 flex flex-col gap-4">
        {rows.map((row, r) => (
          <div key={r} className="marquee overflow-hidden">
            <ul className={`marquee-track flex w-max gap-4 ${r === 1 ? 'marquee-reverse' : ''}`}>
              {[...row, ...row].map((w, i) => (
                <li
                  key={`${w.id}-${i}`}
                  aria-hidden={i >= row.length || undefined}
                  className="w-[220px] shrink-0 md:w-[280px]"
                >
                  <Link
                    href="/gallery"
                    tabIndex={i >= row.length ? -1 : undefined}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-[20px] border border-white/10 bg-[radial-gradient(70%_60%_at_50%_55%,#14223f,#070c18)]"
                  >
                    <Image
                      src={w.src}
                      alt={i >= row.length ? '' : t(`works.${w.id}`)}
                      fill
                      sizes="280px"
                      className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] text-white/75 backdrop-blur-md">
                      {t(`tags.${w.tag}`)}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/85 to-transparent p-4 pt-10 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      <p className="text-sm font-medium">{t(`works.${w.id}`)}</p>
                      <p className="mt-0.5 flex justify-between text-xs text-white/60">
                        <span>@{w.author}</span>
                        <span>♥ {w.likes.toLocaleString()}</span>
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
