'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { mainNav } from '@/config/nav';
import { href as pageHref } from '@/config/pages';
import { site } from '@/config/site';
import { Link, usePathname } from '@/i18n/navigation';
import { ButtonLink } from '@/components/ui/Button';
import { LocaleSwitcher } from './LocaleSwitcher';

export function MobileNav() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // eslint-disable-next-line react-hooks/set-state-in-effect -- close on navigation
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="ml-auto lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? t('common.close') : t('common.menu')}
        onClick={() => setOpen(!open)}
        className="grid size-10 place-items-center rounded-full hover:bg-surface-2"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
          {open ? (
            <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" />
          ) : (
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" />
          )}
        </svg>
      </button>
      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 bottom-0 top-[var(--header-h)] overflow-y-auto bg-bg"
        >
          <nav aria-label="Mobile" className="container-x py-4">
            <ul className="divide-y divide-line">
              {mainNav.map((entry) =>
                entry.type === 'link' ? (
                  <li key={entry.key}>
                    <Link href={entry.href} className="block py-4 text-lg font-medium">
                      {t(`nav.${entry.key}`)}
                    </Link>
                  </li>
                ) : (
                  <li key={entry.key}>
                    <details className="group">
                      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-lg font-medium [&::-webkit-details-marker]:hidden">
                        {t(`nav.${entry.key}`)}
                        <span
                          aria-hidden
                          className="text-muted transition-transform group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <ul className="pb-4">
                        {entry.items.map((id) => (
                          <li key={id}>
                            <Link href={pageHref(id)} className="block py-2 text-muted">
                              {t(`pages.${id}.title`)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ),
              )}
            </ul>
            <div className="mt-6 flex flex-col gap-3">
              <ButtonLink href={pageHref('developers')} variant="secondary">
                {t('common.getApi')}
              </ButtonLink>
              <a href={site.links.login} className="py-2 text-center text-muted">
                {t('common.login')}
              </a>
              <LocaleSwitcher className="self-center" />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

/** Persistent bottom CTA on small screens. */
export function MobileCTA() {
  const t = useTranslations('common');
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 p-3 backdrop-blur-md lg:hidden">
      <ButtonLink href={site.links.app} className="w-full">
        {t('startCreating')}
      </ButtonLink>
    </div>
  );
}
