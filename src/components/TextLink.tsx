import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  /** Opens in a new tab, with an outward arrow and "(opens in a new tab)" for screen readers. */
  external?: boolean;
  /** Canvas coloured text, for the charcoal band (Chapter IV). */
  inverse?: boolean;
  /** The back version: the arrow on the left, moving left (approved 10 Nov). */
  back?: boolean;
  className?: string;
  tabIndex?: number;
  onClick?: () => void;
  style?: CSSProperties;
};

function textLinkClass({ inverse, back, className = "" }: { inverse?: boolean; back?: boolean; className?: string }) {
  return `text-link${inverse ? " text-link-inverse" : ""}${back ? " text-link-back" : ""}${className ? ` ${className}` : ""}`;
}

/** The words with their hairline, and the arrow after them (or before them, going back). */
function LinkContent({ back, arrow, children }: { back?: boolean; arrow?: string; children: ReactNode }) {
  const mark = (
    <span aria-hidden="true" className="text-link-arrow">
      {back ? "\u2190" : (arrow ?? "\u2192")}
    </span>
  );
  return (
    <>
      {back && mark}
      <span className="text-link-text">{children}</span>
      {!back && mark}
    </>
  );
}

/**
 * The one text call to action for secondary actions, sitewide (approved
 * 10 Nov): no box; Instrument Sans 500 at the small token, uppercase,
 * 0.12em; a permanent 1px hairline under the words, which redraws from the
 * left on hover and focus while the arrow moves 4px to the right (see
 * ".text-link" in styles/motion.css). Primary actions use OutlineCta.
 */
export default function TextLink({ href, children, external, inverse, back, className = "", tabIndex, onClick, style }: Props) {
  const cls = textLinkClass({ inverse, back, className });
  const inner = (
    <>
      <LinkContent back={back} arrow={external ? "\u2197" : undefined}>
        {children}
      </LinkContent>
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} tabIndex={tabIndex} onClick={onClick} style={style}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} tabIndex={tabIndex} onClick={onClick} style={style}>
      {inner}
    </Link>
  );
}

/**
 * The same text call to action as a button, for an action that is not a
 * page (the contact form's Back and Skip).
 */
export function TextButton({
  children,
  onClick,
  back,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  back?: boolean;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={textLinkClass({ back, className })}>
      <LinkContent back={back}>{children}</LinkContent>
    </button>
  );
}
