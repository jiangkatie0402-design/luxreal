'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { mainNav, type NavMenu } from '@/config/nav';
import { href as pageHref } from '@/config/pages';
import { site } from '@/config/site';
import { Link, usePathname } from '@/i18n/navigation';
import { ButtonLink } from '@/components/ui/Button';
import { Logo } from './Logo';
import { MobileNav } from './MobileNav';

export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [open, setOpen] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      // Collapse while scrolling down, expand when scrolling up.
      setHidden(y > 240 && y > lastY.current + 4 ? true : y < lastY.current - 4 ? false : (h) => h);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close menus on navigation
  useEffect(() => setOpen(null), [pathname]);

  const show = (key: string) => {
    clearTimeout(closeTimer.current);
    setOpen(key);
  };
  const hide = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  };

  const solid = scrolled || !isHome || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-[var(--dur-base)] ease-[var(--ease-out)] ${
        hidden && !open ? '-translate-y-full' : ''
      } ${solid ? 'border-b border-line bg-bg/85 backdrop-blur-md' : 'border-b border-transparent'}`}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(null)}
    >
      <div className="container-x flex h-[var(--header-h)] items-center gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((entry) =>
              entry.type === 'link' ? (
                <li key={entry.key}>
                  <Link
                    href={entry.href}
                    className={`rounded-full px-3 py-2 text-sm hover:text-text ${
                      pathname.startsWith(entry.href) ? 'text-text' : 'text-muted'
                    }`}
                  >
                    {t(`nav.${entry.key}`)}
                  </Link>
                </li>
              ) : (
                <li key={entry.key} onMouseEnter={() => show(entry.key)} onMouseLeave={hide}>
                  <button
                    type="button"
                    aria-expanded={open === entry.key}
                    aria-controls={`mega-${entry.key}`}
                    onClick={() => setOpen(open === entry.key ? null : entry.key)}
                    className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm hover:text-text ${
                      open === entry.key ? 'text-text' : 'text-muted'
                    }`}
                  >
                    {t(`nav.${entry.key}`)}
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      aria-hidden
                      className={`transition-transform ${open === entry.key ? 'rotate-180' : ''}`}
                    >
                      <path
                        d="M2 3.5 5 6.5 8 3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                    </svg>
                  </button>
                  {open === entry.key && (
                    <MegaMenu menu={entry} onEnter={() => show(entry.key)} onLeave={hide} />
                  )}
                </li>
              ),
            )}
          </ul>
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <a href={site.links.login} className="px-3 py-2 text-sm text-muted hover:text-text">
            {t('common.login')}
          </a>
          <ButtonLink href={pageHref('developers')} variant="secondary" size="sm">
            {t('common.getApi')}
          </ButtonLink>
          <ButtonLink href={site.links.app} size="sm">
            {t('common.startCreating')}
          </ButtonLink>
        </div>
        <MobileNav />
      </div>
    </header>
  );
}

function MegaMenu({
  menu,
  onEnter,
  onLeave,
}: {
  menu: NavMenu;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const t = useTranslations();
  return (
    <div
      id={`mega-${menu.key}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="absolute inset-x-0 top-full border-b border-line bg-bg shadow-card"
    >
      <div className="container-x grid gap-8 py-8 lg:grid-cols-[240px_1fr]">
        <div>
          <p className="font-display text-xl font-semibold">{t(`nav.${menu.key}`)}</p>
          <p className="mt-2 text-sm text-muted">{t(`nav.menuTitle.${menu.key}`)}</p>
        </div>
        <ul className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
          {menu.items.map((id) => (
            <li key={id}>
              <Link href={pageHref(id)} className="block rounded-md p-3 hover:bg-surface-2">
                <span className="block text-sm font-medium">{t(`pages.${id}.title`)}</span>
                <span className="mt-1 block text-sm text-muted">{t(`pages.${id}.desc`)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
