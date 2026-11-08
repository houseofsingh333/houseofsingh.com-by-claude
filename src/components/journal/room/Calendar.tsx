"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Crossfade from "@/components/Crossfade";
import { isPlainClick } from "@/lib/journalLinks";
import {
  MONTH_NAMES,
  circleSrc,
  entryHref,
  joinTitles,
  monthGrid,
  monthHref,
  monthKey,
  type JournalDay,
  type JournalMonth,
} from "@/lib/journalRoom";

type Props = {
  /** The month of days shown. */
  year: number;
  month: number;
  /** Zoomed out to this year's twelve months (null: the month of days). */
  zoomYear: number | null;
  /** Every entry by day ("2026-7-5"), newest first within a day. */
  byDay: Map<string, JournalDay[]>;
  /** Months with entries, newest first. */
  months: JournalMonth[];
  /** Years with entries, newest first. */
  years: number[];
  /** The entry in view. */
  current: string | null;
  /** Days with several entries crossfade their photographs (off: the first one stays). */
  animate: boolean;
  onEntry: (slug: string) => void;
  onMonth: (m: JournalMonth) => void;
  onZoomOut: () => void;
};

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function dayKey(year: number, month: number, day: number): string {
  return `${year}-${month}-${day}`;
}

/** Follow a link with a plain click inside the page; any other click opens it as usual. */
function plain(e: MouseEvent, run: () => void) {
  if (!isPlainClick(e)) return;
  e.preventDefault();
  run();
}

/**
 * The calendar of the Journal page (frame J4): a month of days, Monday
 * first, where a day with an entry shows its photograph as a circle with
 * the date on a charcoal veil; several entries on one day take turns in the
 * circle. The entry in view has a fine brass ring (and aria-current).
 * Clicking the month name zooms out to the year: twelve tiny months, each
 * day a point, each entry a dot. Every day, month and arrow is a real link,
 * so the calendar works without JavaScript.
 */
/** How long each photograph holds in a circle shared by several entries. */
const TURN_MS = 3500;

