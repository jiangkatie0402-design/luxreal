'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Box, ChevronDown, ImagePlus, Layers } from 'lucide-react';
import { create } from 'zustand';
import { cn } from '@/lib/utils';
import { appUrl, site } from '@/config/site';

/** Preview-only switch between the upload box designs. */
export const UPLOAD_VARIANTS = [
  'D1 下拉设置',
  'D2 光边按钮',
  'D3 虚线拖放区',
  'D4 顶部高光',
  'D5 大缩略图',
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
  // "模型：标准" → ["模型", "标准"]
  const kv = (text: string) => {
    const m = text.match(/^(.+?)(?:\uFF1A|: )(.+)$/);
    return m ? [m[1], m[2]] : [null, text];
  };
  const settings = [
    { icon: Box, text: t('model') },
    { icon: Layers, text: t('output') },
  ];
  /** Outlined button: violet gradient hairline, dark fill, soft glow. */
  const outlined = (size: string, round = 'rounded-[12px]', glow = false) => (
    <span
      className={cn(
        'inline-flex shrink-0 p-px shadow-[0_0_26px_-6px_rgba(167,150,255,0.7)] transition-shadow hover:shadow-[0_0_34px_-4px_rgba(167,150,255,0.9)]',
        round,
        glow ? 'mcp-glow' : 'bg-[linear-gradient(135deg,#e2daff,#7d6fc0_55%,#3b2f7a)]',
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

  // D1 — settings read as dropdowns (icon, label, chevron).
  if (v === 0)
    return (
      <Glass {...drop} dragging={dragging} className="rounded-[22px]">
        {topRow()}
        <div className="flex items-center gap-2 border-t border-white/[0.08] px-3 py-2.5">
          {settings.map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex h-8 items-center gap-1.5 rounded-[9px] px-2.5 text-xs text-white/70 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              <Icon className="size-3.5 text-[#b8a6ff]" aria-hidden />
              {text}
              <ChevronDown className="size-3.5 text-white/40" aria-hidden />
            </span>
          ))}
          <span className="ml-auto">{outlined('h-10 px-5')}</span>
        </div>
      </Glass>
    );

  // D2 — settings as quiet label/value pairs; light travels round the button's outline.
  if (v === 1)
    return (
      <Glass {...drop} dragging={dragging} className="rounded-[22px]">
        {topRow()}
        <div className="flex items-center gap-4 border-t border-white/[0.08] py-2.5 pl-5 pr-3">
          {settings.map(({ text }, i) => {
            const [k, val] = kv(text);
            return (
              <span key={text} className="flex items-center gap-4 text-xs">
                {i > 0 && <span aria-hidden className="h-3 w-px bg-white/15" />}
                <span>
                  <span className="text-white/45">{k}</span>
                  <span className="ml-1.5 text-white/85">{val}</span>
                </span>
              </span>
            );
          })}
          <span className="ml-auto">{outlined('h-10 px-5', 'rounded-[12px]', true)}</span>
        </div>
      </Glass>
    );

  // D3 — the top layer is a real dashed drop zone that lights up on drag.
  if (v === 2)
    return (
      <Glass {...drop} dragging={dragging} className="rounded-[22px] p-2">
        <label
          className={cn(
            'flex cursor-pointer items-center gap-4 rounded-[16px] border border-dashed px-4 py-3.5 transition-colors',
            dragging
              ? 'border-[#c4b5fd] bg-[#6e62a3]/15'
              : 'border-white/15 hover:border-white/30 hover:bg-white/[0.03]',
          )}
        >
          {fileInput}
          {thumb('size-11')}
          {label}
        </label>
        <div className="flex items-center gap-2 px-1.5 pb-0.5 pt-2.5">
          {chips}
          <span className="ml-auto">{outlined('h-10 px-5')}</span>
        </div>
      </Glass>
    );

  // D4 — violet highlight along the top edge; the toolbar sits in a darker tray.
  if (v === 3)
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

  // D5 — a large dashed upload tile; copy and settings stacked beside it; tall button.
  return (
    <Glass {...drop} dragging={dragging} className="rounded-[22px] p-3">
      <div className="flex items-center gap-4">
        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 rounded-[16px] p-1 hover:bg-white/[0.03]">
          {fileInput}
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img
              src={preview}
              alt=""
              className="size-[72px] shrink-0 rounded-[14px] object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="grid size-[72px] shrink-0 place-items-center rounded-[14px] border border-dashed border-white/20 bg-white/[0.04] text-white/80"
            >
              <ImagePlus className="size-6" strokeWidth={1.5} />
            </span>
          )}
          <span className="min-w-0">
            {label}
            <span className="mt-2.5 hidden md:flex">{chips}</span>
          </span>
        </label>
        {outlined('h-12 px-6', 'rounded-[14px]')}
      </div>
    </Glass>
  );
}
