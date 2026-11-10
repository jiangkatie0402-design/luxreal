'use client';
import {
  Bot,
  ChevronDown,
  Clapperboard,
  Gamepad2,
  Image as ImageIcon,
  LayoutGrid,
  Menu,
  MessagesSquare,
  Paintbrush,
  PenLine,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button, ButtonLink } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';

/**
 * Top navigation. Items without a decided destination stay inert (no href).
 * In-page targets point at the homepage sections.
 */
type Leaf = { id: string; href?: string; icon?: LucideIcon };
const NAV: { id: string; href?: string; items?: Leaf[] }[] = [
  {
    id: 'products',
    items: [
      { id: 'editor', href: site.links.app, icon: PenLine },
      { id: 'forAgents', href: '#agents', icon: Bot },
    ],
  },
  {
    id: 'features',
    items: [
      { id: 'imageTo3d', href: '#core', icon: ImageIcon },
      { id: 'retexture', icon: Paintbrush },
    ],
  },
  {
    id: 'solutions',
    items: [
      { id: 'game', href: '#scene-game-anchor', icon: Gamepad2 },
      { id: 'film', href: '#scene-film-anchor', icon: Clapperboard },
    ],
  },
  {
    id: 'community',
    items: [
      { id: 'gallery', href: '#community', icon: LayoutGrid },
      { id: 'discord', icon: MessagesSquare },
    ],
  },
  { id: 'pricing' },
];

function NavLeaf({
  item,
  className,
  label,
  withIcon,
}: {
  item: Leaf;
  className: string;
  label: string;
  withIcon?: boolean;
}) {
  const Icon = withIcon ? item.icon : undefined;
  const body = (
    <>
      {Icon && (
        <span className="grid size-8 flex-none place-items-center rounded-[9px] border border-white/[0.08] bg-white/[0.06] text-[#c4b5fd] transition-colors group-hover/item:border-transparent group-hover/item:bg-[linear-gradient(135deg,#a684ff,#6e62a3)] group-hover/item:text-white">
          <Icon className="size-[17px]" strokeWidth={1.6} aria-hidden />
        </span>
      )}
      <span>{label}</span>
    </>
  );
  return item.href ? (
    <a href={item.href} className={cn('group/item', className)}>
      {body}
    </a>
  ) : (
    <span className={cn(className, 'cursor-default opacity-50')}>{body}</span>
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
      <div className="flex h-full items-center gap-6 px-5 md:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] xl:px-10">
        <Logo className={cn('justify-self-start', !scrolled && 'text-[var(--hero-ink)]')} />
        <nav aria-label={t('main')} className="hidden lg:block">
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
                    <ul className="min-w-52 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(30,26,44,0.96),rgba(16,14,24,0.96))] p-1.5 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                      {n.items.map((it) => (
                        <li key={it.id}>
                          <NavLeaf
                            item={it}
                            label={t(it.id)}
                            withIcon
                            className="flex h-12 items-center gap-3 whitespace-nowrap rounded-xl px-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/[0.06] hover:text-white"
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
        <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:justify-self-end">
          <a
            href={site.links.login}
            className={cn(
              'hidden whitespace-nowrap rounded-btn px-3 text-sm transition-colors lg:inline-flex',
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
