'use client';
import { ChevronDown, Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button, ButtonLink } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';
import { LangMenu } from './LangMenu';
import { Logo } from './Logo';

/**
 * Top navigation. Items without a decided destination stay inert (no href).
 * In-page targets point at the homepage sections.
 */
type Leaf = { id: string; href?: string };
const NAV: { id: string; href?: string; items?: Leaf[] }[] = [
  {
    id: 'products',
    items: [
      { id: 'editor', href: '/editor' },
      { id: 'forAgents', href: '/for-agent' },
    ],
  },
  {
    id: 'features',
    items: [
      { id: 'imageTo3d', href: '/features/image-to-3d' },
      { id: 'retexture', href: '/features/retexture' },
      { id: 'animate', href: '/features/animate' },
    ],
  },
  {
    id: 'solutions',
    items: [
      { id: 'game', href: '/solutions/game' },
      { id: 'film', href: '/solutions/film' },
      { id: 'printing', href: '/solutions/printing' },
      { id: 'architecture', href: '/solutions/architecture' },
    ],
  },
  {
    id: 'community',
    items: [
      { id: 'gallery', href: '/workspace/gallery' },
      // invite link or QR code pop-up (one or the other) — not decided yet
      { id: 'discord' },
    ],
  },
  { id: 'pricing', href: '/pricing' },
];

function NavLeaf({ item, className, label }: { item: Leaf; className: string; label: string }) {
  return item.href ? (
    <a href={item.href} className={className}>
      {label}
    </a>
  ) : (
    <span className={cn(className, 'cursor-default opacity-50')}>{label}</span>
  );
}

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
      <div className="flex h-full items-center gap-6 px-5 md:px-8 xl:px-10">
        <Logo className={cn(!scrolled && 'text-[var(--hero-ink)]')} />
        <nav aria-label={t('main')} className="mr-auto hidden lg:ml-2 lg:block">
          <ul className="flex items-center lg:gap-0 xl:gap-1">
            {NAV.map((n) => (
              <li key={n.id} className="group relative">
                {n.items ? (
                  <button
                    type="button"
                    aria-haspopup="true"
                    className={cn(
                      'inline-flex items-center gap-1 whitespace-nowrap rounded-[10px] px-3 py-2 text-sm font-medium text-white/90 transition-colors group-focus-within:bg-white/[0.08] group-focus-within:text-white group-hover:bg-white/[0.08] group-hover:text-white',
                    )}
                  >
                    {t(n.id)}
                    <ChevronDown
                      className="size-3.5 opacity-70 transition-transform group-focus-within:rotate-180 group-hover:rotate-180"
                      aria-hidden
                    />
                  </button>
                ) : (
                  <NavLeaf
                    item={n}
                    label={t(n.id)}
                    className={cn(
                      'inline-flex items-center whitespace-nowrap rounded-[10px] px-3 py-2 text-sm font-medium text-white/90 opacity-100',
                    )}
                  />
                )}
                {n.items && (
                  <div className="invisible absolute left-0 top-full z-50 -translate-y-1 pt-2.5 opacity-0 transition-[opacity,transform,visibility] duration-200 ease-[cubic-bezier(.22,1,.36,1)] group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <ul className="min-w-[184px] rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(30,26,44,0.96),rgba(16,14,24,0.96))] p-1.5 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                      {n.items.map((it) => (
                        <li key={it.id}>
                          <NavLeaf
                            item={it}
                            label={t(it.id)}
                            className="flex h-11 items-center whitespace-nowrap rounded-xl px-3.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/[0.06] hover:text-white"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          <LangMenu className="hidden lg:block" />
          <a
            href={site.links.login}
            className="hidden h-9 items-center whitespace-nowrap rounded-[10px] px-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white lg:inline-flex"
          >
            {c('login')}
          </a>
          <ButtonLink
            href="/for-agent"
            variant="outline"
            size="sm"
            className="ml-1 hidden h-9 rounded-[10px] border-white/20 bg-white/[0.04] px-4 text-white hover:bg-white/[0.1] hover:text-white lg:inline-flex"
          >
            {c('connectAgent')}
          </ButtonLink>
          <ButtonLink
            href={site.links.app}
            size="sm"
            className="hidden h-9 rounded-[10px] bg-[linear-gradient(90deg,#a684ff,#fff)] px-4 font-semibold text-[#171717] hover:brightness-105 lg:inline-flex"
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
                  <li key={n.id} className="border-b py-3">
                    {n.items ? (
                      <>
                        <p className="text-base">{t(n.id)}</p>
                        <ul className="mt-1 grid">
                          {n.items.map((it) => (
                            <li key={it.id}>
                              <NavLeaf
                                item={it}
                                label={t(it.id)}
                                className="flex h-10 items-center text-sm text-muted-foreground"
                              />
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <NavLeaf
                        item={n}
                        label={t(n.id)}
                        className="flex h-6 items-center text-base"
                      />
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-auto grid gap-3">
                <ButtonLink href={site.links.login} variant="ghost" className="w-full">
                  {c('login')}
                </ButtonLink>
                <ButtonLink href="/for-agent" variant="outline" className="w-full">
                  {c('connectAgent')}
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
