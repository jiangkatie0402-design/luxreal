import type { AssetId } from './assets';

/** Placeholder community items. Titles live in messages under `community.items.<id>`. */
export interface GalleryItem {
  id: string;
  asset: AssetId;
  tint: string;
  author: string;
  likes: number;
  category: 'characters' | 'props' | 'nature' | 'architecture';
  tall?: boolean;
}

export const galleryItems: GalleryItem[] = [
  {
    id: 'corgi',
    asset: 'dog',
    tint: '#f0d6b8',
    author: 'mochi.studio',
    likes: 1284,
    category: 'characters',
    tall: true,
  },
  { id: 'oak', asset: 'tree', tint: '#cfe3c8', author: 'leafwork', likes: 932, category: 'nature' },
  {
    id: 'bench',
    asset: 'bench',
    tint: '#e6d9c9',
    author: 'parkside',
    likes: 411,
    category: 'props',
  },
  {
    id: 'lamp',
    asset: 'lamp',
    tint: '#d9dcef',
    author: 'nightshift',
    likes: 670,
    category: 'props',
    tall: true,
  },
  {
    id: 'chest',
    asset: 'chest',
    tint: '#efd3b5',
    author: 'pixelforge',
    likes: 2210,
    category: 'props',
  },
  {
    id: 'robot',
    asset: 'robot',
    tint: '#d7e5ee',
    author: 'toybox',
    likes: 1550,
    category: 'characters',
  },
  {
    id: 'mushroom',
    asset: 'mushroom',
    tint: '#f1d0cc',
    author: 'forager',
    likes: 803,
    category: 'nature',
    tall: true,
  },
  {
    id: 'vase',
    asset: 'vase',
    tint: '#e9e0f0',
    author: 'clayday',
    likes: 377,
    category: 'architecture',
  },
  {
    id: 'house',
    asset: 'house',
    tint: '#f2e3c2',
    author: 'tinytowns',
    likes: 1903,
    category: 'architecture',
  },
  {
    id: 'rock',
    asset: 'rock',
    tint: '#dfe0db',
    author: 'terrain.lab',
    likes: 290,
    category: 'nature',
  },
  {
    id: 'pup',
    asset: 'dog',
    tint: '#d6e6dc',
    author: 'pawprint',
    likes: 1120,
    category: 'characters',
  },
  {
    id: 'pine',
    asset: 'pine',
    tint: '#d3e2d9',
    author: 'leafwork',
    likes: 512,
    category: 'nature',
    tall: true,
  },
];
