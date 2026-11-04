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
      <div className="container-x flex h-full items-center gap-6">
        <Logo />
        <nav aria-label={t('main')} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.id}>
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-muted-foreground">
                  {t(n.id)}
                  {n.menu && <ChevronDown className="size-3.5 opacity-70" aria-hidden />}
                </span>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a
            href={site.links.login}
            className="hidden px-3 text-sm text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
          >
            {c('login')}
          </a>
          <ButtonLink
            href={site.links.console}
            variant="outline"
            size="sm"
            className="hidden lg:inline-flex"
          >
            {c('getApi')}
          </ButtonLink>
          <ButtonLink href={site.links.app} size="sm" className="hidden lg:inline-flex">
            {c('startCreating')}
          </ButtonLink>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('menu')} className="lg:hidden">
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
