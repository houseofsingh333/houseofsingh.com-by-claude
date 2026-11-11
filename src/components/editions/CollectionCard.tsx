"use client";

import { useRef, type CSSProperties } from "react";
import { shopColour } from "@/lib/editions/palette";
import { collectionTitle, gurmukhi } from "@/lib/editions/format";
import EditionsSeal from "./EditionsSeal";

type Props = {
  number: number;
  colour: string;
  /** "13 · 04 · 2027", the release date in Toronto. */
  date: string;
  /** Read to screen readers: "Collection 01, released on 13 April 2027". */
  label: string;
};

/**
 * The Collection card while it is sealed and in early access (Shop design
 * round 2): the square in its colour; "House of Singh Editions"; the
 * number large in Gurmukhi numerals (Noto Serif Gurmukhi) with "Collection
 * 01" beneath; the release date and "Released once" at the foot; the seal
 * at the bottom right. With a fine pointer the card presses toward it
 * (up to 6 degrees each way, lifted 6px with a deeper shadow) and returns
 * on leave; never on touch or with reduced motion.
 */
export default function CollectionCard({ number, colour, date, label }: Props) {
  const c = shopColour(colour);
  const ref = useRef<HTMLDivElement>(null);
  const style = { "--sq": c.square, "--sq-ink": c.ink, "--sq-quiet": c.quiet } as CSSProperties;

  function press(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - y) * 12).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((x - 0.5) * 12).toFixed(2)}deg`);
    el.dataset.pressed = "";
  }
  function release() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    delete el.dataset.pressed;
  }

  return (
    <div className="ed-card2-stage" onPointerMove={press} onPointerLeave={release}>
      <div ref={ref} className="ed-card2" style={style} role="img" aria-label={label}>
        <span className="ed-card2-label" aria-hidden="true">
          House of Singh Editions
        </span>
        <span className="ed-card2-number" aria-hidden="true">
          <span className="ed-card2-gurmukhi" lang="pa">
            {gurmukhi(number).padStart(2, "੦")}
          </span>
          <span className="ed-card2-label">{collectionTitle(number)}</span>
        </span>
        <span className="ed-card2-foot" aria-hidden="true">
          <span className="ed-card2-label">
            <span className="ed-card2-date">{date}</span>
            <br />
            Released once
          </span>
          <EditionsSeal />
        </span>
      </div>
    </div>
  );
}
