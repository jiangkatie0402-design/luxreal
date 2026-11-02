'use client';
import { create } from 'zustand';

export type PerfTier = 'high' | 'mid' | 'low';

interface PerfState {
  tier: PerfTier;
  reducedMotion: boolean;
  touch: boolean;
  ready: boolean;
  init: () => void;
}

function detectTier(): PerfTier {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent);
  let gpu = '';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return 'low';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    gpu = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
  } catch {
    return 'low';
  }
  if (/swiftshader|llvmpipe|software/i.test(gpu)) return 'low';
  if (memory <= 2 || cores <= 2) return 'low';
  if (mobile || memory <= 4 || cores <= 4) return 'mid';
  return 'high';
}

export const usePerfStore = create<PerfState>((set, get) => ({
  tier: 'mid',
  reducedMotion: false,
  touch: false,
  ready: false,
  init: () => {
    if (get().ready || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const forced = new URLSearchParams(window.location.search).get('perf') as PerfTier | null;
    set({
      tier: forced && ['high', 'mid', 'low'].includes(forced) ? forced : detectTier(),
      reducedMotion: mq.matches,
      touch: window.matchMedia('(pointer: coarse)').matches,
      ready: true,
    });
    mq.addEventListener('change', (e) => set({ reducedMotion: e.matches }));
  },
}));
