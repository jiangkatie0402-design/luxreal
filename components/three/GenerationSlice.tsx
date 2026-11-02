'use client';
/* Imperative three.js scene-graph code: objects are mutated per frame by design. */
/* eslint-disable react-hooks/immutability */
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useToken, useTokenList } from '@/lib/tokens';
import { usePerfStore } from '@/lib/perf';
import { animateParticleCloud, createParticleCloud, type ParticleCloud } from './GaussianParticles';

export interface GenerationSliceProps {
  target: React.RefObject<THREE.Object3D | null>;
  /** 0 ~ 1. A number, or a ref for per-frame driving without re-renders. */
  progress: number | { current: number };
  axis?: 'y' | 'x' | 'z';
  direction?: 1 | -1;
  showParticles?: boolean;
  showWireframe?: boolean;
  sliceColor?: string;
  /** Show the translucent slice plane itself. Default true. */
  showPlane?: boolean;
  particleCount?: number;
  /** Use this material on the finished side instead of the model's own (e.g. printed PLA). */
  solidMaterial?: THREE.Material;
}

const AXES = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
};
const AXIS_INDEX = { x: 0, y: 1, z: 2 } as const;
const DEFAULT_PALETTE = ['#6cb6ff', '#8f9dff', '#5fd4e0', '#c3d3ff', '#3f6fe0'];

type SliceUniforms = {
  uSliceH: { value: number };
  uSliceAxis: { value: THREE.Vector3 };
  uSliceColor: { value: THREE.Color };
  uSliceGlow: { value: number };
  uSliceWidth: { value: number };
};

