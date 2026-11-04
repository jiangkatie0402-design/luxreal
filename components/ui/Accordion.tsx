export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((it) => (
        <details key={it.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium [&::-webkit-details-marker]:hidden">
            {it.q}
            <span
              aria-hidden
              className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-transform duration-[var(--dur-base)] group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{it.a}</p>
        </details>
      ))}
    </div>
  );
}
