'use client';
import { View } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { usePerfStore } from '@/lib/perf';

/**
 * One shared, fixed WebGL canvas for the whole page. Any <View> rendered anywhere
 * (gallery hover, feature workspace, scenario cards) draws into it, so the page
 * never holds more than one GL context for these small stages.
 */
export function ViewCanvas() {
  const { tier, ready, init } = usePerfStore();
  const [body, setBody] = useState<HTMLElement | null>(null);
  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- needs the DOM node after mount
    setBody(document.body);
  }, [init]);
  if (!ready || tier === 'low' || !body) return null;
  return (
    <Canvas
      className="!pointer-events-none !fixed !inset-0"
      style={{ zIndex: 20 }}
      eventSource={body}
      dpr={tier === 'high' ? [1, 2] : 1}
      gl={{ alpha: true, antialias: true }}
    >
      <View.Port />
    </Canvas>
  );
}

/** True when shared-canvas 3D is available on this device. */
export function useViews3d() {
  const { tier, ready } = usePerfStore();
  return ready && tier !== 'low';
}
