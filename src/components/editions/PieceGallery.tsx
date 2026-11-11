"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

/** Told when the phone rail settles on a photograph (its number, from 1). */
const EVENT = "ed-photo";

/**
 * A piece's photographs (Shop design round 3). Desktop: stacked. Phones:
 * a rail to swipe, one photograph at a time, snapping, with the page's 24px
 * margins (styles/editions.css); "1 of 3" beside the way back follows it.
 */
export default function PieceGallery({ children }: { children: ReactNode }) {
  const rail = useRef<HTMLDivElement>(null);
  const count = Children.count(children);

  useEffect(() => {
    const el = rail.current;
    if (!el || count < 2) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const first = el.firstElementChild as HTMLElement | null;
        const step = first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || "0") : el.clientWidth;
        const at = Math.min(count, Math.max(1, Math.round(el.scrollLeft / Math.max(1, step)) + 1));
        window.dispatchEvent(new CustomEvent(EVENT, { detail: at }));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [count]);

  return (
    // Reachable by keyboard when there is more than one photograph, so the
    // phone rail can be scrolled with the arrow keys.
    <div
      ref={rail}
      className="ed-piece-photos ed-gallery"
      aria-label={count > 1 ? `${count} photographs` : undefined}
      role={count > 1 ? "group" : undefined}
      tabIndex={count > 1 ? 0 : undefined}
    >
      {children}
    </div>
  );
}

/** "1 of 3": which photograph the phone rail shows (phones only). */
export function PhotoCount({ total }: { total: number }) {
  const [at, setAt] = useState(1);
  useEffect(() => {
    const on = (e: Event) => setAt((e as CustomEvent<number>).detail);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return (
    <span className="ed-photo-count type-label text-muted-foreground" aria-live="polite">
      {`${at} of ${total}`}
    </span>
  );
}
