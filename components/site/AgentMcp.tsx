'use client';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { create } from 'zustand';
import { site } from '@/config/site';
import { usePerfStore } from '@/lib/perf';
import { cn } from '@/lib/utils';
import { AGENT_ITEMS, Form } from './AgentCapabilities';

/** Preview-only switch between the three MCP block layouts. */
export const MCP_VARIANTS = ['A 终端演示', 'B 接入链路', 'C 发光命令条'] as const;
export const useMcpVariant = create<{ v: number; set: (v: number) => void }>((setState) => ({
  v: 0,
  set: (v) => setState({ v }),
}));

const CLIENTS = ['Claude Code', 'Cursor', 'Codex'] as const;

function useCopy(text: string) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.setTimeout(() => setDone(false), 1600);
    } catch {
      /* clipboard unavailable: the command stays selectable */
    }
  };
  return { done, copy };
}

/** The command with light shell colouring: tool in violet, flags in lavender. */
function Command({ cmd, upTo }: { cmd: string; upTo?: number }) {
  const shown = upTo === undefined ? cmd : cmd.slice(0, upTo);
  return (
    <code className="font-mono text-sm leading-6 text-foreground/90 md:text-[15px]">
      <span className="select-none text-muted-foreground">$ </span>
      {shown.split(' ').map((w, i) => (
        <span
          key={i}
          className={cn(i === 0 && 'text-[#b8a6ff]', w.startsWith('--') && 'text-[#8fa8ff]')}
        >
          {i ? ' ' : ''}
          {w}
        </span>
      ))}
    </code>
  );
}

function CopyButton({ cmd, className }: { cmd: string; className?: string }) {
  const t = useTranslations('site.agents.mcp');
  const { done, copy } = useCopy(cmd);
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={t('copy')}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground',
        className,
      )}
    >
      {done ? (
        <Check className="size-3.5" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
      {done ? t('copied') : t('copy')}
    </button>
  );
}

function GuideLink({ className }: { className?: string }) {
  const t = useTranslations('site.agents.mcp');
  return (
    <a
      href={site.links.docs}
      className={cn(
        'inline-flex items-center gap-1 text-sm font-medium text-[#b8a6ff] transition-colors hover:text-white',
        className,
      )}
    >
      {t('guide')}
      <ArrowUpRight className="size-4" aria-hidden />
    </a>
  );
}

