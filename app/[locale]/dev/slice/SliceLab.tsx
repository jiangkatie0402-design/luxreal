'use client';
/* Dev-only page: copy is intentionally not localized. */
import { useRef, useState } from 'react';
import type * as THREE from 'three';
import { Asset } from '@/components/three/AssetLoader';
import { GenerationSlice } from '@/components/three/GenerationSlice';
import { ModelStage } from '@/components/three/ModelStage';
import { assets, type AssetId } from '@/config/assets';

function Subject({
  id,
  progress,
  axis,
  direction,
  particles,
  wire,
}: {
  id: AssetId;
  progress: number;
  axis: 'x' | 'y' | 'z';
  direction: 1 | -1;
  particles: boolean;
  wire: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  return (
    <>
      <Asset key={id} ref={ref} id={id} scale={1.2} />
      <GenerationSlice
        key={`s-${id}`}
        target={ref}
        progress={progress}
        axis={axis}
        direction={direction}
        showParticles={particles}
        showWireframe={wire}
      />
    </>
  );
}

export function SliceLab() {
  const [id, setId] = useState<AssetId>('dog');
  const [progress, setProgress] = useState(0.5);
  const [axis, setAxis] = useState<'x' | 'y' | 'z'>('y');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [particles, setParticles] = useState(true);
  const [wire, setWire] = useState(true);
  return (
    <div className="container-x grid gap-6 pb-10 pt-[calc(var(--header-h)+1.5rem)] lg:grid-cols-[1fr_300px]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-secondary">
        <ModelStage className="absolute inset-0" label="GenerationSlice test">
          <Subject
            id={id}
            progress={progress}
            axis={axis}
            direction={direction}
            particles={particles}
            wire={wire}
          />
        </ModelStage>
      </div>
      <form className="space-y-5 text-sm" onSubmit={(e) => e.preventDefault()}>
        <h1 className="font-display text-xl font-semibold">/dev/slice</h1>
        <label className="block">
          progress: {progress.toFixed(2)}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={progress}
            onChange={(e) => setProgress(+e.target.value)}
            className="mt-2 w-full accent-[var(--color-accent)]"
          />
        </label>
        <label className="block">
          asset
          <select
            value={id}
            onChange={(e) => setId(e.target.value as AssetId)}
            className="mt-2 w-full rounded-md border border-border bg-card p-2"
          >
            {Object.keys(assets).map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <label className="block">
          axis
          <select
            value={axis}
            onChange={(e) => setAxis(e.target.value as 'x' | 'y' | 'z')}
            className="mt-2 w-full rounded-md border border-border bg-card p-2"
          >
            <option>y</option>
            <option>x</option>
            <option>z</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={direction === -1}
            onChange={(e) => setDirection(e.target.checked ? -1 : 1)}
          />{' '}
          reverse direction
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={particles}
            onChange={(e) => setParticles(e.target.checked)}
          />{' '}
          particles
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={wire} onChange={(e) => setWire(e.target.checked)} />{' '}
          wireframe
        </label>
      </form>
    </div>
  );
}
