import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Stylized low-poly world pieces for the homepage hero. Each builder returns a
 * Group standing on y = 0, centred on x/z. Named nodes ('swingSeat', 'blades')
 * are animated by the scene.
 */

type V3 = [number, number, number];
const UP = new THREE.Vector3(0, 1, 0);

const mat = (color: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.78, ...o });
const glow = (color = '#ffd27a') =>
  new THREE.MeshStandardMaterial({
    color,
    emissive: '#ffb347',
    emissiveIntensity: 1.6,
    roughness: 0.4,
  });
const rbox = (w: number, h: number, d: number, r = 0.05) =>
  new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));

function add(
  g: THREE.Object3D,
  geo: THREE.BufferGeometry,
  m: THREE.Material,
  p: V3 = [0, 0, 0],
  r: V3 = [0, 0, 0],
) {
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.set(...p);
  mesh.rotation.set(...r);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);
  return mesh;
}

/** A cylinder from a to b. */
function beam(g: THREE.Object3D, a: V3, b: V3, r: number, m: THREE.Material) {
  const va = new THREE.Vector3(...a),
    vb = new THREE.Vector3(...b);
  const dir = vb.clone().sub(va);
  const mesh = add(g, new THREE.CylinderGeometry(r, r, dir.length(), 8), m);
  mesh.position.copy(va).add(vb).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
  return mesh;
}

/** Triangular prism roof, ridge along x. */
function gable(w: number, h: number, d: number) {
  const s = new THREE.Shape();
  s.moveTo(-d / 2, 0);
  s.lineTo(d / 2, 0);
  s.lineTo(0, h);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false });
  geo.translate(0, 0, -w / 2);
  geo.rotateY(Math.PI / 2);
  return geo;
}

