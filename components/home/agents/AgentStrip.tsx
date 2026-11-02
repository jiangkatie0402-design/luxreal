'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const CMD = 'npx add-mcp @lux3d/mcp-server --env LUX3D_API_KEY=lux_YOUR_API_KEY';
const CLIENTS = ['Claude Code', 'Cursor', 'Codex'];

/** Slim, highlighted MCP one-liner between two homepage sections; links to the full agent section. */
export function AgentStrip() {
  const t = useTranslations('home.agentStrip');
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CMD);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <section
      aria-labelledby="agent-strip-title"
      className="bg-[#03060d] px-4 py-10 md:px-8 md:py-14"
    >
      {/* gradient hairline border */}
      <div className="agent-strip relative mx-auto max-w-[1180px] rounded-[22px] p-px">
        <div className="relative flex flex-col gap-5 overflow-hidden rounded-[21px] bg-[#070c18] px-5 py-5 md:flex-row md:items-center md:gap-8 md:px-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 top-1/2 size-48 -translate-y-1/2 rounded-full bg-[#4d8dff]/20 blur-3xl"
          />
          <div className="relative flex min-w-0 items-center gap-4 md:w-[38%]">
            <span
              aria-hidden
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#5ea8ff]/40 bg-[#5ea8ff]/10 text-[#9cc8ff]"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="7" width="16" height="12" rx="3" />
                <path d="M12 3v4M9 12h.01M15 12h.01M9.5 15.5h5" />
              </svg>
            </span>
            <div className="min-w-0">
              <h2 id="agent-strip-title" className="text-base font-semibold text-white md:text-lg">
                {t('title')}
              </h2>
              <p className="mt-0.5 truncate text-sm text-white/55">
                {t('sub')} <span className="text-white/75">{CLIENTS.join(' · ')}</span>
              </p>
            </div>
          </div>

          <div className="relative flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/40 py-1.5 pl-4 pr-1.5">
            <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-white/85">
              <span className="select-none text-white/35">$ </span>
              <span className="text-[#7fe0b0]">npx</span> add-mcp @lux3d/mcp-server{' '}
              <span className="text-[#7fb6ff]">--env</span>{' '}
              <span className="text-[#ffd27a]">LUX3D_API_KEY=lux_YOUR_API_KEY</span>
            </code>
            <button
              type="button"
              onClick={copy}
              className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/20"
            >
              {copied ? t('copied') : t('copy')}
            </button>
          </div>

          <a
            href="#agents-title"
            className="relative shrink-0 text-sm text-[#9cc8ff] underline-offset-4 hover:text-white hover:underline"
          >
            {t('more')} →
          </a>
        </div>
      </div>
    </section>
  );
}
