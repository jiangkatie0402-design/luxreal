'use client';
import { useState } from 'react';
import { Asset, type RenderMode } from '@/components/three/AssetLoader';
import { ModelStage } from '@/components/three/ModelStage';

const MODES: RenderMode[] = ['clay', 'wireframe', 'pbr'];

export function HowViewer({
  labels,
  groupLabel,
  stageLabel,
}: {
  labels: Record<RenderMode, string>;
  groupLabel: string;
  stageLabel: string;
}) {
  const [mode, setMode] = useState<RenderMode>('pbr');
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-surface-2 lg:aspect-auto lg:h-full lg:min-h-[480px]">
      <ModelStage
        className="absolute inset-0"
        autoRotate
        label={stageLabel}
        fallback={<div className="h-full" />}
      >
        <Asset id="dog" mode={mode} scale={1.1} />
      </ModelStage>
      <div
        role="group"
        aria-label={groupLabel}
        className="absolute left-1/2 top-4 flex -translate-x-1/2 rounded-full border border-line bg-surface/85 p-1 text-sm backdrop-blur-sm"
      >
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={`rounded-full px-3.5 py-1.5 transition-colors ${mode === m ? 'bg-accent text-on-accent' : 'text-muted hover:text-text'}`}
          >
            {labels[m]}
          </button>
        ))}
      </div>
    </div>
  );
}
