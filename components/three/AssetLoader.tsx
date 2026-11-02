'use client';
import { useGLTF } from '@react-three/drei';
import { forwardRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { assets, type AssetId, type AssetSource } from '@/config/assets';

/** pbr = full material; the four channel modes preview one PBR map each. */
export type RenderMode =
  'pbr' | 'clay' | 'wireframe' | 'albedo' | 'normal' | 'roughness' | 'metalness';

interface AssetProps {
  id: AssetId;
  mode?: RenderMode;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  /** Normalize the largest dimension to this size (units). */
  fit?: number;
  /** Center the bounding box on the origin instead of standing on y = 0. */
  center?: boolean;
}

/** Unified asset interface: placeholder geometry today, glTF tomorrow. */
export const Asset = forwardRef<THREE.Group, AssetProps>(function Asset(
  { id, mode = 'pbr', ...rest },
  ref,
) {
  const src = assets[id] as AssetSource;
  return src.kind === 'gltf' ? (
    <GltfAsset ref={ref} url={src.url} mode={mode} {...rest} />
  ) : (
    <PlaceholderAsset ref={ref} build={src.build} mode={mode} {...rest} />
  );
});

type InnerProps = Omit<AssetProps, 'id'> & { mode: RenderMode };

const PlaceholderAsset = forwardRef<THREE.Group, InnerProps & { build: () => THREE.Group }>(
  function PlaceholderAsset({ build, mode, scale = 1, fit, center, ...rest }, ref) {
    const object = useMemo(() => build(), [build]);
    useRenderMode(object, mode);
    const frame = useFrameFit(object, fit, center);
    return (
      <group ref={ref} scale={scale} {...rest}>
        <group scale={frame.scale} position={frame.offset}>
          <primitive object={object} />
        </group>
      </group>
    );
  },
);

const GltfAsset = forwardRef<THREE.Group, InnerProps & { url: string }>(function GltfAsset(
  { url, mode, scale = 1, fit, center, ...rest },
  ref,
) {
  const { scene } = useGLTF(url);
  const object = useMemo(() => {
    const c = scene.clone(true);
    c.userData.interactive = true;
    return c;
  }, [scene]);
  useRenderMode(object, mode);
  const frame = useFrameFit(object, fit, center);
  return (
    <group ref={ref} scale={scale} {...rest}>
      <group scale={frame.scale} position={frame.offset}>
        <primitive object={object} />
      </group>
    </group>
  );
});

const clayMat = new THREE.MeshStandardMaterial({ color: '#e7e2d8', roughness: 0.85 });
const wireMat = new THREE.MeshBasicMaterial({ color: '#7f97c8', wireframe: true });

const normalMat = new THREE.MeshNormalMaterial();

/** Derive (and cache) a preview material for one PBR channel of an original material. */
function channelMaterial(mesh: THREE.Mesh, mode: RenderMode): THREE.Material {
  const orig = mesh.userData.original as THREE.Material;
  if (mode === 'clay') return clayMat;
  if (mode === 'wireframe') return wireMat;
  if (mode === 'normal') return normalMat;
  if (mode === 'pbr' || !(orig instanceof THREE.MeshStandardMaterial)) return orig;
  const key = `channel_${mode}`;
  if (!mesh.userData[key]) {
    const color =
      mode === 'albedo'
        ? orig.color.clone()
        : new THREE.Color().setScalar(mode === 'roughness' ? orig.roughness : orig.metalness);
    mesh.userData[key] = new THREE.MeshBasicMaterial({
      color,
      map: mode === 'albedo' ? orig.map : null,
    });
  }
  return mesh.userData[key] as THREE.Material;
}

/** Swap materials for clay / wireframe / channel previews without losing the originals. */
function useRenderMode(object: THREE.Object3D, mode: RenderMode) {
  useEffect(() => {
    object.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || m.userData.helper) return;
      if (!m.userData.original) m.userData.original = m.material;
      m.material = channelMaterial(m, mode);
    });
  }, [object, mode]);
}

/** Scale/offset so an object fits a target size and optionally sits centred. */
function useFrameFit(object: THREE.Object3D, fit?: number, center?: boolean) {
  return useMemo(() => {
    if (!fit && !center) return { scale: 1, offset: [0, 0, 0] as [number, number, number] };
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const scale = fit ? fit / Math.max(size.x, size.y, size.z, 1e-3) : 1;
    const c = box.getCenter(new THREE.Vector3()).multiplyScalar(scale);
    const offset: [number, number, number] = center
      ? [-c.x, -c.y, -c.z]
      : [-c.x, -box.min.y * scale, -c.z];
    return { scale, offset };
  }, [object, fit, center]);
}
