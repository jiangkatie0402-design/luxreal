'use client';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const labels: Record<string, string> = { zh: '中文', en: 'EN' };

export function LocaleSwitcher({ className = '' }: { className?: string }) {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  return (
    <div
      role="group"
      aria-label={t('language')}
      className={`inline-flex rounded-full border border-line p-0.5 text-xs ${className}`}
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={l === locale}
          onClick={() =>
            // @ts-expect-error -- params match the current pathname
            router.replace({ pathname, params }, { locale: l, scroll: false })
          }
          className={`rounded-full px-2.5 py-1 ${l === locale ? 'bg-surface-2 text-text' : 'text-subtle hover:text-text'}`}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}
