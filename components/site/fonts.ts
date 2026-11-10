import { Geist, Inter, Noto_Sans_SC, Oxanium, Pontano_Sans } from 'next/font/google';

/**
 * Fonts per chinese-font-selector (web/UI, commercial): T0/T1 licences only,
 * Chinese faces subset/split for the web. MiSans is self-hosted
 * split CSS under /public/fonts (linked in the root layout); these come from next/font.
 */
/** English display face (cover title and headings), OFL. */
export const titleEn = Oxanium({
  weight: ['600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--f-oxanium',
});

/** Cover main title in both languages (Latin; Chinese characters fall back to MiSans), OFL. */
export const heroTitle = Geist({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--f-geist',
});

/** English headings (and the English cover title), OFL. */
export const headingEn = Pontano_Sans({
  weight: ['400', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--f-pontano',
});

/** 思源黑体 (Source Han Sans = Noto Sans SC, OFL) */
export const sans = Noto_Sans_SC({
  weight: ['400', '500', '600', '700'],
  preload: false,
  display: 'swap',
  variable: '--f-sans',
});
/** Latin partner for the Chinese faces (declared first so Latin renders in Inter). */
export const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--f-inter' });

export const fontVariables = [
  titleEn.variable,
  heroTitle.variable,
  sans.variable,
  inter.variable,
].join(' ');

/** Self-hosted split web fonts. */
export const fontStylesheets = [
  '/fonts/misans/MiSans-Regular.min.css',
  '/fonts/misans/MiSans-Semibold.min.css',
  /** Chinese display face: Smiley Sans (得意黑, OFL) subset, renamed Aholo Display */
  '/fonts/smiley/AholoDisplay.min.css',
];
