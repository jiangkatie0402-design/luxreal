'use client';
import { useTranslations } from 'next-intl';
import { useId, useState, type ComponentType, type CSSProperties } from 'react';
import { href } from '@/config/pages';
import { site } from '@/config/site';
import { Link } from '@/i18n/navigation';
import { FilmScene } from './FilmScene';
import { GameScene } from './GameScene';
import { LowPoly } from './LowPoly';
import { PbrChannels } from './PbrChannels';
import { PrintScene } from './PrintScene';
import { PrintSplit } from './PrintSplit';
import { Relight } from './Relight';
import { ShotBoard } from './ShotBoard';

interface Field {
  id: 'print' | 'game' | 'film';
  color: string;
  cards: { id: 'a' | 'b' | 'c'; Visual: ComponentType; interactive?: boolean }[];
  tools: string[];
  formats: string[];
}

const FIELDS: Field[] = [
  {
    id: 'print',
    color: 'var(--scene-printing)',
    cards: [
      { id: 'a', Visual: PrintScene, interactive: true },
      { id: 'b', Visual: PrintSplit },
    ],
    tools: [
      'Bambu Studio',
      'OrcaSlicer',
      'PrusaSlicer',
      'UltiMaker Cura',
      'Creality Print',
      'Lychee Slicer',
    ],
    formats: ['STL', '3MF', 'OBJ'],
  },
  {
    id: 'game',
    color: 'var(--scene-games)',
    cards: [
      { id: 'a', Visual: PbrChannels },
      { id: 'b', Visual: GameScene, interactive: true },
      { id: 'c', Visual: LowPoly, interactive: true },
    ],
    tools: ['Unity', 'Unreal Engine', 'Godot', 'Blender', 'Maya'],
    formats: ['FBX', 'GLB', 'OBJ', 'USDZ'],
  },
  {
    id: 'film',
    color: 'var(--scene-film)',
    cards: [
      { id: 'a', Visual: FilmScene, interactive: true },
      { id: 'b', Visual: Relight },
      { id: 'c', Visual: ShotBoard },
    ],
    tools: ['Blender', 'Unreal Engine', 'Houdini', 'Cinema 4D', 'Nuke'],
    formats: ['USD', 'FBX', 'GLB', 'PLY (3DGS)'],
  },
];

const OTHER = [
  { id: 'ecommerce', icon: '🛍' },
  { id: 'embodied', icon: '🤖' },
  { id: 'heritage', icon: '🏺' },
  { id: 'gameAssets', icon: '🎮' },
  { id: 'useCases', icon: '✦' },
] as const;

/**
 * Use cases, one field per tab: what the model specifically does for that field,
 * as capability cards. Hands-on cards (click to print / click to move / drag the
 * slider / render and move the camera) get a grid cursor.
 */
export function Scenes() {
  const t = useTranslations('home.scenes');
  const [active, setActive] = useState(0);
  const id = useId();
  const f = FIELDS[active];

  return (
    <section
      aria-labelledby="scenes-title"
      style={{ '--field': f.color } as CSSProperties}
      className="py-20 transition-[background] duration-700 [background:radial-gradient(70%_45%_at_50%_0%,color-mix(in_srgb,var(--field)_18%,transparent),transparent_70%),#03060d] md:py-28"
    >
      <div className="mx-auto w-full max-w-[1320px] px-4 md:px-8">
        <h2 id="scenes-title" className="sr-only">
          {t('eyebrow')}
        </h2>
        <div
          role="tablist"
          aria-label={t('eyebrow')}
          className="mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.05] p-1"
          onKeyDown={(e) => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            const n = (active + (e.key === 'ArrowRight' ? 1 : FIELDS.length - 1)) % FIELDS.length;
            setActive(n);
            document.getElementById(`${id}-${n}`)?.focus();
          }}
        >
          {FIELDS.map((x, i) => (
            <button
              key={x.id}
              id={`${id}-${i}`}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-controls={`${id}-panel`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm transition-colors md:px-6 ${
                i === active
                  ? 'bg-white font-medium text-[#07112a]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {t(`${x.id}.tab`)}
            </button>
          ))}
        </div>

        <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${active}`}>
          <div className="mt-8 text-center text-white">
            <h3 className="text-balance font-display text-3xl font-semibold tracking-tight md:text-[3.25rem] md:leading-[1.1]">
              {t(`${f.id}.headline`)}
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-balance text-base text-white/65 md:text-lg">
              {t(`${f.id}.sub`)}
            </p>
            <a
              href={site.links.app}
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-medium text-[#07112a] transition-transform hover:scale-[1.03]"
            >
              {t('cta')} →
            </a>
          </div>

          <div
            className={`mt-12 grid gap-4 md:grid-cols-2 ${f.cards.length === 3 ? 'lg:grid-cols-3' : ''}`}
          >
            {f.cards.map(({ id: cid, Visual, interactive }) => (
              <article
                key={`${f.id}-${cid}`}
                className="overflow-hidden rounded-[24px] border border-[color-mix(in_srgb,var(--field)_26%,rgba(255,255,255,0.1))] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]"
              >
                <div className="relative h-[300px] overflow-hidden bg-[radial-gradient(70%_70%_at_50%_45%,color-mix(in_srgb,var(--field)_22%,#0b1222),#05080f)] [container-type:size] sm:h-[340px] lg:h-[360px]">
                  <Visual />
                  {interactive && (
                    <span className="pointer-events-none absolute bottom-3 right-3 z-10 hidden items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] text-white/80 backdrop-blur-md sm:inline-flex">
                      <span className="size-1.5 animate-pulse rounded-full bg-[var(--field)]" />
                      {t('tryIt')}
                    </span>
                  )}
                </div>
                <div className="p-6 text-white">
                  <h4 className="text-xl font-semibold tracking-tight">
                    {t(`${f.id}.cards.${cid}.title`)}
                  </h4>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/65">
                    {t(`${f.id}.cards.${cid}.desc`)}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-4 text-sm text-white lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-white/60">{t('compatible')}</span>
              {f.tools.map((tool) => (
                <span
                  key={tool}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] py-1.5 pl-1.5 pr-3"
                >
                  <span
                    aria-hidden
                    className="grid size-6 place-items-center rounded-md bg-[color-mix(in_srgb,var(--field)_24%,transparent)] text-[10px] font-semibold text-[var(--field)]"
                  >
                    {tool.replace(/[^A-Za-z0-9]/g, '').slice(0, 2)}
                  </span>
                  {tool}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-white/60">{t('formats')}</span>
              {f.formats.map((fmt) => (
                <span
                  key={fmt}
                  className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1.5 font-mono text-xs"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-10">
          <Link
            href="/use-cases"
            className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-white hover:underline"
          >
            {t('other')} <span aria-hidden>›</span>
          </Link>
          <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {OTHER.map((o) => (
              <li key={o.id}>
                <Link
                  href={href(o.id)}
                  className="flex h-full items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-5 text-[15px] text-white transition-colors hover:border-white/25 hover:bg-white/[0.07]"
                >
                  <span aria-hidden className="text-lg">
                    {o.icon}
                  </span>
                  {t(`others.${o.id}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
