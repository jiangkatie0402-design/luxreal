import type { Group } from 'three';
import {
  buildBall,
  buildBench,
  buildChest,
  buildDog,
  buildHouse,
  buildLamp,
  buildMushroom,
  buildPine,
  buildRobot,
  buildRock,
  buildTree,
  buildVase,
} from '@/components/three/placeholders';

/**
 * Asset table. Phase 1 uses code-generated placeholders; switch an entry to
 * `{ kind: 'gltf', url: '/models/dog.glb' }` to load a real file — no component changes.
 */
export type AssetSource =
  { kind: 'placeholder'; build: () => Group } | { kind: 'gltf'; url: string };

export const assets = {
  dog: { kind: 'placeholder', build: buildDog },
  tree: { kind: 'placeholder', build: buildTree },
  pine: { kind: 'placeholder', build: buildPine },
  bench: { kind: 'placeholder', build: buildBench },
  lamp: { kind: 'placeholder', build: buildLamp },
  chest: { kind: 'placeholder', build: buildChest },
  robot: { kind: 'placeholder', build: buildRobot },
  mushroom: { kind: 'placeholder', build: buildMushroom },
  vase: { kind: 'placeholder', build: buildVase },
  house: { kind: 'placeholder', build: buildHouse },
  rock: { kind: 'placeholder', build: buildRock },
  ball: { kind: 'placeholder', build: buildBall },
} satisfies Record<string, AssetSource>;

export type AssetId = keyof typeof assets;
