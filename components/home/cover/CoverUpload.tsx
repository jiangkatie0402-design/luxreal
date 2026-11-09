'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ImagePlus } from 'lucide-react';
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
  // Like an AI prompt box: the prompt as the field, attach bottom-left, send bottom-right.
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
}
