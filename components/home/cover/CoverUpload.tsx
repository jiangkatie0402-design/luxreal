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
export const GO_VARIANTS = [
  'B2 流光边框',
  'L1 双色流光胶囊',
  'L2 流光+光晕',
  'L3 彗星光点',
  'L4 流光+渐变字',
] as const;
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
          {gv === 0 && (
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
          {/* L1 — pill, two light heads (violet and pink) chasing round the border */}
          {gv === 1 && (
            <span className="glow-dual inline-flex rounded-full p-px shadow-[0_0_26px_-6px_rgba(200,150,255,0.6)]">
              <button
                type="button"
                onClick={submit}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-[#120e24] px-6 text-sm font-medium text-white transition-colors hover:bg-[#1c1638]"
              >
                {t('generate')}
                {arrow}
              </button>
            </span>
          )}
          {/* L2 — the light also blooms outside the button, following the head */}
          {gv === 2 && (
            <span className="relative inline-flex">
              <span
                aria-hidden
                className="mcp-glow absolute -inset-1 rounded-[14px] opacity-70 blur-md"
              />
              <span className="mcp-glow relative inline-flex rounded-[12px] p-px">
                <button
                  type="button"
                  onClick={submit}
                  className="inline-flex h-10 items-center gap-2 rounded-[11px] bg-[linear-gradient(180deg,#1d1740,#100c20)] px-5 text-sm font-medium text-white transition-colors hover:brightness-125"
                >
                  {t('generate')}
                  {arrow}
                </button>
              </span>
            </span>
          )}
          {/* L3 — a quiet border with a single bright comet running round it */}
          {gv === 3 && (
            <span className="glow-comet inline-flex rounded-[12px] p-px">
              <button
                type="button"
                onClick={submit}
                className="group inline-flex h-10 items-center gap-2.5 rounded-[11px] bg-[#100c1e] pl-5 pr-1.5 text-sm font-medium text-white"
              >
                {t('generate')}
                <span className="grid size-7 place-items-center rounded-[8px] bg-[#6e62a3]/50 transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </button>
            </span>
          )}
          {/* L4 — flowing border; label in a lavender gradient */}
          {gv === 4 && (
            <span className="mcp-glow inline-flex rounded-[12px] p-px shadow-[0_0_24px_-6px_rgba(167,150,255,0.6)]">
              <button
                type="button"
                onClick={submit}
                className="inline-flex h-10 items-center gap-2 rounded-[11px] bg-[#0f0b1d] px-5 text-sm font-semibold transition-colors hover:bg-[#1a1434]"
              >
                <span className="bg-[linear-gradient(90deg,#ffffff,#d6ccff_55%,#a996ff)] bg-clip-text text-transparent">
                  {t('generate')}
                </span>
                <ArrowRight className="size-4 text-[#c4b5fd]" aria-hidden />
              </button>
            </span>
          )}
        </span>
      </div>
    </Glass>
  );
}
