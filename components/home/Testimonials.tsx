import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/ui/Section';

const KEYS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;
const HUES = ['var(--color-accent-soft)', 'var(--color-surface-2)'];

export function Testimonials() {
  const t = useTranslations('home.testimonials');
  return (
    <section aria-labelledby="tm-title" className="section-y">
      <div className="container-x">
        <SectionHeading id="tm-title" eyebrow={t('eyebrow')} title={t('title')} />
        <ul className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {KEYS.map((k, i) => {
            const name = t(`items.${k}.name`);
            return (
              <li key={k} className="mb-5 break-inside-avoid">
                <figure className="rounded-lg border border-line bg-surface p-6">
                  <blockquote className="text-lg leading-relaxed">
                    “{t(`items.${k}.quote`)}”
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span
                      aria-hidden
                      className="grid size-10 place-items-center rounded-full text-sm font-semibold"
                      style={{ background: HUES[i % 2] }}
                    >
                      {name.slice(0, 1)}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{name}</span>
                      <span className="block text-sm text-muted">{t(`items.${k}.role`)}</span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-subtle">{t('note')}</p>
      </div>
    </section>
  );
}
