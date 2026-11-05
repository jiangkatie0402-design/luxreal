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

/** Active-tab options, all borderless; radius from the shared button token. */
export const TAB_STYLES = [
  {
    name: '1 雾紫',
    item: 'data-[state=active]:bg-[linear-gradient(135deg,#6e62a3,#4b4277)] data-[state=active]:text-white',
  },
  {
    name: '2 石墨紫',
    item: 'data-[state=active]:bg-[linear-gradient(135deg,#4a4560,#2f2c3d)] data-[state=active]:text-white',
  },
  {
    name: '3 紫光玻璃',
    item: 'data-[state=active]:bg-[radial-gradient(120%_160%_at_0%_0%,rgba(167,139,250,0.34),rgba(139,92,246,0.10)_70%)] data-[state=active]:text-[#ece7ff]',
  },
] as const;

export const useTabStyle = create<{ i: number; set: (i: number) => void }>((setState) => ({
  i: 0,
  set: (i) => setState({ i }),
}));
