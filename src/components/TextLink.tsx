import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  /** Opens in a new tab, with an outward arrow and "(opens in a new tab)" for screen readers. */
  external?: boolean;
  /** Canvas coloured text, for the charcoal band (Chapter IV). */
  inverse?: boolean;
  className?: string;
  tabIndex?: number;
  onClick?: () => void;
  style?: CSSProperties;
};

/**
 * The one text call to action for secondary actions, sitewide (approved
 * 10 Nov): no box; Instrument Sans 500 at the small token, uppercase,
 * 0.12em; a permanent 1px hairline under the words, which redraws from the
 * left on hover and focus while the arrow moves 4px to the right (see
 * ".text-link" in styles/motion.css). Primary actions use OutlineCta.
 */
export default function TextLink({ href, children, external, inverse, className = "", tabIndex, onClick, style }: Props) {
  const cls = `text-link${inverse ? " text-link-inverse" : ""}${className ? ` ${className}` : ""}`;
  const inner = (
    <>
      <span className="text-link-text">{children}</span>
      <span aria-hidden="true" className="text-link-arrow">
        {external ? "↗" : "→"}
      </span>
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
