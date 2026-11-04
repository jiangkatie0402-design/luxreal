'use client';
import { View } from '@react-three/drei';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type * as THREE from 'three';
import { Asset, type RenderMode } from '@/components/three/AssetLoader';
import { ExplodeModel } from '@/components/three/ExplodeModel';
import { GenerationSlice } from '@/components/three/GenerationSlice';
import { RigPreview } from '@/components/three/RigPreview';
import { ShowcaseModel, ShowcaseRig } from '@/components/three/ShowcaseModel';
import { useViews3d } from '@/components/three/ViewCanvas';
import type { AssetId } from '@/config/assets';
import { galleryItems, thumbSrc } from '@/config/gallery';
import type { EvidenceVisual as Visual } from '@/config/scenarios';
import { usePerfStore } from '@/lib/perf';

const thumbFor = (asset: AssetId) =>
  `gallery-${galleryItems.find((g) => g.asset === asset)?.id ?? 'corgi'}`;

/** Live 3D in the shared canvas, or the pre-rendered thumbnail when 3D is off. */
function Stage({ asset, children }: { asset: AssetId; children: ReactNode }) {
  const can3d = useViews3d();
  return can3d ? (
    <View className="absolute inset-0">
      <ShowcaseRig>{children}</ShowcaseRig>
    </View>
  ) : (
    <Image
      src={thumbSrc(thumbFor(asset))}
      alt=""
      fill
      sizes="400px"
      className="object-contain p-6"
    />
  );
}

/** Cycles through values on a timer until the viewer picks one. */
function useCycle<T>(values: T[], ms: number) {
  const [i, setI] = useState(0);
  const [manual, setManual] = useState(false);
  const reduced = usePerfStore((s) => s.reducedMotion);
  useEffect(() => {
    if (manual || reduced) return;
    const id = setInterval(() => setI((n) => (n + 1) % values.length), ms);
    return () => clearInterval(id);
  }, [manual, reduced, values.length, ms]);
  const pick = (v: number) => {
    setManual(true);
    setI(v);
  };
  return [values[i], pick] as const;
}

const chip =
  'z-30 rounded-full border border-border bg-card/85 px-2.5 py-1 text-[11px] backdrop-blur-sm';

