'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ImagePlus } from 'lucide-react';
import { create } from 'zustand';
import { cn } from '@/lib/utils';
import { appUrl, site } from '@/config/site';

/** Preview-only switch between the upload box designs. */
export const UPLOAD_VARIANTS = ['A 单行胶囊', 'B 两层精简', 'C 输入条+按钮'] as const;
export const useUploadVariant = create<{ v: number; set: (v: number) => void }>((setState) => ({
  v: 0,
  set: (v) => setState({ v }),
}));

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
      <span className="mt-0.5 block truncate text-xs text-white/55">
        {error ? (
          <span className="text-[#ffb4c8]">{error}</span>
        ) : file ? (
          t('replace')
        ) : (
          t('formats')
        )}
      </span>
    </span>
  );
  const chips = (
    <span className="flex shrink-0 items-center gap-1.5 text-xs text-white/60">
      <span className="rounded-full bg-white/[0.07] px-2.5 py-1">{t('model')}</span>
      <span className="rounded-full bg-white/[0.07] px-2.5 py-1">{t('output')}</span>
    </span>
  );
  const go = (cls?: string) => (
    <button
      type="button"
      onClick={submit}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 bg-white text-sm font-medium text-[#170b33] transition hover:bg-white/90',
        cls,
      )}
    >
      {t('generate')}
      <ArrowRight className="size-4" aria-hidden />
    </button>
  );

  // A — one slim row: thumb, text, settings, button.
  if (v === 0)
    return (
      <Glass {...drop} dragging={dragging} className="rounded-[20px] p-2">
        <div className="flex items-center gap-3">
          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[14px] p-1.5 hover:bg-white/[0.04]">
            {fileInput}
            {thumb('size-12')}
            {label}
          </label>
          <span className="hidden md:flex">{chips}</span>
          {go('h-12 rounded-[14px] px-5')}
        </div>
      </Glass>
    );

  // B — two tidy layers: drop row on top, a thin toolbar below.
  if (v === 1)
    return (
      <Glass {...drop} dragging={dragging} className="rounded-[22px]">
        <label className="flex cursor-pointer items-center gap-4 rounded-t-[22px] px-5 pb-4 pt-5 hover:bg-white/[0.03]">
          {fileInput}
          {thumb('size-11')}
          {label}
        </label>
        <div className="flex items-center gap-2 border-t border-white/[0.08] px-3 py-2.5">
          {chips}
          {go('ml-auto h-9 rounded-[10px] px-4')}
        </div>
      </Glass>
    );

  // C — a frosted input bar with the action as its own solid button beside it.
  return (
    <div className="flex items-stretch gap-3">
      <Glass {...drop} dragging={dragging} className="min-w-0 flex-1 rounded-[18px]">
        <label className="flex h-full cursor-pointer items-center gap-3 rounded-[18px] py-2 pl-2 pr-4 hover:bg-white/[0.04]">
          {fileInput}
          {thumb('size-12')}
          {label}
          <span className="ml-auto hidden lg:flex">{chips}</span>
        </label>
      </Glass>
      {go('rounded-[18px] px-7 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)]')}
    </div>
  );
}
