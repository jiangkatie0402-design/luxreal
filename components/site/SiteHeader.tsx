'use client';
import { ChevronDown, Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button, ButtonLink } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';

/** Nav labels as on the signed-off cover. Destinations/menus are not decided yet, so items are inert. */
const NAV = [
  { id: 'create', menu: true },
  { id: 'developers', menu: true },
  { id: 'useCases', menu: true },
  { id: 'gallery', menu: false },
  { id: 'technology', menu: false },
  { id: 'pricing', menu: false },
  { id: 'resources', menu: true },
] as const;

export function SiteHeader() {
  const t = useTranslations('site.nav');
  const c = useTranslations('common');
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 h-[var(--header-h)] border-b border-transparent transition-[background-color,border-color] duration-[var(--dur-base)]',
        scrolled && 'border-border bg-background/75 backdrop-blur-xl',
      )}
    >
      <div className="flex h-full items-center gap-6 px-5 md:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] xl:px-10">
        <Logo className={cn('justify-self-start', !scrolled && 'text-[var(--hero-ink)]')} />
        <nav aria-label={t('main')} className="hidden lg:block">
          <ul className="flex items-center lg:gap-0 xl:gap-1">
            {NAV.map((n) => (
              <li key={n.id}>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-sm xl:px-3',
                    scrolled ? 'text-muted-foreground' : 'text-[var(--hero-ink-muted)]',
                  )}
                >
                  {t(n.id)}
                  {n.menu && <ChevronDown className="size-3.5 opacity-70" aria-hidden />}
                </span>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:justify-self-end">
          <a
            href={site.links.login}
            className={cn(
              'hidden whitespace-nowrap px-3 text-sm transition-colors lg:inline-flex',
              scrolled
                ? 'text-muted-foreground hover:text-foreground'
                : 'text-[var(--hero-ink-muted)] hover:text-[var(--hero-ink)]',
            )}
          >
            {c('login')}
          </a>
          <ButtonLink
            href={site.links.console}
            variant="outline"
            size="sm"
            className={cn(
              'hidden lg:inline-flex',
              !scrolled &&
                'border-[var(--chip-border)] text-[var(--hero-ink)] hover:bg-[var(--chip-bg)] hover:text-[var(--hero-ink)]',
            )}
          >
            {c('getApi')}
          </ButtonLink>
          <ButtonLink
            href={site.links.app}
            size="sm"
            className={cn(
              'hidden lg:inline-flex',
              !scrolled &&
                'bg-[var(--hero-cta-bg)] text-[var(--hero-cta-ink)] hover:bg-[var(--hero-cta-bg)] hover:brightness-95',
            )}
          >
            {c('startCreating')}
          </ButtonLink>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('menu')}
                className={cn('lg:hidden', !scrolled && 'text-[var(--hero-ink)]')}
              >
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent
              closeLabel={t('close')}
              aria-describedby={undefined}
              className="pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            >
              <SheetTitle>
                <span className="sr-only">{t('menu')}</span>
                <Logo />
              </SheetTitle>
              <ul className="mt-4 grid">
                {NAV.map((n) => (
                  <li key={n.id} className="flex h-12 items-center border-b text-base">
                    {t(n.id)}
                  </li>
                ))}
              </ul>
              <div className="mt-auto grid gap-3">
                <ButtonLink href={site.links.login} variant="ghost" className="w-full">
                  {c('login')}
                </ButtonLink>
                <ButtonLink href={site.links.console} variant="outline" className="w-full">
                  {c('getApi')}
                </ButtonLink>
                <ButtonLink href={site.links.app} className="w-full">
                  {c('startCreating')}
                </ButtonLink>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
