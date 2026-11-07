"use client";

import { useState, useMemo, useRef } from "react";
import type { JournalEntry } from "@/lib/types";
import { MONTH_SHORT_LABELS, parseSanityDate } from "@/lib/dates";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useInView } from "@/hooks/useInView";
import JournalTimeline from "./JournalTimeline";
import JournalCard from "./JournalCard";
import { useJournalCardColour } from "./useJournalCardColour";
import { journalMonthHref } from "@/lib/journalLinks";

type Props = {
  entries: JournalEntry[];
  /** The month this page's address names (/journal/archive/<year>/<month>);
   *  null on /journal, which opens on the most recent month. */
  requested?: { year: number; month: number } | null;
};

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

  /** The month a year link opens: its most recent month with entries. */
  const yearMonth = (year: number) => {
    const months = monthsWithEntries[year];
    return months && months.size > 0 ? Math.max(...months) : 1;
  };

  /** Show the chosen month's own address, without loading a page. */
  const showAddress = (year: number, month: number) => {
    window.history.replaceState(window.history.state, "", journalMonthHref(year, month));
  };

  const handleYearClick = (year: number) => {
    if (activeYear === year) {
      setActiveYear(-1);
      return;
    }
    // Select the latest month that has entries for this year
    const month = yearMonth(year);
    setActiveYear(year);
    setActiveMonth(month);
    showAddress(year, month);
  };

  const handleMonthClick = (month: number) => {
    setActiveMonth(month);
    showAddress(activeYear, month);
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

  useJournalCardColour(gridRef, filtered, reducedMotion);

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

      <JournalTimeline
        years={years}
        activeYear={activeYear}
        activeMonth={activeMonth}
        monthsWithEntries={monthsWithEntries}
        isSticky={isSticky}
        onYearClick={handleYearClick}
        onMonthClick={handleMonthClick}
        yearHref={(year) => journalMonthHref(year, yearMonth(year))}
        monthHref={(month) => journalMonthHref(activeYear > 0 ? activeYear : resolved.year, month)}
      />

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
              <JournalCard key={entry._id} entry={entry} reducedMotion={reducedMotion} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
