import type { AssetId } from './assets';

/**
 * Homepage feature tabs. Each tab shows a workspace window with input + settings
 * and the generated output.
 *
 * `screenshot`: set to a real workspace capture (e.g. '/screens/image-to-3d.webp')
 * to replace the coded workspace mock — no component changes needed.
 */
export interface FeatureTab {
  id: 'imageTo3d' | 'multiView' | 'rigging';
  output: AssetId;
  /** Thumbnail shown when live 3D isn't available. */
  outputThumb: string;
  input: { kind: 'image'; thumb: string } | { kind: 'views'; thumbs: string[] } | { kind: 'rig' };
  stats: string;
  screenshot?: string;
}

export const featureTabs: FeatureTab[] = [
  {
    id: 'imageTo3d',
    output: 'dog',
    outputThumb: 'gallery-corgi',
    input: { kind: 'image', thumb: 'gallery-corgi' },
    stats: '12.4k · PBR · 58s',
  },
  {
    id: 'multiView',
    output: 'chest',
    outputThumb: 'gallery-chest',
    input: { kind: 'views', thumbs: ['mv-front', 'mv-three-quarter', 'mv-side', 'mv-back'] },
    stats: '15.7k · PBR · 72s',
  },
  {
    id: 'rigging',
    output: 'dog',
    outputThumb: 'gallery-corgi',
    input: { kind: 'rig' },
    stats: '24 bones · walk',
  },
];
