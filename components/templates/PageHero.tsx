import type { ReactNode } from 'react';

export function PageHero({
  eyebrow,
  title,
  desc,
  children,
  aside,
}: {
  eyebrow?: string;
  title: string;
  desc: string;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="border-b border-border pt-[var(--header-h)] [background:var(--hero-gradient)]">
      <div
        className={`container-x grid gap-10 py-14 md:py-20 ${aside ? 'lg:grid-cols-2 lg:items-center' : ''}`}
      >
        <div className="max-w-2xl">
          {eyebrow && <p className="mb-3 text-sm font-medium text-primary">{eyebrow}</p>}
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-[3.5rem] md:leading-[1.05]">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{desc}</p>
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
        {aside}
      </div>
    </section>
  );
}
