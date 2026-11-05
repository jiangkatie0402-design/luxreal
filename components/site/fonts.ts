import { Inter, Noto_Sans_SC, Orbitron, ZCOOL_QingKe_HuangYou } from 'next/font/google';

/**
 * Fonts per chinese-font-selector (web/UI, commercial): T0/T1 licences only,
 * Chinese faces subset/split for the web. MiSans and Smiley Sans are self-hosted
 * split CSS under /public/fonts (linked in the root layout); these come from next/font.
 */
export const titleZh = ZCOOL_QingKe_HuangYou({
  weight: '400',
  preload: false,
  display: 'swap',
  variable: '--f-zcool',
});
export const titleEn = Orbitron({ weight: ['700', '900'], subsets: ['latin'], display: 'swap' });

/** 思源黑体 (Source Han Sans = Noto Sans SC, OFL) */
export const sans = Noto_Sans_SC({
  weight: ['400', '500', '600', '700'],
  preload: false,
  display: 'swap',
  variable: '--f-sans',
});
/** Latin partner for the Chinese faces (declared first so Latin renders in Inter). */
export const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--f-inter' });

export const fontVariables = [titleZh.variable, sans.variable, inter.variable].join(' ');

/** Self-hosted split web fonts. */
export const fontStylesheets = [
  '/fonts/misans/MiSans-Regular.min.css',
  '/fonts/misans/MiSans-Semibold.min.css',
  '/fonts/smiley/smiley.css',
];
