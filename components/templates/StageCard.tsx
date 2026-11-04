'use client';
import { Asset } from '@/components/three/AssetLoader';
import { ModelStage } from '@/components/three/ModelStage';
import type { AssetId } from '@/config/assets';

/** Rotatable model in a framed card; used by page heroes and detail pages. */
export function StageCard({
  asset,
  label,
  className = 'aspect-[4/3]',
}: {
  asset: AssetId;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border bg-secondary ${className}`}
    >
      <ModelStage
        className="absolute inset-0"
        autoRotate
        label={label}
        fallback={<div className="h-full" />}
      >
        <Asset id={asset} />
      </ModelStage>
    </div>
  );
}
