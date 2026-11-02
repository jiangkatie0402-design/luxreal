import * as THREE from 'three';

/**
 * Code-generated placeholder assets. Every builder returns a Group standing on y = 0,
 * roughly 1.2–1.8 units tall. They are swapped for glTF files via config/assets.ts.
 */

type MatOpts = { color: string; roughness?: number; metalness?: number; emissive?: string };

const mat = ({ color, roughness = 0.7, metalness = 0, emissive }: MatOpts) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    ...(emissive ? { emissive, emissiveIntensity: 1.4 } : {}),
  });

function mesh(
  geo: THREE.BufferGeometry,
  material: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1],
  name?: string,
) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(...pos);
  m.rotation.set(...rot);
  m.scale.set(...scale);
  m.castShadow = true;
  m.receiveShadow = true;
  if (name) m.name = name;
  return m;
}

export function buildDog(): THREE.Group {
  const g = new THREE.Group();
  const fur = mat({ color: '#d99a5b', roughness: 0.9 });
  const cream = mat({ color: '#f3e3cc', roughness: 0.9 });
  const dark = mat({ color: '#2a201c', roughness: 0.25 });
  const collar = mat({ color: '#d8342b', roughness: 0.4, metalness: 0.1 });
  const tag = mat({ color: '#e8c35a', roughness: 0.25, metalness: 1 });

  const body = new THREE.Group();
  body.name = 'body';
  body.add(
    mesh(new THREE.CapsuleGeometry(0.34, 0.7, 8, 16), fur, [0, 0.62, 0], [0, 0, Math.PI / 2]),
  );
  body.add(
    mesh(new THREE.SphereGeometry(0.28, 16, 16), cream, [0.32, 0.55, 0], [0, 0, 0], [1, 0.9, 1.05]),
  );
  g.add(body);

  const legGeo = new THREE.CapsuleGeometry(0.09, 0.32, 6, 10);
  (
    [
      [0.38, 0.22, 0.17],
      [0.38, 0.22, -0.17],
      [-0.38, 0.22, 0.17],
      [-0.38, 0.22, -0.17],
    ] as [number, number, number][]
  ).forEach((p, i) => g.add(mesh(legGeo, i < 2 ? cream : fur, p, [0, 0, 0], [1, 1, 1], `leg${i}`)));

  const head = new THREE.Group();
  head.name = 'head';
  head.position.set(0.62, 0.98, 0);
  head.add(mesh(new THREE.SphereGeometry(0.3, 20, 20), fur));
  head.add(
    mesh(new THREE.SphereGeometry(0.17, 16, 16), cream, [0.22, -0.08, 0], [0, 0, 0], [1.3, 0.8, 1]),
  );
  head.add(
    mesh(
      new THREE.SphereGeometry(0.055, 12, 12),
      dark,
      [0.44, -0.04, 0],
      [0, 0, 0],
      [1, 0.8, 1.2],
      'nose',
    ),
  );
  head.add(mesh(new THREE.SphereGeometry(0.04, 10, 10), dark, [0.22, 0.08, 0.13]));
  head.add(mesh(new THREE.SphereGeometry(0.04, 10, 10), dark, [0.22, 0.08, -0.13]));
  const earGeo = new THREE.ConeGeometry(0.11, 0.26, 4);
  head.add(mesh(earGeo, fur, [-0.04, 0.3, 0.15], [0.3, 0, -0.15], [1, 1, 0.5], 'earL'));
  head.add(mesh(earGeo, fur, [-0.04, 0.3, -0.15], [-0.3, 0, -0.15], [1, 1, 0.5], 'earR'));
  g.add(head);

  g.add(
    mesh(
      new THREE.TorusGeometry(0.21, 0.035, 10, 28),
      collar,
      [0.5, 0.82, 0],
      [0, Math.PI / 2, 0.55],
      [1, 1, 1],
      'collar',
    ),
  );
  g.add(
    mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.015, 16),
      tag,
      [0.62, 0.68, 0],
      [0, 0, Math.PI / 2 - 0.4],
    ),
  );

  const tail = mesh(
    new THREE.CapsuleGeometry(0.06, 0.24, 6, 10),
    fur,
    [-0.62, 0.86, 0],
    [0, 0, 0.9],
    [1, 1, 1],
    'tail',
  );
  g.add(tail);
  g.rotation.y = -0.5;
  return wrap(g);
}

export function buildTree(): THREE.Group {
  const g = new THREE.Group();
  const bark = mat({ color: '#7a5537', roughness: 0.95 });
  const leaf = mat({ color: '#5f9a4e', roughness: 0.85 });
  const leaf2 = mat({ color: '#7cb35d', roughness: 0.85 });
  g.add(mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.9, 10), bark, [0, 0.45, 0]));
  g.add(mesh(new THREE.IcosahedronGeometry(0.45, 1), leaf, [0, 1.15, 0]));
  g.add(mesh(new THREE.IcosahedronGeometry(0.32, 1), leaf2, [0.28, 1.0, 0.12]));
  g.add(mesh(new THREE.IcosahedronGeometry(0.3, 1), leaf2, [-0.25, 1.05, -0.15]));
  g.add(mesh(new THREE.IcosahedronGeometry(0.28, 1), leaf, [0.05, 1.45, 0.05]));
  return wrap(g);
}