export default function Calendar({ year, month, zoomYear, byDay, months, years, current, animate, onEntry, onMonth, onZoomOut }: Props) {
  // One shared beat for every shared circle; still under reduced motion.
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    if (!animate) return;
    const t = window.setInterval(() => {
      if (!document.hidden) setBeat((b) => b + 1);
    }, TURN_MS);
    return () => window.clearInterval(t);
  }, [animate]);
  const tick = animate ? beat : null;
  const mode = zoomYear === null ? "month" : "year";
  const sheetYear = zoomYear ?? year;
  const { lead, days } = monthGrid(year, month);
  const at = months.findIndex((m) => m.key === monthKey(year, month));
  // Months are newest first: the previous month with entries is further on.
  const older = at >= 0 ? months[at + 1] : months.find((m) => m.year * 12 + m.month < year * 12 + month);
  const newer = at > 0 ? months[at - 1] : at === -1 ? [...months].reverse().find((m) => m.year * 12 + m.month > year * 12 + month) : undefined;
  const name = `${MONTH_NAMES[month - 1]} ${year}`;

  return (
    <div className="jr-calendar" data-mode={mode}>
      {/* ——— The month ——— */}
      <div className="jr-month" inert={mode !== "month"}>
        <div className="jr-month-head">
          <a
            className="jr-month-name"
            href={monthHref(year, month)}
            aria-label={`${name}, show the whole year`}
            onClick={(e) => plain(e, onZoomOut)}
          >
            {/* The month's name and year crossfade as the month turns. */}
            <span className="jr-month-label">
              <Crossfade className="jr-month-word" value={MONTH_NAMES[month - 1]} />
              {/* Fresh for each month: it moves with the name's width, so it arrives rather than slides. */}
              <span key={monthKey(year, month)} className="jr-month-year">
                {year}
              </span>
            </span>
          </a>
          <span className="jr-month-arrows">
            {older ? (
              <a
                href={monthHref(older.year, older.month)}
                aria-label={`Previous month with entries, ${MONTH_NAMES[older.month - 1]} ${older.year}`}
                onClick={(e) => plain(e, () => onMonth(older))}
              >
                <span aria-hidden="true">&larr;</span>
              </a>
            ) : (
              <span className="is-off" aria-hidden="true">&larr;</span>
            )}
            {newer ? (
              <a
                href={monthHref(newer.year, newer.month)}
                aria-label={`Next month with entries, ${MONTH_NAMES[newer.month - 1]} ${newer.year}`}
                onClick={(e) => plain(e, () => onMonth(newer))}
              >
                <span aria-hidden="true">&rarr;</span>
              </a>
            ) : (
              <span className="is-off" aria-hidden="true">&rarr;</span>
            )}
          </span>
        </div>
        {/* A fresh grid for each month: the days of a new month arrive, they do not slide. */}
        <div key={monthKey(year, month)} className="jr-grid" role="group" aria-label={`${name}, days with entries`}>
          {WEEKDAYS.map((w, i) => (
            <span key={i} className="jr-weekday" aria-hidden="true">
              {w}
            </span>
          ))}
          {Array.from({ length: lead }, (_, i) => (
            <span key={`lead-${i}`} aria-hidden="true" />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const d = i + 1;
            const list = byDay.get(dayKey(year, month, d));
            if (!list?.length) {
              return (
                <span key={d} className="jr-day" aria-hidden="true">
                  {d}
                </span>
              );
            }
            const here = list.findIndex((e) => e.slug === current);
            // A second click on the day in view moves on to its next entry.
            const target = here >= 0 ? list[(here + 1) % list.length] : list[0];
            const shown = tick === null ? 0 : tick % list.length;
            return (
              <a
                key={d}
                className="jr-day has"
                href={entryHref(target.slug)}
                aria-label={`${d} ${MONTH_NAMES[month - 1]} ${year}, ${joinTitles(list.map((e) => e.title))}`}
                aria-current={here >= 0 ? "true" : undefined}
                onClick={(e) => plain(e, () => onEntry(target.slug))}
              >
                <span className="jr-circle">
                  {list.map((e, j) =>
                    e.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element -- a 42px crop straight from the Sanity CDN
                      <img
                        key={e.slug}
                        src={circleSrc(e.thumb.url, 96, e.thumb.hotspot)}
                        alt=""
                        width={48}
                        height={48}
                        loading="lazy"
                        decoding="async"
                        data-shown={j === shown ? "" : undefined}
                      />
                    ) : null,
                  )}
                  <span className="jr-circle-num" aria-hidden="true">
                    {d}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* ——— The year: every year is in the page (links to every month); the one zoomed to shows,
          and the sheets crossfade when the year turns (styles/journal.css) ——— */}
      <div className="jr-year" inert={mode !== "year"}>
        {years.map((y) => (
          <div key={y} className="jr-year-sheet" data-shown={y === sheetYear ? "" : undefined} inert={y !== sheetYear}>
            <p className="jr-year-title">{y}</p>
            <ul className="jr-minis" role="list" aria-label={`${y}, months with entries`}>
              {MONTH_NAMES.map((mn, mi) => {
                const m = months.find((x) => x.year === y && x.month === mi + 1);
                const g = monthGrid(y, mi + 1);
                const dots = (
                  <span className="jr-mini-days" aria-hidden="true">
                    {Array.from({ length: g.lead }, (_, i) => (
                      <span key={`l${i}`} />
                    ))}
                    {Array.from({ length: g.days }, (_, i) => {
                      const list = byDay.get(dayKey(y, mi + 1, i + 1));
                      const on = !!list?.some((e) => e.slug === current);
                      return <span key={i} className="d" data-entry={list?.length ? "" : undefined} data-current={on ? "" : undefined} />;
                    })}
                  </span>
                );
                const count = m ? [...byDay.entries()].filter(([k]) => k.startsWith(`${y}-${mi + 1}-`)).reduce((n, [, l]) => n + l.length, 0) : 0;
                return (
                  <li key={mn}>
                    {m ? (
                      <a
                        className="jr-mini hairline-host"
                        href={monthHref(y, mi + 1)}
                        aria-label={`${mn} ${y}, ${count} ${count === 1 ? "entry" : "entries"}`}
                        onClick={(e) => plain(e, () => onMonth(m))}
                      >
                        <span className="jr-mini-name hairline">{mn.slice(0, 3)}</span>
                        {dots}
                      </a>
                    ) : (
                      <span className="jr-mini is-empty">
                        <span className="jr-mini-name hairline">{mn.slice(0, 3)}</span>
                        {dots}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
