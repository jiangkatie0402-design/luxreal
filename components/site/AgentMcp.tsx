'use client';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { create } from 'zustand';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';

/** Preview-only switch between the three MCP block layouts. */
export const MCP_VARIANTS = ['A 卡片', 'B 左右分栏', 'C 合并面板'] as const;
export const useMcpVariant = create<{ v: number; set: (v: number) => void }>((setState) => ({
  v: 0,
  set: (v) => setState({ v }),
}));

function useCopy(text: string) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.setTimeout(() => setDone(false), 1600);
    } catch {
      /* clipboard unavailable: leave the command selectable */
    }
  };
  return { done, copy };
}

/** The command with light shell colouring: tool in violet, flags in lavender. */
function Command({ cmd }: { cmd: string }) {
  return (
    <code className="font-mono text-sm leading-6 text-foreground/90">
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
        'inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground',
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

/** Terminal window: "bash" bar with copy, then the command. */
function Terminal({ cmd, className }: { cmd: string; className?: string }) {
  return (
    <div
      className={cn('overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0d]', className)}
    >
      <div className="flex h-9 items-center justify-between border-b border-white/[0.08] pl-4 pr-2">
        <span className="font-mono text-xs text-muted-foreground">bash</span>
        <CopyButton cmd={cmd} />
      </div>
      <div className="overflow-x-auto whitespace-pre px-4 py-4">
        <Command cmd={cmd} />
      </div>
    </div>
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

/**
 * MCP install block above the 应用案例 sub-block. Three layouts for review:
 * A — Meshy-style card: header row, terminal inside.
 * B — no outer card: copy on the left, terminal on the right with a soft glow.
 * C — one panel holding the command bar and the cases beneath a hairline.
 */
export function AgentMcp({ cases }: { cases: ReactNode }) {
  const t = useTranslations('site.agents.mcp');
  const v = useMcpVariant((s) => s.v);
  const cmd = t('command');

  if (v === 1)
    return (
      <>
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <p className="t-label font-mono text-primary">MCP</p>
            <h3 className="t-title mt-3 md:!text-2xl">{t('title')}</h3>
            <p className="t-desc mt-3 max-w-[30rem] text-pretty text-muted-foreground">
              {t('desc')}
            </p>
            <GuideLink className="mt-5" />
          </div>
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-[-20%_-10%] -z-10 [background:radial-gradient(50%_50%_at_50%_50%,rgba(110,98,163,0.22),transparent_70%)]"
            />
            <Terminal cmd={cmd} className="shadow-[0_30px_80px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
        <div className="mt-10 border-t pt-10 md:mt-12 md:pt-12">{cases}</div>
      </>
    );

  if (v === 2)
    return (
      <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0f0f12]">
        <div className="relative isolate p-6 md:p-10">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_120%_at_0%_0%,rgba(110,98,163,0.18),transparent_60%)]"
          />
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="t-title md:!text-2xl">{t('title')}</h3>
              <p className="t-desc mt-2 text-pretty text-muted-foreground">{t('desc')}</p>
            </div>
            <GuideLink className="shrink-0" />
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-btn-outer border border-white/10 bg-black/40 py-2 pl-4 pr-2">
            <div className="min-w-0 flex-1 overflow-x-auto whitespace-pre">
              <Command cmd={cmd} />
            </div>
            <CopyButton cmd={cmd} />
          </div>
        </div>
        <div className="border-t border-white/[0.08] p-6 md:p-10">{cases}</div>
      </div>
    );

  return (
    <>
      <div className="rounded-[20px] border border-white/[0.08] bg-[#111114] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="t-title md:!text-2xl">{t('title')}</h3>
            <p className="t-desc mt-2 text-pretty text-muted-foreground">{t('desc')}</p>
          </div>
          <GuideLink className="shrink-0 md:mt-1" />
        </div>
        <Terminal cmd={cmd} className="mt-6" />
      </div>
      <div className="mt-10 md:mt-12">{cases}</div>
    </>
  );
}
