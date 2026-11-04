import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

/** Aholo 3D mark (ghost in a violet sphere, transparent background) + wordmark. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Aholo 3D"
      className={cn(
        'flex items-center gap-2 font-display text-lg font-semibold tracking-tight',
        className,
      )}
    >
      <svg width="30" height="30" viewBox="0 0 100 100" aria-hidden className="shrink-0">
        <defs>
          <clipPath id="aholo-clip">
            <circle cx="50" cy="50" r="48" />
          </clipPath>
        </defs>
        <g clipPath="url(#aholo-clip)">
          <rect width="100" height="100" fill="#a385ff" />
          <circle cx="74" cy="22" r="66" fill="#7845ff" />
        </g>
        <path
          fill="#ffffff"
          d="M22 53 C 30 44, 41 34.5, 54 30.5 C 63 27.8, 70.5 29, 73.8 34 C 77 39, 78.6 47, 80.2 56 C 81.6 64, 84 70, 81 75.5 C 78 80, 72 76, 66 71.5 C 59 66.5, 52 61.5, 44 58.5 C 37 56, 29 54.4, 22 53 Z"
        />
        <path
          d="M72.6 34.5 C 71.6 26.8, 82.8 25.2, 83.4 31.6 C 83.8 35.8, 78.6 36.8, 78 33.2"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4.6"
          strokeLinecap="round"
        />
        <ellipse cx="53" cy="47" rx="3.3" ry="5.2" transform="rotate(-28 53 47)" fill="#7845ff" />
        <ellipse
          cx="62.5"
          cy="53.5"
          rx="3.3"
          ry="5.2"
          transform="rotate(-28 62.5 53.5)"
          fill="#7845ff"
        />
      </svg>
      <span>Aholo 3D</span>
    </Link>
  );
}
