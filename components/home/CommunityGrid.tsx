'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { galleryItems } from '@/config/gallery';
import { GalleryCard } from './GalleryCard';

const FILTERS = ['all', 'characters', 'props', 'nature', 'architecture'] as const;

/** Filterable masonry used on /gallery. Thumbnails by default, live 3D on hover. */
export function CommunityGrid({ limit }: { limit?: number }) {
  const t = useTranslations('home.community');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
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
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(`filters.${f}`)}
          </button>
        ))}
      </div>
      <ul className="columns-2 gap-5 md:columns-3 lg:columns-4">
        {items.map((it) => (
          <li key={it.id} className="mb-5 break-inside-avoid">
            <GalleryCard item={it} tall={it.tall} />
          </li>
        ))}
      </ul>
    </div>
  );
}
