"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { JournalEntry } from "@/lib/types";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useDragToScroll } from "@/hooks/useDragToScroll";
import FilmstripCard from "./FilmstripCard";
import { useFilmstripDrift } from "./useFilmstripDrift";

/**
 * The homepage journal as a drifting filmstrip: the latest entries as
 * cards in one row, starting at the page margin and running off the right
 * edge.
 *
 * The server sends a still strip that scrolls by hand. That is what reduced
 * motion and JavaScript off keep. Once the page runs with motion allowed it
 * becomes a slow right to left loop (useFilmstripDrift), with copies of the
 * cards after the real ones; the copies are inert and hidden from screen
 * readers. A pause button controls the movement, as moving content longer
 * than five seconds needs.
 */
export default function JournalFilmstrip({ entries }: { entries: JournalEntry[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Still until the page has run in the browser, and always with reduced
  // motion: the server HTML and the first paint are the still strip.
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- switch to the drift once running in the browser
  useEffect(() => setMounted(true), []);
  const drift = mounted && !reducedMotion && entries.length > 1;

  const { copySets, userPaused, togglePaused, stripHandlers } = useFilmstripDrift({
    sectionRef,
    viewportRef,
    trackRef,
    enabled: drift,
  });
  useDragToScroll(viewportRef, mounted && !drift);

  return (
    <section ref={sectionRef} aria-labelledby="journal-strip-title" className="section-py">
      <div className="px-6 md:px-16">
        <div className="flex items-end justify-between gap-6 border-b border-border pb-4 md:pb-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline gap-4">
              <span aria-hidden="true" className="font-editorial italic text-[30px] leading-none text-accent">
                V
              </span>
              <span className="text-[13px] tracking-[0.14em] uppercase text-muted-foreground">
                Notebook
              </span>
            </div>
            <h2
              id="journal-strip-title"
              className="font-editorial font-normal text-[32px] md:text-[44px] leading-[1.1] text-foreground"
            >
              Journal
            </h2>
          </div>
          <div className="flex items-center gap-5 md:gap-6">
            {drift && (
              <button
                type="button"
                onClick={togglePaused}
                aria-pressed={userPaused}
                aria-label="Pause the moving journal strip"
                className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors duration-(--dur-hover) ease-(--ease-soft-out) hover:border-foreground hover:text-foreground focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-foreground relative after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']"
              >
                {userPaused ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M3 1.5 10 6 3 10.5Z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M3 1.5v9M9 1.5v9" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
              </button>
            )}
            <Link
              href="/journal"
              className="text-[12px] md:text-[13px] tracking-[0.12em] uppercase text-muted-foreground border-b border-border pb-1 transition-colors duration-(--dur-hover) ease-(--ease-soft-out) hover:text-foreground hover:border-foreground"
            >
              Read the journal
            </Link>
          </div>
        </div>
      </div>

      <div
        ref={viewportRef}
        className={`filmstrip-viewport mt-7 md:mt-10 ${drift ? "overflow-hidden" : "overflow-x-auto"}`}
        style={drift ? { touchAction: "pan-y" } : undefined}
        {...(drift ? stripHandlers : {})}
      >
        <div ref={trackRef} className="flex w-max gap-4 md:gap-8 px-6 md:px-16">
          {entries.map((entry) => (
            <FilmstripCard key={entry._id} entry={entry} />
          ))}
          {drift &&
            Array.from({ length: copySets }, (_, set) =>
              entries.map((entry) => (
                <FilmstripCard key={`${set}-${entry._id}`} entry={entry} copy />
              )),
            )}
        </div>
      </div>
    </section>
  );
}
