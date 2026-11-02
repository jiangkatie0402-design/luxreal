'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { appUrl, site } from '@/config/site';

/** The big upload box under the cover. Validates locally, then hands off to the app. */
export function CoverUpload() {
  const t = useTranslations('home.cover.upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

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
    if (!file) {
      setError(t('errorEmpty'));
      input.current?.click();
      return;
    }
    window.location.href = appUrl({ mode: 'image', source: 'www' });
  };

  return (
    <div
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
      className={`rounded-[22px] border bg-[rgba(12,19,34,0.82)] p-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-colors md:p-4 ${
        dragging ? 'border-accent' : 'border-line-strong'
      }`}
    >
      <label className="flex min-h-24 cursor-pointer items-center gap-4 rounded-2xl px-3 py-3 hover:bg-white/[0.03] md:min-h-28">
        <input
          ref={input}
          type="file"
          accept={site.upload.accept.join(',')}
          className="sr-only"
          onChange={(e) => accept(e.target.files?.[0])}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview
          <img
            src={preview}
            alt=""
            className="size-16 shrink-0 rounded-xl object-cover md:size-20"
          />
        ) : (
          <span
            aria-hidden
            className="grid size-14 shrink-0 place-items-center rounded-xl border border-dashed border-line-strong text-2xl text-muted md:size-16"
          >
            +
          </span>
        )}
        <span className="min-w-0">
          <span className="line-clamp-2 block text-base text-text md:truncate md:text-lg">
            {file ? file.name : t('placeholder')}
          </span>
          <span className="mt-1 block text-sm text-subtle">
            {file ? t('replace') : t('formats')}
          </span>
        </span>
      </label>
      <div className="flex flex-wrap items-center gap-2 border-t border-line px-1 pt-3">
        <span className="rounded-full border border-line px-3 py-1.5 text-xs text-muted">
          {t('model')}
        </span>
        <span className="rounded-full border border-line px-3 py-1.5 text-xs text-muted">
          {t('output')}
        </span>
        <p role="alert" className="min-w-0 flex-1 truncate px-2 text-sm text-accent">
          {error}
        </p>
        <button
          type="button"
          onClick={submit}
          className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-on-accent hover:brightness-110"
        >
          {t('generate')} <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
