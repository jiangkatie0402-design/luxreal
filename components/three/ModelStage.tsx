'use client';
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, type ReactNode } from 'react';
import { usePerfStore } from '@/lib/perf';
import { useToken } from '@/lib/tokens';

export interface ModelStageProps {
  children: ReactNode;
  className?: string;
  camera?: [number, number, number];
  target?: [number, number, number];
  fov?: number;
  autoRotate?: boolean;
  controls?: boolean;
  floor?: boolean;
  floorRadius?: number;
  /** Shown instead of WebGL on low-tier devices. */
  fallback?: ReactNode;
  label?: string;
}

/**
 * The unified model stage: fixed lighting rig, floor disc, contact shadow and orbit
 * interaction. Every model on the site is presented through this component.
 */
export function ModelStage({
  children,
  className,
  camera = [2.6, 1.7, 3.4],
  target = [0, 0.7, 0],
  fov = 35,
  autoRotate = false,
  controls = true,
  floor = true,
  floorRadius = 1.9,
  fallback,
  label,
}: ModelStageProps) {
  const { tier, reducedMotion, ready, init } = usePerfStore();
  useEffect(() => init(), [init]);
  const floorColor = useToken('--color-stage-floor', '#ddd6c6');

  if (ready && tier === 'low' && fallback) return <div className={className}>{fallback}</div>;

  return (
    <div className={className} role="img" aria-label={label}>
      <Canvas
        shadows={tier === 'high' ? 'percentage' : false}
        dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
        camera={{ position: camera, fov }}
        gl={{ antialias: true, alpha: true }}
      >
        <hemisphereLight args={['#ffffff', '#b9a98f', 0.7]} />
        <directionalLight
          position={[3, 5, 2.5]}
          intensity={1.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#ffd9c2" />
        <Environment resolution={64} frames={1}>
          <Lightformer intensity={1.5} position={[0, 4, 3]} scale={[6, 2, 1]} />
          <Lightformer intensity={0.8} position={[-4, 1, -2]} scale={[3, 3, 1]} color="#ffd9c2" />
          <Lightformer intensity={0.6} position={[4, 1, -2]} scale={[3, 3, 1]} color="#cfe0ff" />
        </Environment>
        <Suspense fallback={null}>{children}</Suspense>
        {floor && (
          <>
            <mesh rotation-x={-Math.PI / 2} position-y={-0.005} receiveShadow>
              <circleGeometry args={[floorRadius, 64]} />
              <meshStandardMaterial color={floorColor} roughness={0.95} />
            </mesh>
            <ContactShadows position={[0, 0.001, 0]} opacity={0.4} scale={5} blur={2.4} far={2} />
          </>
        )}
        {controls && (
          <OrbitControls
            target={target}
            enablePan={false}
            enableZoom={false}
            autoRotate={autoRotate && !reducedMotion}
            autoRotateSpeed={0.8}
            minPolarAngle={Math.PI / 5}
            maxPolarAngle={Math.PI / 2.1}
            enableDamping
          />
        )}
      </Canvas>
    </div>
  );
}
