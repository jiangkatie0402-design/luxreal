import * as THREE from 'three';

/**
 * Procedural PBR textures for the hero world. Each generator paints a height
 * field + albedo + roughness per pixel; normals are derived from the height
 * field, so every surface gets real relief under light. Generated once, cached.
 */

export interface PbrSet {
  map: THREE.Texture;
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
  emissiveMap?: THREE.Texture;
}

/* ---------- noise ---------- */
function hash(x: number, y: number, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function vnoise(x: number, y: number, s = 0) {
  const xi = Math.floor(x),
    yi = Math.floor(y);
  const xf = x - xi,
    yf = y - yi;
  const u = xf * xf * (3 - 2 * xf),
    v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s),
    b = hash(xi + 1, yi, s),
    c = hash(xi, yi + 1, s),
    d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number, oct = 4, s = 0) {
  let v = 0,
    amp = 0.5,
    f = 1;
  for (let i = 0; i < oct; i++) {
    v += amp * vnoise(x * f, y * f, s + i * 17);
    f *= 2;
    amp *= 0.5;
  }
  return v;
}

type Painter = (
  u: number,
  v: number,
) => { h: number; c: [number, number, number]; r: number; e?: number };

function bake(size: number, paint: Painter, strength: number, emissive = false): PbrSet {
  const n = size * size;
  const height = new Float32Array(n);
  const albedo = new Uint8ClampedArray(n * 4);
  const rough = new Uint8ClampedArray(n * 4);
  const emit = emissive ? new Uint8ClampedArray(n * 4) : null;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const p = paint(x / size, y / size);
      height[i] = p.h;
      albedo[i * 4] = p.c[0] * 255;
      albedo[i * 4 + 1] = p.c[1] * 255;
      albedo[i * 4 + 2] = p.c[2] * 255;
      albedo[i * 4 + 3] = 255;
      const r = Math.min(Math.max(p.r, 0), 1) * 255;
      rough[i * 4] = rough[i * 4 + 1] = rough[i * 4 + 2] = r;
      rough[i * 4 + 3] = 255;
      if (emit) {
        const e = (p.e ?? 0) * 255;
        emit[i * 4] = e * 0.45;
        emit[i * 4 + 1] = e * 0.72;
        emit[i * 4 + 2] = e;
        emit[i * 4 + 3] = 255;
      }
    }
  const normal = new Uint8ClampedArray(n * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const at = (xx: number, yy: number) =>
        height[((yy + size) % size) * size + ((xx + size) % size)];
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      normal[i] = ((-dx / l) * 0.5 + 0.5) * 255;
      normal[i + 1] = ((dy / l) * 0.5 + 0.5) * 255;
      normal[i + 2] = ((1 / l) * 0.5 + 0.5) * 255;
      normal[i + 3] = 255;
    }
  const tex = (data: Uint8ClampedArray, srgb: boolean) => {
    const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
  };
  return {
    map: tex(albedo, true),
    normalMap: tex(normal, false),
    roughnessMap: tex(rough, false),
    emissiveMap: emit ? tex(emit, true) : undefined,
  };
}

const rgb = (hex: string): [number, number, number] => {
  const c = new THREE.Color(hex);
  return [c.r, c.g, c.b].map((x) => Math.pow(x, 1 / 2.2)) as [number, number, number];
};
const mix = (a: [number, number, number], k: number): [number, number, number] => [
  a[0] * k,
  a[1] * k,
  a[2] * k,
];

