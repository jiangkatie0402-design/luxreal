import { create } from 'zustand';

/** One hero colour set: three page colours + title accent, CTA and ink. */
export interface HeroSet {
  name: string;
  pages: [string, string, string];
  accent: [string, string];
  cta: string;
  ctaInk: string;
  ink: string;
}

export const HERO_SETS: HeroSet[] = [
  {
    name: '电光三原',
    pages: ['#3b6dff', '#7a50f2', '#14b886'],
    accent: ['#ffe14d', '#fff6b8'],
    cta: '#5a2fe6',
    ctaInk: '#ffffff',
    ink: '#ffffff',
  },
  {
    name: '落日橘粉',
    pages: ['#ff6b4a', '#ff9f1c', '#f72585'],
    accent: ['#fff3b0', '#ffffff'],
    cta: '#3a0ca3',
    ctaInk: '#ffffff',
    ink: '#ffffff',
  },
  {
    name: '深海蓝青',
    pages: ['#0077b6', '#00a6c8', '#20b2a0'],
    accent: ['#ffe66d', '#fff6c2'],
    cta: '#023e8a',
    ctaInk: '#ffffff',
    ink: '#ffffff',
  },
  {
    name: '糖果气泡',
    pages: ['#ff6fae', '#9d7bff', '#4f9dff'],
    accent: ['#fff7ae', '#ffffff'],
    cta: '#6d28d9',
    ctaInk: '#ffffff',
    ink: '#ffffff',
  },
  {
    name: '薄荷蜜桃',
    pages: ['#20b2a0', '#ff8a65', '#9d7bff'],
    accent: ['#fff3b0', '#ffffff'],
    cta: '#3b2a7a',
    ctaInk: '#ffffff',
    ink: '#ffffff',
  },
  {
    name: '霓虹夜店',
    pages: ['#7b2cbf', '#f72585', '#2fb8e6'],
    accent: ['#ccff33', '#f0ffb0'],
    cta: '#240046',
    ctaInk: '#ccff33',
    ink: '#ffffff',
  },
  {
    name: '复古海报',
    pages: ['#e63946', '#f4a261', '#2a9d8f'],
    accent: ['#fefae0', '#ffffff'],
    cta: '#1d3557',
    ctaInk: '#ffffff',
    ink: '#ffffff',
  },
  {
    name: '柠檬汽水',
    pages: ['#ffc928', '#ff7a1a', '#ff3d7f'],
    accent: ['#3a0ca3', '#7209b7'],
    cta: '#1a1033',
    ctaInk: '#ffffff',
    ink: '#1a1033',
  },
  {
    name: '莫兰迪',
    pages: ['#6c8ead', '#9d8189', '#a89b6e'],
    accent: ['#ffffff', '#f2e9e4'],
    cta: '#3d405b',
    ctaInk: '#ffffff',
    ink: '#ffffff',
  },
  {
    name: '午夜荧光',
    pages: ['#1e1b4b', '#312e81', '#0f5f5a'],
    accent: ['#a3e635', '#d9f99d'],
    cta: '#a3e635',
    ctaInk: '#1e1b4b',
    ink: '#ffffff',
  },
];

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) =>
  '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
/** Mix a colour toward white (t > 0) or black (t < 0). */
export const shade = (h: string, t: number) =>
  toHex(hex(h).map((v) => (t >= 0 ? v + (255 - v) * t : v * (1 + t))));

/** Background + stripe tints derived from one page colour. */
export function pageTheme(c: string) {
  return {
    bg: `radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1.5px) 0 0 / 18px 18px, radial-gradient(60% 55% at 50% 55%, rgba(255,255,255,0.18), transparent 70%), linear-gradient(160deg, ${shade(c, -0.12)} 0%, ${c} 50%, ${shade(c, 0.45)} 100%)`,
    bands: [shade(c, -0.18), c, shade(c, 0.3), shade(c, 0.55)],
  };
}

export const useHeroSet = create<{ i: number; set: (i: number) => void }>((setState) => ({
  i: 0,
  set: (i) => setState({ i }),
}));
