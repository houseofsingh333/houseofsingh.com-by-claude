"use client";

import { useRef, type CSSProperties } from "react";
import { shopColour } from "@/lib/editions/palette";
import { gurmukhi, pad2, piecesInWords } from "@/lib/editions/format";
import type { CollectionState } from "@/lib/editions/types";

type Props = {
  number: number;
  season: string;
  colour: string;
  pieces: number;
  state: CollectionState;
  /** No pointer tilt (the archive's small square). */
  still?: boolean;
};

const SEAL: Record<CollectionState, string> = {
  sealed: "Sealed",
  early: "Early access",
  open: "Open",
  closed: "Sold out",
};

/**
 * A Collection's square (canvas "Shop, the flow"): its colour, "House of
 * Singh Editions", "No. 01 · ੧", the season large in Playfair, the number
 * of pieces, and the seal. The seal breathes like the brass dot (2.8s);
 * Early access and Open in brass, Sealed with the crest, Sold out in
 * outline. The square tilts gently toward the pointer (a fine pointer and
 * motion allowed only).
 */
export default function CollectionSquare({ number, season, colour, pieces, state, still }: Props) {
  const c = shopColour(colour);
  const ref = useRef<HTMLDivElement>(null);
  const style = { "--sq": c.square, "--sq-ink": c.ink, "--sq-quiet": c.quiet } as CSSProperties;

  function tilt(e: React.PointerEvent<HTMLDivElement>) {
    if (still || e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 6).toFixed(2)}deg`);
  }
  function untilt() {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  }

  return (
    <div className="ed-square-stage" onPointerMove={tilt} onPointerLeave={untilt}>
      <div ref={ref} className="ed-square" style={style} role="img" aria-label={`Collection ${pad2(number)}, ${season}: ${SEAL[state].toLowerCase()}`}>
        <div className="ed-square-top" aria-hidden="true">
          <span>House of Singh Editions</span>
          <span>
            No. {pad2(number)} &middot; {gurmukhi(number)}
          </span>
        </div>
        <div className="ed-square-title" aria-hidden="true">
          <span className="ed-square-label">Collection {pad2(number)}</span>
          <span className="ed-square-season">{season}</span>
        </div>
        <div className="ed-square-foot" aria-hidden="true">
          <span className="ed-square-label">
            {piecesInWords(pieces)}
            <br />
            Released once
          </span>
          <span className="ed-seal" data-state={state}>
            {state === "sealed" ? <span className="ed-seal-crest" /> : SEAL[state].split(" ").map((w) => <span key={w}>{w}</span>)}
          </span>
        </div>
      </div>
    </div>
  );
}
