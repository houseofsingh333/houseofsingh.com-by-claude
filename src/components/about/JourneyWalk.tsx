"use client";

import { useEffect, useRef } from "react";
import SanityImage from "@/components/SanityImage";
import { useDragToScroll } from "@/hooks/useDragToScroll";
import type { AboutMilestone } from "@/lib/types";

/**
 * Chapter V on the About page, a walk through the years: the Journey
 * milestones in a horizontal row that scrolls sideways (by trackpad,
 * touch, dragging, or the arrow keys once focused). The milestone at the
 * start of the row is the current one: its year in charcoal and its
 * photograph in full; the years before and after wait in grey, their
 * photographs faded. A hairline with a brass dot shows how far along the
 * walk is. Opacity and transforms only (see "Journey walk" in about.css).
 * Without JavaScript every milestone is shown in full.
 */
export default function JourneyWalk({ milestones }: { milestones: AboutMilestone[] }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  useDragToScroll(rowRef, true);

  useEffect(() => {
    const row = rowRef.current;
    const wrap = wrapRef.current;
    if (!row || !wrap) return;
    const cards = Array.from(row.querySelectorAll<HTMLElement>("[data-walk-card]"));
    let raf = 0;
    const update = () => {
      raf = 0;
      const start = row.scrollLeft + parseFloat(getComputedStyle(row).paddingLeft);
      let active = 0;
      let best = Infinity;
      cards.forEach((card, i) => {
        const d = Math.abs(card.offsetLeft - start);
        if (d < best) {
          best = d;
          active = i;
        }
      });
      cards.forEach((card, i) => card.toggleAttribute("data-active", i === active));
      const span = row.scrollWidth - row.clientWidth;
      wrap.style.setProperty("--walk", span > 0 ? (row.scrollLeft / span).toFixed(4) : "0");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    wrap.setAttribute("data-walking", "");
    row.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      row.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={wrapRef} className="walk">
      <div
        ref={rowRef}
        className="walk-row"
        tabIndex={0}
        role="region"
        aria-label="Journey milestones, scroll sideways"
      >
        {milestones.map((m, i) => (
          <article key={m.year + i} data-walk-card className="walk-card">
            <p className="walk-year">
              <span className="walk-year-on">{m.year}</span>
              <span aria-hidden="true" className="walk-year-off">
                {m.year}
              </span>
            </p>
            <div className="walk-photo">
              <SanityImage
                image={m.image}
                context="thumbnail"
                alt={m.title}
                fill
                sizes="(min-width: 768px) 420px, 76vw"
                className="object-cover"
              />
            </div>
            <h3 className="walk-title">{m.title}</h3>
            {m.text && <p className="walk-text">{m.text}</p>}
          </article>
        ))}
        <span aria-hidden="true" className="walk-end" />
      </div>
      <div aria-hidden="true" className="walk-progress px-6 md:px-16">
        <span className="walk-track">
          <span className="walk-fill" />
          <span className="walk-mover">
            <span className="walk-dot" />
          </span>
        </span>
        <span className="walk-hint">Scroll to walk on</span>
      </div>
    </div>
  );
}
