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

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) =>
  '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
/** Mix a colour toward white (t > 0) or black (t < 0). */
export const shade = (h: string, t: number) =>
  toHex(hex(h).map((v) => (t >= 0 ? v + (255 - v) * t : v * (1 + t))));

/** Ten purples; each set's three pages are the base, a deeper and a lighter step of it. */
const purple = (
  name: string,
  c: string,
  accent: [string, string],
  cta: string,
  ctaInk = '#ffffff',
): HeroSet => ({
  name,
  pages: [c, shade(c, -0.2), shade(c, 0.18)],
  accent,
  cta,
  ctaInk,
  ink: '#ffffff',
});

export const HERO_SETS: HeroSet[] = [
  purple('品牌紫', '#7a50f2', ['#ffe14d', '#fff6b8'], '#5a2fe6'),
  purple('电光紫', '#8b5cf6', ['#ffffff', '#e9ddff'], '#5b21b6'),
  purple('靛紫', '#5b4be8', ['#a5f3fc', '#e0fbff'], '#3730a3'),
  purple('葡萄紫', '#7e22ce', ['#fde68a', '#fffbeb'], '#581c87'),
  purple('兰花紫', '#a855f7', ['#fef08a', '#ffffff'], '#6b21a8'),
  purple('紫红莓果', '#a21caf', ['#fbcfe8', '#ffffff'], '#701a75'),
  purple('薰衣草', '#9a86f0', ['#ffffff', '#f5f0ff'], '#5b46d8'),
  purple('丁香紫', '#b48cf0', ['#3b0764', '#5b21b6'], '#5b21b6'),
  purple('烟灰紫', '#7d6b9e', ['#f3e8ff', '#ffffff'], '#463a66'),
  purple('午夜紫', '#3b1c8c', ['#c4b5fd', '#ede9fe'], '#c4b5fd', '#1e0b4b'),
];

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
