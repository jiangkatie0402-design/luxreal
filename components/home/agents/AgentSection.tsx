'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { site } from '@/config/site';
import { usePerfStore } from '@/lib/perf';

/** Install commands per MCP client. Package name and key format are placeholders. */
const CLIENTS = [
  {
    id: 'claude',
    label: 'Claude Code',
    lang: 'bash',
    code: 'claude mcp add lux3d -e LUX3D_API_KEY=lux_YOUR_API_KEY -- npx -y @lux3d/mcp-server',
  },
  {
    id: 'cursor',
    label: 'Cursor',
    lang: 'json',
    code: '{ "mcpServers": { "lux3d": { "command": "npx", "args": ["-y", "@lux3d/mcp-server"], "env": { "LUX3D_API_KEY": "lux_YOUR_API_KEY" } } } }',
  },
  {
    id: 'codex',
    label: 'Codex',
    lang: 'bash',
    code: 'codex mcp add lux3d --env LUX3D_API_KEY=lux_YOUR_API_KEY -- npx -y @lux3d/mcp-server',
  },
  {
    id: 'any',
    label: 'Any MCP client',
    lang: 'bash',
    code: 'npx add-mcp @lux3d/mcp-server --env LUX3D_API_KEY=lux_YOUR_API_KEY',
  },
] as const;

const RESULTS = [
  { src: '/community/chest.webp', name: 'treasure_chest.glb' },
  { src: '/community/knight.webp', name: 'knight.glb' },
  { src: '/scenes/figurine.webp', name: 'corgi_statue.glb' },
  { src: '/core/robot-model-cut.webp', name: 'tin_robot.glb' },
];
const CALLS = 4;
const LOOP = 14000;

const SHOWCASE = [
  { id: 'game', src: '/community/knight.webp' },
  { id: 'shop', src: '/community/sneaker.webp' },
  { id: 'print', src: '/scenes/figurine.webp' },
  { id: 'museum', src: '/community/ding.webp' },
] as const;

function useLoopClock() {
  const reduced = usePerfStore((s) => s.reducedMotion);
  const [t, setT] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- static final frame for reduced motion
      setT(LOOP - 1);
      return;
    }
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.2 });
    if (ref.current) io.observe(ref.current);
    let acc = 0;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (visible) {
        acc = (acc + dt) % LOOP;
        setT(acc);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [reduced]);
  return { t, ref };
}