/** True once the element has scrolled into view. */
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), {
      threshold: 0.4,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

/* ------------------------------------------------------------------ A */

/** A — copy on the left; on the right a terminal that types the command, then connects. */
function TerminalDemo({ cmd }: { cmd: string }) {
  const t = useTranslations('site.agents');
  const reduced = usePerfStore((s) => s.reducedMotion);
  const [ref, seen] = useInView<HTMLDivElement>();
  const [n, setN] = useState(0);
  const [step, setStep] = useState(0);
  // reduced motion: show the finished state straight away
  const typed = reduced ? cmd.length : n;
  const shown = reduced ? 2 : step;

  useEffect(() => {
    if (!seen || reduced) return;
    const timers: number[] = [];
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= cmd.length) {
        window.clearInterval(id);
        timers.push(window.setTimeout(() => setStep(1), 450));
        timers.push(window.setTimeout(() => setStep(2), 1000));
      }
    }, 32);
    return () => {
      window.clearInterval(id);
      timers.forEach((x) => window.clearTimeout(x));
    };
  }, [seen, reduced, cmd]);

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
      <div>
        <p className="t-label font-mono text-primary">MCP</p>
        <h3 className="mt-3 text-balance font-display text-2xl font-semibold leading-[1.3] md:text-3xl">
          {t('mcp.title')}
        </h3>
        <p className="t-desc mt-4 text-pretty text-muted-foreground">{t('mcp.desc')}</p>
        <GuideLink className="mt-6" />
      </div>

      <div ref={ref} className="relative isolate">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[-25%_-10%] -z-10 [background:radial-gradient(50%_50%_at_60%_50%,rgba(110,98,163,0.28),transparent_70%)]"
        />
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0e] shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
          <div className="flex h-10 items-center gap-2 border-b border-white/[0.08] pl-4 pr-2">
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="ml-3 font-mono text-xs text-muted-foreground">bash</span>
            <CopyButton cmd={cmd} className="ml-auto" />
          </div>
          <div className="min-h-[150px] overflow-x-auto p-5 font-mono text-sm leading-7">
            <div className="whitespace-pre">
              <Command cmd={cmd} upTo={typed} />
              {shown === 0 && (
                <span className="mcp-caret ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-[#b8a6ff]" />
              )}
            </div>
            <p
              className={cn(
                'mt-3 text-[#9be3b4] transition-opacity duration-500',
                shown >= 1 ? 'opacity-100' : 'opacity-0',
              )}
            >
              ✓ {t('mcp.added')}
            </p>
            <div
              className={cn(
                'mt-2 flex flex-wrap items-center gap-2 transition-opacity duration-700',
                shown >= 2 ? 'opacity-100' : 'opacity-0',
              )}
            >
              <span className="text-muted-foreground">{t('mcp.available')}:</span>
              {AGENT_ITEMS.map((k) => (
                <span
                  key={k}
                  className="rounded-md bg-[#6e62a3]/20 px-2 font-sans text-[13px] text-[#d6ccff]"
                >
                  {t(`items.${k}.label`)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ B */

const LINE = 'rgba(196,186,255,0.14)';
const DOT = 'rgba(214,204,255,0.9)';

/** One connection: a faint line with light dots flowing along it. */
function Flow({ d, delay }: { d: string; delay: number }) {
  return (
    <g>
      <path d={d} stroke={LINE} fill="none" vectorEffect="non-scaling-stroke" />
      <path
        d={d}
        stroke={DOT}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        className="mcp-flow"
        style={{ animationDelay: `${delay}s` }}
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}

/** B — clients flow into the turning form, which fans out to the six capabilities. */
function Pipeline({ cmd }: { cmd: string }) {
  const t = useTranslations('site.agents');
  const left = [...CLIENTS, t('mcp.anyClient')];
  const ly = left.map((_, i) => 20 + i * 20); // % of height
  const ry = AGENT_ITEMS.map((_, i) => 10 + i * 16);
  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <p className="t-label font-mono text-primary">MCP</p>
        <h3 className="mt-3 text-balance font-display text-2xl font-semibold leading-[1.3] md:text-3xl">
          {t('mcp.title')}
        </h3>
        <p className="t-desc mt-3 max-w-2xl text-pretty text-muted-foreground">{t('mcp.desc')}</p>
      </div>

      {/* diagram (desktop) */}
      <div className="relative mx-auto mt-8 hidden h-[320px] max-w-[1100px] md:block">
        <svg
          aria-hidden
          className="absolute inset-0 size-full"
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
        >
          {ly.map((y, i) => (
            <Flow key={`l${i}`} d={`M 235 ${y} C 360 ${y}, 380 50, 470 50`} delay={-i * 0.4} />
          ))}
          {ry.map((y, i) => (
            <Flow key={`r${i}`} d={`M 530 50 C 620 50, 640 ${y}, 765 ${y}`} delay={-i * 0.27} />
          ))}
        </svg>
        <div className="absolute left-1/2 top-1/2 size-[150px] -translate-x-1/2 -translate-y-1/2">
          <Form />
        </div>
        {left.map((c, i) => (
          <span
            key={c}
            className="absolute right-[76.5%] -translate-y-1/2 whitespace-nowrap rounded-btn border border-white/10 bg-[#121216] px-4 py-2 text-sm font-medium"
            style={{ top: `${ly[i]}%` }}
          >
            {c}
          </span>
        ))}
        {AGENT_ITEMS.map((k, i) => (
          <span
            key={k}
            className="absolute left-[76.5%] -translate-y-1/2 whitespace-nowrap rounded-btn bg-[#6e62a3]/20 px-3 py-1.5 text-sm text-[#d6ccff]"
            style={{ top: `${ry[i]}%` }}
          >
            {t(`items.${k}.label`)}
          </span>
        ))}
      </div>

      {/* chips (mobile) */}
      <div className="mt-8 flex flex-wrap justify-center gap-2 md:hidden">
        {left.map((c) => (
          <span key={c} className="rounded-btn border border-white/10 px-3 py-1.5 text-sm">
            {c}
          </span>
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-[760px] items-center gap-3 rounded-btn-outer border border-white/10 bg-[#0b0b0e] py-2 pl-5 pr-2">
        <div className="min-w-0 flex-1 overflow-x-auto whitespace-pre">
          <Command cmd={cmd} />
        </div>
        <CopyButton cmd={cmd} />
      </div>
      <div className="mt-4 text-center">
        <GuideLink />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ C */

/** C — a big centred command bar with light travelling round its border. */
function GlowBar({ cmd }: { cmd: string }) {
  const t = useTranslations('site.agents.mcp');
  return (
    <div className="relative isolate flex flex-col items-center py-4 text-center md:py-8">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[140%] -translate-y-1/2 [background:radial-gradient(40%_45%_at_50%_60%,rgba(110,98,163,0.26),transparent_70%)]"
      />
      <p className="t-label font-mono text-primary">MCP</p>
      <h3 className="mt-3 text-balance font-display text-3xl font-semibold leading-[1.25] md:text-[2.5rem]">
        {t('title')}
      </h3>
      <p className="t-desc mt-4 max-w-2xl text-pretty text-muted-foreground">{t('desc')}</p>

      <div className="mcp-glow mt-10 w-full max-w-[880px] rounded-[18px] p-px shadow-[0_0_60px_rgba(110,98,163,0.25)]">
        <div className="flex items-center gap-3 rounded-[17px] bg-[#0b0b0e] py-3 pl-6 pr-3 md:py-4">
          <div className="min-w-0 flex-1 overflow-x-auto whitespace-pre text-left">
            <Command cmd={cmd} />
          </div>
          <CopyButton cmd={cmd} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {[...CLIENTS, t('anyClient')].map((c, i) => (
          <span key={c} className="flex items-center gap-4">
            {i > 0 && <span aria-hidden className="size-1 rounded-full bg-white/20" />}
            {c}
          </span>
        ))}
      </div>
      <GuideLink className="mt-6" />
    </div>
  );
}

/** MCP install block, then the 应用案例 sub-block. */
export function AgentMcp({ cases }: { cases: ReactNode }) {
  const t = useTranslations('site.agents.mcp');
  const v = useMcpVariant((s) => s.v);
  const cmd = t('command');
  return (
    <>
      {v === 0 && <TerminalDemo cmd={cmd} />}
      {v === 1 && <Pipeline cmd={cmd} />}
      {v === 2 && <GlowBar cmd={cmd} />}
      <div className="mt-10 border-t pt-10 md:mt-12 md:pt-12">{cases}</div>
    </>
  );
}
