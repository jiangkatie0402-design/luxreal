'use client';
import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const LABEL: Record<Locale, string> = { zh: '中文', en: 'English' };

/** Globe button with a small dropdown of languages. */
export function LangMenu({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className={cn('group relative', className)}>
      <button
        type="button"
        aria-haspopup="true"
        aria-label={LABEL[locale]}
        className="grid size-8 place-items-center rounded-[9px] text-white/80 transition-colors group-focus-within:bg-white/[0.08] group-focus-within:text-white group-hover:bg-white/[0.08] group-hover:text-white"
      >
        <Globe className="size-4" strokeWidth={1.7} aria-hidden />
      </button>
      <div className="invisible absolute right-0 top-full z-50 -translate-y-1 pt-2.5 opacity-0 transition-[opacity,transform,visibility] duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <ul className="min-w-36 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(30,26,44,0.96),rgba(16,14,24,0.96))] p-1.5 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          {routing.locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                aria-current={l === locale ? 'true' : undefined}
                onClick={() => router.replace(pathname, { locale: l })}
                className={cn(
                  'flex h-10 w-full items-center justify-between gap-4 rounded-xl px-3.5 text-sm transition-colors hover:bg-white/[0.06]',
                  l === locale ? 'text-white' : 'text-white/70',
                )}
              >
                {LABEL[l]}
                {l === locale && <span className="size-1.5 rounded-full bg-[#b493ed]" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
