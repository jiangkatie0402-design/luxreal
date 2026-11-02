/**
 * Homepage social proof. Testimonials are EXAMPLES — replace with real, approved
 * user quotes before launch. Community works are AI-generated sample renders.
 * Copy lives in messages under `home.voices` / `home.community2`.
 */
export const testimonials = [
  { id: 'a', field: 'print', work: '/scenes/figurine.webp' },
  { id: 'b', field: 'game', work: '/community/knight.webp' },
  { id: 'c', field: 'ecommerce', work: '/community/sneaker.webp' },
  { id: 'd', field: 'film', work: '/core/robot-model-cut.webp' },
  { id: 'e', field: 'heritage', work: '/community/ding.webp' },
  { id: 'f', field: 'game', work: '/community/chest.webp' },
] as const;

export const communityWorks = [
  {
    id: 'corgi',
    src: '/core/corgi-model-cut.webp',
    author: 'mochi.studio',
    likes: 2841,
    tag: 'image',
  },
  { id: 'knight', src: '/community/knight.webp', author: 'ironforge', likes: 1960, tag: 'game' },
  { id: 'cat', src: '/community/cat.webp', author: 'orange.loaf', likes: 3312, tag: 'image' },
  { id: 'ding', src: '/community/ding.webp', author: 'museum.lab', likes: 1204, tag: 'heritage' },
  {
    id: 'sneaker',
    src: '/community/sneaker.webp',
    author: 'kicks3d',
    likes: 987,
    tag: 'ecommerce',
  },
  { id: 'robot', src: '/core/robot-model-cut.webp', author: 'toybox', likes: 2210, tag: 'text' },
  { id: 'chest', src: '/community/chest.webp', author: 'pixelforge', likes: 1755, tag: 'game' },
  { id: 'camera', src: '/community/camera.webp', author: 'analog.days', likes: 864, tag: 'image' },
  { id: 'figurine', src: '/scenes/figurine.webp', author: 'layerline', likes: 1432, tag: 'print' },
  { id: 'pup', src: '/scenes/corgi-run.webp', author: 'pawprint', likes: 2675, tag: 'game' },
] as const;
