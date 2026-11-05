import {
  Noto_Sans_SC,
  Noto_Serif_SC,
  Orbitron,
  Sora,
  ZCOOL_QingKe_HuangYou,
} from 'next/font/google';

/** Hero title faces (also exposed as CSS variables for heading options). */
export const titleZh = ZCOOL_QingKe_HuangYou({
  weight: '400',
  preload: false,
  display: 'swap',
  variable: '--f-zcool',
});
export const titleEn = Orbitron({ weight: ['700', '900'], subsets: ['latin'], display: 'swap' });

/** Heading / body options. */
export const serif = Noto_Serif_SC({
  weight: ['500', '600'],
  preload: false,
  display: 'swap',
  variable: '--f-serif',
});
export const sans = Noto_Sans_SC({
  weight: ['400', '500', '600'],
  preload: false,
  display: 'swap',
  variable: '--f-sans',
});
export const sora = Sora({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--f-sora',
});

export const fontVariables = [titleZh.variable, serif.variable, sans.variable, sora.variable].join(
  ' ',
);
