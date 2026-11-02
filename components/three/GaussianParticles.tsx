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
  const weights = meshes.map((m) => m.geometry.attributes.position.count);
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const v = new THREE.Vector3();
  const color = new THREE.Color();
  const colors = palette.map((p) => new THREE.Color(p));
  for (let i = 0; i < count; i++) {
    let r = Math.random() * total;
    let mi = 0;
    while (r > weights[mi] && mi < meshes.length - 1) r -= weights[mi++];
    const m = meshes[mi];
    const attr = m.geometry.attributes.position;
    v.fromBufferAttribute(attr, Math.floor(Math.random() * attr.count));
    m.localToWorld(v);
    root.worldToLocal(v);
    v.x += (Math.random() - 0.5) * 0.06;
    v.y += (Math.random() - 0.5) * 0.06;
    v.z += (Math.random() - 0.5) * 0.06;
    v.toArray(pos, i * 3);
    color.copy(colors[i % colors.length] ?? color.set('#6cb6ff'));
    color.toArray(col, i * 3);
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
