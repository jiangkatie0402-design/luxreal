'use client';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

let softSprite: THREE.Texture | null = null;
/** Soft round gaussian-ish sprite, generated once. */
export function getSoftSprite() {
  if (softSprite || typeof document === 'undefined') return softSprite;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  softSprite = new THREE.CanvasTexture(c);
  softSprite.colorSpace = THREE.SRGBColorSpace;
  return softSprite;
}

export interface ParticleCloud {
  points: THREE.Points;
  base: Float32Array;
  phase: Float32Array;
}

/**
 * Sample points from the surface vertices of `meshes`, expressed in `root` local space.
 * Colors come from the token palette — soft and warm, not cold point-cloud blue.
 */
export function createParticleCloud(
  root: THREE.Object3D,
  meshes: THREE.Mesh[],
  count: number,
  palette: string[],
  size = 0.05,
): ParticleCloud {
  root.updateWorldMatrix(true, true);
  // Area-weighted sampling over every triangle (in root-local space), so flat
  // low-poly faces get covered evenly instead of particles bunching at corners.
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const tris: number[] = [];
  const cum: number[] = [];
  let total = 0;
  const a = new THREE.Vector3(),
    b = new THREE.Vector3(),
    c = new THREE.Vector3();
  const ab = new THREE.Vector3(),
    ac = new THREE.Vector3();
  for (const m of meshes) {
    const pos = m.geometry.attributes.position;
    const idx = m.geometry.index;
    const toLocal = new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld);
    const n = idx ? idx.count : pos.count;
    for (let i = 0; i + 2 < n; i += 3) {
      const i0 = idx ? idx.getX(i) : i,
        i1 = idx ? idx.getX(i + 1) : i + 1,
        i2 = idx ? idx.getX(i + 2) : i + 2;
      a.fromBufferAttribute(pos, i0).applyMatrix4(toLocal);
      b.fromBufferAttribute(pos, i1).applyMatrix4(toLocal);
      c.fromBufferAttribute(pos, i2).applyMatrix4(toLocal);
      const area = ab.subVectors(b, a).cross(ac.subVectors(c, a)).length() / 2;
      if (area <= 0) continue;
      tris.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
      total += area;
      cum.push(total);
    }
  }
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const colors = palette.map((p) => new THREE.Color(p));
  const fallback = new THREE.Color('#6cb6ff');
  for (let i = 0; i < count; i++) {
    let x = 0,
      y = 0,
      z = 0;
    if (cum.length) {
      const r = Math.random() * total;
      let lo = 0,
        hi = cum.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] < r) lo = mid + 1;
        else hi = mid;
      }
      let u = Math.random(),
        v = Math.random();
      if (u + v > 1) {
        u = 1 - u;
        v = 1 - v;
      }
      const k = lo * 9;
      for (let d = 0; d < 3; d++) {
        const val =
          tris[k + d] + (tris[k + 3 + d] - tris[k + d]) * u + (tris[k + 6 + d] - tris[k + d]) * v;
        if (d === 0) x = val;
        else if (d === 1) y = val;
        else z = val;
      }
    }
    pos[i * 3] = x + (Math.random() - 0.5) * 0.04;
    pos[i * 3 + 1] = y + (Math.random() - 0.5) * 0.04;
    pos[i * 3 + 2] = z + (Math.random() - 0.5) * 0.04;
    (colors[i % colors.length] ?? fallback).toArray(col, i * 3);
    phase[i] = Math.random() * Math.PI * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos.slice(), 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const material = new THREE.PointsMaterial({
    size,
    map: getSoftSprite(),
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    opacity: 0.85,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, material);
  points.userData.helper = true;
  points.frustumCulled = false;
  return { points, base: pos, phase };
}

/** Gentle float + pull toward a plane coordinate along `axis` (index 0/1/2). */
export function animateParticleCloud(
  cloud: ParticleCloud,
  t: number,
  axis: number,
  target: number | null,
  pull: number,
) {
  const attr = cloud.points.geometry.attributes.position as THREE.BufferAttribute;
  const arr = attr.array as Float32Array;
  const { base, phase } = cloud;
  for (let i = 0; i < phase.length; i++) {
    const k = i * 3;
    const ph = phase[i];
    arr[k] = base[k] + Math.sin(t * 0.9 + ph) * 0.015;
    arr[k + 1] = base[k + 1] + Math.sin(t * 1.3 + ph * 1.7) * 0.02;
    arr[k + 2] = base[k + 2] + Math.cos(t * 1.1 + ph) * 0.015;
    if (target !== null) arr[k + axis] += (target - arr[k + axis]) * pull;
  }
  attr.needsUpdate = true;
}

/** Stand-alone particle layer for decorative use. */
export function GaussianParticles({
  count = 400,
  radius = 2,
  palette,
}: {
  count?: number;
  radius?: number;
  palette: string[];
}) {
  const cloud = useMemo(() => {
    const dummy = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 16));
    const root = new THREE.Group();
    root.add(dummy);
    return createParticleCloud(root, [dummy], count, palette, 0.06);
  }, [count, radius, palette]);
  useEffect(() => () => cloud.points.geometry.dispose(), [cloud]);
  useFrame(({ clock }) => animateParticleCloud(cloud, clock.elapsedTime, 1, null, 0));
  return <primitive object={cloud.points} />;
}
