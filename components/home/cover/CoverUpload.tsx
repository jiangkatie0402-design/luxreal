'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ImagePlus } from 'lucide-react';
import { create } from 'zustand';
import { cn } from '@/lib/utils';
import { appUrl, site } from '@/config/site';

/** Glass shell shared by the designs: dark frosted fill, hairline border, top highlight. */
function Glass({
  className,
  dragging,
  children,
  ...drop
}: {
  className?: string;
  dragging: boolean;
  children: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...drop}
      className={cn(
        'relative border bg-[rgba(14,10,30,0.55)] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl backdrop-saturate-150 transition-colors',
        dragging ? 'border-white/60' : 'border-white/[0.14]',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** The upload box on the cover. Validates locally, then hands off to the app. */
/** Preview-only: upload box layouts for review. */
export const UPLOAD_VARIANTS = ['A 单行', 'B 两层', 'C 居中'] as const;
export const useUploadVariant = create<{ v: number; set: (v: number) => void }>((setState) => ({
  v: 0,
  set: (v) => setState({ v }),
}));

export function CoverUpload() {
  const v = useUploadVariant((st) => st.v);
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

  const drop = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      accept(e.dataTransfer.files[0]);
    },
  };
  const fileInput = (
    <input
      ref={input}
      type="file"
      accept={site.upload.accept.join(',')}
      className="sr-only"
      onChange={(e) => accept(e.target.files?.[0])}
    />
  );
  const thumb = (size: string) =>
    preview ? (
      // eslint-disable-next-line @next/next/no-img-element -- local blob preview
      <img src={preview} alt="" className={cn(size, 'shrink-0 rounded-xl object-cover')} />
    ) : (
      <span
        aria-hidden
        className={cn(
          size,
          'grid shrink-0 place-items-center rounded-xl bg-white/[0.08] text-white/80 ring-1 ring-inset ring-white/15',
        )}
      >
        <ImagePlus className="size-5" strokeWidth={1.6} />
      </span>
    );
  const label = (
    <span className="min-w-0 text-left">
      <span className="block truncate text-[15px] text-white">
        {file ? file.name : t('placeholder')}
      </span>
      {(error || file) && (
        <span className="mt-0.5 block truncate text-xs text-white/55">
          {error ? <span className="text-[#ffb4c8]">{error}</span> : t('replace')}
        </span>
      )}
    </span>
  );
  const topRow = (pad = 'px-5 pb-4 pt-5') => (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-4 rounded-t-[22px] hover:bg-white/[0.03]',
        pad,
      )}
    >
      {fileInput}
      {thumb('size-11')}
      {label}
    </label>
  );

  const go = (
    <span className="brand-ring brand-hero shrink-0">
      <button
        type="button"
        onClick={submit}
        className="brand-fill inline-flex h-10 items-center gap-2 whitespace-nowrap px-5 text-sm font-semibold"
      >
        <span className="brand-label">{t('generate')}</span>
        <ArrowRight className="size-4" aria-hidden />
      </button>
    </span>
  );
  const glow = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[8%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(214,204,255,0.85),transparent)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-16 size-56 rounded-full bg-[#8b5cf6]/20 blur-3xl"
      />
    </>
  );

  // A — one slim row: icon, prompt, button.
  if (v === 0)
    return (
      <Glass {...drop} dragging={dragging} className="overflow-hidden rounded-[20px]">
        {glow}
        <div className="flex items-center gap-3 py-2.5 pl-3 pr-2.5">
          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[14px] p-1.5 hover:bg-white/[0.04]">
            {fileInput}
            {thumb('size-11')}
            {label}
          </label>
          {go}
        </div>
      </Glass>
    );

  // B — two layers kept: prompt on top, the button alone in the tray below.
  if (v === 1)
    return (
      <Glass {...drop} dragging={dragging} className="overflow-hidden rounded-[22px]">
        {glow}
        {topRow()}
        <div className="flex items-center bg-black/25 px-3 py-2.5">
          <span className="ml-auto">{go}</span>
        </div>
      </Glass>
    );

  // C — a centred drop area: icon above a larger prompt, button beneath.
  return (
    <Glass {...drop} dragging={dragging} className="overflow-hidden rounded-[24px]">
      {glow}
      <div className="flex flex-col items-center gap-4 px-6 py-6 text-center">
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl px-4 py-1 hover:bg-white/[0.03]">
          {fileInput}
          {thumb('size-12')}
          <span className="text-base text-white">{file ? file.name : t('placeholder')}</span>
          {(error || file) && (
            <span className="-mt-2 text-xs text-white/55">
              {error ? <span className="text-[#ffb4c8]">{error}</span> : t('replace')}
            </span>
          )}
        </label>
        {go}
      </div>
    </Glass>
  );
}