export function EvidenceVisual({ visual }: { visual: Visual }) {
  const t = useTranslations('home.scenarios.labels');
  switch (visual.kind) {
    case 'printability':
      return (
        <>
          <Stage asset={visual.asset}>
            <ShowcaseModel asset={visual.asset} fit={1.15} />
          </Stage>
          <dl className="absolute right-3 top-3 z-30 w-48 rounded-md border border-border bg-background/85 p-3 text-xs backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between border-b border-border pb-2 font-medium">
              <dt>{t('printability')}</dt>
              <dd className="text-[var(--scene)]" aria-label={t('yes')}>
                ✓
              </dd>
            </div>
            {(
              [
                ['watertight', t('yes')],
                ['volume', visual.volume],
                ['holes', '0'],
                ['nonManifold', '0'],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="flex justify-between py-0.5">
                <dt className="text-subtle">{t(k)}</dt>
                <dd className="font-mono text-[var(--scene)] tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </>
      );
    case 'split':
      return <SplitVisual asset={visual.asset} />;
    case 'channels':
      return <ChannelsVisual asset={visual.asset} />;
    case 'rig':
      return (
        <>
          <Stage asset="dog">
            <RigPreview fit={1.2} />
          </Stage>
          <span className={`absolute bottom-3 right-3 font-mono text-muted-foreground ${chip}`}>
            walk_cycle · 24 bones
          </span>
        </>
      );
    case 'compare':
      return <CompareVisual asset={visual.asset} />;
    case 'turntable':
      return (
        <>
          <Stage asset={visual.asset}>
            <ShowcaseModel asset={visual.asset} fit={1.15} active />
          </Stage>
          <div className="absolute bottom-3 left-3 z-30 flex gap-1.5">
            {visual.chips.map((c) => (
              <span key={c} className={`font-mono text-muted-foreground ${chip}`}>
                {c}
              </span>
            ))}
          </div>
        </>
      );
    case 'batch':
      return (
        <div className="absolute inset-0 flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-muted-foreground">{t('batchJob')}</span>
            <span className="font-mono text-[var(--scene)] tabular-nums">1,200 / 1,200 ✓</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-full rounded-full bg-[var(--scene)]" />
          </div>
          <ul className="grid flex-1 grid-cols-4 gap-2">
            {visual.thumbs.map((k) => (
              <li key={k} className="relative rounded border border-border bg-secondary">
                <Image src={thumbSrc(k)} alt="" fill sizes="80px" className="object-contain p-1" />
              </li>
            ))}
          </ul>
        </div>
      );
    case 'gaussian':
      return <GaussianVisual asset={visual.asset} />;
  }
}

function SplitVisual({ asset }: { asset: AssetId }) {
  const t = useTranslations('home.scenarios.labels');
  const [exploded, pick] = useCycle([false, true], 2400);
  return (
    <>
      <Stage asset={asset}>
        <ExplodeModel asset={asset} exploded={exploded} />
      </Stage>
      <button
        type="button"
        role="switch"
        aria-checked={exploded}
        onClick={() => pick(exploded ? 0 : 1)}
        className={`absolute right-3 top-3 flex items-center gap-2 text-muted-foreground ${chip}`}
      >
        {t('autoSplit')}
        <span
          className={`relative h-3.5 w-6 rounded-full transition-colors ${exploded ? 'bg-[var(--scene)]' : 'bg-border-strong'}`}
        >
          <span
            className={`absolute top-0.5 size-2.5 rounded-full bg-background transition-[left] ${exploded ? 'left-3' : 'left-0.5'}`}
          />
        </span>
      </button>
    </>
  );
}

const CHANNELS: RenderMode[] = ['albedo', 'normal', 'roughness', 'metalness', 'pbr'];

function ChannelsVisual({ asset }: { asset: AssetId }) {
  const t = useTranslations('home.scenarios.labels');
  const [mode, pick] = useCycle(CHANNELS, 1600);
  return (
    <>
      <Stage asset={asset}>
        <ShowcaseModel asset={asset} mode={mode} yaw={0.6} fit={1.15} />
      </Stage>
      <div
        role="group"
        aria-label={t('channels')}
        className="absolute inset-x-3 bottom-3 z-30 flex flex-wrap gap-1.5"
      >
        {CHANNELS.map((c, i) => (
          <button
            key={c}
            type="button"
            aria-pressed={mode === c}
            onClick={() => pick(i)}
            className={`${chip} ${mode === c ? '!border-[var(--scene)] text-foreground' : 'text-subtle'}`}
          >
            {t(`channel.${c}`)}
          </button>
        ))}
      </div>
    </>
  );
}

function CompareModel({ asset, progress }: { asset: AssetId; progress: number }) {
  const ref = useRef<THREE.Group>(null);
  return (
    <>
      <group rotation={[0.18, 0.5, 0]}>
        <Asset ref={ref} id={asset} fit={1.2} center />
      </group>
      <GenerationSlice target={ref} progress={progress} axis="x" showParticles={false} />
    </>
  );
}

function CompareVisual({ asset }: { asset: AssetId }) {
  const t = useTranslations('home.scenarios.labels');
  const [p, setP] = useState(0.5);
  return (
    <>
      <Stage asset={asset}>
        <CompareModel asset={asset} progress={p} />
      </Stage>
      <span className={`absolute left-3 top-3 text-muted-foreground ${chip}`}>
        {t('compareLeft')}
      </span>
      <span className={`absolute right-3 top-3 text-muted-foreground ${chip}`}>
        {t('compareRight')}
      </span>
      <label className="absolute inset-x-6 bottom-3 z-30 flex items-center gap-2 text-[11px] text-subtle">
        <span className="sr-only">{t('compareDrag')}</span>
        <input
          type="range"
          min={0.05}
          max={0.95}
          step={0.01}
          value={p}
          onChange={(e) => setP(+e.target.value)}
          className="w-full accent-[var(--scene)]"
        />
      </label>
    </>
  );
}

function GaussianModel({ asset }: { asset: AssetId }) {
  const ref = useRef<THREE.Group>(null);
  return (
    <>
      <group rotation={[0.18, 0, 0]}>
        <Asset ref={ref} id={asset} fit={1.2} center />
      </group>
      <GenerationSlice
        target={ref}
        progress={0}
        showWireframe={false}
        showPlane={false}
        particleCount={3500}
      />
    </>
  );
}

function GaussianVisual({ asset }: { asset: AssetId }) {
  const t = useTranslations('home.scenarios.labels');
  return (
    <>
      <Stage asset={asset}>
        <GaussianModel asset={asset} />
      </Stage>
      <span className={`absolute bottom-3 left-3 font-mono text-muted-foreground ${chip}`}>
        {t('gaussian')}
      </span>
    </>
  );
}
