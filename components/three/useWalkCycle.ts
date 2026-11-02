'use client';
/* Imperative per-frame animation of named scene-graph nodes. */
import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type * as THREE from 'three';
import { usePerfStore } from '@/lib/perf';

const PARTS = ['head', 'tail', 'leg0', 'leg1', 'leg2', 'leg3', 'body'];

/**
 * Drives the placeholder dog's named parts: tail wag, head bob and, when `legs`
 * is on, a trot. Replaced by real animation clips once the rigged glTF lands.
 */
export function useWalkCycle(
  root: RefObject<THREE.Object3D | null>,
  {
    legs = true,
    speed = 5,
    headTilt = 0,
  }: { legs?: boolean; speed?: number; headTilt?: number } = {},
) {
  const nodes = useRef<Record<string, THREE.Object3D> | null>(null);
  const base = useRef<Record<string, THREE.Euler>>({});
  const reduced = usePerfStore((s) => s.reducedMotion);
  useFrame(({ clock }) => {
    const r = root.current;
    if (!r) return;
    if (!nodes.current) {
      const found: Record<string, THREE.Object3D> = {};
      r.traverse((o) => {
        if (PARTS.includes(o.name)) found[o.name] = o;
      });
      if (!found.body) return;
      nodes.current = found;
      for (const [k, o] of Object.entries(found)) base.current[k] = o.rotation.clone();
    }
    const n = nodes.current;
    const t = reduced ? 0 : clock.elapsedTime * speed;
    if (n.tail) n.tail.rotation.x = base.current.tail.x + Math.sin(t * 1.6) * 0.5;
    if (n.head) {
      n.head.rotation.z = base.current.head.z + Math.sin(t * 0.5) * 0.08;
      n.head.rotation.x = base.current.head.x + headTilt;
    }
    for (let i = 0; i < 4; i++) {
      const leg = n[`leg${i}`];
      if (!leg) continue;
      const phase = i === 0 || i === 3 ? 0 : Math.PI;
      leg.rotation.z = base.current[`leg${i}`].z + (legs ? Math.sin(t + phase) * 0.4 : 0);
    }
  });
  return nodes;
}