export function buildPine(): THREE.Group {
  const g = new THREE.Group();
  const bark = mat({ color: '#6b4a32', roughness: 0.95 });
  const needle = mat({ color: '#3e7a5a', roughness: 0.85 });
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.4, 8), bark, [0, 0.2, 0]));
  [0, 1, 2].forEach((i) =>
    g.add(mesh(new THREE.ConeGeometry(0.55 - i * 0.13, 0.6, 9), needle, [0, 0.55 + i * 0.36, 0])),
  );
  return wrap(g);
}

export function buildBench(): THREE.Group {
  const g = new THREE.Group();
  const wood = mat({ color: '#b07a4a', roughness: 0.75 });
  const iron = mat({ color: '#30302f', roughness: 0.4, metalness: 0.9 });
  for (let i = 0; i < 3; i++)
    g.add(mesh(new THREE.BoxGeometry(1.4, 0.05, 0.12), wood, [0, 0.45, -0.15 + i * 0.15]));
  for (let i = 0; i < 2; i++)
    g.add(
      mesh(new THREE.BoxGeometry(1.4, 0.1, 0.04), wood, [0, 0.7 + i * 0.15, -0.26], [-0.15, 0, 0]),
    );
  [-0.6, 0.6].forEach((x) => {
    g.add(mesh(new THREE.BoxGeometry(0.05, 0.45, 0.4), iron, [x, 0.22, 0]));
    g.add(mesh(new THREE.BoxGeometry(0.05, 0.45, 0.05), iron, [x, 0.7, -0.27], [-0.15, 0, 0]));
  });
  return wrap(g);
}

export function buildLamp(): THREE.Group {
  const g = new THREE.Group();
  const iron = mat({ color: '#2f3a3a', roughness: 0.35, metalness: 0.9 });
  const glow = mat({ color: '#fff3d1', roughness: 0.2, emissive: '#ffd27a' });
  g.add(mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.1, 16), iron, [0, 0.05, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.035, 0.05, 1.5, 12), iron, [0, 0.8, 0]));
  g.add(mesh(new THREE.SphereGeometry(0.13, 16, 16), glow, [0, 1.62, 0]));
  g.add(mesh(new THREE.ConeGeometry(0.22, 0.16, 6), iron, [0, 1.8, 0]));
  return wrap(g);
}

export function buildChest(): THREE.Group {
  const g = new THREE.Group();
  const wood = mat({ color: '#8a5a33', roughness: 0.8 });
  const gold = mat({ color: '#e0b34f', roughness: 0.3, metalness: 1 });
  g.add(mesh(new THREE.BoxGeometry(1, 0.5, 0.62), wood, [0, 0.25, 0]));
  g.add(
    mesh(
      new THREE.CylinderGeometry(0.31, 0.31, 1, 20, 1, false, 0, Math.PI),
      wood,
      [0, 0.5, 0],
      [0, 0, Math.PI / 2],
      [1, 1, 1],
    ),
  );
  [-0.35, 0.35].forEach((x) => {
    g.add(mesh(new THREE.BoxGeometry(0.08, 0.52, 0.64), gold, [x, 0.25, 0]));
    g.add(
      mesh(
        new THREE.CylinderGeometry(0.32, 0.32, 0.08, 20, 1, false, 0, Math.PI),
        gold,
        [x, 0.5, 0],
        [0, 0, Math.PI / 2],
      ),
    );
  });
  g.add(mesh(new THREE.BoxGeometry(0.14, 0.18, 0.06), gold, [0, 0.48, 0.33]));
  g.scale.setScalar(1.2);
  return wrap(g);
}

export function buildRobot(): THREE.Group {
  const g = new THREE.Group();
  const shell = mat({ color: '#e9eef2', roughness: 0.35, metalness: 0.2 });
  const accent = mat({ color: '#3d7bd9', roughness: 0.4 });
  const visor = mat({ color: '#1b2430', roughness: 0.1, metalness: 0.6 });
  const eye = mat({ color: '#9ff3ff', emissive: '#59e2ff' });
  g.add(mesh(new THREE.BoxGeometry(0.62, 0.6, 0.44), shell, [0, 0.62, 0]));
  g.add(mesh(new THREE.BoxGeometry(0.5, 0.42, 0.42), shell, [0, 1.18, 0]));
  g.add(mesh(new THREE.BoxGeometry(0.4, 0.2, 0.05), visor, [0, 1.2, 0.21]));
  g.add(mesh(new THREE.SphereGeometry(0.04, 10, 10), eye, [-0.09, 1.2, 0.24]));
  g.add(mesh(new THREE.SphereGeometry(0.04, 10, 10), eye, [0.09, 1.2, 0.24]));
  g.add(mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8), accent, [0, 1.5, 0]));
  g.add(mesh(new THREE.SphereGeometry(0.05, 10, 10), accent, [0, 1.62, 0]));
  [-0.42, 0.42].forEach((x) =>
    g.add(mesh(new THREE.CapsuleGeometry(0.07, 0.4, 6, 10), accent, [x, 0.6, 0])),
  );
  [-0.15, 0.15].forEach((x) =>
    g.add(mesh(new THREE.BoxGeometry(0.16, 0.32, 0.2), accent, [x, 0.16, 0])),
  );
  return wrap(g);
}

