'use client';
/* Imperative three.js scene graph: objects are positioned per frame by design. */
/* eslint-disable react-hooks/immutability */
import { Environment, Lightformer, Sparkles } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { GenerationSlice } from '@/components/three/GenerationSlice';
import { usePerfStore } from '@/lib/perf';
import * as P from './pieces';

export type WorldPhase = 'gen' | 'hold' | 'fly' | 'reset' | 'done';
export interface WorldStatus {
  index: number; // item currently being generated
  phase: WorldPhase;
  placed: number; // items standing in the world (incl. starters)
  total: number;
}

interface Item {
  id: string;
  build: () => THREE.Group;
  pos: [number, number];
  rot?: number;
  scale?: number;
  y?: number;
}

/** Already in the world when the loop starts. */
const STARTERS: Item[] = [
  {
    id: 'houseA',
    build: () => P.house({ wall: '#f1e4cc', roof: '#c4553a' }),
    pos: [-2.6, -1.7],
    rot: 0.35,
  },
  {
    id: 'houseB',
    build: () => P.house({ wall: '#b5654a', roof: '#3a4f6e', w: 1.6, h: 1.2, wallKind: 'brick' }),
    pos: [0.3, -3.1],
    rot: 0,
  },
  {
    id: 'houseC',
    build: () => P.house({ wall: '#f2d6b3', roof: '#2f6e58', w: 1.2, solarPanel: false }),
    pos: [3.0, -1.6],
    rot: -0.4,
  },
];

/** Generated one by one, in this order, then the world resets. */
export const QUEUE: Item[] = [
  {
    id: 'house',
    build: () => P.house({ wall: '#d9d4cc', roof: '#5b3f8f', w: 1.3, h: 1.05, wallKind: 'brick' }),
    pos: [-3.7, 1.0],
    rot: 0.7,
  },
  { id: 'lawn', build: P.lawn, pos: [0.6, -0.7], rot: 0.05, scale: 1.25 },
  { id: 'swing', build: P.swing, pos: [0.7, -0.75], rot: 0.05, y: 0.12, scale: 0.85 },
  { id: 'tree', build: () => P.tree(3), pos: [-1.3, -0.3] },
  { id: 'windmill', build: P.windmill, pos: [3.9, 1.0], rot: -0.7 },
  { id: 'pond', build: P.pond, pos: [-1.7, 2.1] },
  { id: 'doghouse', build: P.doghouse, pos: [2.0, 1.9], rot: -0.5 },
  { id: 'bench', build: P.bench, pos: [-0.2, 3.3], rot: 0.15 },
  { id: 'lamp', build: P.lamp, pos: [0.85, 3.4] },
  { id: 'fence', build: P.fence, pos: [2.9, 3.4], rot: -0.6 },
  { id: 'mailbox', build: P.mailbox, pos: [-1.0, 4.2], rot: 0.3 },
  { id: 'pine', build: P.pine, pos: [4.4, -1.4], scale: 1.1 },
];

const T = { gen: 3.0, hold: 0.8, fly: 1.3, gap: 0.25, reset: 1.2 };
const PEDESTAL = new THREE.Vector3(0, 1.5, 5.8);
const DISPLAY_SIZE = 2.6;

// Debug: ?worldspeed=4 fast-forwards the loop (used for screenshots).
const SPEED =
  typeof window !== 'undefined'
    ? Number(new URLSearchParams(window.location.search).get('worldspeed')) || 1
    : 1;

