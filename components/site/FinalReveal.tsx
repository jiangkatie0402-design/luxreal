'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Final CTA card: the copy appears on a narrow centre panel, then the image opens out to both sides. */
export function FinalReveal({ className, children }: { className?: string; children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'closed' | 'open'>('closed');
  useEffect(() => {
    // reduced motion: the CSS shows the open card regardless of state
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // observe the wrapper: the card's own clip-path shrinks its visible area
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.3) {
          setState('open');
        } else if (!e.isIntersecting) {
          setState('closed');
        }
      },
      { threshold: [0, 0.3] },
    );
    if (wrap.current) io.observe(wrap.current);
    return () => {
      io.disconnect();
    };
  }, []);
  return (
    <div ref={wrap} className="relative left-1/2 w-screen -translate-x-1/2">
      <div className={cn('final-reveal', className)} data-state={state}>
        {children}
      </div>
    </div>
  );
}
