'use client';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { AssetId } from '@/config/assets';
import { Asset } from './AssetLoader';

/** Moves each mesh outward from the model centre — a placeholder for Auto Split. */
export function ExplodeModel({
  asset,
  exploded,
  yaw = 0.5,
}: {
  asset: AssetId;
  exploded: boolean;
  yaw?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const parts = useRef<{ mesh: THREE.Object3D; base: THREE.Vector3; dir: THREE.Vector3 }[] | null>(
    null,
  );
  const amount = useRef(0);
  useFrame((_, dt) => {
    const root = ref.current;
    if (!root) return;
    if (!parts.current) {
      const meshes: THREE.Mesh[] = [];
      root.traverse(
        (o) => (o as THREE.Mesh).isMesh && !o.userData.helper && meshes.push(o as THREE.Mesh),
      );
      if (!meshes.length) return;
      const center = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());
      parts.current = meshes.map((m) => {
        const wp = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());
        const dir = wp.sub(center);
        if (dir.lengthSq() < 1e-4) dir.set(0, 1, 0);
        // direction expressed in the mesh parent's local space
        const local = m.parent!.worldToLocal(
          m.getWorldPosition(new THREE.Vector3()).add(dir.normalize()),
        );
        return { mesh: m, base: m.position.clone(), dir: local.sub(m.position).normalize() };
      });
    }
    amount.current = THREE.MathUtils.damp(amount.current, exploded ? 1 : 0, 6, dt);
    for (const p of parts.current)
      p.mesh.position.copy(p.base).addScaledVector(p.dir, amount.current * 0.18);
  });
  return (
    <group rotation={[0.18, yaw, 0]}>
      <Asset ref={ref} id={asset} fit={1.15} center />
    </group>
  );
}