let glowTex: THREE.Texture | null = null;
function getGlow() {
  if (glowTex || typeof document === 'undefined') return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(70,130,255,0.9)');
  g.addColorStop(0.45, 'rgba(50,100,230,0.35)');
  g.addColorStop(1, 'rgba(30,60,180,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);

function World({
  onStatus,
  progressEl,
}: {
  onStatus: (s: WorldStatus) => void;
  progressEl: RefObject<HTMLElement | null>;
}) {
  const reduced = usePerfStore((s) => s.reducedMotion);
  const tier = usePerfStore((s) => s.tier);
  const camera = useThree((s) => s.camera);

  const starters = useMemo(() => STARTERS.map((it) => ({ ...it, obj: it.build() })), []);
  const items = useMemo(
    () =>
      QUEUE.map((it) => {
        const obj = it.build();
        const size = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
        const display = Math.min(DISPLAY_SIZE / Math.max(size.x, size.y, size.z), 3);
        return { ...it, obj, display, ref: { current: obj as THREE.Object3D }, landedAt: -1 };
      }),
    [],
  );

  const [active, setActive] = useState(reduced ? QUEUE.length : 0);
  const [phase, setPhase] = useState<WorldPhase>(reduced ? 'done' : 'gen');
  const seq = useRef({
    index: reduced ? QUEUE.length : 0,
    phase: (reduced ? 'done' : 'gen') as WorldPhase,
    start: 0,
    clock: 0,
    spin: 0,
  });
  const progress = useRef(0);
  const ring = useRef<THREE.Mesh>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const status = useRef(onStatus);
  useEffect(() => {
    status.current = onStatus;
  }, [onStatus]);

  const report = (index: number, ph: WorldPhase) =>
    status.current({
      index,
      phase: ph,
      placed: STARTERS.length + Math.min(index, QUEUE.length),
      total: STARTERS.length + QUEUE.length,
    });

  useEffect(() => {
    report(seq.current.index, seq.current.phase);
  }, []);

  const go = (ph: WorldPhase, index = seq.current.index) => {
    seq.current.phase = ph;
    seq.current.index = index;
    seq.current.start = seq.current.clock;
    setPhase(ph);
    setActive(index);
    report(index, ph);
  };

  useFrame((state, dt) => {
    const s = seq.current;
    if (!reduced) s.clock += Math.min(dt, 0.05) * SPEED;
    const t = s.clock - s.start;
    const now = state.clock.elapsedTime;

    // phase machine
    if (!reduced) {
      if (s.phase === 'gen' && t >= T.gen) go('hold');
      else if (s.phase === 'hold' && t >= T.hold) go('fly');
      else if (s.phase === 'fly' && t >= T.fly + T.gap) {
        items[s.index].landedAt = now;
        if (pulse.current) {
          const it = items[s.index];
          pulse.current.position.set(it.pos[0], 0.02, it.pos[1]);
          pulse.current.userData.t0 = now;
        }
        if (s.index + 1 >= items.length) go('reset', items.length);
        else go('gen', s.index + 1);
      } else if (s.phase === 'reset' && t >= T.reset) {
        items.forEach((it) => (it.landedAt = -1));
        go('gen', 0);
      }
    }

    progress.current = s.phase === 'gen' ? ease(clamp01(t / T.gen)) : 1;
    if (progressEl.current) {
      const p =
        s.phase === 'gen' ? progress.current : s.phase === 'hold' || s.phase === 'fly' ? 1 : 0;
      progressEl.current.style.width = `${Math.round(p * 100)}%`;
    }
    s.spin += Math.min(dt, 0.05) * (reduced ? 0 : 0.7);

    // item transforms
    items.forEach((it, i) => {
      const o = it.obj;
      const slotScale = it.scale ?? 1;
      if (i < s.index || s.phase === 'done' || (s.phase === 'reset' && i < items.length)) {
        // placed (or shrinking away during reset)
        o.visible = true;
        o.position.set(it.pos[0], it.y ?? 0, it.pos[1]);
        o.rotation.set(0, it.rot ?? 0, 0);
        let k = slotScale;
        if (it.landedAt >= 0) {
          const a = now - it.landedAt;
          if (a < 0.5) k *= 1 + Math.sin((a / 0.5) * Math.PI) * 0.12;
        }
        if (s.phase === 'reset') k *= 1 - ease(clamp01(t / T.reset));
        o.scale.setScalar(Math.max(k, 0.0001));
      } else if (i === s.index && (s.phase === 'gen' || s.phase === 'hold')) {
        o.visible = true;
        o.position.copy(PEDESTAL);
        o.rotation.set(0, s.spin, 0);
        o.scale.setScalar(it.display);
      } else if (i === s.index && s.phase === 'fly') {
        o.visible = true;
        const k = ease(clamp01(t / T.fly));
        const target = new THREE.Vector3(it.pos[0], it.y ?? 0, it.pos[1]);
        o.position.lerpVectors(PEDESTAL, target, k);
        o.position.y += Math.sin(k * Math.PI) * 2.2;
        const from = s.spin % (Math.PI * 2);
        o.rotation.set(0, from + ((it.rot ?? 0) + Math.PI * 2 - from) * k, 0);
        o.scale.setScalar(THREE.MathUtils.lerp(it.display, slotScale, k));
      } else {
        o.visible = false;
      }
    });

    // living details
    for (const o of [...items.map((x) => x.obj), ...starters.map((x) => x.obj)]) {
      const seat = o.getObjectByName('swingSeat');
      if (seat) seat.rotation.x = reduced ? 0 : Math.sin(now * 1.8) * 0.45;
      const water = o.getObjectByName('water') as THREE.Mesh | undefined;
      if (water) {
        const nm = (water.material as THREE.MeshPhysicalMaterial).normalMap;
        if (nm && !reduced) nm.offset.set(now * 0.02, now * 0.013);
      }
      const blades = o.getObjectByName('blades');
      if (blades) blades.rotation.z = reduced ? 0.3 : now * 1.2;
    }

    // pedestal ring + landing pulse
    if (ring.current) {
      const on = s.phase === 'gen' || s.phase === 'hold';
      const m = ring.current.material as THREE.MeshBasicMaterial;
      m.opacity = THREE.MathUtils.lerp(m.opacity, on ? 0.9 : 0.25, 0.08);
      ring.current.rotation.z = now * 0.6;
    }
    if (pulse.current) {
      const a = now - (pulse.current.userData.t0 ?? -10);
      const m = pulse.current.material as THREE.MeshBasicMaterial;
      pulse.current.visible = a < 0.9;
      pulse.current.scale.setScalar(0.4 + a * 2.2);
      m.opacity = Math.max(0, 0.8 - a);
    }

    // gentle camera drift
    // pull back on narrow (portrait) screens so the whole island fits
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const k = Math.min(Math.max(1, Math.pow(1.6 / aspect, 0.85)), 1.85);
    camera.position.set(Math.sin(now * 0.07) * (reduced ? 0 : 1.4), 8.2 * k, 19.5 * k);
    camera.lookAt(0, 0.2, 0.8);
  });

  const activeItem = items[Math.min(active, items.length - 1)];
  const sliceOn = !reduced && (phase === 'gen' || phase === 'hold') && active < items.length;

  return (
    <>
      <color attach="background" args={['#050a16']} />
      <fog attach="fog" args={['#050a16', 26, 62]} />
      <hemisphereLight args={['#8fb0ff', '#1d1430', 0.55]} />
      <directionalLight
        position={[6, 10, 5]}
        intensity={3.2}
        color="#ffd7a8"
        castShadow={tier === 'high'}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={9}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-7, 5, -6]} intensity={2.2} color="#5b8dff" />
      <mesh position={[0, -2.6, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[22, 22]} />
        <meshBasicMaterial
          map={getGlow()}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <Environment resolution={64} frames={1}>
        <Lightformer intensity={2.2} position={[0, 6, 5]} scale={[10, 3, 1]} color="#ffe9d0" />
        <Lightformer intensity={1.6} position={[-7, 2, -3]} scale={[4, 6, 1]} color="#5b8dff" />
        <Lightformer intensity={1.2} position={[7, 3, -2]} scale={[3, 5, 1]} color="#9fd0ff" />
      </Environment>

      <primitive object={useMemo(() => P.island(), [])} />
      <primitive object={useMemo(() => P.energyFloor(), [])} />
      {starters.map((s) => (
        <primitive
          key={s.id}
          object={s.obj}
          position={[s.pos[0], 0, s.pos[1]]}
          rotation={[0, s.rot ?? 0, 0]}
        />
      ))}
      {items.map((it) => (
        <primitive key={it.id} object={it.obj} />
      ))}
      {sliceOn && (
        <GenerationSlice
          key={activeItem.id}
          target={activeItem.ref}
          progress={progress}
          particleCount={tier === 'high' ? 2600 : 1200}
        />
      )}

      {/* hologram pedestal */}
      <group position={[PEDESTAL.x, PEDESTAL.y - 0.02, PEDESTAL.z]}>
        <mesh ref={ring} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[1.6, 1.7, 64, 1, 0, Math.PI * 1.7]} />
          <meshBasicMaterial color="#5ea8ff" transparent opacity={0.9} depthWrite={false} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
          <circleGeometry args={[1.58, 64]} />
          <meshBasicMaterial color="#2c5ad8" transparent opacity={0.16} depthWrite={false} />
        </mesh>
      </group>
      <mesh ref={pulse} rotation-x={-Math.PI / 2} visible={false}>
        <ringGeometry args={[0.9, 1, 48]} />
        <meshBasicMaterial color="#9fd1ff" transparent opacity={0} depthWrite={false} />
      </mesh>
      {tier !== 'low' && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.85} luminanceSmoothing={0.2} />
          <Vignette eskil={false} offset={0.25} darkness={0.55} />
        </EffectComposer>
      )}
      <Sparkles
        count={tier === 'high' ? 70 : 30}
        scale={[22, 9, 14]}
        position={[0, 3, 0]}
        size={2.2}
        speed={0.25}
        color="#9cc2ff"
        opacity={0.6}
      />
    </>
  );
}

/** Full-bleed canvas for the homepage hero. */
export default function WorldScene({
  onStatus,
  progressEl,
}: {
  onStatus: (s: WorldStatus) => void;
  progressEl: RefObject<HTMLElement | null>;
}) {
  const { tier, init } = usePerfStore();
  useEffect(() => init(), [init]);
  return (
    <Canvas
      className="!absolute inset-0"
      shadows={tier === 'high' ? 'percentage' : false}
      dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
      camera={{ position: [0, 8.2, 19.5], fov: 33 }}
      gl={{ antialias: true }}
    >
      <World onStatus={onStatus} progressEl={progressEl} />
    </Canvas>
  );
}
