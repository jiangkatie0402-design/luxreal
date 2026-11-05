'use client';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { create } from 'zustand';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';

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
function Command({ cmd }: { cmd: string }) {
  return (
    <code className="font-mono text-sm leading-6 text-foreground/90 md:text-[15px]">
      <span className="select-none text-muted-foreground">$ </span>
      {cmd.split(' ').map((w, i) => (
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

/* ------------------------------------------------------------------ C */

/** Preview-only switch between the MCP layouts. */
export const MCP_VARIANTS = ['A 一体横条', 'B 左文右码', 'C 命令为主'] as const;
export const useMcpVariant = create<{ v: number; set: (v: number) => void }>((setState) => ({
  v: 0,
  set: (v) => setState({ v }),
}));

/** Glowing border shell (light travels round it). */
function Glow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mcp-glow rounded-[18px] p-px', className)}>
      <div className="rounded-[17px] bg-[#0c0b10]">{children}</div>
    </div>
  );
}

/** A — one glowing strip: heading on the left, command, copy and guide on the right. */
function Strip({ cmd }: { cmd: string }) {
  const t = useTranslations('site.agents.mcp');
  return (
    <Glow>
      <div className="flex flex-col gap-5 p-5 md:p-6 lg:flex-row lg:items-center lg:gap-8 lg:px-8">
        <div className="lg:w-[24rem] lg:shrink-0">
          <h3 className="text-lg font-semibold">{t('title')}</h3>
          <p className="t-small mt-1 text-pretty text-muted-foreground">{t('desc')}</p>
          <GuideLink className="mt-2" />
        </div>
        <span aria-hidden className="hidden h-12 w-px bg-white/10 lg:block" />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="min-w-0 flex-1 overflow-x-auto whitespace-pre">
            <Command cmd={cmd} />
          </div>
          <CopyButton cmd={cmd} />
        </div>
      </div>
    </Glow>
  );
}

/** B — copy on the left (aligned with the cases below), glowing command bar on the right. */
function Split({ cmd }: { cmd: string }) {
  const t = useTranslations('site.agents.mcp');
  return (
    <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12">
      <div>
        <h3 className="t-title">{t('title')}</h3>
        <p className="t-desc mt-2 text-pretty text-muted-foreground">{t('desc')}</p>
        <GuideLink className="mt-4" />
      </div>
      <div>
        <Glow className="shadow-[0_0_48px_rgba(110,98,163,0.16)]">
          <div className="flex items-center gap-3 py-3 pl-5 pr-3">
            <div className="min-w-0 flex-1 overflow-x-auto whitespace-pre">
              <Command cmd={cmd} />
            </div>
            <CopyButton cmd={cmd} />
          </div>
        </Glow>
        <p className="t-small mt-3 text-muted-foreground lg:text-right">
          {[...CLIENTS, t('anyClient')].join(' · ')}
        </p>
      </div>
    </div>
  );
}

/** C — the command itself is the visual: large mono line, light sweeping along a rule beneath. */
function Hero({ cmd }: { cmd: string }) {
  const t = useTranslations('site.agents.mcp');
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <h3 className="t-title">{t('title')}</h3>
        <GuideLink />
      </div>
      <div className="mt-6 flex items-center gap-4">
        <div className="min-w-0 flex-1 overflow-x-auto whitespace-pre py-2 [&_code]:text-lg md:[&_code]:text-2xl">
          <Command cmd={cmd} />
        </div>
        <CopyButton cmd={cmd} />
      </div>
      <span aria-hidden className="mcp-sweep mt-3 block h-px w-full" />
      <p className="t-small mt-3 text-muted-foreground">{t('desc')}</p>
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
      {v === 0 && <Strip cmd={cmd} />}
      {v === 1 && <Split cmd={cmd} />}
      {v === 2 && <Hero cmd={cmd} />}
      <div className="mt-14 border-t pt-12 md:mt-16 md:pt-14">{cases}</div>
    </>
  );
}