export function buildMushroom(): THREE.Group {
  const g = new THREE.Group();
  const stem = mat({ color: '#f1e6d2', roughness: 0.8 });
  const cap = mat({ color: '#d4463a', roughness: 0.5 });
  const dot = mat({ color: '#fff8ee', roughness: 0.7 });
  g.add(mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.8, 16), stem, [0, 0.4, 0]));
  g.add(
    mesh(
      new THREE.SphereGeometry(0.55, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      cap,
      [0, 0.75, 0],
      [0, 0, 0],
      [1, 0.75, 1],
    ),
  );
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const r = i % 2 ? 0.3 : 0.42;
    const y = 0.75 + Math.sqrt(Math.max(0, 0.55 ** 2 - r ** 2)) * 0.75;
    g.add(
      mesh(
        new THREE.SphereGeometry(0.06, 10, 10),
        dot,
        [Math.cos(a) * r, y, Math.sin(a) * r],
        [0, 0, 0],
        [1, 0.4, 1],
      ),
    );
  }
  return wrap(g);
}

export function buildVase(): THREE.Group {
  const g = new THREE.Group();
  const glaze = mat({ color: '#5a6fb8', roughness: 0.18, metalness: 0.05 });
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const r =
      0.12 + 0.3 * Math.sin(Math.PI * (t * 0.85 + 0.1)) ** 2 + (t > 0.85 ? (t - 0.85) * 0.8 : 0);
    pts.push(new THREE.Vector2(r, t * 1.4));
  }
  g.add(mesh(new THREE.LatheGeometry(pts, 40), glaze));
  return wrap(g);
}

export function buildHouse(): THREE.Group {
  const g = new THREE.Group();
  const wall = mat({ color: '#f2e4cf', roughness: 0.9 });
  const roof = mat({ color: '#b5543c', roughness: 0.7 });
  const wood = mat({ color: '#6e4a32', roughness: 0.8 });
  const glass = mat({ color: '#a8d0e6', roughness: 0.05, metalness: 0.3 });
  g.add(mesh(new THREE.BoxGeometry(1, 0.8, 0.8), wall, [0, 0.4, 0]));
  g.add(
    mesh(
      new THREE.ConeGeometry(0.82, 0.55, 4),
      roof,
      [0, 1.07, 0],
      [0, Math.PI / 4, 0],
      [1, 1, 0.85],
    ),
  );
  g.add(mesh(new THREE.BoxGeometry(0.22, 0.4, 0.02), wood, [0, 0.2, 0.41]));
  g.add(mesh(new THREE.BoxGeometry(0.2, 0.2, 0.02), glass, [0.3, 0.5, 0.41]));
  g.add(mesh(new THREE.BoxGeometry(0.2, 0.2, 0.02), glass, [-0.3, 0.5, 0.41]));
  g.add(mesh(new THREE.BoxGeometry(0.14, 0.35, 0.14), wall, [0.28, 1.2, -0.1]));
  return wrap(g);
}

export function buildRock(): THREE.Group {
  const g = new THREE.Group();
  const stone = mat({ color: '#8d8a84', roughness: 0.95 });
  const geo = new THREE.IcosahedronGeometry(0.6, 3);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n =
      1 + 0.12 * Math.sin(v.x * 7.1) * Math.cos(v.y * 5.3) + 0.08 * Math.sin(v.z * 9.7 + v.x * 3);
    v.multiplyScalar(n);
    pos.setXYZ(i, v.x, v.y * 0.7, v.z);
  }
  geo.computeVertexNormals();
  g.add(mesh(geo, stone, [0, 0.38, 0]));
  return wrap(g);
}

export function buildBall(): THREE.Group {
  const g = new THREE.Group();
  g.add(
    mesh(
      new THREE.SphereGeometry(0.12, 20, 20),
      mat({ color: '#c8e04a', roughness: 0.6 }),
      [0, 0.12, 0],
    ),
  );
  return wrap(g);
}

/** Re-centre on XZ, put base on y = 0. */
function wrap(inner: THREE.Group) {
  const box = new THREE.Box3().setFromObject(inner);
  const center = box.getCenter(new THREE.Vector3());
  inner.position.x -= center.x;
  inner.position.z -= center.z;
  inner.position.y -= box.min.y;
  const outer = new THREE.Group();
  outer.add(inner);
  outer.userData.interactive = true;
  return outer;
}