/** For agents: install Lux3D as an MCP server, watch an agent use it, see what agents build. */
export function AgentSection() {
  const t = useTranslations('home.agents');
  const [client, setClient] = useState(0);
  const [copied, setCopied] = useState(false);
  const { t: time, ref } = useLoopClock();
  const c = CLIENTS[client];

  const ask = t('chat.ask');
  const typed = ask.slice(0, Math.round(ask.length * Math.min(time / 1800, 1)));
  const callAt = (i: number) => 2600 + i * 1700;
  const doneAt = (i: number) => callAt(i) + 1300;
  const finalAt = doneAt(CALLS - 1) + 500;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(c.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section
      aria-labelledby="agents-title"
      className="relative overflow-hidden bg-[#03060d] py-24 text-white md:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%] [background:radial-gradient(50%_60%_at_50%_0%,rgba(77,141,255,0.22),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle,rgba(170,210,255,0.5)_1px,transparent_1.6px)_0_0/40px_40px] [mask-image:radial-gradient(60%_50%_at_50%_30%,#000,transparent)]"
      />

      <div className="relative mx-auto w-full max-w-[1320px] px-4 md:px-8">
        {/* ---------- headline + install ---------- */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#5ea8ff]/40 bg-[#5ea8ff]/10 px-3.5 py-1.5 text-xs font-medium text-[#9cc8ff]">
            <span className="size-1.5 rounded-full bg-[#5ea8ff]" />
            {t('eyebrow')}
          </p>
          <h2
            id="agents-title"
            className="mt-6 text-balance font-display text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl"
          >
            {t('titleA')}
            <br />
            <span className="bg-[linear-gradient(100deg,#7fb6ff,#5fe0ff_45%,#a7b4ff)] bg-clip-text text-transparent">
              {t('titleB')}
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-white/65">
            {t('subtitle')}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-white/12 bg-[#070c18]/90 shadow-[0_30px_100px_-30px_rgba(77,141,255,0.55)] backdrop-blur-md">
          <div
            className="flex flex-wrap items-center gap-1 border-b border-white/10 px-2 pt-2"
            role="tablist"
            aria-label={t('clientsLabel')}
          >
            {CLIENTS.map((x, i) => (
              <button
                key={x.id}
                role="tab"
                type="button"
                aria-selected={client === i}
                onClick={() => setClient(i)}
                className={`relative rounded-t-lg px-4 py-2.5 text-sm transition-colors ${client === i ? 'bg-white/[0.06] text-white' : 'text-white/50 hover:text-white'}`}
              >
                {x.id === 'any' ? t('anyClient') : x.label}
                {client === i && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#5ea8ff]" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 p-4 md:p-6">
            <pre className="min-w-0 flex-1 whitespace-pre-wrap break-all font-mono text-sm leading-relaxed md:text-[17px]">
              <code>
                {c.lang === 'bash' && <span className="select-none text-white/35">$ </span>}
                {c.code.split(/(\s+)/).map((w, i) => (
                  <span
                    key={i}
                    className={
                      /^(npx|claude|codex)$/.test(w)
                        ? 'text-[#7fe0b0]'
                        : /^--?\w/.test(w)
                          ? 'text-[#7fb6ff]'
                          : w.includes('YOUR_API_KEY')
                            ? 'text-[#ffd27a]'
                            : 'text-white/90'
                    }
                  >
                    {w}
                  </span>
                ))}
              </code>
            </pre>
            <button
              type="button"
              onClick={copy}
              className="shrink-0 rounded-xl bg-[#4d8dff] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5b9bff]"
            >
              {copied ? t('copied') : t('copy')}
            </button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <a
            href={site.links.console}
            className="text-white/80 underline-offset-4 hover:text-white hover:underline"
          >
            {t('getKey')} →
          </a>
          <a
            href={site.links.docs}
            className="text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            {t('guide')} ↗
          </a>
        </div>

        {/* ---------- live agent demo ---------- */}
        <div
          ref={ref}
          className="mt-16 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
          aria-hidden
        >
          <div className="flex flex-col rounded-[24px] border border-white/10 bg-[#070c18] p-5 md:p-6">
            <div className="flex items-center gap-2 text-xs text-white/45">
              <span className="size-2 rounded-full bg-[#ff6b6b]/70" />
              <span className="size-2 rounded-full bg-[#ffd27a]/70" />
              <span className="size-2 rounded-full bg-[#7fe0b0]/70" />
              <span className="ml-2 font-mono">agent · lux3d mcp</span>
            </div>
            <div className="mt-5 self-end rounded-2xl rounded-br-md bg-[#4d8dff] px-4 py-3 text-[15px] leading-relaxed">
              {typed}
              {time < 1800 && (
                <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-white" />
              )}
            </div>
            <div className="mt-5 flex flex-col gap-2.5 font-mono text-[13px]">
              {Array.from({ length: CALLS }, (_, i) => {
                if (time < callAt(i)) return null;
                const done = time >= doneAt(i);
                return (
                  <div
                    key={i}
                    className="story-in flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                  >
                    <span
                      className={`grid size-5 place-items-center rounded-full text-[10px] ${done ? 'bg-[#7fe0b0]/20 text-[#7fe0b0]' : 'text-[#7fb6ff]'}`}
                    >
                      {done ? (
                        '✓'
                      ) : (
                        <span className="size-3 animate-spin rounded-full border-2 border-[#7fb6ff] border-t-transparent" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      <span className="text-[#7fb6ff]">
                        lux3d.{i === 2 ? 'image_to_3d' : 'text_to_3d'}
                      </span>
                      <span className="text-white/45">(&quot;{t(`chat.calls.${i}`)}&quot;)</span>
                    </span>
                    <span className="text-white/40">
                      {done ? `${18 + i * 3}s` : t('chat.running')}
                    </span>
                  </div>
                );
              })}
            </div>
            {time >= finalAt && (
              <div className="story-in mt-5 rounded-2xl rounded-bl-md bg-white/[0.06] px-4 py-3 text-[15px] leading-relaxed text-white/85">
                {t('chat.reply')}
              </div>
            )}
          </div>

          <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(60%_60%_at_50%_45%,#11224a,#060b16)] p-5 md:p-6">
            <div className="flex items-center justify-between text-xs text-white/45">
              <span className="font-mono">./assets/props</span>
              <span className="font-mono">
                {RESULTS.filter((_, i) => time >= doneAt(i)).length} / {RESULTS.length} GLB
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {RESULTS.map((r, i) => {
                const started = time >= callAt(i);
                const done = time >= doneAt(i);
                return (
                  <div
                    key={r.name}
                    className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-black/30"
                  >
                    {started && (
                      <>
                        <div
                          className="absolute inset-[8%] transition-[clip-path] duration-[1200ms] ease-out"
                          style={{ clipPath: done ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)' }}
                        >
                          <Image src={r.src} alt="" fill sizes="320px" className="object-contain" />
                        </div>
                        {!done && (
                          <span className="absolute inset-x-0 bottom-[8%] h-[2px] animate-pulse bg-[#7fb6ff] shadow-[0_0_14px_3px_rgba(94,168,255,0.8)]" />
                        )}
                      </>
                    )}
                    <span
                      className={`absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 font-mono text-[11px] ${done ? 'text-white/85' : 'text-white/35'}`}
                    >
                      {r.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ---------- what agents build ---------- */}
        <div className="mt-20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h3 className="text-balance font-display text-2xl font-semibold tracking-tight md:text-4xl">
              {t('showcaseTitle')}
            </h3>
            <p className="max-w-md text-white/55">{t('showcaseSub')}</p>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SHOWCASE.map((s) => (
              <li
                key={s.id}
                className="group overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] transition-colors hover:border-white/25"
              >
                <div className="relative h-44 bg-[radial-gradient(60%_70%_at_50%_60%,rgba(77,141,255,0.22),transparent_70%)]">
                  <Image
                    src={s.src}
                    alt=""
                    fill
                    sizes="320px"
                    className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] text-white/75 backdrop-blur-md">
                    {t(`showcase.${s.id}.agent`)}
                  </span>
                </div>
                <div className="p-5">
                  <h4 className="text-lg font-semibold">{t(`showcase.${s.id}.title`)}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {t(`showcase.${s.id}.desc`)}
                  </p>
                  <p className="mt-4 truncate rounded-lg bg-black/40 px-3 py-2 font-mono text-[12px] text-[#9cc8ff]">
                    &gt; {t(`showcase.${s.id}.prompt`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-white/35">{t('note')}</p>
        </div>
      </div>
    </section>
  );
}