/** Inject a short-lived highlight band where the slice crosses the surface. */
function patchGlow(mat: THREE.Material, u: SliceUniforms) {
  if (!(mat instanceof THREE.MeshStandardMaterial)) return;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u);
    shader.vertexShader =
      'varying vec3 vSliceWorld;\n' +
      shader.vertexShader.replace(
        '#include <project_vertex>',
        '#include <project_vertex>\n  vSliceWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;',
      );
    shader.fragmentShader =
      'uniform float uSliceH;\nuniform vec3 uSliceAxis;\nuniform vec3 uSliceColor;\nuniform float uSliceGlow;\nuniform float uSliceWidth;\nvarying vec3 vSliceWorld;\n' +
      shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
  {
    float sd = abs(dot(vSliceWorld, uSliceAxis) - uSliceH);
    totalEmissiveRadiance += uSliceColor * (1.0 - smoothstep(0.0, uSliceWidth, sd)) * uSliceGlow * 1.6;
  }`,
      );
  };
  mat.customProgramCacheKey = () => 'lux-generation-slice';
  mat.needsUpdate = true;
}

/**
 * Brand symbol: a plane sweeping through an object. Finished side = real materials,
 * unfinished side = soft gaussian particles + faint wireframe.
 * Place it in an untransformed parent: the slice plane is positioned in world space.
 */
export function GenerationSlice({
  target,
  progress,
  axis = 'y',
  direction = 1,
  showParticles = true,
  showWireframe = true,
  showPlane = true,
  sliceColor,
  particleCount,
  solidMaterial,
}: GenerationSliceProps) {
  const gl = useThree((s) => s.gl);
  const tokenColor = useToken('--slice-color', '#5ea8ff');
  const palette = useTokenList('--particle-palette', DEFAULT_PALETTE);
  const textColor = useToken('--color-text-secondary', '#9aa8c7');
  const tier = usePerfStore((s) => s.tier);
  const color = sliceColor ?? tokenColor;
  const count = particleCount ?? (tier === 'high' ? 2200 : 900);

  const planes = useMemo(() => ({ solid: new THREE.Plane(), rest: new THREE.Plane() }), []);
  const uniforms = useMemo<SliceUniforms>(
    () => ({
      uSliceH: { value: 0 },
      uSliceAxis: { value: AXES.y.clone() },
      uSliceColor: { value: new THREE.Color(color) },
      uSliceGlow: { value: 0 },
      uSliceWidth: { value: 0.035 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const state = useRef<{ meshes: THREE.Mesh[]; wire: THREE.Mesh[]; cloud: ParticleCloud | null }>({
    meshes: [],
    wire: [],
    cloud: null,
  });
  const planeRef = useRef<THREE.Mesh>(null);
  const edgeRef = useRef<THREE.LineSegments>(null);
  const box = useMemo(() => new THREE.Box3(), []);
  const wireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        wireframe: true,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        clippingPlanes: [planes.rest],
      }),
    [planes],
  );

  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);

  useEffect(() => {
    uniforms.uSliceColor.value.set(color);
  }, [color, uniforms]);
  useEffect(() => {
    wireMat.color.set(textColor);
  }, [textColor, wireMat]);

  // Attach clipping + helpers to the target once it is mounted.
  useEffect(() => {
    const root = target.current;
    if (!root) return;
    const meshes: THREE.Mesh[] = [];
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && !m.userData.helper) meshes.push(m);
    });
    const originals = new Map<THREE.Mesh, THREE.Material>();
    for (const m of meshes) {
      const orig = (m.userData.original ?? m.material) as THREE.Material;
      originals.set(m, orig);
      const c = (solidMaterial ?? orig).clone();
      c.clippingPlanes = [planes.solid];
      patchGlow(c, uniforms);
      m.userData.original = c;
      m.material = c;
    }
    const wire: THREE.Mesh[] = [];
    for (const m of meshes) {
      const w = new THREE.Mesh(m.geometry, wireMat);
      w.userData.helper = true;
      w.raycast = () => {};
      m.add(w);
      wire.push(w);
    }
    const cloud = createParticleCloud(root, meshes, count, palette);
    (cloud.points.material as THREE.PointsMaterial).clippingPlanes = [planes.rest];
    cloud.points.raycast = () => {};
    root.add(cloud.points);
    state.current = { meshes, wire, cloud };
    return () => {
      wire.forEach((w) => w.parent?.remove(w));
      root.remove(cloud.points);
      cloud.points.geometry.dispose();
      (cloud.points.material as THREE.Material).dispose();
      for (const [m, orig] of originals) {
        (m.material as THREE.Material).dispose();
        m.userData.original = orig;
        m.material = orig;
      }
      state.current = { meshes: [], wire: [], cloud: null };
    };
    // palette identity changes with theme; rebuild then.
  }, [target, planes, uniforms, wireMat, count, palette, solidMaterial]);

  useFrame(({ clock }) => {
    const { meshes, wire, cloud } = state.current;
    if (!meshes.length) return;
    const p = THREE.MathUtils.clamp(
      typeof progress === 'number' ? progress : progress.current,
      0,
      1,
    );
    const a = AXES[axis];
    const ai = AXIS_INDEX[axis];

    box.makeEmpty();
    for (const m of meshes) box.expandByObject(m, false);
    const min = box.min.getComponent(ai);
    const max = box.max.getComponent(ai);
    const eps = 0.002;
    const span = max - min + eps * 2;
    const h = direction === 1 ? min - eps + p * span : max + eps - p * span;

    // Solid keeps the side already swept; rest keeps the other.
    const sign = direction === 1 ? 1 : -1;
    planes.solid.normal.copy(a).multiplyScalar(-sign);
    planes.solid.constant = sign * h;
    planes.rest.normal.copy(a).multiplyScalar(sign);
    planes.rest.constant = -sign * h;

    const active = p > 0.0005 && p < 0.9995;
    uniforms.uSliceAxis.value.copy(a);
    uniforms.uSliceH.value = h;
    uniforms.uSliceGlow.value = active ? 1 : 0;

    wire.forEach((w) => (w.visible = showWireframe && p < 0.9995));
    if (cloud) {
      cloud.points.visible = showParticles && p < 0.9995;
      if (cloud.points.visible) {
        const root = cloud.points.parent!;
        const local = root.worldToLocal(box.getCenter(new THREE.Vector3()).setComponent(ai, h));
        animateParticleCloud(
          cloud,
          clock.elapsedTime,
          ai,
          local.getComponent(ai),
          active ? 0.06 : 0,
        );
        (cloud.points.material as THREE.PointsMaterial).opacity = 0.85 * (1 - p * 0.4);
      }
    }

    const plane = planeRef.current;
    const edge = edgeRef.current;
    if (plane && edge) {
      const visible = showPlane && active;
      plane.visible = edge.visible = visible;
      if (visible) {
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3()).setComponent(ai, h);
        const others = [0, 1, 2]
          .filter((i) => i !== ai)
          .map((i) => size.getComponent(i) * 1.35 + 0.2);
        for (const o of [plane, edge]) {
          o.position.copy(center);
          o.rotation.set(axis === 'y' ? -Math.PI / 2 : 0, axis === 'x' ? Math.PI / 2 : 0, 0);
          o.scale.set(
            axis === 'x' ? others[1] : others[0],
            axis === 'x' ? others[0] : others[1],
            1,
          );
        }
      }
    }
  });

  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)), []);

  return (
    <group>
      <mesh ref={planeRef} visible={false} renderOrder={2} raycast={() => {}}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.14}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments
        ref={edgeRef}
        geometry={edgeGeo}
        visible={false}
        renderOrder={3}
        raycast={() => {}}
      >
        <lineBasicMaterial color={color} transparent opacity={0.9} />
      </lineSegments>
    </group>
  );
}
