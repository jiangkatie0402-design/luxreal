'use client';
import { View } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import { Asset } from '@/components/three/AssetLoader';
import { galleryItems, type GalleryItem } from '@/config/gallery';
import { Link } from '@/i18n/navigation';
import { usePerfStore } from '@/lib/perf';

const FILTERS = ['all', 'characters', 'props', 'nature', 'architecture'] as const;

function Spinner({ item, hovered }: { item: GalleryItem; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const reduced = usePerfStore((s) => s.reducedMotion);
  useFrame((_, dt) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y += dt * (hovered ? 1.6 : 0.25);
  });
  return (
    <>
      <hemisphereLight args={['#ffffff', '#b9a98f', 1]} />
      <directionalLight position={[3, 5, 3]} intensity={1.6} />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#ffd9c2" />
      <group ref={ref} rotation={[0.18, 0, 0]}>
        <Asset id={item.asset} fit={1.45} center />
      </group>
    </>
  );
}

function CommunityCard({ item, show3d }: { item: GalleryItem; show3d: boolean }) {
  const t = useTranslations('home.community');
  const [hovered, setHovered] = useState(false);
  return (
    <li className="mb-5 break-inside-avoid">
      <Link
        href={`/gallery/${item.id}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="group block"
      >
        <div
          className={`relative overflow-hidden rounded-lg border border-line ${item.tall ? 'aspect-[4/5]' : 'aspect-square'}`}
          style={{ background: item.tint }}
        >
          {show3d && (
            <View className="absolute inset-0">
              <perspectiveCamera />
              <Spinner item={item} hovered={hovered} />
            </View>
          )}
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3 text-sm">
          <span className="truncate font-medium group-hover:underline">
            {t(`items.${item.id}`)}
          </span>
          <span className="shrink-0 text-subtle">♥ {item.likes.toLocaleString()}</span>
        </div>
        <p className="text-sm text-muted">{t('by', { author: item.author })}</p>
      </Link>
    </li>
  );
}

/** Masonry of community items. One shared WebGL canvas renders every card via <View>. */
export function CommunityGrid({ limit }: { limit?: number }) {
  const t = useTranslations('home.community');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const { tier, ready, init } = usePerfStore();
  useEffect(() => init(), [init]);
  const show3d = ready && tier !== 'low';
  const items = galleryItems
    .filter((it) => filter === 'all' || it.category === filter)
    .slice(0, limit);

  return (
    <div>
      <div role="group" className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              filter === f
                ? 'border-text bg-text text-bg'
                : 'border-line text-muted hover:text-text'
            }`}
          >
            {t(`filters.${f}`)}
          </button>
        ))}
      </div>
      <ul className="columns-2 gap-5 md:columns-3 lg:columns-4">
        {items.map((it) => (
          <CommunityCard key={it.id} item={it} show3d={show3d} />
        ))}
      </ul>
      {show3d && (
        <Canvas
          className="!pointer-events-none !fixed !inset-0"
          style={{ zIndex: 20 }}
          eventSource={typeof document !== 'undefined' ? document.body : undefined}
          dpr={tier === 'high' ? [1, 2] : 1}
          camera={{ position: [0, 0.3, 3.4], fov: 32 }}
          gl={{ alpha: true, antialias: true }}
        >
          <View.Port />
        </Canvas>
      )}
    </div>
  );
}
