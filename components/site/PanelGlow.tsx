/** Soft blurred tints of the panel colour behind the copy (no lines, no noise). */
export function PanelGlow({
  tint,
  strength = 0.55,
}: {
  tint: [string, string];
  strength?: number;
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span
        className="absolute -right-[10%] -top-[20%] size-[60vw] max-w-[900px] rounded-full blur-[120px]"
        style={{ background: tint[0], opacity: strength }}
      />
      <span
        className="absolute -bottom-[25%] left-[20%] size-[55vw] max-w-[820px] rounded-full blur-[120px]"
        style={{ background: tint[1], opacity: strength }}
      />
    </div>
  );
}
