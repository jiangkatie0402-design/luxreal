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
/** Preview-only: button styles for review. */
export const GO_VARIANTS = ['当前 描边', 'B1 雾紫流光', 'B2 流光边框', 'B3 玻璃胶囊'] as const;
export const useGoVariant = create<{ v: number; set: (v: number) => void }>((setState) => ({
  v: 0,
  set: (v) => setState({ v }),
}));

export function CoverUpload() {
  const gv = useGoVariant((st) => st.v);
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
        <span className="ml-auto">
          {gv === 0 && outlined('h-10 px-5')}
          {gv === 1 && (
            <button
              type="button"
              onClick={submit}
              className="go-sheen relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-[12px] bg-[linear-gradient(135deg,#9a8ad8,#6e62a3_55%,#4b4277)] px-5 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_28px_-10px_rgba(130,110,220,0.9)] transition hover:brightness-110"
            >
              {t('generate')}
              {arrow}
            </button>
          )}
          {gv === 2 && (
            <span className="mcp-glow inline-flex rounded-[12px] p-px shadow-[0_0_24px_-6px_rgba(167,150,255,0.6)]">
              <button
                type="button"
                onClick={submit}
                className="inline-flex h-10 items-center gap-2 rounded-[11px] bg-[#120e24] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1c1638]"
              >
                {t('generate')}
                {arrow}
              </button>
            </span>
          )}
          {gv === 3 && (
            <button
              type="button"
              onClick={submit}
              className="group inline-flex h-10 items-center gap-2.5 rounded-full border border-white/25 bg-white/[0.12] py-1 pl-4 pr-1 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_24px_-10px_rgba(0,0,0,0.6)] backdrop-blur-md transition hover:bg-white/[0.18]"
            >
              {t('generate')}
              <span className="grid size-8 place-items-center rounded-full bg-white text-[#2a1f5c] transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="size-4" aria-hidden />
              </span>
            </button>
          )}
        </span>
      </div>
    </Glass>
  );
}