/* ---------- surfaces ---------- */
export const SURFACES = {
  /** Overlapping clay roof tiles. */
  tiles: (hex: string) => {
    const base = rgb(hex);
    return bake(
      256,
      (u, v) => {
        const rows = 8,
          cols = 6;
        const ry = v * rows,
          row = Math.floor(ry),
          fy = ry - row;
        const rx = u * cols + (row % 2) * 0.5,
          col = Math.floor(rx),
          fx = rx - col;
        const edge = Math.min(fx, 1 - fx);
        const n = fbm(u * 24, v * 24, 3);
        const h = (1 - fy) * 0.8 + Math.min(edge * 8, 1) * 0.2 + n * 0.08;
        const k = 0.78 + hash(col, row, 3) * 0.32 - fy * 0.18 + n * 0.12;
        return { h, c: mix(base, k), r: 0.62 + n * 0.25 };
      },
      5,
    );
  },
  /** Brick wall with recessed mortar. */
  brick: (hex: string) => {
    const base = rgb(hex);
    return bake(
      256,
      (u, v) => {
        const rows = 10,
          cols = 4;
        const ry = v * rows,
          row = Math.floor(ry),
          fy = ry - row;
        const rx = u * cols + (row % 2) * 0.5,
          col = Math.floor(rx),
          fx = rx - col;
        const mortar = fy < 0.1 || fx < 0.05;
        const n = fbm(u * 30, v * 30, 3, 2);
        if (mortar)
          return { h: 0.1 + n * 0.05, c: mix([0.86, 0.83, 0.78], 0.9 + n * 0.1), r: 0.95 };
        const k = 0.8 + hash(col, row, 9) * 0.3 + (n - 0.5) * 0.25;
        return { h: 0.9 + n * 0.1, c: mix(base, k), r: 0.8 };
      },
      6,
    );
  },
  /** Painted plaster. */
  plaster: (hex: string) => {
    const base = rgb(hex);
    return bake(
      256,
      (u, v) => {
        const n = fbm(u * 18, v * 18, 5, 4);
        const d = fbm(u * 3, v * 3, 3, 8);
        return { h: n, c: mix(base, 0.88 + n * 0.14 - Math.max(0, d - 0.6) * 0.3), r: 0.85 };
      },
      2.2,
    );
  },
  /** Wood planks with grain. */
  wood: (hex: string) => {
    const base = rgb(hex);
    return bake(
      256,
      (u, v) => {
        const planks = 5,
          p = Math.floor(u * planks),
          fx = u * planks - p;
        const gap = fx < 0.04;
        const g = Math.sin((v * 20 + fbm(u * 6 + p * 3, v * 2, 3, p) * 6) * Math.PI);
        const k = 0.8 + hash(p, 0, 5) * 0.25 + g * 0.08;
        return {
          h: gap ? 0 : 0.7 + g * 0.06,
          c: gap ? mix(base, 0.35) : mix(base, k),
          r: 0.7 - g * 0.05,
        };
      },
      4,
    );
  },
  /** Lush grass. */
  grass: () =>
    bake(
      512,
      (u, v) => {
        const n = fbm(u * 10, v * 10, 5, 1);
        const blade = vnoise(u * 160, v * 40, 3);
        const k = 0.65 + n * 0.5 + (blade - 0.5) * 0.35;
        const c: [number, number, number] = [0.32 * k + 0.05 * n, 0.62 * k, 0.22 * k];
        return { h: blade * 0.7 + n * 0.3, c, r: 0.9 };
      },
      3,
    ),
  /** Brushed gunmetal panels with seams, rivets and scratches. */
  metal: (hex = '#3a4252', glowSeams = false) => {
    const base = rgb(hex);
    return bake(
      256,
      (u, v) => {
        const cols = 3,
          rows = 3;
        const fx = (u * cols) % 1,
          fy = (v * rows) % 1;
        const seam = fx < 0.015 || fy < 0.015;
        const rivet =
          (Math.hypot(fx - 0.06, fy - 0.06) < 0.02 || Math.hypot(fx - 0.94, fy - 0.06) < 0.02) &&
          !seam;
        const brushed = vnoise(u * 400, v * 6, 7);
        const n = fbm(u * 8, v * 8, 4, 2);
        const scratch = vnoise(u * 3 + v * 40, v * 2, 11) > 0.93 ? 1 : 0;
        const h = seam ? 0 : rivet ? 1 : 0.6 + brushed * 0.05;
        const k = seam ? 0.35 : 0.85 + brushed * 0.18 + n * 0.12 + scratch * 0.35;
        return {
          h,
          c: mix(base, k),
          r: seam ? 0.8 : 0.28 + n * 0.25 - scratch * 0.15,
          e: glowSeams && seam ? 1 : 0,
        };
      },
      6,
      glowSeams,
    );
  },
  /** Rippled water (normal + roughness only matter). */
  water: () =>
    bake(
      256,
      (u, v) => {
        const n = fbm(u * 8, v * 8, 4, 5);
        return { h: n, c: [0.16, 0.42, 0.62], r: 0.05 };
      },
      3,
    ),
  /** Rough stone. */
  stone: (hex = '#9a948c') => {
    const base = rgb(hex);
    return bake(
      128,
      (u, v) => {
        const n = fbm(u * 10, v * 10, 5, 9);
        return { h: n, c: mix(base, 0.75 + n * 0.45), r: 0.9 };
      },
      5,
    );
  },
  /** Leaf canopy clumps. */
  foliage: (hex: string) => {
    const base = rgb(hex);
    return bake(
      128,
      (u, v) => {
        const n = vnoise(u * 40, v * 40, 2);
        const m = fbm(u * 6, v * 6, 3, 4);
        return { h: n, c: mix(base, 0.7 + n * 0.4 + m * 0.2), r: 0.8 };
      },
      5,
    );
  },
  /** Hex energy floor with glowing seams. */
  hex: () =>
    bake(
      256,
      (u, v) => {
        const s = 6;
        let x = u * s;
        const y = v * s * 1.1547;
        const r = Math.floor(y);
        x += (r % 2) * 0.5;
        const fx = x - Math.floor(x) - 0.5,
          fy = y - r - 0.5;
        const d = Math.max(Math.abs(fx) * 1.1547 + Math.abs(fy) * 0.5, Math.abs(fy));
        const seam = d > 0.46;
        const n = fbm(u * 12, v * 12, 3, 6);
        return {
          h: seam ? 0 : 0.7,
          c: seam ? [0.05, 0.08, 0.14] : mix([0.12, 0.15, 0.22], 0.8 + n * 0.3),
          r: seam ? 0.6 : 0.35,
          e: seam ? 1 : 0,
        };
      },
      5,
      true,
    ),
};

const cache = new Map<string, PbrSet>();
export function surface<K extends keyof typeof SURFACES>(
  kind: K,
  ...args: Parameters<(typeof SURFACES)[K]>
): PbrSet {
  const key = `${kind}:${args.join(',')}`;
  let set = cache.get(key);
  if (!set) {
    set = (SURFACES[kind] as (...a: unknown[]) => PbrSet)(...args);
    cache.set(key, set);
  }
  return set;
}

/** Clone a set with its own repeat (texture data stays shared on the GPU). */
export function repeatSet(set: PbrSet, rx: number, ry = rx): PbrSet {
  const c = (t?: THREE.Texture) => {
    if (!t) return undefined;
    const n = t.clone();
    n.repeat.set(rx, ry);
    n.needsUpdate = true;
    return n;
  };
  return {
    map: c(set.map)!,
    normalMap: c(set.normalMap)!,
    roughnessMap: c(set.roughnessMap)!,
    emissiveMap: c(set.emissiveMap),
  };
}
