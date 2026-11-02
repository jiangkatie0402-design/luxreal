'use client';
import { useEffect, useMemo, useState } from 'react';

/** Read a CSS custom property from :root. */
export function readToken(name: string, fallback = ''): string {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** Subscribe to a CSS token so 3D colors follow light/dark theme changes. */
export function useToken(name: string, fallback: string): string {
  const [value, setValue] = useState(fallback);
  useEffect(() => {
    const update = () => setValue(readToken(name, fallback));
    update();
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', update);
    return () => {
      mo.disconnect();
      mq.removeEventListener('change', update);
    };
  }, [name, fallback]);
  return value;
}

export function useTokenList(name: string, fallback: string[]): string[] {
  const fb = fallback.join(',');
  const raw = useToken(name, fb);
  return useMemo(
    () =>
      raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    [raw],
  );
}
