'use client';
/* Imperative three.js scene code: objects are positioned per frame by design. */
import { Grid } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { Asset } from '@/components/three/AssetLoader';
import { GenerationSlice } from '@/components/three/GenerationSlice';
import { useWalkCycle } from '@/components/three/useWalkCycle';
import type { StoryStageId } from '@/config/story';

/** Stage-local clock in seconds; owned by StoryStage so hover-pause freezes it. */
export type StoryClock = RefObject<{ t: number }>;

const ease = (x: number) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 2.4);
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Eases the camera toward the pose each scene writes into `pose`. */
function CameraRig({ pose }: { pose: RefObject<{ pos: THREE.Vector3; look: THREE.Vector3 }> }) {
  const camera = useThree((s) => s.camera);
  const look = useRef(new THREE.Vector3(0, 0.6, 0));
  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 3.5);
    camera.position.lerp(pose.current.pos, k);
    look.current.lerp(pose.current.look, k);
    camera.lookAt(look.current);
  });
  return null;
}

function Lights({ sun = 1.8, ambient = 0.7 }: { sun?: number; ambient?: number }) {
  return (
    <>
      <hemisphereLight args={['#ffffff', '#3b4660', ambient]} />
      <directionalLight
        position={[3, 5, 2.5]}
        intensity={sun}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#9cc2ff" />
    </>
  );
}

/** A dog that trots or idles, facing +x (the builder's own turn is cancelled). */
function Dog({
  legs = false,
  headTilt = 0,
  scale = 1,
}: {
  legs?: boolean;
  headTilt?: number;
  scale?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useWalkCycle(ref, { legs, headTilt, speed: legs ? 9 : 4 });
  return (
    <group rotation-y={0.5} scale={scale}>
      <Asset ref={ref} id="dog" />
    </group>
  );
}

/* ---------- 1 · capture: a real-looking room, phone camera framing the dog ---------- */
function CaptureScene({ pose }: { pose: RefObject<{ pos: THREE.Vector3; look: THREE.Vector3 }> }) {
  useFrame(() => {
    pose.current.pos.set(2.0, 1.15, 3.0);
    pose.current.look.set(0.1, 0.5, 0);
  });
  return (
    <>
      <color attach="background" args={['#d9cfbf']} />
      <Lights sun={1.6} ambient={0.9} />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#b48d64" roughness={0.8} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0.1, 0.003, 0.1]} receiveShadow>
        <circleGeometry args={[1.3, 48]} />
        <meshStandardMaterial color="#e9e1d2" roughness={1} />
      </mesh>
      <mesh position={[0, 2, -2.2]} receiveShadow>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color="#efe8dc" roughness={1} />
      </mesh>
      <group rotation-y={-0.45}>
        <Dog headTilt={0.25} />
      </group>
    </>
  );
}

/* ---------- 2 · generate: studio, generation slice builds the model ---------- */
function GenerateScene({
  clock,
  pose,
}: {
  clock: StoryClock;
  pose: RefObject<{ pos: THREE.Vector3; look: THREE.Vector3 }>;
}) {
  const ref = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const spin = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    pose.current.pos.set(2.5, 1.5, 3.3);
    pose.current.look.set(0, 0.65, 0);
    progress.current = ease((clock.current.t - 0.6) / 3);
    if (spin.current) spin.current.rotation.y += dt * 0.35;
  });
  return (
    <>
      <Lights />
      <Grid
        position={[0, 0, 0]}
        args={[10, 10]}
        cellSize={0.25}
        cellThickness={0.6}
        cellColor="#2a3a5c"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#3b5b99"
        fadeDistance={7}
        infiniteGrid
      />
      <group ref={spin}>
        <group rotation-y={-0.4}>
          <Asset ref={ref} id="dog" />
        </group>
      </group>
      <GenerationSlice target={ref} progress={progress} />
    </>
  );
}

