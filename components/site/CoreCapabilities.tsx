import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ITEMS = ['image', 'text', 'agent'] as const;

/** 核心能力: three quick entries (image / text / agent). Media slots are empty until assets are decided. */
export function CoreCapabilities() {
  const t = useTranslations('site.core');
  return (
    <section aria-labelledby="core-title" id="core" className="scroll-mt-20 py-24 md:py-32">
      <div className="container-x">
        <h2
          id="core-title"
          className="text-center font-display text-3xl font-semibold tracking-tight md:text-5xl"
        >
          {t('title')}
        </h2>
        <Tabs defaultValue="image" className="mt-10 items-center md:mt-14">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            {ITEMS.map((id) => (
              <TabsTrigger key={id} value={id} className="px-2">
                {t(`${id}.tab`)}
              </TabsTrigger>
            ))}
          </TabsList>
          {ITEMS.map((id) => (
            <TabsContent key={id} value={id} className="w-full">
              <div className="grid items-center gap-10 rounded-[var(--radius-lg)] border bg-card p-6 md:grid-cols-[1fr_1.2fr] md:p-10">
                <div>
                  <h3 className="text-2xl font-semibold md:text-3xl">{t(`${id}.title`)}</h3>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{t(`${id}.intro`)}</p>
                  <ol className="mt-6 grid gap-3">
                    {(t.raw(`${id}.points`) as string[]).map((p, i) => (
                      <li key={p} className="flex gap-3 text-sm leading-relaxed md:text-base">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft font-mono text-xs text-primary">
                          {i + 1}
                        </span>
                        {p}
                      </li>
                    ))}
                  </ol>
                </div>
                {/* media slot: asset not decided yet */}
                <div
                  aria-hidden
                  className="aspect-[16/10] rounded-2xl border border-dashed border-border-strong bg-background/40"
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
