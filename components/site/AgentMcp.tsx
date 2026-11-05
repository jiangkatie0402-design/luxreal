'use client';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
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

/**
 * MCP install, hung off the orbit above by a thin light line: a short heading,
 * the command bar with light travelling round its border, then clients + guide.
 */
function GlowBar({ cmd }: { cmd: string }) {
  const t = useTranslations('site.agents.mcp');
  return (
    <div className="flex flex-col items-center text-center">
      <span
        aria-hidden
        className="h-14 w-px bg-[linear-gradient(to_bottom,transparent,rgba(196,186,255,0.6))]"
      />
      <h3 className="mt-5 text-lg font-semibold">{t('title')}</h3>
      <p className="t-desc mt-2 max-w-2xl text-pretty text-muted-foreground">{t('desc')}</p>

      <div className="mcp-glow mt-6 w-full max-w-[720px] rounded-[16px] p-px shadow-[0_0_40px_rgba(110,98,163,0.18)]">
        <div className="flex items-center gap-3 rounded-[15px] bg-[#0b0b0e] py-2.5 pl-5 pr-2.5">
          <div className="min-w-0 flex-1 overflow-x-auto whitespace-pre text-left">
            <Command cmd={cmd} />
          </div>
          <CopyButton cmd={cmd} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        {[...CLIENTS, t('anyClient')].map((c, i) => (
          <span key={c} className="flex items-center gap-3">
            {i > 0 && <span aria-hidden className="size-1 rounded-full bg-white/20" />}
            {c}
          </span>
        ))}
        <span aria-hidden className="mx-2 h-3 w-px bg-white/15" />
        <GuideLink />
      </div>
    </div>
  );
}

/** MCP install block, then the 应用案例 sub-block. */
export function AgentMcp({ cases }: { cases: ReactNode }) {
  const t = useTranslations('site.agents.mcp');
  return (
    <>
      <GlowBar cmd={t('command')} />
      <div className="mt-14 border-t pt-12 md:mt-16 md:pt-14">{cases}</div>
    </>
  );
}
