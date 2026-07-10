/**
 * Shared image caption. Renders only when the caption is genuinely non-empty
 * (whitespace-only is treated as empty). Alt text is never shown here — it
 * lives on the image's alt attribute. Quiet, muted, editorial.
 */
export default function Caption({
  text,
  align = "left",
}: {
  text?: string;
  align?: "left" | "center";
}) {
  if (!text?.trim()) return null;
  return (
    <figcaption
      className={`mt-3 text-xs text-muted-foreground/50 tracking-wide ${
        align === "center" ? "text-center" : ""
      }`}
    >
      {text}
    </figcaption>
  );
}
