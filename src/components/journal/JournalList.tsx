"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import type { JournalEntry } from "@/lib/types";
import {
  formatEntryDate,
  MONTH_SHORT_LABELS,
  parseSanityDate,
} from "@/lib/dates";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useInView } from "@/hooks/useInView";

type Props = {
  entries: JournalEntry[];
  /** Year and month from the address, read on the server; null if absent. */
  requested?: { year: number; month: number } | null;
};

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

/** Find the most recent entry's year and month to use as initial selection. */
function getMostRecentYearMonth(entries: JournalEntry[]): {
  year: number;
  month: number;
} {
  if (entries.length === 0) {
    return { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };
  }
  const sorted = [...entries].sort(
    (a, b) =>
      parseSanityDate(b.date).getTime() - parseSanityDate(a.date).getTime(),
  );
  const d = parseSanityDate(sorted[0].date);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export default function JournalList({ entries, requested }: Props) {
  const initial = useMemo(() => getMostRecentYearMonth(entries), [entries]);

  /* Initial year/month: the one in the address (read on the server by the
     page) takes priority over the most recent month with entries. */
  const resolved = useMemo(
    () => (requested ? requested : initial),
    [requested, initial],
  );

  const [activeYear, setActiveYear] = useState<number>(resolved.year);
  const [activeMonth, setActiveMonth] = useState<number>(resolved.month);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // The filter bar is stuck once its sentinel has scrolled out of view.
  const sentinelInView = useInView(sentinelRef, {
    once: false,
    initial: true,
    rootMargin: "-1px 0px 0px 0px",
  });
  const isSticky = !sentinelInView;
  const gridRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  /* Sync initial selection when entries or the URL change (e.g. ISR
     revalidation). Adjusted during render, React's recommended pattern for
     state that follows a prop, instead of setting state in an effect. */
  const [syncedFrom, setSyncedFrom] = useState(resolved);
  if (
    syncedFrom.year !== resolved.year ||
    syncedFrom.month !== resolved.month
  ) {
    setSyncedFrom(resolved);
    setActiveYear(resolved.year);
    setActiveMonth(resolved.month);
  }

  /* Derive unique years from entries, sorted newest-first */
  const years = useMemo(() => {
    const uniqueYears = new Set<number>();
    entries.forEach((e) => {
      uniqueYears.add(parseSanityDate(e.date).getFullYear());
    });
    return [...uniqueYears].sort((a, b) => b - a);
  }, [entries]);

  const monthsWithEntries = useMemo(() => {
    const map: Record<number, Set<number>> = {};
    entries.forEach((e) => {
      const d = parseSanityDate(e.date);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      if (!map[y]) map[y] = new Set();
      map[y].add(m);
    });
    return map;
  }, [entries]);

  const handleYearClick = (year: number) => {
    if (activeYear === year) {
      setActiveYear(-1);
      return;
    }
    setActiveYear(year);
    // Select the latest month that has entries for this year
    const months = monthsWithEntries[year];
    if (months && months.size > 0) {
      setActiveMonth(Math.max(...months));
    } else {
      setActiveMonth(1);
    }
  };

  // Memoised so the colour reveal observer below re-runs only when the
  // visible entries change, not on every render.
  const filtered = useMemo(
    () =>
      activeYear === -1
        ? []
        : entries.filter((e) => {
            const d = parseSanityDate(e.date);
            return (
              d.getFullYear() === activeYear && d.getMonth() + 1 === activeMonth
            );
          }),
    [entries, activeYear, activeMonth],
  );

  /* Mobile: scroll-driven grayscale-to-color. Its own IntersectionObserver
     (not useInView): one observer watches the whole list of cards and turns
     each grey again as it leaves the band. */
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  useEffect(() => {
    if (isDesktop) return; // desktop — hover handles it
    const prefersReduced = reducedMotion;

    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll<HTMLElement>("[data-journal-card]");
    if (cards.length === 0) return;

    if (prefersReduced) {
      // Reduced motion: show all cards in full color on mobile
      cards.forEach((card) => {
        const img = card.querySelector("img");
        if (img) {
          img.classList.remove("grayscale");
          img.classList.add("grayscale-0");
        }
      });
      return () =>
        cards.forEach((card) =>
          card.querySelector("img")?.classList.remove("grayscale-0"),
        );
    }

    // Start all cards in grayscale on mobile
    cards.forEach((card) => {
      const img = card.querySelector("img");
      if (img) {
        img.classList.add("grayscale");
        img.classList.remove("grayscale-0");
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const img = entry.target.querySelector("img");
          if (!img) return;
          if (entry.isIntersecting) {
            img.classList.remove("grayscale");
            img.classList.add("grayscale-0");
          } else {
            img.classList.add("grayscale");
            img.classList.remove("grayscale-0");
          }
        });
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: 0 },
    );

    cards.forEach((card) => observer.observe(card));
    return () => {
      observer.disconnect();
      // Undo, so a change of screen size or motion setting starts clean.
      cards.forEach((card) =>
        card.querySelector("img")?.classList.remove("grayscale", "grayscale-0"),
      );
    };
  }, [filtered, isDesktop, reducedMotion]);

  return (
    <div className="overflow-hidden">
      {/* Page Header */}
      <section className="px-6 md:px-16 page-top-offset pb-12 md:pb-20">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
          Archive
        </p>
        <div className="w-full h-px bg-border mb-8 md:mb-10" />
        <h1 className="font-editorial text-3xl md:text-5xl lg:text-6xl font-light text-foreground leading-none">
          Journal
        </h1>
      </section>

      {/* Sentinel for sticky detection. Lifted 24px (relative, so it takes no
          space) to sit at the timeline's sticky edge, which starts 24px above
          its content (see below). */}
      <div ref={sentinelRef} className="relative -top-6 h-0" />

      {/* Sticky Horizontal Timeline.
          Its box never changes size: it is always sticky, with 24px of top
          padding offset by a -24px margin, so it sits exactly where it did
          unstuck and keeps 24px of breathing room when stuck. Earlier the
          stuck state swapped in different padding, which moved the content
          below and made the bar jitter while scrolling. Only the background
          layer changes, by opacity. */}
      <section className="sticky top-0 z-30 -mt-6 pt-6 px-6 md:px-16 pb-16 md:pb-28">
        <div
          aria-hidden="true"
          className={`absolute inset-0 -z-10 bg-background/95 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${
            isSticky ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Timeline — evenly distributed years */}
        <div className="relative overflow-x-auto md:overflow-visible scrollbar-hide snap-x snap-mandatory">
          <div className="relative w-full min-w-[480px] md:min-w-0">
            {/* The line */}
            <div className="absolute top-[5px] left-0 right-0 h-px bg-border z-0" />

            {/* Year markers — flex-1 for even distribution */}
            <div className="flex items-start">
              {years.map((year) => {
                const isActive = activeYear === year;
                return (
                  <button
                    key={year}
                    onClick={() => handleYearClick(year)}
                    className="flex-1 flex flex-col items-center snap-start group min-w-0"
                  >
                    <div
                      className={`rounded-full transition-all duration-(--dur-hover) ease-(--ease-soft-out) relative z-10 ${
                        isActive
                          ? "w-3 h-3 bg-foreground"
                          : "w-[10px] h-[10px] bg-border group-hover:bg-foreground/50"
                      }`}
                    />
                    <span
                      className={`font-editorial text-sm md:text-base mt-3 transition-all duration-(--dur-hover) ease-(--ease-soft-out) ${
                        isActive
                          ? "text-foreground font-medium"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {year}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Months row */}
        {/* Keeps its space when a year is collapsed (fades out instead of
            collapsing), so nothing below moves. inert: not focusable while
            hidden. */}
        <div
          className={`mt-8 transition-opacity duration-400 ease-in-out motion-reduce:transition-none ${
            activeYear > 0 ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          inert={activeYear <= 0}
        >
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-x-4 md:gap-x-6 gap-y-3 justify-items-start">
            {MONTHS.map((month) => {
              const isActive = activeMonth === month;
              const isFuture =
                activeYear === currentYear && month > currentMonth;
              const hasEntries = monthsWithEntries[activeYear]?.has(month);

              return (
                <button
                  key={month}
                  onClick={() => !isFuture && setActiveMonth(month)}
                  disabled={isFuture}
                  className={`text-xs tracking-[0.15em] uppercase transition-all duration-(--dur-hover) ease-(--ease-soft-out) pb-0.5 ${
                    isActive
                      ? "text-foreground border-b border-foreground"
                      : isFuture
                        ? "text-muted-foreground/30 cursor-not-allowed"
                        : hasEntries
                          ? "text-muted-foreground hover:text-foreground border-b border-transparent hover:border-foreground"
                          : "text-muted-foreground hover:text-foreground border-b border-transparent"
                  }`}
                >
                  {MONTH_SHORT_LABELS[month - 1]}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Article Grid */}
      <section className="px-6 md:px-16 section-pb-lg">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-[0.2em]">
              {activeYear === -1
                ? "Select a year to browse entries"
                : `No entries for ${MONTH_SHORT_LABELS[activeMonth - 1]} ${activeYear}`}
            </p>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14 animate-fade-in">
            {filtered.map((entry) => (
              <Link
                key={entry._id}
                href={`/journal/${entry.slug}`}
                className={`block group ${
                  reducedMotion
                    ? ""
                    : "transition-transform duration-(--dur-hover) ease-(--ease-soft-out) hover:-translate-y-1"
                }`}
              >
                {/* Image */}
                <div data-journal-card className="relative overflow-hidden bg-secondary mb-5 shadow-sm group-hover:shadow-md transition-shadow duration-(--dur-hover) ease-(--ease-soft-out) aspect-[3/4]">
                  <SanityImage
                    image={entry.coverImage}
                    context="thumbnail"
                    alt={entry.title}
                    fill
                    className={`object-cover lg:grayscale ${
                      reducedMotion
                        ? ""
                        : "transition-all duration-(--dur-image) ease-(--ease-slow) group-hover:scale-[1.03] lg:group-hover:grayscale-0"
                    }`}
                  />
                </div>

                {/* Date */}
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                  {formatEntryDate(entry.date)}
                </p>

                {/* Title */}
                <h2 className="font-editorial text-base md:text-lg font-light text-foreground leading-snug mb-3 line-clamp-2">
                  {entry.title}
                </h2>

                {/* Read more */}
                <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground group-hover:text-foreground transition-colors duration-(--dur-hover) ease-(--ease-soft-out) border-b border-muted-foreground/30 group-hover:border-foreground pb-px">
                  Read more
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
