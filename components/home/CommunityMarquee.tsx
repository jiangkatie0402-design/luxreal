import { galleryItems } from '@/config/gallery';
import { GalleryCard } from './GalleryCard';

/** Two full-bleed rows drifting in opposite directions; pauses on hover. */
export function CommunityMarquee() {
  const half = Math.ceil(galleryItems.length / 2);
  const rows = [galleryItems.slice(0, half), galleryItems.slice(half)];
  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, r) => (
        <div key={r} className="marquee group/marquee overflow-hidden">
          <ul className={`marquee-track flex w-max gap-4 ${r === 1 ? 'marquee-reverse' : ''}`}>
            {[...row, ...row].map((item, i) => (
              <li key={`${item.id}-${i}`} className="w-[220px] shrink-0 md:w-[280px]">
                <GalleryCard item={item} inert={i >= row.length} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
