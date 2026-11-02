/**
 * Homepage cover slides, in story order. Images are AI-generated key visuals
 * (Figma file "Lux3D 相关改动", page "Aholo3D 官网"). Replace a `src` to swap art.
 * Copy lives in messages under `home.cover.slides.<id>`.
 */
export const coverSlides = [
  { id: 'capture', src: '/cover/capture.webp', position: '60% 50%' },
  { id: 'model', src: '/cover/model.webp', position: '55% 50%' },
  { id: 'print', src: '/cover/print.webp', position: '45% 50%' },
  { id: 'game', src: '/cover/game.webp', position: '45% 50%' },
] as const;

export const COVER_INTERVAL = 4500;
