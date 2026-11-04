import { create } from 'zustand';

/**
 * One hero colour set. Light two-hue backgrounds with near-black ink; brand violet
 * only as the title accent; a black CTA carries the "pop" colour.
 */
export interface HeroSet {
  name: string;
  /** three pages, each a two-hue gradient [from, to] */
  pages: [[string, string], [string, string], [string, string]];
  accent: [string, string];
  ink: string;
  inkMuted: string;
  ctaBg: string;
  ctaInk: string;
  /** mesh line gradient */
  mesh: [string, string];
}

const INK = '#170b33';
const INK_MUTED = 'rgba(23,11,51,0.68)';

export const HERO_SETS: HeroSet[] = [
  {
    name: '薰衣草 × 薄荷',
    pages: [
      ['#d9c8ff', '#b8f5e4'],
      ['#cbb6ff', '#bfeaff'],
      ['#e2d4ff', '#c4ffd8'],
    ],
    accent: ['#6a3cf0', '#a855f7'],
    ink: INK,
    inkMuted: INK_MUTED,
    ctaBg: '#120a24',
    ctaInk: '#9ff5d8',
    mesh: ['#6a3cf0', '#14b8a6'],
  },
  {
    name: '丁香 × 蜜桃',
    pages: [
      ['#dcc6ff', '#ffd3c2'],
      ['#cdb2ff', '#ffc4da'],
      ['#e6d6ff', '#ffe0c2'],
    ],
    accent: ['#6a3cf0', '#ff4f8b'],
    ink: INK,
    inkMuted: INK_MUTED,
    ctaBg: '#120a24',
    ctaInk: '#ffc9b5',
    mesh: ['#6a3cf0', '#ff5c8a'],
  },
  {
    name: '浅紫 × 荧光',
    pages: [
      ['#e1d3ff', '#ecffb0'],
      ['#d2bdff', '#e0ff8c'],
      ['#ebe1ff', '#f5ffcc'],
    ],
    accent: ['#5a2fe6', '#9b5cff'],
    ink: INK,
    inkMuted: INK_MUTED,
    ctaBg: '#120a24',
    ctaInk: '#d8ff3c',
    mesh: ['#6a3cf0', '#84cc16'],
  },
];

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) =>
  '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
/** Mix a colour toward white (t > 0) or black (t < 0). */
export const shade = (h: string, t: number) =>
  toHex(hex(h).map((v) => (t >= 0 ? v + (255 - v) * t : v * (1 + t))));
const mix = (a: string, b: string, t: number) => {
  const x = hex(a);
  const y = hex(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
};

/** Background + stripe tints for one page's two-hue gradient. */
export function pageTheme([a, b]: [string, string]) {
  return {
    bg: `radial-gradient(circle, rgba(23,11,51,0.07) 1px, transparent 1.5px) 0 0 / 18px 18px, radial-gradient(55% 50% at 50% 48%, rgba(255,255,255,0.55), transparent 70%), linear-gradient(150deg, ${a} 0%, ${mix(a, b, 0.5)} 55%, ${b} 100%)`,
    bands: [shade(a, -0.12), a, mix(a, b, 0.5), b],
  };
}

export const useHeroSet = create<{ i: number; set: (i: number) => void }>((setState) => ({
  i: 0,
  set: (i) => setState({ i }),
}));
