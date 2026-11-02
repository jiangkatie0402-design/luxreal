'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { appUrl, site } from '@/config/site';
import { Button } from '@/components/ui/Button';

/** Image upload. Validates locally, then hands off to the app (placeholder). */
export function HeroInput() {
  const t = useTranslations('home.hero');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- derived object URL lifecycle
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const accept = (f: File | undefined) => {
    if (!f) return;
    if (!(site.upload.accept as readonly string[]).includes(f.type))
      return setError(t('errorType'));
    if (f.size > site.upload.maxBytes) return setError(t('errorSize'));
    setError(null);
    setFile(f);
  };

  const submit = () => {
    if (!file) return setError(t('errorEmpty'));
    window.location.href = appUrl({ mode: 'image', source: 'www' });
  };

  return (
    <div className="rounded-lg border border-line bg-surface p-2 shadow-card">
      <p className="px-3 pb-2 pt-2 text-sm font-medium">{t('inputTitle')}</p>
      <div className="p-1">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            accept(e.dataTransfer.files[0]);
          }}
          className={`flex min-h-28 cursor-pointer items-center gap-4 rounded-md border border-dashed p-4 transition-colors ${
            dragging ? 'border-accent bg-accent-soft' : 'border-line-strong hover:bg-surface-2'
          }`}
        >
          <input
            type="file"
            accept={site.upload.accept.join(',')}
            className="sr-only"
            onChange={(e) => accept(e.target.files?.[0])}
          />
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img src={preview} alt="" className="size-20 rounded-md object-cover" />
          ) : (
            <span
              aria-hidden
              className="grid size-14 shrink-0 place-items-center rounded-md bg-surface-2 text-muted"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <circle cx="12" cy="12" r="3.5" />
                <path d="M8 5l1.5-2h5L16 5" />
              </svg>
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">
              {file ? file.name : t('dropHint')}
            </span>
            <span className="mt-1 block text-xs text-subtle">
              {file ? t('replace') : t('dropFormats')}
            </span>
          </span>
        </label>
      </div>
      <div className="flex flex-col gap-2 p-1 sm:flex-row sm:items-center sm:justify-between">
        <p role="alert" className="min-h-5 px-2 text-sm text-accent">
          {error}
        </p>
        <Button onClick={submit} size="md">
          {t('generate')}
          <span aria-hidden>→</span>
        </Button>
      </div>
    </div>
  );
}
