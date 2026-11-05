'use client';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';

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

/** MCP install block, then the 应用案例 sub-block. */
export function AgentMcp({ cases }: { cases: ReactNode }) {
  const t = useTranslations('site.agents.mcp');
  const cmd = t('command');
  return (
    <>
      <Strip cmd={cmd} />
      <div className="mt-14 border-t pt-12 md:mt-16 md:pt-14">{cases}</div>
    </>
  );
}
