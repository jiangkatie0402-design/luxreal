import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/ui/Section';

const ITEMS = [
  'materials',
  'representations',
  'topology',
  'speed',
  'animation',
  'integration',
] as const;
const STATS = ['time', 'texture', 'formats', 'reps'] as const;

const ICONS: Record<(typeof ITEMS)[number], React.ReactNode> = {
  materials: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M7 9.5a6 6 0 0 1 5-3" />
    </>
  ),
  representations: (
    <>
      <path d="M12 3 20 7.5v9L12 21 4 16.5v-9Z" />
      <path d="M4 7.5 12 12l8-4.5M12 12v9" />
    </>
  ),
  topology: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M4 12h16M12 4v16M4 8h16M8 4v16" opacity=".5" />
    </>
  ),
  speed: (
    <>
      <path d="M13 3 5 13h6l-1 8 8-10h-6Z" />
    </>
  ),
  animation: (
    <>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v6l-4 7M12 13l4 7M7 10h10" />
    </>
  ),
  integration: (
    <>
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
    </>
  ),
};

export function Advantages() {
  const t = useTranslations('home.advantages');
  return (
    <section aria-labelledby="adv-title" className="section-y bg-surface">
      <div className="container-x">
        <SectionHeading
          id="adv-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
        />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((k) => (
            <li key={k} className="bg-surface p-7">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {ICONS[k]}
              </svg>
              <h3 className="mt-5 text-lg font-semibold">{t(`items.${k}.title`)}</h3>
              <p className="mt-2 leading-relaxed text-muted">{t(`items.${k}.desc`)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((k) => (
            <div key={k} className="border-l-2 border-accent pl-5">
              <dt className="text-sm text-muted">{t(`stats.${k}.label`)}</dt>
              <dd className="order-first font-display text-3xl font-semibold tracking-tight">
                {t(`stats.${k}.value`)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
