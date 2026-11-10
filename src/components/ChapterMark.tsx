import type { ReactNode } from "react";

type Props = {
  /** The Roman numeral, I to VII. */
  numeral: string;
  /** The chapter's label (Site Settings or the About page in Sanity). */
  label: ReactNode;
  /** Give the label this id and make it the chapter's heading (h2). */
  headingId?: string;
  /** Canvas coloured label, for the charcoal band (Chapter IV). */
  inverse?: boolean;
  /** Centred, for a centred chapter (About III). */
  centred?: boolean;
  className?: string;
};

/**
 * Every chapter's mark, on every page (approved 10 Nov): the Roman numeral
 * in brass at the numeral token (30px) and, beside it, the chapter's label
 * in the label token (12px, uppercase, 0.12em, muted). A chapter title,
 * where there is one, sits below in its own heading style. When the
 * chapter has no title the label is its heading (headingId).
 */
export default function ChapterMark({ numeral, label, headingId, inverse, centred, className = "" }: Props) {
  const labelClass = `type-label ${inverse ? "text-muted-foreground-inverse" : "text-muted-foreground"}`;
  return (
    <div className={`chapter-mark${centred ? " chapter-mark-centred" : ""}${className ? ` ${className}` : ""}`}>
      <span aria-hidden="true" className="chapter-mark-numeral font-editorial text-numeral leading-none text-accent">
        {numeral}
      </span>
      {headingId ? (
        <h2 id={headingId} className={labelClass}>
          {label}
        </h2>
      ) : (
        <span className={labelClass}>{label}</span>
      )}
    </div>
  );
}
