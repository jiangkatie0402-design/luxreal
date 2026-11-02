'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { usePerfStore } from '@/lib/perf';

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });

interface Labels {
  stageLabel: string;
  generating: string;
  done: string;
  chipInput: string;
  chipFaces: string;
  chipMaterial: string;
}

/** Static poster renders first; the 3D scene fades in over it when ready. */
export function HeroStage({ labels }: { labels: Labels }) {
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const tier = usePerfStore((s) => s.tier);
  const perfReady = usePerfStore((s) => s.ready);
  const use3d = !(perfReady && tier === 'low');

  return (
    <div className="relative h-full min-h-[360px] w-full">
      <Poster visible={!ready || !use3d} />
      {use3d && (
        <div
          className="absolute inset-0 transition-opacity duration-[var(--dur-slow)]"
          style={{ opacity: ready ? 1 : 0 }}
        >
          <HeroScene
            label={labels.stageLabel}
            onStatus={(d) => {
              setReady(true);
              setDone(d);
            }}
          />
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-4 bottom-6 flex flex-wrap justify-center gap-2 text-xs md:bottom-10">
        <Chip>
          <span
            className={`size-1.5 rounded-full ${done ? 'bg-[#3fae6a]' : 'animate-pulse bg-accent'}`}
            aria-hidden
          />
          <span aria-live="polite">{done ? labels.done : labels.generating}</span>
        </Chip>
        <Chip>{labels.chipInput}</Chip>
        <Chip>{labels.chipFaces}</Chip>
        <Chip>{labels.chipMaterial}</Chip>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-3 py-1.5 text-muted backdrop-blur-sm">
      {children}
    </span>
  );
}

function Poster({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 grid place-items-center transition-opacity duration-[var(--dur-slow)]"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <svg viewBox="0 0 400 300" className="w-[70%] max-w-[480px] text-subtle">
        <ellipse cx="200" cy="250" rx="150" ry="26" fill="var(--color-stage-floor)" />
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M120 200c0-34 30-56 80-56s70 18 82 30" />
          <circle cx="292" cy="140" r="38" />
          <path d="M270 110l-8-30 26 20M312 108l12-28 4 32" />
          <path d="M140 205v38M170 210v34M240 210v34M268 205v38" />
          <path d="M120 190c-18-8-28-24-26-40" />
        </g>
        <line x1="60" y1="170" x2="340" y2="170" stroke="var(--slice-color)" strokeWidth="2.5" />
      </svg>
    </div>
  );
}
