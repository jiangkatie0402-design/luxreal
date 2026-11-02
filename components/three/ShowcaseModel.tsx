'use client';
import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, type ReactNode } from 'react';
import type * as THREE from 'three';
import type { AssetId } from '@/config/assets';
import { usePerfStore } from '@/lib/perf';
import { useToken } from '@/lib/tokens';
import { Asset, type RenderMode } from './AssetLoader';

/** Camera + lights shared by thumbnails and hover previews, so they match exactly. */
export const SHOWCASE_CAMERA: [number, number, number] = [0, 0.3, 3.4];
export const SHOWCASE_FOV = 32;

export function ShowcaseRig({ children }: { children: ReactNode }) {
  const ground = useToken('--stage-ground', '#1b2945');
  const fill = useToken('--stage-fill', '#7fb0ff');
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={SHOWCASE_CAMERA}
        fov={SHOWCASE_FOV}
        onUpdate={(c) => c.lookAt(0, 0, 0)}
      />
      <hemisphereLight args={['#ffffff', ground, 1]} />
      <directionalLight position={[3, 5, 3]} intensity={1.6} />
      <directionalLight position={[-3, 2, -2]} intensity={0.9} color={fill} />
      {children}
    </>
  );
}

/** Centered, fitted model that turns slowly (faster when `active`). */
export function ShowcaseModel({
  asset,
  yaw = 0,
  active = false,
  spin = true,
  mode = 'pbr',
  fit = 1.45,
}: {
  asset: AssetId;
  yaw?: number;
  active?: boolean;
  spin?: boolean;
  mode?: RenderMode;
  fit?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const reduced = usePerfStore((s) => s.reducedMotion);
  useFrame((_, dt) => {
    if (!ref.current || reduced || !spin) return;
    ref.current.rotation.y += dt * (active ? 1.4 : 0.25);
  });
  return (
    <group rotation={[0.18, 0, 0]}>
      <group ref={ref} rotation={[0, yaw, 0]}>
        <Asset id={asset} fit={fit} center mode={mode} />
      </group>
    </group>
  );
}
