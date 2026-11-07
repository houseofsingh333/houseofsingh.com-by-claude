/**
 * A section's small uppercase label above a hairline, as used on About,
 * Privacy and Terms. `gap` is the space below it (a Tailwind margin class).
 */
export default function SectionDivider({
  label,
  gap = "mb-16",
}: {
  label: string;
  gap?: string;
}) {
  return (
    <div className={gap}>
      <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
        {label}
      </p>
      <div className="w-full h-px bg-border" />
    </div>
  );
}