/* ---------- 3 · print: printed in PLA on the printer, then set on the desk ---------- */
const DESK_Y = 0.75;
function PrintScene({
  clock,
  pose,
}: {
  clock: StoryClock;
  pose: RefObject<{ pos: THREE.Vector3; look: THREE.Vector3 }>;
}) {
  const fig = useRef<THREE.Group>(null);
  const holder = useRef<THREE.Group>(null);
  const nozzle = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const pla = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#e8e4dc', roughness: 0.55 }),
    [],
  );
  const bed = v3(-0.55, DESK_Y + 0.08, 0);
  const spot = v3(0.55, DESK_Y, 0.15);

  useFrame(() => {
    const t = clock.current.t;
    progress.current = ease((t - 0.4) / 3.2);
    const move = ease((t - 4) / 1.2);
    if (holder.current) {
      holder.current.position.lerpVectors(bed, spot, move);
      holder.current.position.y += Math.sin(move * Math.PI) * 0.25;
      holder.current.rotation.y = -0.6 + move * 0.9;
    }
    if (nozzle.current && fig.current) {
      const box = new THREE.Box3().setFromObject(fig.current);
      const h = box.min.y + (box.max.y - box.min.y) * progress.current;
      nozzle.current.position.set(
        bed.x + Math.sin(t * 14) * 0.12,
        h + 0.05,
        bed.z + Math.cos(t * 9) * 0.08,
      );
      nozzle.current.visible = progress.current < 0.999;
    }
    const printing = 1 - move;
    pose.current.pos.set(0.35 - 0.55 * printing, DESK_Y + 0.95, 2.3);
    pose.current.look.set(spot.x * move + bed.x * printing, DESK_Y + 0.22, 0);
  });

  return (
    <>
      <color attach="background" args={['#d6cfc3']} />
      <Lights sun={1.7} ambient={0.85} />
      {/* wall + desk */}
      <mesh position={[0, 2, -1.2]} receiveShadow>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#e7e0d4" roughness={1} />
      </mesh>
      <mesh position={[0, DESK_Y - 0.03, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.2, 0.06, 1.6]} />
        <meshStandardMaterial color="#9a7550" roughness={0.6} />
      </mesh>
      {/* printer: bed, frame, gantry */}
      <group position={[bed.x, DESK_Y, bed.z]}>
        <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.08, 0.7]} />
          <meshStandardMaterial color="#20252f" roughness={0.5} metalness={0.3} />
        </mesh>
        {[-0.36, 0.36].map((x) => (
          <mesh key={x} position={[x, 0.55, -0.32]} castShadow>
            <boxGeometry args={[0.05, 1.1, 0.05]} />
            <meshStandardMaterial color="#2b313c" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 1.08, -0.32]}>
          <boxGeometry args={[0.8, 0.06, 0.06]} />
          <meshStandardMaterial color="#2b313c" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
      <group ref={nozzle}>
        <mesh>
          <boxGeometry args={[0.09, 0.06, 0.09]} />
          <meshStandardMaterial color="#3b7bff" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.06, 0]}>
          <coneGeometry args={[0.025, 0.05, 8]} />
          <meshStandardMaterial color="#d8b25a" metalness={1} roughness={0.3} />
        </mesh>
      </group>
      {/* the figurine (small, PLA) */}
      <group ref={holder} position={bed}>
        <group scale={0.26} rotation-y={0.5}>
          <Asset ref={fig} id="dog" />
        </group>
      </group>
      <GenerationSlice
        target={fig}
        progress={progress}
        showParticles={false}
        showWireframe={false}
        showPlane={false}
        solidMaterial={pla}
      />
      {/* desk props */}
      <group position={[1.15, DESK_Y, -0.25]}>
        <mesh position={[0, 0.11, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.075, 0.22, 24]} />
          <meshStandardMaterial color="#f4f1ea" roughness={0.3} />
        </mesh>
        <mesh position={[0.1, 0.12, 0]} rotation-z={Math.PI / 2}>
          <torusGeometry args={[0.05, 0.012, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#f4f1ea" roughness={0.3} />
        </mesh>
      </group>
      <group position={[1.45, DESK_Y, -0.45]} scale={0.25}>
        <Asset id="pine" />
      </group>
    </>
  );
}

/* ---------- 4 · game: the dog trots through a little world; camera follows ---------- */
const TREES: [number, number, 'tree' | 'pine', number][] = [
  [-2.6, -1.4, 'tree', 0.9],
  [2.8, -2.2, 'pine', 1],
  [-1.2, 3, 'pine', 0.8],
  [3.4, 1.6, 'tree', 1.1],
  [0.3, -3.6, 'tree', 1],
  [-3.8, 1.2, 'pine', 1.2],
  [1.6, 3.8, 'tree', 0.9],
  [-4.5, -3.5, 'tree', 1.2],
  [5, -1, 'pine', 1.3],
];
function GameScene({
  clock,
  pose,
}: {
  clock: StoryClock;
  pose: RefObject<{ pos: THREE.Vector3; look: THREE.Vector3 }>;
}) {
  const dog = useRef<THREE.Group>(null);
  const R = 1.9;
  useFrame(() => {
    const a = 0.6 + clock.current.t * 0.45;
    const p = v3(R * Math.cos(a), 0, R * Math.sin(a));
    const fwd = v3(-Math.sin(a), 0, Math.cos(a));
    if (dog.current) {
      dog.current.position.copy(p);
      dog.current.rotation.y = Math.atan2(-fwd.z, fwd.x);
    }
    pose.current.pos
      .copy(p)
      .addScaledVector(fwd, -2.1)
      .add(v3(0, 1.25, 0))
      .addScaledVector(v3(p.x, 0, p.z).normalize(), 0.9);
    pose.current.look
      .copy(p)
      .addScaledVector(fwd, 0.8)
      .add(v3(0, 0.35, 0));
  });
  return (
    <>
      <color attach="background" args={['#a9d3f2']} />
      <fog attach="fog" args={['#a9d3f2', 6, 16]} />
      <Lights sun={2.2} ambient={1} />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[30, 64]} />
        <meshStandardMaterial color="#79b05a" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.004} receiveShadow>
        <ringGeometry args={[R - 0.3, R + 0.3, 64]} />
        <meshStandardMaterial color="#d9c49a" roughness={1} />
      </mesh>
      {TREES.map(([x, z, id, s]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]} scale={s}>
          <Asset id={id} />
        </group>
      ))}
      <group position={[0, 0, 0]} scale={0.9} rotation-y={0.6}>
        <Asset id="house" />
      </group>
      <group position={[-1.4, 0, -0.6]} scale={0.35}>
        <Asset id="rock" />
      </group>
      <group position={[1.1, 0, -1.2]} scale={0.45}>
        <Asset id="chest" />
      </group>
      <group ref={dog}>
        <Dog legs scale={0.42} />
      </group>
    </>
  );
}

export function StoryScenes({ stage, clock }: { stage: StoryStageId; clock: StoryClock }) {
  const pose = useRef({ pos: v3(2.5, 1.5, 3.3), look: v3(0, 0.6, 0) });
  return (
    <>
      <CameraRig pose={pose} />
      {stage === 'capture' && <CaptureScene pose={pose} />}
      {stage === 'generate' && <GenerateScene clock={clock} pose={pose} />}
      {stage === 'print' && <PrintScene clock={clock} pose={pose} />}
      {stage === 'game' && <GameScene clock={clock} pose={pose} />}
    </>
  );
}
