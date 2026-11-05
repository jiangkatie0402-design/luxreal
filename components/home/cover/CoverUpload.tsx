'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ChevronDown, CloudUpload, ImagePlus, Sparkles } from 'lucide-react';
import { create } from 'zustand';
import { cn } from '@/lib/utils';
import { appUrl, site } from '@/config/site';

/** Preview-only comparison: the locked D4 box vs a bezel-framed alternative. */
export const UPLOAD_VARIANTS = ['当前 D4', '对比 图二风格'] as const;
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
  /** Outlined button: violet gradient hairline, dark fill, soft glow. */
  const outlined = (size: string, round = 'rounded-[12px]') => (
    <span
      className={cn(
        'inline-flex shrink-0 p-px shadow-[0_0_26px_-6px_rgba(167,150,255,0.7)] transition-shadow hover:shadow-[0_0_34px_-4px_rgba(167,150,255,0.9)]',
        'bg-[linear-gradient(135deg,#e2daff,#7d6fc0_55%,#3b2f7a)]',
        round,
      )}
    >
      <button
        type="button"
        onClick={submit}
        className={cn(
          'inline-flex items-center gap-2 bg-[#15102c] text-sm font-medium text-white transition-colors hover:bg-[#1e1840]',
          size,
          round,
        )}
      >
        {t('generate')}
        {arrow}
      </button>
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

  // Comparison — device-like bezel: near-black well inside a lighter frame, violet
  // hairline on top, centred drop prompt, "label | value" pills, round orb button.
  if (v === 1) {
    const pill = (text: string) => {
      const m = text.match(/^(.+?)(?:\uFF1A|: )(.+)$/);
      return (
        <span className="inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.12] bg-[#121214] px-4 text-[13px]">
          <span className="text-white/45">{m ? m[1] : ''}</span>
          {m && <span aria-hidden className="h-3 w-px bg-white/20" />}
          <span className="text-white/90">{m ? m[2] : text}</span>
          <ChevronDown className="size-3.5 text-white/45" aria-hidden />
        </span>
      );
    };
    return (
      <div className="relative">
        {/* violet bloom under the frame */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[6%] -bottom-6 h-16 rounded-full bg-[#7c5cff]/35 blur-3xl"
        />
        <div
          {...drop}
          className="relative rounded-[30px] bg-[linear-gradient(180deg,#2a2a30,#1a1a1e)] p-2.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)]"
        >
          <div
            className={cn(
              'relative overflow-hidden rounded-[22px] border-2 bg-[#0a0a0c] shadow-[inset_0_2px_12px_rgba(0,0,0,0.8)] transition-colors',
              dragging ? 'border-[#8b7bff]' : 'border-black',
            )}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-[10%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(150,130,255,0.9),transparent)]"
            />
            <label className="flex cursor-pointer flex-col items-center px-6 pb-3 pt-6 text-center">
              {fileInput}
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                <img src={preview} alt="" className="size-10 rounded-lg object-cover" />
              ) : (
                <CloudUpload className="size-8 text-white/90" strokeWidth={1.4} aria-hidden />
              )}
              <span className="mt-2 text-lg font-medium text-white">
                {file ? file.name : t('placeholder')}
              </span>
              <span className="mt-1 text-xs text-white/45">
                {error ? (
                  <span className="text-[#ffb4c8]">{error}</span>
                ) : file ? (
                  t('replace')
                ) : (
                  t('formats')
                )}
              </span>
            </label>
            <div className="flex items-center gap-2 px-3 pb-3">
              <span className="hidden gap-2 md:flex">
                {pill(t('model'))}
                {pill(t('output'))}
              </span>
              <button
                type="button"
                onClick={submit}
                aria-label={t('generate')}
                title={t('generate')}
                className="ml-auto grid size-12 place-items-center rounded-full bg-[radial-gradient(circle_at_70%_75%,#f5f0ff_0%,#b9a6ff_28%,#6d4dff_62%,#2b1d6e_100%)] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_0_28px_rgba(124,92,255,0.6)] transition hover:scale-105"
              >
                <Sparkles className="size-5" fill="currentColor" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Violet highlight along the top edge; the toolbar sits in a darker tray.
  return (
    <Glass {...drop} dragging={dragging} className="overflow-hidden rounded-[22px]">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[8%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(214,204,255,0.85),transparent)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-16 size-56 rounded-full bg-[#8b5cf6]/20 blur-3xl"
      />
      {topRow()}
      <div className="flex items-center gap-2 bg-black/25 px-3 py-2.5">
        {chips}
        <span className="ml-auto">{outlined('h-10 px-5')}</span>
      </div>
    </Glass>
  );
}
