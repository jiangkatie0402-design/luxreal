'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Final CTA card: the copy appears on a narrow centre panel, then the image opens out to both sides. */
export function FinalReveal({ className, children }: { className?: string; children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'closed' | 'peek' | 'open'>('closed');
  useEffect(() => {
    // reduced motion: the CSS shows the open card regardless of state
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer = 0;
    // observe the wrapper: the card's own clip-path shrinks its visible area
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.5) {
          setState('peek');
          timer = window.setTimeout(() => setState('open'), 900);
        } else if (!e.isIntersecting) {
          clearTimeout(timer);
          setState('closed');
        }
      },
      { threshold: [0, 0.5] },
    );
    if (wrap.current) io.observe(wrap.current);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);
  return (
    <div ref={wrap}>
      <div className={cn('final-reveal', className)} data-state={state}>
        {children}
      </div>
    </div>
  );
}
