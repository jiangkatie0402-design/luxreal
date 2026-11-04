import { useTranslations } from 'next-intl';
import { footerColumns } from '@/config/nav';
import { href as pageHref } from '@/config/pages';
import { site } from '@/config/site';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './LocaleSwitcher';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

export function Footer() {
  const t = useTranslations();
  return (
    <footer className="border-t border-border bg-card pb-24 lg:pb-0">
      <div className="container-x grid gap-10 py-14 lg:grid-cols-[1.2fr_repeat(6,1fr)]">
        <div className="lg:pr-6">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">{t('footer.tagline')}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6 lg:grid-cols-6">
          {footerColumns.map((col) => (
            <div key={col.key}>
              <p className="text-sm font-medium">{t(`footer.columns.${col.key}`)}</p>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((it) => (
                  <li key={it.id ?? it.href}>
                    <Link
                      href={it.id ? pageHref(it.id) : it.href!}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {it.id ? t(`pages.${it.id}.title`) : t(`footer.links.${it.label}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="container-x flex flex-col gap-4 border-t border-border py-6 text-sm text-subtle md:flex-row md:items-center md:justify-between">
        <p>
          {t('footer.rights', { year: new Date().getFullYear() })}
          {site.icp && <span className="ml-3">{site.icp}</span>}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <ul className="flex gap-4">
            {site.social.map((s) => (
              <li key={s.id}>
                <a
                  href={s.href}
                  className="hover:text-foreground"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t(`footer.social.${s.id}`)}
                </a>
              </li>
            ))}
          </ul>
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
