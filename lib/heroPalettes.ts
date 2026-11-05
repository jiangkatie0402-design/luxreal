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

/** Tab style options (Meshy-like radius and size), chosen in the preview. */
export const TAB_STYLES = [
  {
    name: 'Meshy 原版',
    list: 'rounded-2xl bg-[#18181b] p-1',
    item: 'h-11 rounded-xl px-6 text-base text-muted-foreground hover:text-foreground data-[state=active]:bg-[#3f3f46] data-[state=active]:text-foreground',
  },
  {
    name: '方案 A 紫调',
    list: 'rounded-[14px] bg-[#141417] p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]',
    item: 'h-11 rounded-[10px] px-6 text-base text-muted-foreground hover:text-foreground data-[state=active]:bg-[linear-gradient(180deg,#3b2f63,#251d40)] data-[state=active]:text-foreground data-[state=active]:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_6px_18px_rgba(139,92,246,0.25)]',
  },
  {
    name: '方案 B 指示条',
    list: 'rounded-2xl bg-[#18181b] p-1',
    item: "relative h-11 rounded-xl px-6 text-base text-muted-foreground hover:text-foreground data-[state=active]:bg-[#27272a] data-[state=active]:text-foreground data-[state=active]:after:absolute data-[state=active]:after:bottom-1.5 data-[state=active]:after:left-1/2 data-[state=active]:after:h-0.5 data-[state=active]:after:w-5 data-[state=active]:after:-translate-x-1/2 data-[state=active]:after:rounded-full data-[state=active]:after:bg-primary data-[state=active]:after:content-['']",
  },
] as const;

export const useTabStyle = create<{ i: number; set: (i: number) => void }>((setState) => ({
  i: 0,
  set: (i) => setState({ i }),
}));
