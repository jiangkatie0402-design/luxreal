'use client';
import { View } from '@react-three/drei';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ShowcaseModel, ShowcaseRig } from '@/components/three/ShowcaseModel';
import { useViews3d } from '@/components/three/ViewCanvas';
import { thumbSrc, type GalleryItem } from '@/config/gallery';
import { Link } from '@/i18n/navigation';

/**
 * Community card: a pre-rendered thumbnail by default; on hover/focus the shared
 * canvas takes over with a live, spinning 3D model.
 */
export function GalleryCard({
  item,
  className = '',
  tall = false,
  inert = false,
}: {
  item: GalleryItem;
  className?: string;
  tall?: boolean;
  /** Duplicate copy inside a marquee: hidden from assistive tech and tab order. */
  inert?: boolean;
}) {
  const t = useTranslations('home.community');
  const can3d = useViews3d();
  const [active, setActive] = useState(false);
  const live = can3d && active;
  const title = t(`items.${item.id}`);
  return (
    <Link
      href={`/gallery/${item.id}`}
      aria-hidden={inert || undefined}
      tabIndex={inert ? -1 : undefined}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={`group block overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-border-strong ${className}`}
    >
      <div
        className={`relative ${tall ? 'aspect-[4/5]' : 'aspect-square'}`}
        style={{
          background: `radial-gradient(70% 60% at 50% 55%, color-mix(in srgb, ${item.tint} 16%, var(--color-surface-2)), var(--color-surface))`,
        }}
      >
        <Image
          src={thumbSrc(`gallery-${item.id}`)}
          alt={inert ? '' : title}
          fill
          sizes="(min-width: 768px) 300px, 240px"
          className={`object-contain p-3 transition-opacity duration-[var(--dur-base)] ${live ? 'opacity-0' : 'opacity-100'}`}
        />
        {live && (
          <View className="absolute inset-0">
            <ShowcaseRig>
              <ShowcaseModel asset={item.asset} yaw={item.yaw} active />
            </ShowcaseRig>
          </View>
        )}
      </div>
      <div className="flex items-center gap-2.5 px-4 py-3 text-sm">
        <span
          aria-hidden
          className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground"
        >
          {item.author.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{title}</span>
          <span className="block truncate text-xs text-subtle">{item.author}</span>
        </span>
        <span className="shrink-0 text-xs text-subtle">
          <span aria-hidden>♥ </span>
          {item.likes.toLocaleString()}
        </span>
      </div>
    </Link>
  );
}
