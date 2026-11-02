'use client';
import { useEffect, useState } from 'react';
import { usePerfStore } from '@/lib/perf';

/** Steps through `count` states on a timer until the viewer picks one. */
export function useCycle(count: number, ms: number) {
  const reduced = usePerfStore((s) => s.reducedMotion);
  const [i, setI] = useState(0);
  const [manual, setManual] = useState(false);
  useEffect(() => {
    if (manual || reduced) return;
    const id = setInterval(() => setI((n) => (n + 1) % count), ms);
    return () => clearInterval(id);
  }, [manual, reduced, count, ms]);
  const pick = (n: number) => {
    setManual(true);
    setI(n);
  };
  return [i, pick] as const;
}
