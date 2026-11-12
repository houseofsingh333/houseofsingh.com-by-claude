import Link from "@/components/Link";
import type { CSSProperties } from "react";
import { shopColour } from "@/lib/editions/palette";
import { gurmukhi } from "@/lib/editions/format";
import { spineLine } from "@/lib/editions/view";

/**
 * A closed Collection on the archive shelf (canvas FL5, "Shelf"): a narrow
 * spine in its colour, its Gurmukhi numeral at the top, "No. 01 · Vaisakhi
 * 2027" running up it, and a brass ring at the foot. Pointing at it draws
 * it up from the shelf (styles/editions.css; still with reduced motion).
 */
export function Spine({ number, season, colour, href, small }: { number: number; season: string; colour: string; href: string; small?: boolean }) {
  const c = shopColour(colour);
  const style = { "--sq": c.square, "--sq-ink": c.ink } as CSSProperties;
  return (
    <Link href={href} className="ed-spine" data-small={small ? "" : undefined} style={style}>
      <span aria-hidden="true" className="ed-spine-numeral">
        {gurmukhi(number)}
      </span>
      <span className="ed-spine-title">{spineLine({ number, season })}</span>
      <span aria-hidden="true" className="ed-spine-ring" />
    </Link>
  );
}

/** The next Collection's place on the shelf, still sealed: an outline. */
export function SpineSealed({ number }: { number: number }) {
  return (
    <div className="ed-spine ed-spine-sealed">
      <span className="ed-spine-title">{`No. ${String(number).padStart(2, "0")} · Sealed`}</span>
    </div>
  );
}
