'use client';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const ITEMS = ['image', 'text', 'agent'] as const;
type Item = (typeof ITEMS)[number];

/**
 * 核心能力: three quick entries as a vertical list on the left (the active one
 * expands with its intro and points) and one shared media stage on the right.
 * The stage is empty until assets are decided.
 */
export function CoreCapabilities() {
  const t = useTranslations('site.core');
  const [active, setActive] = useState<Item>('image');

  return (
    <section aria-labelledby="core-title" id="core" className="scroll-mt-20 py-24 md:py-32">
      <div className="container-x">
        <h2
          id="core-title"
          className="text-center font-display text-3xl font-semibold tracking-tight md:text-4xl"
        >
          {t('title')}
        </h2>

        <TabsPrimitive.Root
          value={active}
          onValueChange={(v) => setActive(v as Item)}
          orientation="vertical"
          className="mt-12 grid gap-8 md:mt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12"
        >
          <TabsPrimitive.List aria-label={t('title')} className="flex flex-col">
            {ITEMS.map((id, i) => {
              const on = active === id;
              return (
                <div
                  key={id}
                  className={cn(
                    'relative border-l pl-6 transition-colors duration-[var(--dur-base)]',
                    on ? 'border-primary' : 'border-border hover:border-border-strong',
                  )}
                >
                  <TabsPrimitive.Trigger
                    value={id}
                    className="group flex w-full items-baseline gap-4 rounded-md py-5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <span
                      className={cn(
                        'font-mono text-xs tabular-nums transition-colors',
                        on ? 'text-primary' : 'text-subtle',
                      )}
                    >
                      0{i + 1}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          'block text-xs font-medium tracking-wide transition-colors',
                          on ? 'text-primary' : 'text-muted-foreground',
                        )}
                      >
                        {t(`${id}.tab`)}
                      </span>
                      <span
                        className={cn(
                          'mt-1.5 block text-lg font-semibold leading-snug transition-colors md:text-xl',
                          on
                            ? 'text-foreground'
                            : 'text-muted-foreground group-hover:text-foreground',
                        )}
                      >
                        {t(`${id}.title`)}
                      </span>
                    </span>
                  </TabsPrimitive.Trigger>

                  {/* expanded detail for the active entry */}
                  <div
                    className={cn(
                      'grid transition-[grid-template-rows,opacity] duration-[var(--dur-base)] ease-[var(--ease-out)]',
                      on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="pb-6 pl-8">
                        <p className="text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                          {t(`${id}.intro`)}
                        </p>
                        <ul className="mt-4 grid gap-2.5">
                          {(t.raw(`${id}.points`) as string[]).map((p) => (
                            <li
                              key={p}
                              className="flex gap-2.5 text-sm leading-relaxed text-foreground/90"
                            >
                              <Check className="mt-1 size-3.5 shrink-0 text-primary" aria-hidden />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsPrimitive.List>

          {/* shared media stage (asset not decided yet) */}
          {ITEMS.map((id) => (
            <TabsPrimitive.Content
              key={id}
              value={id}
              forceMount
              hidden={active !== id}
              className="outline-none lg:sticky lg:top-24 lg:self-start"
            >
              <div
                aria-hidden
                className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] border [background:radial-gradient(60%_60%_at_50%_45%,rgba(47,107,255,0.16),transparent_70%),#05080F]"
              >
                <span className="absolute inset-x-[-30%] bottom-0 h-[55%] [background:linear-gradient(rgba(111,168,255,0.14)_1px,transparent_1px)_0_0/48px_48px,linear-gradient(90deg,rgba(111,168,255,0.14)_1px,transparent_1px)_0_0/48px_48px] [mask-image:radial-gradient(60%_90%_at_50%_100%,#000,transparent)] [transform:perspective(600px)_rotateX(62deg)] [transform-origin:bottom]" />
                <span className="absolute left-4 top-4 font-mono text-[11px] text-subtle">
                  {t(`${id}.tab`)}
                </span>
              </div>
            </TabsPrimitive.Content>
          ))}
        </TabsPrimitive.Root>
      </div>
    </section>
  );
}
