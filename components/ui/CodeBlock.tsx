'use client';
import { useState } from 'react';

export interface CodeSample {
  lang: string;
  label: string;
  code: string;
}

/** Code block with language tabs and one-click copy. */
export function CodeBlock({
  samples,
  copyLabel,
  copiedLabel,
}: {
  samples: CodeSample[];
  copyLabel: string;
  copiedLabel: string;
}) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const sample = samples[active];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sample.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface-2">
      <div className="flex items-center justify-between border-b border-line px-2">
        <div role="tablist" className="flex">
          {samples.map((s, i) => (
            <button
              key={s.lang}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`px-3 py-2.5 text-sm ${i === active ? 'text-text' : 'text-subtle hover:text-muted'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button onClick={copy} className="px-3 py-1.5 text-xs text-muted hover:text-text">
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
        <code>{sample.code}</code>
      </pre>
    </div>
  );
}
