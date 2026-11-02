'use client';
/* Imperative per-frame animation of scene-graph nodes. */
/* eslint-disable react-hooks/immutability */
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { usePerfStore } from '@/lib/perf';
import { useToken } from '@/lib/tokens';
import { Asset } from './AssetLoader';

const LIMBS = ['head', 'tail', 'leg0', 'leg1', 'leg2', 'leg3'];

/**
 * Placeholder rigging demo for the dog: bones drawn from the body to each limb,
 * visible through the mesh, while a simple walk cycle drives the named parts.
 * Replaced by the real skinned glTF + animation clips later.
 */
export function RigPreview({ walk = true, fit = 1.45 }: { walk?: boolean; fit?: number }) {
  const ref = useRef<THREE.Group>(null);
  const reduced = usePerfStore((s) => s.reducedMotion);
  const color = useToken('--color-accent', '#4d8dff');
  const nodes = useRef<Record<string, THREE.Object3D> | null>(null);
  const base = useRef<Record<string, THREE.Euler>>({});
  const { lines, joints } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(LIMBS.length * 6), 3));
    const jgeo = new THREE.BufferGeometry();
    jgeo.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array((LIMBS.length + 1) * 3), 3),
    );
    const lines = new THREE.LineSegments(
      geo,
      new THREE.LineBasicMaterial({ depthTest: false, transparent: true }),
    );
    const joints = new THREE.Points(
      jgeo,
      new THREE.PointsMaterial({ size: 0.07, depthTest: false, transparent: true }),
    );
    lines.renderOrder = joints.renderOrder = 10;
    lines.frustumCulled = joints.frustumCulled = false;
    return { lines, joints };
  }, []);
  (lines.material as THREE.LineBasicMaterial).color.set(color);
  (joints.material as THREE.PointsMaterial).color.set(color);

  const v = useMemo(() => new THREE.Vector3(), []);
  const c = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const root = ref.current;
    if (!root) return;
    if (!nodes.current) {
      const found: Record<string, THREE.Object3D> = {};
      root.traverse((o) => {
        if ([...LIMBS, 'body'].includes(o.name)) found[o.name] = o;
      });
      if (!found.body) return;
      nodes.current = found;
      for (const [k, o] of Object.entries(found)) base.current[k] = o.rotation.clone();
    }
    const n = nodes.current;
    const t = walk && !reduced ? clock.elapsedTime * 5 : 0;
    if (n.tail) n.tail.rotation.x = base.current.tail.x + Math.sin(t * 1.6) * 0.5;
    if (n.head) n.head.rotation.z = base.current.head.z + Math.sin(t * 0.5) * 0.08;
    for (let i = 0; i < 4; i++) {
      const leg = n[`leg${i}`];
      if (leg)
        leg.rotation.z =
          base.current[`leg${i}`].z + Math.sin(t + (i % 2 === i >> 1 ? 0 : Math.PI)) * 0.35;
    }
    // Bones: body centre → each limb, in this group's parent space.
    const parent = lines.parent!;
    n.body.getWorldPosition(c);
    parent.worldToLocal(c);
    const lp = lines.geometry.attributes.position as THREE.BufferAttribute;
    const jp = joints.geometry.attributes.position as THREE.BufferAttribute;
    jp.setXYZ(0, c.x, c.y, c.z);
    LIMBS.forEach((name, i) => {
      const o = n[name];
      if (!o) return;
      o.getWorldPosition(v);
      parent.worldToLocal(v);
      lp.setXYZ(i * 2, c.x, c.y, c.z);
      lp.setXYZ(i * 2 + 1, v.x, v.y, v.z);
      jp.setXYZ(i + 1, v.x, v.y, v.z);
    });
    lp.needsUpdate = jp.needsUpdate = true;
  });

  return (
    <group>
      <Asset ref={ref} id="dog" fit={fit} center mode="clay" />
      <primitive object={lines} />
      <primitive object={joints} />
    </group>
  );
}
