'use client';
import { useTranslations } from 'next-intl';
import { useCallback, useId, useState } from 'react';
import { site } from '@/config/site';
import { ButtonLink } from '@/components/ui/Button';
import { CoreDemo, useDemoClock, type CoreMode } from './CoreDemo';

const MODES: CoreMode[] = ['image', 'text'];

/** Core capabilities: image-to-3D and text-to-3D, each shown as a live workspace demo. */
export function CoreCapabilities() {
  const t = useTranslations('home.core');
  const [mode, setMode] = useState<CoreMode>('image');
  const next = useCallback(() => setMode((m) => (m === 'image' ? 'text' : 'image')), []);
  const { t: time, ref: panelRef, restart } = useDemoClock(next);
  const id = useId();
  const pick = (m: CoreMode) => {
    setMode(m);
    restart();
  };

  return (
    <section aria-labelledby="core-title" className="relative bg-[#03060d] py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1480px] px-4 md:px-8">
        <div className="text-center">
          <p className="mb-3 text-sm font-medium tracking-wide text-accent">{t('eyebrow')}</p>
          <h2
            id="core-title"
            className="text-balance font-display text-3xl font-semibold tracking-tight text-white md:text-[2.75rem]"
          >
            {t('title')}
          </h2>
        </div>
        <div
          role="tablist"
          aria-label={t('title')}
          className="mx-auto mt-8 flex w-fit rounded-full border border-white/10 bg-white/[0.04] p-1"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
              const m = mode === 'image' ? 'text' : 'image';
              pick(m);
              document.getElementById(`${id}-${m}`)?.focus();
            }
          }}
        >
          {MODES.map((m) => (
            <button
              key={m}
              id={`${id}-${m}`}
              role="tab"
              type="button"
              aria-selected={mode === m}
              aria-controls={`${id}-panel`}
              tabIndex={mode === m ? 0 : -1}
              onClick={() => pick(m)}
              className={`rounded-full px-5 py-2 text-sm transition-colors md:px-6 ${mode === m ? 'bg-white/10 font-medium text-white' : 'text-white/55 hover:text-white'}`}
            >
              {t(`tabs.${m}.tab`)}
            </button>
          ))}
        </div>

        <div
          ref={panelRef}
          id={`${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-${mode}`}
          className="mt-10 grid overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#0a1222,#060b16)] lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]"
        >
          <div className="flex flex-col gap-5 p-8 text-white md:p-10 [background:radial-gradient(120%_70%_at_0%_100%,rgba(77,141,255,0.16),transparent)]">
            <h3 className="text-balance font-display text-2xl font-semibold leading-tight tracking-tight md:text-[2.25rem]">
              {t(`tabs.${mode}.title`)}
            </h3>
            <p className="text-base leading-relaxed text-white/65 md:text-lg">
              {t(`tabs.${mode}.desc`)}
            </p>
            <ul className="space-y-2.5 text-sm text-white/70">
              {(t.raw(`tabs.${mode}.points`) as string[]).map((p) => (
                <li key={p} className="flex gap-2.5">
                  <span aria-hidden className="text-accent">
                    ✓
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <ButtonLink
              href={site.links.app}
              size="lg"
              className="mt-auto w-full sm:w-fit lg:w-full"
            >
              {t('cta')} →
            </ButtonLink>
          </div>
          <div className="min-w-0 p-3 md:p-6 lg:pl-0">
            <CoreDemo mode={mode} t={time} />
          </div>
        </div>
      </div>
    </section>
  );
}
