'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ImagePlus } from 'lucide-react';
import { create } from 'zustand';
import { cn } from '@/lib/utils';
import { appUrl, site } from '@/config/site';

/** Public asset base: "/" in the app, overridable for static previews. */
const BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? '/';
/** Example works shown as one-click starting points. */
const SAMPLES = ['shield', 'spear'] as const;

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
export const UPLOAD_VARIANTS = [
  'D 对话框',
  'E 带示例',
  'F 胶囊',
  'G 虚线拖放区',
  'C 居中',
] as const;
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

  const sub = (error || file) && (
    <span className="block truncate text-xs text-white/55">
      {error ? <span className="text-[#ffb4c8]">{error}</span> : t('replace')}
    </span>
  );
  const trySample = (k: string) => {
    window.location.assign(appUrl({ mode: 'image', source: 'www', sample: k }));
  };

  // D — like an AI prompt box: the prompt as the field, attach bottom-left, a round send bottom-right.
  if (v === 0)
    return (
      <Glass {...drop} dragging={dragging} className="overflow-hidden rounded-[24px]">
        {glow}
        <label className="block cursor-pointer px-6 pb-2 pt-5">
          {fileInput}
          <span className="block text-[17px] text-white/90">
            {file ? file.name : t('placeholder')}
          </span>
          <span className="mt-1 block min-h-4">{sub}</span>
        </label>
        <div className="flex items-center gap-2 px-3 pb-3">
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-white/[0.07] px-3.5 text-sm text-white/80 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.12]"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview
              <img src={preview} alt="" className="size-5 rounded object-cover" />
            ) : (
              <ImagePlus className="size-4" aria-hidden />
            )}
            {t('attach')}
          </button>
          <span className="ml-auto">{go}</span>
        </div>
      </Glass>
    );

  // E — prompt row with example works to start from in one click.
  if (v === 1)
    return (
      <Glass {...drop} dragging={dragging} className="overflow-hidden rounded-[22px]">
        {glow}
        <div className="flex items-center gap-3 py-3 pl-3 pr-3">
          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[14px] p-1.5 hover:bg-white/[0.04]">
            {fileInput}
            {thumb('size-11')}
            {label}
          </label>
          {go}
        </div>
        <div className="flex items-center gap-3 border-t border-white/[0.07] px-5 py-3">
          <span className="text-xs text-white/50">{t('samples')}</span>
          {SAMPLES.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => trySample(k)}
              className="size-11 rounded-xl bg-white/[0.06] bg-[length:78%] bg-center bg-no-repeat ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.12] hover:ring-white/30"
              style={{ backgroundImage: `url(${BASE}works/${k}-render.webp)` }}
              aria-label={`${t('samples')} ${k}`}
            />
          ))}
        </div>
      </Glass>
    );

  // F — a narrower pill: icon, prompt, round arrow.
  if (v === 2)
    return (
      <div className="mx-auto max-w-[640px]">
        <Glass {...drop} dragging={dragging} className="overflow-hidden rounded-full">
          {glow}
          <div className="flex items-center gap-2 py-2 pl-2 pr-2">
            <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-white/[0.04]">
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
            <span className="brand-ring brand-hero shrink-0 !rounded-full">
              <button
                type="button"
                onClick={submit}
                aria-label={t('generate')}
                title={t('generate')}
                className="brand-fill grid size-11 place-items-center !rounded-full"
              >
                <ArrowRight className="size-5" aria-hidden />
              </button>
            </span>
          </div>
        </Glass>
      </div>
    );

  // G — a dashed drop zone inside the glass, button to its right.
  if (v === 3)
    return (
      <Glass {...drop} dragging={dragging} className="overflow-hidden rounded-[22px] p-2.5">
        {glow}
        <div className="flex items-stretch gap-2.5">
          <label
            className={cn(
              'flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[15px] border border-dashed px-4 py-3 transition-colors',
              dragging
                ? 'border-[#c4b5fd] bg-[#6e62a3]/15'
                : 'border-white/20 hover:border-white/35 hover:bg-white/[0.03]',
            )}
          >
            {fileInput}
            {thumb('size-10')}
            {label}
          </label>
          <span className="flex items-center">{go}</span>
        </div>
      </Glass>
    );

  // C — a centred drop area: icon above the prompt, button beneath.
  return (
    <Glass {...drop} dragging={dragging} className="overflow-hidden rounded-[24px]">
      {glow}
      <div className="flex flex-col items-center gap-4 px-6 py-6 text-center">
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl px-4 py-1 hover:bg-white/[0.03]">
          {fileInput}
          {thumb('size-12')}
          <span className="text-base text-white">{file ? file.name : t('placeholder')}</span>
          {sub}
        </label>
        {go}
      </div>
    </Glass>
  );
}
