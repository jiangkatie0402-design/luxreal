import type { AssetId } from './assets';

/**
 * Homepage scenario tabs. Each has its own secondary color (token), evidence cards
 * and the tools/formats it exports to. Tool names are shown as text marks, not
 * brand logos. Card copy lives in messages under `home.scenarios.<id>.cards.<card>`.
 */
export type EvidenceVisual =
  | { kind: 'printability'; asset: AssetId; volume: string }
  | { kind: 'split'; asset: AssetId }
  | { kind: 'channels'; asset: AssetId }
  | { kind: 'rig' }
  | { kind: 'compare'; asset: AssetId }
  | { kind: 'turntable'; asset: AssetId; chips: string[] }
  | { kind: 'batch'; thumbs: string[] }
  | { kind: 'gaussian'; asset: AssetId };

export interface Scenario {
  id: 'printing' | 'games' | 'ecommerce' | 'film';
  page: string;
  color: string;
  cards: { id: string; visual: EvidenceVisual }[];
  tools: string[];
  formats: string[];
}

export const scenarios: Scenario[] = [
  {
    id: 'printing',
    page: 'printing',
    color: 'var(--scene-printing)',
    cards: [
      { id: 'printable', visual: { kind: 'printability', asset: 'mushroom', volume: '312.4 cm³' } },
      { id: 'split', visual: { kind: 'split', asset: 'robot' } },
    ],
    tools: [
      'Bambu Studio',
      'OrcaSlicer',
      'PrusaSlicer',
      'UltiMaker Cura',
      'Chitubox',
      'Lychee Slicer',
    ],
    formats: ['STL', '3MF', 'OBJ'],
  },
  {
    id: 'games',
    page: 'gameAssets',
    color: 'var(--scene-games)',
    cards: [
      { id: 'pbr', visual: { kind: 'channels', asset: 'chest' } },
      { id: 'rig', visual: { kind: 'rig' } },
      { id: 'lowpoly', visual: { kind: 'compare', asset: 'rock' } },
    ],
    tools: ['Unity', 'Unreal Engine', 'Godot', 'Blender', 'Maya'],
    formats: ['FBX', 'GLB', 'OBJ', 'USDZ'],
  },
  {
    id: 'ecommerce',
    page: 'ecommerce',
    color: 'var(--scene-ecommerce)',
    cards: [
      { id: 'ar', visual: { kind: 'turntable', asset: 'vase', chips: ['USDZ', 'GLB', '360°'] } },
      {
        id: 'batch',
        visual: {
          kind: 'batch',
          thumbs: [
            'gallery-vase',
            'gallery-lamp',
            'gallery-chest',
            'gallery-bench',
            'gallery-house',
            'gallery-robot',
            'gallery-mushroom',
            'gallery-rock',
          ],
        },
      },
    ],
    tools: ['Shopify', 'WooCommerce', '<model-viewer>', 'AR Quick Look', 'Three.js'],
    formats: ['GLB', 'USDZ'],
  },
  {
    id: 'film',
    page: 'film',
    color: 'var(--scene-film)',
    cards: [
      { id: 'gaussian', visual: { kind: 'gaussian', asset: 'tree' } },
      {
        id: 'previs',
        visual: { kind: 'turntable', asset: 'house', chips: ['USD', 'FBX', '3DGS'] },
      },
    ],
    tools: ['Blender', 'Unreal Engine', 'Houdini', 'Nuke', 'DaVinci Resolve'],
    formats: ['PLY (3DGS)', 'USD', 'FBX'],
  },
];
