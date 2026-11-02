'use client';
import { Canvas } from '@react-three/fiber';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { thumbSrc } from '@/config/gallery';
import { storyStages, type StoryStageId } from '@/config/story';
import { usePerfStore } from '@/lib/perf';
import { StoryScenes } from './scenes';

/**
 * Four-stage story: photo → 3D → printed on a desk → running in a game.
 * One canvas, one shared stage clock; auto-advances, pauses on hover/focus or
 * with the pause button, and can be clicked or swiped between stages.
 */
export function StoryStage() {
  const t = useTranslations('home.story');
  const { tier, ready, reducedMotion, init } = usePerfStore();
  useEffect(() => init(), [init]);
  const can3d = ready && tier !== 'low';

  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [hover, setHover] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const paused = hover || userPaused || reducedMotion;
  const clock = useRef({ t: 0 });
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const indexRef = useRef(0);
  const pausedRef = useRef(paused);
  const id = useId();

  const go = useCallback(
    (i: number) => {
      const n = (i + storyStages.length) % storyStages.length;
      indexRef.current = n;
      // Reduced motion shows each stage's finished frame instead of playing it.
      clock.current.t = reducedMotion ? 60 : 0;
      setIndex(n);
      setCycle((c) => c + 1);
    },
    [reducedMotion],
  );

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    if (reducedMotion) clock.current.t = 60;
  }, [reducedMotion]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const i = indexRef.current;
      const dur = storyStages[i].duration / 1000;
      if (!pausedRef.current) clock.current.t += dt;
      bars.current.forEach((el, k) => {
        if (el)
          el.style.width = `${k < i ? 100 : k > i ? 0 : Math.min(clock.current.t / dur, 1) * 100}%`;
      });
      if (!pausedRef.current && clock.current.t >= dur) go(i + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go]);

  const touchX = useRef<number | null>(null);
  const stage: StoryStageId = storyStages[index].id;

  return (
    <div
      className={paused ? 'story-paused' : ''}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${index}`}
        aria-roledescription={t('stageRole')}
        className="relative aspect-[4/5] overflow-hidden rounded-lg border border-line-strong bg-surface-2 shadow-card sm:aspect-[16/9]"
      >
        {can3d ? (
          <Canvas
            className="!absolute inset-0"
            shadows={tier === 'high' ? 'percentage' : false}
            dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
            camera={{ position: [2.5, 1.5, 3.3], fov: 40 }}
            aria-label={t(`stages.${stage}.title`)}
          >
            <StoryScenes stage={stage} clock={clock} />
          </Canvas>
        ) : (
          <Image
            src={thumbSrc('gallery-corgi')}
            alt=""
            fill
            sizes="(min-width: 1024px) 1100px, 100vw"
            className="object-contain p-10"
          />
        )}

        <Overlay key={`${stage}-${cycle}`} stage={stage} />

        {/* caption over a dark scrim: reads the same on every scene */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(4,7,14,0.78)] to-transparent px-5 pb-5 pt-16 text-left text-white md:px-8 md:pb-7">
          <p key={`cap-${stage}-${cycle}`} className="story-in">
            <span className="block font-mono text-xs opacity-70">
              0{index + 1} / 0{storyStages.length}
            </span>
            <span className="mt-1 block font-display text-xl font-semibold md:text-2xl">
              {t(`stages.${stage}.title`)}
            </span>
            <span className="mt-1 block text-sm opacity-80 md:text-base">
              {t(`stages.${stage}.desc`)}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          aria-label={userPaused ? t('play') : t('pause')}
          className="absolute bottom-4 right-4 grid size-9 place-items-center rounded-full bg-[rgba(4,7,14,0.55)] text-white backdrop-blur-sm hover:bg-[rgba(4,7,14,0.75)] md:bottom-6 md:right-6"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden fill="currentColor">
            {userPaused ? <path d="M3 1.5v11l9-5.5z" /> : <path d="M3 1.5h3v11H3zM8 1.5h3v11H8z" />}
          </svg>
        </button>
      </div>

      <div
        role="tablist"
        aria-label={t('tabsLabel')}
        className="mt-4 grid grid-cols-4 gap-2 md:gap-4"
        onKeyDown={(e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          const n =
            (index + (e.key === 'ArrowRight' ? 1 : storyStages.length - 1)) % storyStages.length;
          go(n);
          document.getElementById(`${id}-tab-${n}`)?.focus();
        }}
      >
        {storyStages.map((s, i) => (
          <button
            key={s.id}
            id={`${id}-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={i === index}
            aria-controls={`${id}-panel`}
            tabIndex={i === index ? 0 : -1}
            onClick={() => go(i)}
            className="group text-left"
          >
            <span className="block h-1 overflow-hidden rounded-full bg-line-strong">
              <span
                ref={(el) => void (bars.current[i] = el)}
                className="block h-full w-0 rounded-full bg-accent"
              />
            </span>
            <span
              className={`mt-2.5 flex items-baseline gap-2 text-sm transition-colors ${i === index ? 'text-text' : 'text-subtle group-hover:text-muted'}`}
            >
              <span className="font-mono text-xs">0{i + 1}</span>
              <span className="truncate font-medium">{t(`stages.${s.id}.tab`)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

const chip =
  'inline-flex items-center gap-2 rounded-full bg-[rgba(4,7,14,0.62)] px-3 py-1.5 text-xs text-white backdrop-blur-sm';
const delay = (s: number) => ({ animationDelay: `${s}s` });

/** DOM layer on top of each scene. Animations are CSS, timed to the 3D clock. */
function Overlay({ stage }: { stage: StoryStageId }) {
  const t = useTranslations('home.story.overlay');
  if (stage === 'capture')
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* viewfinder corners */}
        {[
          'left-[8%] top-[9%] border-l-2 border-t-2',
          'right-[8%] top-[9%] border-r-2 border-t-2',
          'left-[8%] bottom-[9%] border-b-2 border-l-2',
          'right-[8%] bottom-[9%] border-b-2 border-r-2',
        ].map((c) => (
          <span key={c} className={`absolute size-8 border-white/90 md:size-12 ${c}`} />
        ))}
        <span className={`${chip} absolute left-1/2 top-[11%] -translate-x-1/2`}>
          <span className="size-1.5 rounded-full bg-[#ff4d4d]" />
          {t('photo')}
        </span>
        <span
          className="story-focus absolute left-[46%] top-[38%] size-16 -translate-x-1/2 -translate-y-1/2 border border-[#ffd34d] md:size-24"
          style={delay(0.4)}
        />
        <span className="absolute right-[3%] top-1/2 hidden size-12 -translate-y-1/2 rounded-full border-4 border-white/90 sm:block md:size-14">
          <span className="absolute inset-1 rounded-full bg-white/90" />
        </span>
        <span className="story-flash absolute inset-0 bg-white" style={delay(2.2)} />
        <span
          className="story-polaroid absolute right-[10%] top-[14%] w-24 rotate-6 bg-white p-1.5 pb-5 shadow-card md:w-32"
          style={delay(2.5)}
        >
          <span className="relative block aspect-square bg-[#d9cfbf]">
            <Image
              src={thumbSrc('gallery-corgi')}
              alt=""
              fill
              sizes="128px"
              className="object-contain p-1"
            />
          </span>
        </span>
      </div>
    );
  if (stage === 'generate')
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="story-in absolute left-4 top-4 flex items-center gap-2.5 rounded-md bg-[rgba(4,7,14,0.62)] p-1.5 pr-3 text-xs text-white backdrop-blur-sm md:left-6 md:top-6">
          <span className="relative size-10 rounded bg-[#d9cfbf]">
            <Image
              src={thumbSrc('gallery-corgi')}
              alt=""
              fill
              sizes="40px"
              className="object-contain p-0.5"
            />
          </span>
          {t('uploaded')} <span className="text-[#5be3a0]">✓</span>
        </span>
        <span
          className="story-in absolute right-4 top-4 w-48 rounded-md bg-[rgba(4,7,14,0.62)] p-3 text-xs text-white backdrop-blur-sm md:right-6 md:top-6 md:w-56"
          style={delay(0.4)}
        >
          {t('generating')}
          <span className="mt-2 block h-1 overflow-hidden rounded-full bg-white/20">
            <span
              className="story-fill block h-full w-full rounded-full bg-accent"
              style={{ animationDuration: '3s', animationDelay: '0.6s' }}
            />
          </span>
        </span>
        <span
          className={`story-in ${chip} absolute right-4 top-[5.5rem] md:right-6 md:top-24`}
          style={delay(3.7)}
        >
          <span className="text-[#5be3a0]">✓</span>
          {t('generated')}
        </span>
      </div>
    );
  if (stage === 'print')
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="story-in absolute left-4 top-4 w-48 rounded-md bg-[rgba(4,7,14,0.62)] p-3 text-xs text-white backdrop-blur-sm md:left-6 md:top-6 md:w-56">
          {t('printing')}
          <span className="mt-2 block h-1 overflow-hidden rounded-full bg-white/20">
            <span
              className="story-fill block h-full w-full rounded-full bg-accent"
              style={{ animationDuration: '3.2s', animationDelay: '0.4s' }}
            />
          </span>
        </span>
        <span
          className={`story-in ${chip} absolute left-4 top-[5.5rem] md:left-6 md:top-24`}
          style={delay(3.7)}
        >
          <span className="text-[#5be3a0]">✓</span>
          {t('printed')}
        </span>
      </div>
    );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 text-white">
      <span className="story-in absolute left-4 top-4 rounded-md bg-[rgba(4,7,14,0.55)] px-3 py-2 text-xs backdrop-blur-sm md:left-6 md:top-6">
        <span className="font-semibold">{t('petName')}</span>{' '}
        <span className="opacity-70">{t('level')}</span>
        <span className="mt-1 block tracking-[0.2em] text-[#ff6b7a]">♥♥♥</span>
      </span>
      <span
        className="story-in absolute right-4 top-4 size-16 overflow-hidden rounded-full border-2 border-white/70 bg-[rgba(30,60,40,0.7)] md:right-6 md:top-6 md:size-20"
        style={delay(0.2)}
      >
        <span className="absolute inset-[30%] rounded-full border border-dashed border-white/50" />
        <span className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffd34d]" />
      </span>
      <span
        className={`story-in ${chip} absolute left-1/2 top-4 -translate-x-1/2 md:top-6`}
        style={delay(0.8)}
      >
        {t('quest')}
      </span>
      <span
        className={`story-in ${chip} absolute bottom-[34%] right-4 hidden sm:inline-flex md:right-6`}
        style={delay(1.6)}
      >
        {t('rig')}
      </span>
    </div>
  );
}
