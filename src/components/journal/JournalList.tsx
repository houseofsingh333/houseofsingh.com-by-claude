"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SanityImage from "@/components/SanityImage";
import type { JournalEntry } from "@/lib/placeholder-data";
import { parseSanityDate } from "@/lib/dates";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

type Props = {
  entries: JournalEntry[];
};

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

function formatDate(dateStr: string) {
  const d = parseSanityDate(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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

export default function JournalList({ entries }: Props) {
  const searchParams = useSearchParams();
  const initial = useMemo(() => getMostRecentYearMonth(entries), [entries]);

  /* Resolve initial year/month: URL params take priority over defaults */
  const resolved = useMemo(() => {
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");

    if (yearParam && monthParam) {
      // Both params present: navigate to exact year + month
      return { year: Number(yearParam), month: Number(monthParam) };
    }
    // No params (or only partial): use existing default
    return initial;
  }, [searchParams, initial]);

  const [activeYear, setActiveYear] = useState<number>(resolved.year);
  const [activeMonth, setActiveMonth] = useState<number>(resolved.month);
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  /* Sync initial selection when entries change (e.g. ISR revalidation) */
  useEffect(() => {
    setActiveYear(resolved.year);
    setActiveMonth(resolved.month);
  }, [resolved.year, resolved.month]);

  /* Derive unique years from entries, sorted newest-first */
  const years = useMemo(() => {
    const uniqueYears = new Set<number>();
    entries.forEach((e) => {
      uniqueYears.add(parseSanityDate(e.date).getFullYear());
    });
    return [...uniqueYears].sort((a, b) => b - a);
  }, [entries]);

  /* Sticky timeline observer */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

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

  const filtered =
    activeYear === -1
      ? []
      : entries.filter((e) => {
          const d = parseSanityDate(e.date);
          return (
            d.getFullYear() === activeYear && d.getMonth() + 1 === activeMonth
          );
        });

  /* Mobile: scroll-driven grayscale-to-color via IntersectionObserver */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    if (mq.matches) return; // desktop — hover handles it

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

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
      return;
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
    return () => observer.disconnect();
  }, [filtered]);

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

      {/* Sentinel for sticky detection */}
      <div ref={sentinelRef} className="h-0" />

      {/* Sticky Horizontal Timeline */}
      <section
        className={`px-6 md:px-16 pb-16 md:pb-28 transition-all duration-300 ${
          isSticky
            ? "sticky top-0 z-30 bg-background/95 backdrop-blur-sm py-6"
            : ""
        }`}
      >
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
                      className={`rounded-full transition-all duration-300 relative z-10 ${
                        isActive
                          ? "w-3 h-3 bg-foreground"
                          : "w-[10px] h-[10px] bg-border group-hover:bg-foreground/50"
                      }`}
                    />
                    <span
                      className={`font-editorial text-sm md:text-base mt-3 transition-all duration-300 ${
                        isActive
                          ? "text-foreground font-medium"
                          : "text-muted-foreground/50 group-hover:text-muted-foreground"
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
        <div
          className={`overflow-hidden transition-all duration-400 ease-in-out ${
            activeYear > 0
              ? "max-h-24 opacity-100 mt-8"
              : "max-h-0 opacity-0 mt-0"
          }`}
        >
          <div className="flex items-center gap-4 md:gap-6 flex-wrap">
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
                  className={`text-xs tracking-[0.15em] uppercase transition-all duration-200 pb-0.5 ${
                    isActive
                      ? "text-foreground border-b border-foreground"
                      : isFuture
                        ? "text-muted-foreground/30 cursor-not-allowed"
                        : hasEntries
                          ? "text-muted-foreground/70 hover:text-foreground border-b border-transparent hover:border-foreground"
                          : "text-muted-foreground/40 hover:text-muted-foreground/60 border-b border-transparent"
                  }`}
                >
                  {MONTH_LABELS[month - 1]}
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
            <p className="text-sm text-muted-foreground/60 uppercase tracking-[0.2em]">
              {activeYear === -1
                ? "Select a year to browse entries"
                : `No entries for ${MONTH_LABELS[activeMonth - 1]} ${activeYear}`}
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
                    : "transition-transform duration-300 hover:-translate-y-1"
                }`}
              >
                {/* Image */}
                <div data-journal-card className="relative overflow-hidden bg-secondary mb-5 shadow-sm group-hover:shadow-md transition-shadow duration-300 aspect-[3/4]">
                  <SanityImage
                    image={entry.coverImage}
                    context="thumbnail"
                    alt={entry.title}
                    fill
                    className={`object-cover lg:grayscale ${
                      reducedMotion
                        ? ""
                        : "transition-all duration-700 group-hover:scale-[1.03] lg:group-hover:grayscale-0"
                    }`}
                  />
                </div>

                {/* Date */}
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">
                  {formatDate(entry.date)}
                </p>

                {/* Title */}
                <h2 className="text-[11px] md:text-xs uppercase tracking-[0.15em] text-foreground font-normal leading-[1.6] mb-3 line-clamp-2">
                  {entry.title}
                </h2>

                {/* Read more */}
                <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground group-hover:text-foreground transition-colors duration-300 border-b border-muted-foreground/30 group-hover:border-foreground pb-px">
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
