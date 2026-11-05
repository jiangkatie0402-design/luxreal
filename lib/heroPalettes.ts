import { create } from 'zustand';

/** One cover colour treatment. The cover is a single still page (no carousel). */
export interface HeroSet {
  name: string;
  bg: string;
  /** small swatch for the preview switcher */
  swatch: string;
  accent: [string, string];
  /** wireframe line gradient */
  mesh: [string, string];
}

const DOTS =
  'radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1.5px) 0 0 / 18px 18px';

export const HERO_SETS: HeroSet[] = [
  {
    name: 'A 紫粉',
    bg: `${DOTS}, radial-gradient(60% 55% at 50% 38%, rgba(255,255,255,0.14), transparent 70%), linear-gradient(160deg, #d66bd9 0%, #9b50e2 45%, #5a2bbd 100%)`,
    swatch: 'linear-gradient(160deg,#d66bd9,#5a2bbd)',
    accent: ['#ffd1f3', '#ffffff'],
    mesh: ['#ffffff', '#ffc4f0'],
  },
  {
    name: 'B 粉蓝',
    bg: `${DOTS}, radial-gradient(55% 60% at 10% 25%, rgba(255,70,205,0.8), transparent 70%), radial-gradient(60% 70% at 88% 75%, rgba(45,95,255,0.6), transparent 70%), linear-gradient(160deg, #3a1ea0 0%, #1a2c9a 50%, #0b1452 100%)`,
    swatch: 'linear-gradient(135deg,#ff46cd,#1a2c9a 60%,#0b1452)',
    accent: ['#8ae9ff', '#c9b8ff'],
    mesh: ['#ffffff', '#8ae9ff'],
  },
];

export const useHeroSet = create<{ i: number; set: (i: number) => void }>((setState) => ({
  i: 0,
  set: (i) => setState({ i }),
}));

/** Use-case panel colour sets (one colour per field), chosen in the preview. */
type Panel = { bg: string; ink: string; muted: string; line: string; slot: string };
const dark = (bg: string): Panel => ({
  bg,
  ink: '#ffffff',
  muted: 'rgba(255,255,255,0.74)',
  line: 'rgba(255,255,255,0.2)',
  slot: 'rgba(255,255,255,0.08)',
});
const light = (bg: string): Panel => ({
  bg,
  ink: '#16121f',
  muted: 'rgba(22,18,31,0.68)',
  line: 'rgba(22,18,31,0.16)',
  slot: 'rgba(22,18,31,0.07)',
});
export const PANEL_SETS: { name: string; panels: [Panel, Panel, Panel] }[] = [
  { name: 'A 粉彩', panels: [light('#cdbcff'), light('#a8e6d4'), light('#ffcdb2')] },
  { name: 'B 冷暖对比', panels: [dark('#5b4e9a'), dark('#2f4fd1'), light('#f3d9bf')] },
  { name: 'C 莫兰迪', panels: [light('#bcaedb'), light('#b3c9b8'), light('#e3d3b9')] },
];
export const usePanelSet = create<{ i: number; set: (i: number) => void }>((setState) => ({
  i: 0,
  set: (i) => setState({ i }),
}));
