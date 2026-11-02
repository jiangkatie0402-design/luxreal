import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { repeatSet, surface, type PbrSet } from './textures';

/**
 * World pieces for the homepage hero, with procedural PBR materials (tiles,
 * brick, plaster, wood, grass, water, brushed metal). Each builder returns a
 * Group standing on y = 0, centred on x/z. Named nodes ('swingSeat', 'blades',
 * 'water') are animated by the scene.
 */

type V3 = [number, number, number];
const UP = new THREE.Vector3(0, 1, 0);

function pbr(set: PbrSet, o: Partial<THREE.MeshPhysicalMaterialParameters> = {}, normal = 1) {
  return new THREE.MeshPhysicalMaterial({
    map: set.map,
    normalMap: set.normalMap,
    roughnessMap: set.roughnessMap,
    normalScale: new THREE.Vector2(normal, normal),
    roughness: 1,
    metalness: 0,
    ...o,
  });
}
const T = {
  tiles: (hex: string, r = 2) =>
    pbr(repeatSet(surface('tiles', hex), r), { envMapIntensity: 0.8 }, 1.2),
  brick: (hex: string, r = 1.5) => pbr(repeatSet(surface('brick', hex), r), {}, 1.1),
  plaster: (hex: string, r = 1.5) => pbr(repeatSet(surface('plaster', hex), r), {}, 0.6),
  wood: (hex: string, r = 1) => pbr(repeatSet(surface('wood', hex), r), { clearcoat: 0.15 }, 0.9),
  grass: (r = 2) => pbr(repeatSet(surface('grass'), r), {}, 1.2),
  stone: (hex?: string) => pbr(repeatSet(surface('stone', hex ?? '#9a948c'), 1), {}, 1.4),
  foliage: (hex: string) =>
    pbr(repeatSet(surface('foliage', hex), 1.5), { flatShading: true }, 1.2),
  metal: (hex = '#3a4252', r = 1, o: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
    pbr(
      repeatSet(surface('metal', hex, false), r),
      { metalness: 0.9, clearcoat: 0.3, clearcoatRoughness: 0.4, ...o },
      0.8,
    ),
  techMetal: (r = 1) => {
    const set = repeatSet(surface('metal', '#2a3142', true), r);
    return pbr(
      set,
      {
        metalness: 0.92,
        clearcoat: 0.4,
        emissiveMap: set.emissiveMap,
        emissive: new THREE.Color('#5ea8ff'),
        emissiveIntensity: 2.2,
      },
      0.9,
    );
  },
  paint: (hex: string, o: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
    new THREE.MeshPhysicalMaterial({
      color: hex,
      roughness: 0.45,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
      ...o,
    }),
  glass: () =>
    new THREE.MeshPhysicalMaterial({
      color: '#ffd9a0',
      emissive: '#ffb347',
      emissiveIntensity: 2.6,
      roughness: 0.15,
      clearcoat: 1,
    }),
};

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

function beam(g: THREE.Object3D, a: V3, b: V3, r: number, m: THREE.Material) {
  const va = new THREE.Vector3(...a),
    vb = new THREE.Vector3(...b);
  const dir = vb.clone().sub(va);
  const mesh = add(g, new THREE.CylinderGeometry(r, r, dir.length(), 10), m);
  mesh.position.copy(va).add(vb).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
  return mesh;
}

/** Triangular prism roof, ridge along x; UVs normalized so tiles run down the slope. */
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

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** Rooftop solar panel: the tech detail on each house. */
function solar(g: THREE.Object3D, w: number, y: number, z: number, tilt: number) {
  const p = add(g, rbox(w, 0.04, 0.42, 0.01), T.techMetal(1.2), [0, y, z], [tilt, 0, 0]);
  p.castShadow = false;
}

export function house(o: {
  w?: number;
  d?: number;
  h?: number;
  wall: string;
  roof: string;
  wallKind?: 'plaster' | 'brick';
  chimney?: boolean;
  solarPanel?: boolean;
}) {
  const {
    w = 1.4,
    d = 1.1,
    h = 1.0,
    wall,
    roof,
    wallKind = 'plaster',
    chimney = true,
    solarPanel = true,
  } = o;
  const g = new THREE.Group();
  const roofH = h * 0.62;
  add(g, rbox(w, h, d, 0.04), wallKind === 'brick' ? T.brick(wall) : T.plaster(wall), [
    0,
    h / 2,
    0,
  ]);
  add(g, rbox(w + 0.06, 0.12, d + 0.06, 0.02), T.stone('#8f8a83'), [0, 0.06, 0]);
  add(g, gable(w + 0.2, roofH, d + 0.28), T.tiles(roof, 1.4), [0, h, 0]);
  add(g, rbox(w + 0.08, 0.05, d + 0.08, 0.02), T.paint('#efe9df'), [0, h + 0.005, 0]);
  add(g, rbox(0.32, h * 0.54, 0.06, 0.03), T.wood('#7a4b2c', 0.6), [0, h * 0.27, d / 2 + 0.01]);
  add(g, new THREE.SphereGeometry(0.025, 8, 8), T.metal('#d8b25a', 1, { roughness: 0.3 }), [
    0.1,
    h * 0.27,
    d / 2 + 0.05,
  ]);
  add(g, rbox(w * 0.5, 0.06, 0.3, 0.02), T.stone('#bdb5a8'), [0, 0.03, d / 2 + 0.17]);
  const frame = T.paint('#f4efe6');
  for (const x of [-w * 0.3, w * 0.3]) {
    add(g, rbox(0.3, 0.3, 0.04, 0.02), frame, [x, h * 0.6, d / 2 + 0.005]);
    add(g, rbox(0.23, 0.23, 0.05, 0.01), T.glass(), [x, h * 0.6, d / 2 + 0.012]);
  }
  for (const z of [-d * 0.2, d * 0.2])
    add(g, rbox(0.05, 0.22, 0.2, 0.01), T.glass(), [w / 2 + 0.008, h * 0.6, z]);
  if (chimney)
    add(g, rbox(0.2, 0.55, 0.2, 0.02), T.brick('#8f4a36', 0.5), [
      w * 0.28,
      h + roofH * 0.55,
      -d * 0.14,
    ]);
  if (solarPanel) {
    const slope = Math.atan2(roofH, (d + 0.28) / 2);
    solar(g, w * 0.55, h + roofH * 0.48, (d + 0.28) * 0.22, slope);
  }
  return g;
}

export function doghouse() {
  const g = new THREE.Group();
  add(g, rbox(0.8, 0.55, 0.7, 0.04), T.wood('#c98d54', 0.7), [0, 0.275, 0]);
  add(g, gable(0.92, 0.38, 0.92), T.tiles('#b2352a', 0.8), [0, 0.55, 0]);
  const arch = new THREE.Shape();
  arch.moveTo(-0.16, 0);
  arch.lineTo(-0.16, 0.2);
  arch.absarc(0, 0.2, 0.16, Math.PI, 0, true);
  arch.lineTo(0.16, 0);
  arch.closePath();
  add(
    g,
    new THREE.ExtrudeGeometry(arch, { depth: 0.02, bevelEnabled: false }),
    T.paint('#1d140e', { clearcoat: 0 }),
    [0, 0, 0.351],
  );
  add(
    g,
    new THREE.CylinderGeometry(0.12, 0.1, 0.06, 20),
    T.metal('#4f7fe0', 1, { metalness: 0.7 }),
    [0.48, 0.03, 0.3],
  );
  return g;
}

export function lawn() {
  const g = new THREE.Group();
  add(g, rbox(2.0, 0.1, 1.5, 0.04), T.grass(1.2), [0, 0.05, 0]);
  const r = rng(7);
  const heads = ['#ff7eb6', '#ffd166', '#ffffff', '#c084fc', '#ff8a5c'].map((c) =>
    T.paint(c, { roughness: 0.5, clearcoat: 0.2 }),
  );
  const stem = T.paint('#3f8a2f', { clearcoat: 0 });
  for (let i = 0; i < 40; i++) {
    const x = (r() - 0.5) * 1.8,
      z = (r() - 0.5) * 1.3,
      hgt = 0.08 + r() * 0.1;
    add(g, new THREE.CylinderGeometry(0.008, 0.008, hgt, 4), stem, [x, 0.1 + hgt / 2, z]);
    add(g, new THREE.IcosahedronGeometry(0.035 + r() * 0.02, 1), heads[i % heads.length], [
      x,
      0.1 + hgt,
      z,
    ]);
  }
  return g;
}

export function swing() {
  const g = new THREE.Group();
  const wood = T.wood('#8a5a3c', 0.3);
  for (const x of [-0.8, 0.8]) {
    beam(g, [x, 0, -0.45], [x, 1.6, 0], 0.05, wood);
    beam(g, [x, 0, 0.45], [x, 1.6, 0], 0.05, wood);
  }
  beam(g, [-0.88, 1.6, 0], [0.88, 1.6, 0], 0.055, T.metal('#59606e'));
  const seat = new THREE.Group();
  seat.name = 'swingSeat';
  seat.position.set(0, 1.6, 0);
  const chain = T.metal('#b8bec9', 1, { roughness: 0.25 });
  for (const x of [-0.22, 0.22]) beam(seat, [x, 0, 0], [x, -1.1, 0], 0.012, chain);
  add(seat, rbox(0.6, 0.06, 0.26, 0.02), T.wood('#b3492f', 0.5), [0, -1.12, 0]);
  g.add(seat);
  return g;
}

export function tree(seed = 3, tint = '#4f9a3c') {
  const g = new THREE.Group();
  const r = rng(seed);
  add(g, new THREE.CylinderGeometry(0.08, 0.14, 0.85, 8), T.wood('#5b3a24', 0.4), [0, 0.42, 0]);
  const leaf = [T.foliage(tint), T.foliage('#6cb84a'), T.foliage('#3f8a33')];
  add(g, new THREE.IcosahedronGeometry(0.58, 1), leaf[0], [0, 1.18, 0], [r(), r(), r()]);
  add(g, new THREE.IcosahedronGeometry(0.4, 1), leaf[1], [0.34, 0.95, 0.12], [r(), r(), r()]);
  add(g, new THREE.IcosahedronGeometry(0.38, 1), leaf[2], [-0.32, 1.0, -0.14], [r(), r(), r()]);
  add(g, new THREE.IcosahedronGeometry(0.32, 1), leaf[1], [0.05, 1.6, 0.05], [r(), r(), r()]);
  return g;
}

export function pine() {
  const g = new THREE.Group();
  add(g, new THREE.CylinderGeometry(0.06, 0.09, 0.4, 8), T.wood('#5b3a24', 0.3), [0, 0.2, 0]);
  const needle = T.foliage('#2f6f50');
  [0, 1, 2].forEach((i) =>
    add(g, new THREE.ConeGeometry(0.55 - i * 0.13, 0.65, 9), needle, [0, 0.6 + i * 0.38, 0]),
  );
  return g;
}

export function windmill() {
  const g = new THREE.Group();
  add(g, new THREE.CylinderGeometry(0.28, 0.48, 2.0, 12), T.plaster('#efe6d2', 2), [0, 1.0, 0]);
  add(g, new THREE.CylinderGeometry(0.5, 0.5, 0.1, 12), T.stone('#8f8a83'), [0, 0.05, 0]);
  add(
    g,
    new THREE.ConeGeometry(0.42, 0.5, 12),
    T.metal('#3c66c9', 1.2, { metalness: 0.75 }),
    [0, 2.25, 0],
  );
  add(g, rbox(0.22, 0.4, 0.06, 0.03), T.wood('#6b4428', 0.4), [0, 0.2, 0.46]);
  add(g, rbox(0.16, 0.16, 0.05, 0.02), T.glass(), [0, 1.2, 0.38]);
  const blades = new THREE.Group();
  blades.name = 'blades';
  blades.position.set(0, 1.9, 0.42);
  add(
    blades,
    new THREE.CylinderGeometry(0.07, 0.07, 0.12, 12),
    T.metal('#7a828f'),
    [0, 0, 0],
    [Math.PI / 2, 0, 0],
  );
  const arm = T.metal('#59606e', 0.5);
  const sail = T.techMetal(0.6);
  for (let i = 0; i < 4; i++) {
    const a = new THREE.Group();
    a.rotation.z = (i * Math.PI) / 2;
    add(a, rbox(0.05, 0.95, 0.03, 0.01), arm, [0, 0.5, 0.04]);
    add(a, rbox(0.22, 0.7, 0.02, 0.01), sail, [0.13, 0.58, 0.05]);
    blades.add(a);
  }
  g.add(blades);
  return g;
}

export function pond() {
  const g = new THREE.Group();
  const water = pbr(
    repeatSet(surface('water'), 2),
    {
      color: '#5aaee8',
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      transmission: 0,
    },
    0.6,
  );
  water.map = null;
  const w = add(g, new THREE.CylinderGeometry(0.95, 0.95, 0.05, 40), water, [0, 0.03, 0]);
  w.name = 'water';
  const r = rng(11);
  const stone = T.stone();
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const s = 0.12 + r() * 0.07;
    const m = add(
      g,
      new THREE.DodecahedronGeometry(s, 1),
      stone,
      [Math.cos(a) * 1.0, 0.05, Math.sin(a) * 1.0],
      [r(), r(), r()],
    );
    m.scale.y = 0.6;
  }
  const pad = T.paint('#3f9a45', { clearcoat: 0.6 });
  for (const [x, z] of [
    [0.3, 0.2],
    [-0.35, -0.25],
    [0.1, -0.45],
  ])
    add(g, new THREE.CylinderGeometry(0.13, 0.13, 0.02, 14, 1, false, 0.4, Math.PI * 1.8), pad, [
      x,
      0.07,
      z,
    ]);
  add(g, new THREE.SphereGeometry(0.05, 12, 12), T.paint('#ff9ecb'), [0.32, 0.1, 0.22]);
  return g;
}

export function bench() {
  const g = new THREE.Group();
  const wood = T.wood('#b77945', 0.3);
  const iron = T.metal('#2f3640');
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
  const iron = T.metal('#2a3340');
  add(g, new THREE.CylinderGeometry(0.14, 0.18, 0.1, 16), iron, [0, 0.05, 0]);
  add(g, new THREE.CylinderGeometry(0.035, 0.05, 1.6, 12), iron, [0, 0.85, 0]);
  add(g, new THREE.SphereGeometry(0.14, 20, 20), T.glass(), [0, 1.75, 0]);
  add(g, new THREE.ConeGeometry(0.22, 0.16, 12), iron, [0, 1.92, 0]);
  return g;
}

export function fence() {
  const g = new THREE.Group();
  const white = T.wood('#ece6da', 0.25);
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
  const red = T.metal('#b3302a', 0.6, { metalness: 0.55, clearcoat: 0.8 });
  add(g, rbox(0.08, 0.8, 0.08, 0.02), T.wood('#6b4428', 0.3), [0, 0.4, 0]);
  add(g, rbox(0.26, 0.2, 0.42, 0.03), red, [0, 0.88, 0]);
  add(
    g,
    new THREE.CylinderGeometry(0.13, 0.13, 0.42, 20, 1, false, 0, Math.PI),
    red,
    [0, 0.98, 0],
    [Math.PI / 2, Math.PI / 2, 0],
  );
  add(g, rbox(0.02, 0.22, 0.08, 0.01), T.paint('#ffd166'), [0.15, 1.02, -0.08]);
  return g;
}

/** The floating island: textured turf on a tech platform with light seams. */
export function island() {
  const g = new THREE.Group();
  add(g, new THREE.CylinderGeometry(5.4, 5.4, 0.3, 96), T.grass(9), [0, -0.15, 0]);
  // tech platform: metal band with glowing seams + a light rim
  add(g, new THREE.CylinderGeometry(5.5, 5.5, 0.5, 96, 1, true), T.techMetal(10), [0, -0.5, 0]);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(5.52, 0.03, 8, 160),
    new THREE.MeshBasicMaterial({ color: '#7fb6ff', toneMapped: false }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -0.27;
  g.add(rim);
  add(g, new THREE.CylinderGeometry(5.5, 3.0, 1.6, 48, 1), T.metal('#262c39', 6), [0, -1.55, 0]);
  add(g, new THREE.CylinderGeometry(3.0, 1.2, 1.4, 32, 1), T.techMetal(4), [0, -3.05, 0]);
  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.2, 0.6, 24),
    new THREE.MeshBasicMaterial({ color: '#5ea8ff', toneMapped: false }),
  );
  core.position.y = -3.9;
  g.add(core);

  const r = rng(5);
  const stone = T.stone('#c4bcae');
  for (let i = 0; i < 9; i++) {
    const m = add(g, new THREE.CylinderGeometry(0.22, 0.24, 0.05, 14), stone, [
      (r() - 0.5) * 0.4,
      0.015,
      4.8 - i * 0.55,
    ]);
    m.position.x += Math.sin(i * 0.9) * 0.35;
  }
  const tuft = T.foliage('#3f8a2f');
  const petals = ['#ffffff', '#ffd166', '#ff9ecb'].map((c) => T.paint(c));
  for (let i = 0; i < 80; i++) {
    const a = r() * Math.PI * 2,
      d = 1.2 + Math.sqrt(r()) * 3.9;
    const x = Math.cos(a) * d,
      z = Math.sin(a) * d;
    if (i % 3 === 0) add(g, new THREE.IcosahedronGeometry(0.035, 1), petals[i % 3], [x, 0.04, z]);
    else add(g, new THREE.ConeGeometry(0.05, 0.16, 5), tuft, [x, 0.08, z], [0, r() * 3, 0]);
  }
  const rock = T.stone();
  for (const [x, z, s] of [
    [4.6, 0.5, 0.25],
    [-4.7, 1.4, 0.3],
    [-2.0, 4.6, 0.2],
    [3.4, -3.6, 0.28],
  ] as const) {
    const m = add(g, new THREE.DodecahedronGeometry(s, 1), rock, [x, s * 0.4, z], [r(), r(), r()]);
    m.scale.y = 0.7;
  }
  return g;
}

let fadeTex: THREE.Texture | null = null;
function radialFade() {
  if (fadeTex || typeof document === 'undefined') return fadeTex;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.35, '#888888');
  g.addColorStop(1, '#000000');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  fadeTex = new THREE.CanvasTexture(c);
  return fadeTex;
}

/** Hex energy floor far below the island, fading out towards the edges. */
export function energyFloor() {
  const set = repeatSet(surface('hex'), 14);
  const mat = pbr(
    set,
    {
      metalness: 0.85,
      emissiveMap: set.emissiveMap,
      emissive: new THREE.Color('#3f7dff'),
      emissiveIntensity: 0.45,
      transparent: true,
      alphaMap: radialFade(),
      depthWrite: false,
    },
    0.6,
  );
  const m = new THREE.Mesh(new THREE.CircleGeometry(22, 64), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.y = -6;
  return m;
}