/** Deterministic pseudo-random for stable layouts. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function house(o: {
  w?: number;
  d?: number;
  h?: number;
  wall: string;
  roof: string;
  chimney?: boolean;
  windows?: boolean;
}) {
  const { w = 1.4, d = 1.1, h = 1.0, wall, roof, chimney = true, windows = true } = o;
  const g = new THREE.Group();
  const roofH = h * 0.62;
  add(g, rbox(w, h, d, 0.06), mat(wall), [0, h / 2, 0]);
  add(g, gable(w + 0.18, roofH, d + 0.26), mat(roof, { roughness: 0.6, flatShading: true }), [
    0,
    h,
    0,
  ]);
  add(g, rbox(w + 0.06, 0.06, d + 0.06, 0.02), mat('#e8e0d2'), [0, h + 0.01, 0]);
  const door = mat('#6b4428');
  add(g, rbox(0.3, h * 0.52, 0.06, 0.03), door, [0, h * 0.26, d / 2 + 0.01]);
  add(g, rbox(w * 0.5, 0.06, 0.28, 0.02), mat('#cfc6b6'), [0, 0.03, d / 2 + 0.16]);
  if (windows) {
    for (const x of [-w * 0.3, w * 0.3])
      add(g, rbox(0.24, 0.24, 0.05, 0.02), glow(), [x, h * 0.6, d / 2 + 0.01]);
    for (const z of [-d * 0.2, d * 0.2])
      add(g, rbox(0.05, 0.22, 0.2, 0.02), glow(), [w / 2 + 0.01, h * 0.6, z]);
  }
  if (chimney)
    add(g, rbox(0.2, 0.5, 0.2, 0.03), mat('#9b5a43'), [w * 0.26, h + roofH * 0.55, -d * 0.12]);
  return g;
}

export function doghouse() {
  const g = new THREE.Group();
  add(g, rbox(0.8, 0.55, 0.7, 0.05), mat('#d9a066'), [0, 0.275, 0]);
  add(
    g,
    gable(0.92, 0.38, 0.92),
    mat('#c0392b', { flatShading: true, roughness: 0.6 }),
    [0, 0.55, 0],
  );
  const arch = new THREE.Shape();
  arch.moveTo(-0.16, 0);
  arch.lineTo(-0.16, 0.2);
  arch.absarc(0, 0.2, 0.16, Math.PI, 0, true);
  arch.lineTo(0.16, 0);
  arch.closePath();
  const geo = new THREE.ExtrudeGeometry(arch, { depth: 0.02, bevelEnabled: false });
  add(g, geo, mat('#2b1c14'), [0, 0, 0.351]);
  add(
    g,
    new THREE.CylinderGeometry(0.12, 0.1, 0.06, 16),
    mat('#5b8def', { roughness: 0.4 }),
    [0.48, 0.03, 0.3],
  );
  return g;
}

export function lawn() {
  const g = new THREE.Group();
  add(g, rbox(2.0, 0.1, 1.5, 0.05), mat('#8fd46e'), [0, 0.05, 0]);
  const r = rng(7);
  const heads = ['#ff7eb6', '#ffd166', '#ffffff', '#c084fc', '#ff8a5c'].map((c) =>
    mat(c, { roughness: 0.5 }),
  );
  const stem = mat('#4f9a3c');
  for (let i = 0; i < 34; i++) {
    const x = (r() - 0.5) * 1.8,
      z = (r() - 0.5) * 1.3,
      hgt = 0.08 + r() * 0.1;
    add(g, new THREE.CylinderGeometry(0.008, 0.008, hgt, 4), stem, [x, 0.1 + hgt / 2, z]);
    add(g, new THREE.IcosahedronGeometry(0.035 + r() * 0.02, 0), heads[i % heads.length], [
      x,
      0.1 + hgt,
      z,
    ]);
  }
  return g;
}

export function swing() {
  const g = new THREE.Group();
  const wood = mat('#8a5a3c');
  for (const x of [-0.8, 0.8]) {
    beam(g, [x, 0, -0.45], [x, 1.6, 0], 0.05, wood);
    beam(g, [x, 0, 0.45], [x, 1.6, 0], 0.05, wood);
  }
  beam(g, [-0.88, 1.6, 0], [0.88, 1.6, 0], 0.05, wood);
  const seat = new THREE.Group();
  seat.name = 'swingSeat';
  seat.position.set(0, 1.6, 0);
  const rope = mat('#e9dcc2');
  for (const x of [-0.22, 0.22]) beam(seat, [x, 0, 0], [x, -1.1, 0], 0.012, rope);
  add(seat, rbox(0.6, 0.06, 0.26, 0.02), mat('#e05d5d'), [0, -1.12, 0]);
  g.add(seat);
  return g;
}

export function tree(seed = 3, tint = '#5fae4a') {
  const g = new THREE.Group();
  const r = rng(seed);
  add(g, new THREE.CylinderGeometry(0.08, 0.13, 0.8, 7), mat('#7a5034'), [0, 0.4, 0]);
  const leaf = [tint, '#7cc85a', '#4e9a3e'].map((c) =>
    mat(c, { flatShading: true, roughness: 0.9 }),
  );
  add(g, new THREE.IcosahedronGeometry(0.55, 0), leaf[0], [0, 1.15, 0], [r(), r(), r()]);
  add(g, new THREE.IcosahedronGeometry(0.38, 0), leaf[1], [0.32, 0.95, 0.12], [r(), r(), r()]);
  add(g, new THREE.IcosahedronGeometry(0.36, 0), leaf[2], [-0.3, 1.0, -0.14], [r(), r(), r()]);
  add(g, new THREE.IcosahedronGeometry(0.3, 0), leaf[1], [0.05, 1.55, 0.05], [r(), r(), r()]);
  return g;
}

export function pine() {
  const g = new THREE.Group();
  add(g, new THREE.CylinderGeometry(0.06, 0.09, 0.4, 6), mat('#6b4a32'), [0, 0.2, 0]);
  const needle = mat('#2f7d5b', { flatShading: true, roughness: 0.9 });
  [0, 1, 2].forEach((i) =>
    add(g, new THREE.ConeGeometry(0.55 - i * 0.13, 0.65, 7), needle, [0, 0.6 + i * 0.38, 0]),
  );
  return g;
}

export function windmill() {
  const g = new THREE.Group();
  add(
    g,
    new THREE.CylinderGeometry(0.28, 0.48, 2.0, 8),
    mat('#f2ead8', { flatShading: true }),
    [0, 1.0, 0],
  );
  add(g, new THREE.ConeGeometry(0.42, 0.5, 8), mat('#3d6fd8', { flatShading: true }), [0, 2.25, 0]);
  add(g, rbox(0.22, 0.4, 0.06, 0.03), mat('#6b4428'), [0, 0.2, 0.46]);
  add(g, rbox(0.16, 0.16, 0.05, 0.02), glow(), [0, 1.2, 0.38]);
  const blades = new THREE.Group();
  blades.name = 'blades';
  blades.position.set(0, 1.9, 0.42);
  add(
    blades,
    new THREE.CylinderGeometry(0.07, 0.07, 0.12, 10),
    mat('#5a3d28'),
    [0, 0, 0],
    [Math.PI / 2, 0, 0],
  );
  const sail = mat('#fff8ea', { side: THREE.DoubleSide });
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group();
    arm.rotation.z = (i * Math.PI) / 2;
    add(arm, rbox(0.05, 0.95, 0.03, 0.01), mat('#5a3d28'), [0, 0.5, 0.04]);
    add(arm, rbox(0.22, 0.7, 0.02, 0.01), sail, [0.13, 0.58, 0.05]);
    blades.add(arm);
  }
  g.add(blades);
  return g;
}

export function pond() {
  const g = new THREE.Group();
  add(
    g,
    new THREE.CylinderGeometry(0.95, 0.95, 0.05, 32),
    mat('#3f9bdc', { roughness: 0.08, metalness: 0.1 }),
    [0, 0.03, 0],
  );
  const r = rng(11);
  const stone = mat('#a7a3a0', { flatShading: true });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const s = 0.12 + r() * 0.07;
    const m = add(
      g,
      new THREE.DodecahedronGeometry(s, 0),
      stone,
      [Math.cos(a) * 1.0, 0.05, Math.sin(a) * 1.0],
      [r(), r(), r()],
    );
    m.scale.y = 0.6;
  }
  const pad = mat('#4caf50');
  for (const [x, z] of [
    [0.3, 0.2],
    [-0.35, -0.25],
    [0.1, -0.45],
  ])
    add(g, new THREE.CylinderGeometry(0.13, 0.13, 0.02, 12, 1, false, 0.4, Math.PI * 1.8), pad, [
      x,
      0.07,
      z,
    ]);
  add(g, new THREE.SphereGeometry(0.05, 10, 10), mat('#ff9ecb'), [0.32, 0.1, 0.22]);
  return g;
}

export function bench() {
  const g = new THREE.Group();
  const wood = mat('#b77945');
  const iron = mat('#2f3640', { metalness: 0.6, roughness: 0.4 });
  for (let i = 0; i < 3; i++)
    add(g, rbox(1.2, 0.05, 0.11, 0.02), wood, [0, 0.42, -0.13 + i * 0.13]);
  for (let i = 0; i < 2; i++)
    add(g, rbox(1.2, 0.09, 0.04, 0.015), wood, [0, 0.62 + i * 0.14, -0.24], [-0.15, 0, 0]);
  for (const x of [-0.5, 0.5]) {
    add(g, rbox(0.05, 0.42, 0.36, 0.015), iron, [x, 0.21, 0]);
    add(g, rbox(0.05, 0.4, 0.05, 0.015), iron, [x, 0.66, -0.25], [-0.15, 0, 0]);
  }
  return g;
}

export function lamp() {
  const g = new THREE.Group();
  const iron = mat('#2a3340', { metalness: 0.7, roughness: 0.35 });
  add(g, new THREE.CylinderGeometry(0.14, 0.18, 0.1, 12), iron, [0, 0.05, 0]);
  add(g, new THREE.CylinderGeometry(0.035, 0.05, 1.6, 10), iron, [0, 0.85, 0]);
  add(g, new THREE.SphereGeometry(0.14, 16, 16), glow('#fff1c9'), [0, 1.75, 0]);
  add(g, new THREE.ConeGeometry(0.22, 0.16, 8), iron, [0, 1.92, 0]);
  return g;
}

export function fence() {
  const g = new THREE.Group();
  const white = mat('#f4efe6');
  for (let i = 0; i < 6; i++) {
    add(g, rbox(0.09, 0.6, 0.06, 0.02), white, [-0.9 + i * 0.36, 0.3, 0]);
    add(
      g,
      new THREE.ConeGeometry(0.065, 0.1, 4),
      white,
      [-0.9 + i * 0.36, 0.65, 0],
      [0, Math.PI / 4, 0],
    );
  }
  for (const y of [0.2, 0.45]) add(g, rbox(1.9, 0.06, 0.04, 0.015), white, [0, y, 0.04]);
  return g;
}

export function mailbox() {
  const g = new THREE.Group();
  add(g, rbox(0.08, 0.8, 0.08, 0.02), mat('#7a5034'), [0, 0.4, 0]);
  add(g, rbox(0.26, 0.2, 0.42, 0.03), mat('#e0473f'), [0, 0.88, 0]);
  add(
    g,
    new THREE.CylinderGeometry(0.13, 0.13, 0.42, 16, 1, false, 0, Math.PI),
    mat('#e0473f'),
    [0, 0.98, 0],
    [Math.PI / 2, Math.PI / 2, 0],
  );
  add(g, rbox(0.02, 0.22, 0.08, 0.01), mat('#ffd166'), [0.15, 1.02, -0.08]);
  return g;
}

/** The floating island the world is built on (top at y = 0). */
export function island() {
  const g = new THREE.Group();
  add(g, new THREE.CylinderGeometry(5.4, 5.4, 0.3, 64), mat('#6fbf5a'), [0, -0.15, 0]);
  add(g, new THREE.CylinderGeometry(5.42, 5.42, 0.08, 64), mat('#5aa548'), [0, -0.27, 0]);
  add(
    g,
    new THREE.CylinderGeometry(5.35, 2.6, 1.9, 24, 1),
    mat('#6b4a34', { flatShading: true }),
    [0, -1.26, 0],
  );
  add(
    g,
    new THREE.ConeGeometry(2.6, 1.6, 12),
    mat('#5a3d2b', { flatShading: true }),
    [0, -3.0, 0],
    [Math.PI, 0, 0],
  );
  const r = rng(5);
  const stone = mat('#cfc8bb', { roughness: 0.9 });
  for (let i = 0; i < 9; i++) {
    const m = add(g, new THREE.CylinderGeometry(0.22, 0.24, 0.04, 10), stone, [
      (r() - 0.5) * 0.4,
      0.01,
      4.8 - i * 0.55,
    ]);
    m.position.x += Math.sin(i * 0.9) * 0.35;
  }
  // grass variation, tufts and wild flowers
  const patch = [mat('#63b350'), mat('#7cc964'), mat('#5aa84a')];
  for (let i = 0; i < 22; i++) {
    const a = r() * Math.PI * 2,
      d = Math.sqrt(r()) * 4.7;
    const m = add(
      g,
      new THREE.CircleGeometry(0.3 + r() * 0.7, 18),
      patch[i % 3],
      [Math.cos(a) * d, 0.004 + i * 0.0004, Math.sin(a) * d],
      [-Math.PI / 2, 0, 0],
    );
    m.castShadow = false;
  }
  const tuft = mat('#4f9a3c', { flatShading: true });
  const petals = ['#ffffff', '#ffd166', '#ff9ecb'].map((c) => mat(c));
  for (let i = 0; i < 70; i++) {
    const a = r() * Math.PI * 2,
      d = 1.2 + Math.sqrt(r()) * 3.9;
    const x = Math.cos(a) * d,
      z = Math.sin(a) * d;
    if (i % 3 === 0) add(g, new THREE.IcosahedronGeometry(0.035, 0), petals[i % 3], [x, 0.04, z]);
    else add(g, new THREE.ConeGeometry(0.05, 0.16, 4), tuft, [x, 0.08, z], [0, r() * 3, 0]);
  }
  const rock = mat('#9a948c', { flatShading: true });
  for (const [x, z, s] of [
    [4.6, 0.5, 0.25],
    [-4.7, 1.4, 0.3],
    [-2.0, 4.6, 0.2],
    [3.4, -3.6, 0.28],
  ] as const) {
    const m = add(g, new THREE.DodecahedronGeometry(s, 0), rock, [x, s * 0.4, z], [r(), r(), r()]);
    m.scale.y = 0.7;
  }
  return g;
}
