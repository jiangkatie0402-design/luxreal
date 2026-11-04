import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

/** Placeholder mark: a cube cut by the generation slice. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'flex items-center gap-2 font-display text-lg font-semibold tracking-tight',
        className,
      )}
    >
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
        <path
          d="M13 2 23 7.5v11L13 24 3 18.5v-11Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M3 13.5 13 19l10-5.5"
          fill="none"
          stroke="var(--slice-color)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M13 13v11" stroke="currentColor" strokeWidth="1.8" />
      </svg>
      <span>Lux3D</span>
    </Link>
  );
}
