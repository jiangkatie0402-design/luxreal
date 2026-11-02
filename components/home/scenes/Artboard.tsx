import { forwardRef, type ReactNode } from 'react';

/**
 * A fixed 3:2 layer that covers its stage like `object-fit: cover`. Scene art and
 * everything that must line up with it is placed in % of this layer, so alignment
 * holds at every stage size. The stage needs `container-type: size`.
 */
export const Artboard = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  function Artboard({ children, className = '' }, ref) {
    return (
      <div
        ref={ref}
        className={`absolute left-1/2 top-1/2 aspect-[3/2] w-[max(100cqw,150cqh)] -translate-x-1/2 -translate-y-1/2 ${className}`}
      >
        {children}
      </div>
    );
  },
);
