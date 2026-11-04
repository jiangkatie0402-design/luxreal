'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

type Theme = 'system' | 'light' | 'dark';
const KEY = 'lux3d-theme';

/** Inline script to apply the saved theme before paint. */
export const themeScript = `try{var t=localStorage.getItem('${KEY}');if(t==='light'||t==='system')document.documentElement.dataset.theme=t}catch(e){}`;

function persistTheme(next: Theme) {
  try {
    const root = document.documentElement;
    // Blue-black (dark) is the brand default and needs no attribute.
    if (next === 'dark') {
      localStorage.removeItem(KEY);
      delete root.dataset.theme;
    } else {
      localStorage.setItem(KEY, next);
      root.dataset.theme = next;
    }
  } catch {}
}

export function ThemeToggle() {
  const t = useTranslations('common');
  const [theme, setTheme] = useState<Theme>('dark');
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from storage after hydration
      if (saved === 'light' || saved === 'system') setTheme(saved);
    } catch {}
  }, []);
  const apply = (next: Theme) => {
    setTheme(next);
    persistTheme(next);
  };
  return (
    <div
      role="group"
      aria-label={t('themeLabel')}
      className="inline-flex rounded-full border border-border p-0.5 text-xs"
    >
      {(['dark', 'light', 'system'] as Theme[]).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={theme === v}
          onClick={() => apply(v)}
          className={`rounded-full px-2.5 py-1 ${theme === v ? 'bg-secondary text-foreground' : 'text-subtle hover:text-foreground'}`}
        >
          {t(`theme.${v}`)}
        </button>
      ))}
    </div>
  );
}
