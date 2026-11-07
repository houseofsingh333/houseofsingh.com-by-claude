"use client";

import type { MouseEvent } from "react";
import { MONTH_SHORT_LABELS } from "@/lib/dates";
import { isPlainClick } from "@/lib/journalLinks";

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

type Props = {
  years: number[];
  /** -1 when no year is open. */
  activeYear: number;
  activeMonth: number;
  monthsWithEntries: Record<number, Set<number>>;
  /** True once the bar is stuck to the top: its background fades in. */
  isSticky: boolean;
  onYearClick: (year: number) => void;
  onMonthClick: (month: number) => void;
  /** The address each year link points to (its most recent month). */
  yearHref: (year: number) => string;
  /** The address of a month of the open year. */
  monthHref: (month: number) => string;
};

/** Handle a plain click here (instant switch); let other clicks follow the link. */
function handle(e: MouseEvent<HTMLAnchorElement>, action: () => void) {
  if (!isPlainClick(e)) return;
  e.preventDefault();
  action();
}

/**
 * The journal's sticky year and month filter bar.
 *
 * Its box never changes size: it is always sticky, with 24px of top padding
 * offset by a -24px margin, so it sits exactly where it did unstuck and
 * keeps 24px of breathing room when stuck. Earlier the stuck state swapped
 * in different padding, which moved the content below and made the bar
 * jitter while scrolling. Only the background layer changes, by opacity.
 *
 * Years and months are real links (each month has its own address), so
 * search engines can reach every month. A plain click still switches the
 * view at once, without loading a page; other clicks follow the link.
 */
export default function JournalTimeline({
  years,
  activeYear,
  activeMonth,
  monthsWithEntries,
  isSticky,
  onYearClick,
  onMonthClick,
  yearHref,
  monthHref,
}: Props) {
  return (
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
                <a
                  key={year}
                  href={yearHref(year)}
                  onClick={(e) => handle(e, () => onYearClick(year))}
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
                </a>
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

            const className = `text-xs tracking-[0.15em] uppercase transition-all duration-(--dur-hover) ease-(--ease-soft-out) pb-0.5 ${
                  isActive
                    ? "text-foreground border-b border-foreground"
                    : isFuture
                      ? "text-muted-foreground/30 cursor-not-allowed"
                      : hasEntries
                        ? "text-muted-foreground hover:text-foreground border-b border-transparent hover:border-foreground"
                        : "text-muted-foreground hover:text-foreground border-b border-transparent"
                }`;
              return isFuture ? (
                <span key={month} aria-disabled="true" className={className}>
                  {MONTH_SHORT_LABELS[month - 1]}
                </span>
              ) : (
                <a
                  key={month}
                  href={monthHref(month)}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(e) => handle(e, () => onMonthClick(month))}
                  className={className}
                >
                  {MONTH_SHORT_LABELS[month - 1]}
                </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
