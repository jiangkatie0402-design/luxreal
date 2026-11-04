'use client';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

const ITEMS = ['image', 'text', 'agent'] as const;

/**
 * 核心能力: pill tabs as the three quick entries; each panel is a narrow text
 * column beside a wide media stage. The stage stays empty until assets are decided.
 */
export function CoreCapabilities() {
  const t = useTranslations('site.core');
  return (
    <section aria-labelledby="core-title" id="core" className="scroll-mt-20 py-24 md:py-32">
      <div className="container-x">
        <h2
          id="core-title"
          className="text-center font-display text-3xl font-semibold tracking-tight md:text-[2.5rem]"
        >
          {t('title')}
        </h2>

        <TabsPrimitive.Root
          defaultValue="image"
          className="mt-8 flex flex-col items-center md:mt-10"
        >
          <TabsPrimitive.List
            aria-label={t('title')}
            className="grid w-full max-w-[420px] grid-cols-3 gap-1 rounded-full border bg-card/70 p-1 backdrop-blur"
          >
            {ITEMS.map((id) => (
              <TabsPrimitive.Trigger
                key={id}
                value={id}
                className="h-10 whitespace-nowrap rounded-full px-3 text-sm font-medium text-muted-foreground outline-none transition-[color,background-color,box-shadow] duration-[var(--dur-fast)] hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_6px_20px_rgba(77,141,255,0.35)]"
              >
                {t(`${id}.tab`)}
              </TabsPrimitive.Trigger>
            ))}
          </TabsPrimitive.List>

          {ITEMS.map((id) => (
            <TabsPrimitive.Content
              key={id}
              value={id}
              className="core-panel mt-12 w-full outline-none md:mt-16"
            >
              <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
                <div className="max-w-md lg:max-w-none">
                  <h3 className="text-balance text-2xl font-semibold leading-tight tracking-tight md:text-[1.75rem]">
                    {t(`${id}.title`)}
                  </h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                    {t(`${id}.intro`)}
                  </p>
                  <ul className="mt-8 border-t">
                    {(t.raw(`${id}.points`) as string[]).map((p) => (
                      <li
                        key={p}
                        className="flex gap-3 border-b py-4 text-[15px] leading-relaxed text-foreground/90"
                      >
                        <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* media stage: asset not decided yet */}
                <div
                  aria-hidden
                  className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] border [background:radial-gradient(60%_60%_at_50%_45%,rgba(47,107,255,0.18),transparent_70%),#05080F]"
                >
                  <span className="absolute inset-x-[-30%] bottom-0 h-[55%] [background:linear-gradient(rgba(111,168,255,0.14)_1px,transparent_1px)_0_0/48px_48px,linear-gradient(90deg,rgba(111,168,255,0.14)_1px,transparent_1px)_0_0/48px_48px] [mask-image:radial-gradient(60%_90%_at_50%_100%,#000,transparent)] [transform:perspective(600px)_rotateX(62deg)] [transform-origin:bottom]" />
                </div>
              </div>
            </TabsPrimitive.Content>
          ))}
        </TabsPrimitive.Root>
      </div>
    </section>
  );
}
