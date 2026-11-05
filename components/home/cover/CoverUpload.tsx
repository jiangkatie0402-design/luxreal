'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ImagePlus, Sparkles } from 'lucide-react';
import { create } from 'zustand';
import { cn } from '@/lib/utils';
import { appUrl, site } from '@/config/site';

/** Preview-only switch between the upload box designs. */
export const UPLOAD_VARIANTS = [
  'A 雾紫按钮',
  'B 发光边框',
  'C 极简圆按钮',
  'D 两层+描边按钮',
  'E 分体发光按钮',
] as const;
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
  const arrow = <ArrowRight className="size-4" aria-hidden />;
  const row = (thumbSize: string, extra?: ReactNode) => (
    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[14px] p-1.5 hover:bg-white/[0.04]">
      {fileInput}
      {thumb(thumbSize)}
      {label}
      {extra}
    </label>
  );

  // A — single row; mist-violet gradient button (same family as the core CTA).
  if (v === 0)
    return (
      <Glass {...drop} dragging={dragging} className="rounded-[20px] p-2">
        <div className="flex items-center gap-3">
          {row('size-12')}
          <span className="hidden md:flex">{chips}</span>
          <button
            type="button"
            onClick={submit}
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#8f80d0,#5a4f94)] px-5 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_24px_-8px_rgba(110,98,163,0.8)] transition hover:brightness-110"
          >
            {t('generate')}
            {arrow}
          </button>
        </div>
      </Glass>
    );

  // B — single row inside a light-traced border; white button with a violet arrow disc.
  if (v === 1)
    return (
      <div className="mcp-glow rounded-[21px] p-px shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]">
        <div
          {...drop}
          className={cn(
            'rounded-[20px] bg-[rgba(14,10,30,0.72)] p-2 backdrop-blur-2xl',
            dragging && 'ring-1 ring-white/60',
          )}
        >
          <div className="flex items-center gap-3">
            {row('size-12')}
            <span className="hidden md:flex">{chips}</span>
            <button
              type="button"
              onClick={submit}
              className="group inline-flex h-12 shrink-0 items-center gap-3 rounded-full bg-white py-1.5 pl-5 pr-1.5 text-sm font-medium text-[#170b33] transition hover:bg-white/90"
            >
              {t('generate')}
              <span className="grid size-9 place-items-center rounded-full bg-[#6e62a3] text-white transition-transform group-hover:translate-x-0.5">
                {arrow}
              </span>
            </button>
          </div>
        </div>
      </div>
    );

  // C — a pill like a prompt box; the action is a round white send button.
  if (v === 2)
    return (
      <Glass {...drop} dragging={dragging} className="rounded-full p-1.5 pl-2">
        <div className="flex items-center gap-3">
          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-full p-1 hover:bg-white/[0.04]">
            {fileInput}
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview
              <img src={preview} alt="" className="size-11 shrink-0 rounded-full object-cover" />
            ) : (
              <span
                aria-hidden
                className="grid size-11 shrink-0 place-items-center rounded-full bg-white/[0.08] text-white/80 ring-1 ring-inset ring-white/15"
              >
                <ImagePlus className="size-5" strokeWidth={1.6} />
              </span>
            )}
            {label}
          </label>
          <span className="hidden md:flex">{chips}</span>
          <button
            type="button"
            onClick={submit}
            aria-label={t('generate')}
            title={t('generate')}
            className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-[#170b33] shadow-[0_6px_20px_-6px_rgba(255,255,255,0.5)] transition hover:scale-105"
          >
            <ArrowRight className="size-5" aria-hidden />
          </button>
        </div>
      </Glass>
    );

  // D — two layers; outlined button with a violet gradient hairline and soft glow.
  if (v === 3)
    return (
      <Glass {...drop} dragging={dragging} className="rounded-[22px]">
        <label className="flex cursor-pointer items-center gap-4 rounded-t-[22px] px-5 pb-4 pt-5 hover:bg-white/[0.03]">
          {fileInput}
          {thumb('size-11')}
          {label}
        </label>
        <div className="flex items-center gap-2 border-t border-white/[0.08] px-3 py-2.5">
          {chips}
          <span className="ml-auto rounded-[11px] bg-[linear-gradient(135deg,#d6ccff,#6e62a3_60%,#3b2f7a)] p-px shadow-[0_0_24px_-6px_rgba(167,150,255,0.7)]">
            <button
              type="button"
              onClick={submit}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-[#14102a] px-4 text-sm font-medium text-white transition hover:bg-[#1d1838]"
            >
              {t('generate')}
              {arrow}
            </button>
          </span>
        </div>
      </Glass>
    );

  // E — split: frosted input bar, and a separate violet button with a glow beneath.
  return (
    <div className="flex items-stretch gap-3">
      <Glass {...drop} dragging={dragging} className="min-w-0 flex-1 rounded-[18px] p-1.5">
        {row('size-12', <span className="ml-auto hidden lg:flex">{chips}</span>)}
      </Glass>
      <button
        type="button"
        onClick={submit}
        className="relative inline-flex shrink-0 items-center gap-2 rounded-[18px] bg-[linear-gradient(160deg,#a596e6,#6e62a3_55%,#4b4277)] px-7 text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_18px_44px_-12px_rgba(130,110,220,0.75)] transition hover:brightness-110"
      >
        <Sparkles className="size-4" aria-hidden />
        {t('generate')}
      </button>
    </div>
  );
}
