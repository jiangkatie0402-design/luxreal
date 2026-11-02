'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { agentVideos, MCP_COMMAND } from '@/config/agentVideos';
import { site } from '@/config/site';
import { usePerfStore } from '@/lib/perf';

const AUTO_MS = 9000;

/**
 * Agent use cases as video: a large player of the company's case films, a case
 * list to switch between them, and the MCP command bar right under the player
 * so viewers can copy it while watching.
 */
export function AgentVideoShowcase() {
  const t = useTranslations('home.agentVideo');
  const reduced = usePerfStore((s) => s.reducedMotion);
  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  const v = agentVideos[active];

  // Poster-only cases auto-advance; real videos advance when they end.
  useEffect(() => {
    if (manual || reduced || v.src) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = (now - start) / AUTO_MS;
      if (k >= 1) setActive((i) => (i + 1) % agentVideos.length);
      else {
        setProgress(k);
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, manual, reduced, v.src]);

  const pick = (i: number) => {
    setManual(true);
    setActive(i);
    setProgress(0);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(MCP_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section
      aria-labelledby="agent-video-title"
      className="relative overflow-hidden bg-[#03060d] py-20 text-white md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[60%] [background:radial-gradient(50%_60%_at_50%_0%,rgba(77,141,255,0.2),transparent_70%)]"
      />
      <div className="relative mx-auto w-full max-w-[1320px] px-4 md:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex flex-col items-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#5ea8ff]/40 bg-[#5ea8ff]/10 px-3.5 py-1.5 text-xs font-medium text-[#9cc8ff]">
              <span className="size-1.5 rounded-full bg-[#5ea8ff]" />
              {t('eyebrow')}
            </p>
            <h2
              id="agent-video-title"
              className="mt-5 text-balance font-display text-3xl font-bold leading-[1.1] tracking-tight md:text-[3.2rem]"
            >
              {t('title')}
            </h2>
            <p className="mt-4 max-w-2xl text-balance text-white/60 md:text-lg">{t('subtitle')}</p>
          </div>
          <a
            href={site.links.docs}
            className="-mt-1 text-sm text-[#9cc8ff] underline-offset-4 hover:text-white hover:underline"
          >
            {t('guide')} ↗
          </a>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          {/* ---------- player + command ---------- */}
          <div className="min-w-0">
            <div className="relative aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-[0_40px_120px_-40px_rgba(77,141,255,0.6)]">
              {v.src ? (
                <video
                  ref={video}
                  key={v.src}
                  src={v.src}
                  poster={v.poster}
                  className="absolute inset-0 size-full object-cover"
                  autoPlay={!reduced}
                  muted
                  playsInline
                  controls
                  onTimeUpdate={(e) =>
                    setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))
                  }
                  onEnded={() => setActive((i) => (i + 1) % agentVideos.length)}
                />
              ) : (
                <>
                  <Image
                    key={v.poster}
                    src={v.poster}
                    alt=""
                    fill
                    sizes="(min-width:1024px) 900px, 100vw"
                    className={`object-cover ${reduced ? '' : 'cover-kenburns'}`}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(3,6,13,0.85),transparent_45%)]" />
                  <span className="absolute left-1/2 top-[38%] grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/15 backdrop-blur-md">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span className="absolute right-4 top-4 rounded-full bg-[#ffd27a] px-2.5 py-1 text-[11px] font-medium text-[#2a1d00]">
                    {t('placeholder')}
                  </span>
                </>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 md:p-7">
                <p className="flex items-center gap-2 text-xs text-white/70">
                  <span className="rounded-md bg-white/15 px-2 py-0.5 backdrop-blur">
                    {v.agent}
                  </span>
                  {t(`cases.${v.id}.tag`)}
                </p>
                <p
                  key={v.id}
                  className="story-in mt-2 max-w-xl text-balance text-xl font-semibold md:text-[1.7rem] md:leading-snug"
                >
                  {t(`cases.${v.id}.title`)}
                </p>
                <p className="mt-3 max-w-xl truncate rounded-lg bg-black/45 px-3 py-2 font-mono text-[12px] text-[#9cc8ff] backdrop-blur md:text-[13px]">
                  &gt; {t(`cases.${v.id}.prompt`)}
                </p>
              </div>
              <span className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
                <span
                  className="block h-full bg-[#5ea8ff]"
                  style={{ width: `${progress * 100}%` }}
                />
              </span>
            </div>

            {/* the command, bundled with the video */}
            <div className="agent-strip mt-5 rounded-[20px] p-px">
              <div className="flex flex-col gap-4 rounded-[19px] bg-[#070c18] p-4 md:flex-row md:items-center md:gap-6 md:p-5">
                <div className="shrink-0">
                  <p className="text-base font-semibold md:text-lg">{t('cmdTitle')}</p>
                  <p className="text-sm text-white/50">{t('cmdSub')}</p>
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/40 py-2 pl-4 pr-2">
                  <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-white/85 md:text-sm">
                    <span className="select-none text-white/35">$ </span>
                    <span className="text-[#7fe0b0]">npx</span> add-mcp @lux3d/mcp-server{' '}
                    <span className="text-[#7fb6ff]">--env</span>{' '}
                    <span className="text-[#ffd27a]">LUX3D_API_KEY=lux_YOUR_API_KEY</span>
                  </code>
                  <button
                    type="button"
                    onClick={copy}
                    className="shrink-0 rounded-lg bg-[#4d8dff] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5b9bff]"
                  >
                    {copied ? t('copied') : t('copy')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- case list ---------- */}
          <ul className="flex flex-col gap-3" role="tablist" aria-label={t('listLabel')}>
            {agentVideos.map((c, i) => (
              <li key={c.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={active === i}
                  onClick={() => pick(i)}
                  className={`group flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-colors ${
                    active === i
                      ? 'border-[#5ea8ff]/60 bg-[#5ea8ff]/10'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                  }`}
                >
                  <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-black md:w-32">
                    <Image src={c.poster} alt="" fill sizes="128px" className="object-cover" />
                    <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 font-mono text-[10px]">
                      {c.duration}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] text-white/45">
                      {c.agent} · {t(`cases.${c.id}.tag`)}
                    </span>
                    <span
                      className={`mt-1 block text-[15px] font-medium leading-snug ${active === i ? 'text-white' : 'text-white/75'}`}
                    >
                      {t(`cases.${c.id}.title`)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
            <li className="mt-auto rounded-2xl border border-dashed border-white/15 p-4 text-sm text-white/55">
              {t('more')}{' '}
              <a href={site.links.console} className="text-[#9cc8ff] hover:text-white">
                {t('getKey')} →
              </a>
            </li>
          </ul>
        </div>
        <p className="mt-4 text-center text-xs text-white/35">{t('note')}</p>
      </div>
    </section>
  );
}
