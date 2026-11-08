"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { isPlainClick } from "@/lib/journalLinks";
import {
  MONTH_NAMES,
  dateParts,
  entryHref,
  monthDataHref,
  monthHref,
  monthKeyOf,
  type JournalDay,
  type JournalEntryFull,
  type JournalMonth,
} from "@/lib/journalRoom";
import Crossfade from "@/components/Crossfade";
import Calendar, { dayKey } from "./Calendar";
import Entry from "./Entry";

type Props = {
  /** Every entry, light, newest first (for the calendar). */
  index: JournalDay[];
  /** Months with entries, newest first. */
  months: JournalMonth[];
  /** The month the page opens at, in full. */
  opening: { key: string; entries: JournalEntryFull[] };
  /** The entry brought to the top on arrival (null: the top of the page, /journal). */
  target: string | null;
  /** /journal/[slug]: that entry's title is the page's h1. */
  headingSlug: string | null;
  /** The line under "Journal" (empty: hidden). */
  tagline: string | null;
};

const PHONE = "(max-width: 1023px)";
const DESKTOP = "(min-width: 1024px)";
/** How close an entry must be to its resting line before it settles there. */
const SETTLE_PX = 72;
/** How far ahead of the reader the next month is fetched. */
const AHEAD = "1200px 0px 1200px 0px";
/** How long scrolling must have paused before a month is added above. */
const IDLE_MS = 220;

/**
 * The Journal page, the calendar and the reading room (frames "J4 desktop"
 * and "Phone B"). The entries run newest first, month after month: the
 * page arrives with the month it opens at, and the months before and after
 * are fetched as the reader nears them (api/journal/[year]/[month]). The
 * calendar follows the entry in view (its ring, its numeral, its month);
 * clicking a day glides to that entry and shows its address
 * (/journal/[slug]) without loading a page. The page is complete without
 * JavaScript: the month's entries, and the calendar as plain links.
 */
export default function JournalRoom({ index, months, opening, target, headingSlug, tagline }: Props) {
  const reduced = usePrefersReducedMotion();
  const [range, setRange] = useState<string[]>([opening.key]);
  const [data, setData] = useState<Record<string, JournalEntryFull[]>>({ [opening.key]: opening.entries });
  const [current, setCurrent] = useState<string | null>(target ?? opening.entries[0]?.slug ?? null);
  const [zoom, setZoom] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const entriesRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const yearsRef = useRef<HTMLDivElement>(null);
  const inflight = useRef(new Map<string, Promise<JournalEntryFull[] | null>>());
  const pending = useRef<{ slug: string; smooth: boolean } | null>(null);
  const anchor = useRef<{ el: Element; top: number } | null>(null);
  const gliding = useRef(false);
  const lastScroll = useRef(0);

  const byDay = useMemo(() => {
    const map = new Map<string, JournalDay[]>();
    for (const e of index) {
      const { year, month, day } = dateParts(e.date);
      const k = dayKey(year, month, day);
      map.set(k, [...(map.get(k) ?? []), e]);
    }
    return map;
  }, [index]);
  const years = useMemo(() => [...new Set(months.map((m) => m.year))], [months]);
  const bySlug = useMemo(() => new Map(index.map((e) => [e.slug, e])), [index]);
  const at = (key: string) => months.findIndex((m) => m.key === key);

  const currentDay = current ? bySlug.get(current) : undefined;
  const shown = currentDay ? dateParts(currentDay.date) : { year: months[0]?.year ?? 0, month: months[0]?.month ?? 1 };
  const calYear = zoom ?? shown.year;

  /** Fetch a month in full (once), or null if it cannot be had. */
  const load = useCallback(
    (key: string): Promise<JournalEntryFull[] | null> => {
      if (data[key]) return Promise.resolve(data[key]);
      const known = inflight.current.get(key);
      if (known) return known;
      const m = months.find((x) => x.key === key);
      if (!m) return Promise.resolve(null);
      const p = fetch(monthDataHref(m.year, m.month))
        .then((r) => (r.ok ? r.json() : null))
        .then((j: { entries: JournalEntryFull[] } | null) => {
          inflight.current.delete(key);
          if (!j) return null;
          setData((d) => ({ ...d, [key]: j.entries }));
          return j.entries;
        })
        .catch(() => {
          inflight.current.delete(key);
          return null;
        });
      inflight.current.set(key, p);
      return p;
    },
    [data, months],
  );

  /** Add the next older month below, or the next newer month above. */
  const extend = useCallback(
    async (dir: "older" | "newer") => {
      const edge = dir === "older" ? range[range.length - 1] : range[0];
      const next = months[at(edge) + (dir === "older" ? 1 : -1)];
      if (!next || range.includes(next.key)) return;
      const got = await load(next.key);
      if (!got) return;
      setRange((r) => {
        if (r.includes(next.key)) return r;
        if (dir === "older") return r[r.length - 1] === edge ? [...r, next.key] : r;
        if (r[0] !== edge) return r;
        // Keep the reader where they are while a month is added above.
        const first = entriesRef.current?.querySelector(".jr-entry");
        if (first) anchor.current = { el: first, top: first.getBoundingClientRect().top };
        return [next.key, ...r];
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, months, load],
  );

  /** Bring an entry into view (smoothly unless reduced motion), then give it focus. */
  const reveal = useCallback(
    (slug: string, smooth: boolean) => {
      const el = document.getElementById(`entry-${slug}`);
      if (!el) return;
      gliding.current = true;
      const done = () => {
        gliding.current = false;
        window.removeEventListener("scrollend", done);
      };
      window.addEventListener("scrollend", done, { once: true });
      window.setTimeout(done, smooth && !reduced ? 1400 : 100);
      el.scrollIntoView({ behavior: smooth && !reduced ? "smooth" : "instant", block: "start" });
      el.focus({ preventScroll: true });
    },
    [reduced],
  );

  /** Go to an entry: load its month if needed, glide to it, show its address. */
  const goTo = useCallback(
    async (slug: string) => {
      const day = bySlug.get(slug);
      if (!day) return;
      const key = monthKeyOf(day.date);
      setZoom(null);
      setOpen(false);
      setCurrent(slug);
      window.history.replaceState(window.history.state, "", entryHref(slug));
      if (range.includes(key)) return reveal(slug, true);
      const got = await load(key);
      if (!got) return;
      const i = at(key);
      const adjacent = range.includes(months[i - 1]?.key ?? "") ? "below" : range.includes(months[i + 1]?.key ?? "") ? "above" : null;
      pending.current = { slug, smooth: adjacent !== null };
      setRange((r) => (adjacent === "below" ? [...r, key] : adjacent === "above" ? [key, ...r] : [key]));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bySlug, range, load, reveal, months],
  );

  // After the months change: keep the reader in place (a month added
  // above), or finish a pending glide.
  useLayoutEffect(() => {
    if (anchor.current) {
      const { el, top } = anchor.current;
      anchor.current = null;
      const delta = el.getBoundingClientRect().top - top;
      if (delta) window.scrollBy({ top: delta, behavior: "instant" });
    }
    if (pending.current) {
      const { slug, smooth } = pending.current;
      pending.current = null;
      reveal(slug, smooth);
    }
  }, [range, reveal]);

  // Opened at an entry or a month: bring that entry to the top (the server
  // page does this before the first paint; this covers arriving by a link
  // inside the site, after the router's own scroll).
  useEffect(() => {
    if (!target) return;
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(`entry-${target}`);
      if (!el) return;
      const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      if (Math.abs(el.getBoundingClientRect().top - margin) > 8) el.scrollIntoView({ behavior: "instant", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The entry in view: the one crossing a line a third of the way down.
  useEffect(() => {
    const root = entriesRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (list) => {
        if (gliding.current) return;
        const hit = list.filter((x) => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const slug = (hit?.target as HTMLElement | undefined)?.dataset.slug;
        if (slug) setCurrent(slug);
      },
      { rootMargin: "-32% 0px -64% 0px" },
    );
    root.querySelectorAll(".jr-entry").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [range]);

  // Fetch the neighbouring months as the reader nears either end. A month
  // above is added only once scrolling has paused (IDLE_MS): keeping the
  // reader in place then needs a small scroll correction, which must not
  // fight a scroll still in motion (momentum on phones).
  useEffect(() => {
    const root = entriesRef.current;
    if (!root) return;
    let wait = 0;
    const whenStill = (run: () => void) => {
      window.clearTimeout(wait);
      const since = performance.now() - lastScroll.current;
      if (since >= IDLE_MS) return run();
      wait = window.setTimeout(() => whenStill(run), IDLE_MS - since);
    };
    const io = new IntersectionObserver(
      (list) => {
        for (const x of list) {
          // A keyboard user on the link itself decides (Enter loads it).
          if (!x.isIntersecting || document.activeElement === x.target) continue;
          const dir = (x.target as HTMLElement).dataset.more as "older" | "newer";
          if (dir === "newer") whenStill(() => void extend("newer"));
          else void extend("older");
        }
      },
      { rootMargin: AHEAD },
    );
    root.querySelectorAll("[data-more]").forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      window.clearTimeout(wait);
    };
  }, [range, extend]);

  // Desktop: entries settle gently into view. When scrolling stops with an
  // entry's top close to its resting line, ease it the last few pixels;
  // anywhere else the reader stays exactly where they stopped.
  useEffect(() => {
    if (reduced) return;
    const desk = window.matchMedia(DESKTOP);
    let wait = 0;
    const settle = () => {
      if (!desk.matches || gliding.current) return;
      for (const el of entriesRef.current?.querySelectorAll<HTMLElement>(".jr-entry") ?? []) {
        const line = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        const off = el.getBoundingClientRect().top - line;
        if (Math.abs(off) <= SETTLE_PX) {
          if (Math.abs(off) > 2) window.scrollBy({ top: off, behavior: "smooth" });
          return;
        }
      }
    };
    const onScroll = () => {
      window.clearTimeout(wait);
      wait = window.setTimeout(settle, 160);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(wait);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced]);

  // When the page last scrolled (for the pause above).
  useEffect(() => {
    const onScroll = () => {
      lastScroll.current = performance.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Phone: keep the year in view at the front of its sideways row.
  useEffect(() => {
    const row = yearsRef.current;
    const i = years.indexOf(calYear);
    if (!row || i < 0) return;
    const step = row.scrollWidth / Math.max(1, years.length);
    const left = Math.max(0, (i - 1) * step);
    if (Math.abs(row.scrollLeft - left) > step / 2 && (i * step < row.scrollLeft || (i + 1) * step > row.scrollLeft + row.clientWidth)) {
      row.scrollTo({ left, behavior: reduced ? "instant" : "smooth" });
    }
  }, [calYear, years, reduced]);

  // Phone: Escape folds the calendar away.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const onMonth = useCallback(
    (m: JournalMonth) => {
      const first = index.find((e) => monthKeyOf(e.date) === m.key);
      if (first) void goTo(first.slug);
    },
    [index, goTo],
  );

  const onYear = (e: MouseEvent, y: number) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    if (window.matchMedia(PHONE).matches) {
      // Phone: the year's newest entry.
      const first = index.find((x) => dateParts(x.date).year === y);
      if (first) void goTo(first.slug);
      return;
    }
    setZoom(y);
  };

  const monthName = `${MONTH_NAMES[shown.month - 1]} ${shown.year}`;
  const loaded = range.flatMap((key) => (data[key] ?? []).map((e) => ({ e, key })));
  const older = months[at(range[range.length - 1]) + 1];
  const newer = months[at(range[0]) - 1];
  const scrollScript = target
    ? `document.getElementById(${JSON.stringify(`entry-${target}`)})?.scrollIntoView({block:"start",behavior:"instant"})`
    : null;

  return (
    <section className="jr" aria-labelledby={headingSlug ? `entry-title-${headingSlug}` : "journal-title"}>
      <header className="jr-head">
        <div className="jr-head-text">
          {headingSlug ? (
            <p className="jr-heading">Journal</p>
          ) : (
            <h1 id="journal-title" className="jr-heading">
              Journal
            </h1>
          )}
          {tagline && <p className="jr-tagline">{tagline}</p>}
        </div>
        <nav className="jr-years" aria-label="Years">
          <div ref={yearsRef} className="jr-years-row">
            {years.map((y) => {
              const newest = months.find((m) => m.year === y)!;
              return (
                <a
                  key={y}
                  className="hairline"
                  href={monthHref(newest.year, newest.month)}
                  aria-current={y === calYear ? "true" : undefined}
                  onClick={(e) => onYear(e, y)}
                >
                  {y}
                </a>
              );
            })}
          </div>
        </nav>
      </header>

      <div className="jr-body">
        <div className="jr-rail" data-open={open ? "" : undefined}>
          <button
            ref={toggleRef}
            type="button"
            className="jr-toggle"
            aria-expanded={open}
            aria-controls="journal-calendar"
            aria-label={`${monthName}, ${open ? "close the calendar" : "open the calendar"}`}
            onClick={() => setOpen((o) => !o)}
          >
            <Crossfade className="jr-toggle-month" value={monthName} />
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              {[2, 8, 14].flatMap((y) => [2, 8, 14].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" />))}
            </svg>
          </button>
          <div id="journal-calendar" className="jr-fold">
            <div className="jr-fold-inner">
              <Calendar
                year={shown.year}
                month={shown.month}
                zoomYear={zoom}
                byDay={byDay}
                months={months}
                years={years}
                current={current}
                animate={!reduced}
                onEntry={(slug) => void goTo(slug)}
                onMonth={onMonth}
                onZoomOut={() => setZoom(shown.year)}
              />
            </div>
          </div>
        </div>

        <div ref={entriesRef} className="jr-entries">
          {newer && (
            <a className="jr-more hairline" data-more="newer" href={monthHref(newer.year, newer.month)} onClick={(e) => {
              if (!isPlainClick(e)) return;
              e.preventDefault();
              void extend("newer");
            }}>
              Newer entries, {MONTH_NAMES[newer.month - 1]} {newer.year}
            </a>
          )}
          {loaded.map(({ e }, i) => (
            <Entry
              key={e._id}
              entry={e}
              isPageHeading={e.slug === headingSlug}
              current={e.slug === current}
              priority={e.slug === (target ?? opening.entries[0]?.slug) && i < 3}
            />
          ))}
          {scrollScript && <script dangerouslySetInnerHTML={{ __html: scrollScript }} />}
          {older && (
            <div className="jr-tail">
              <a className="jr-more hairline" data-more="older" href={monthHref(older.year, older.month)} onClick={(e) => {
                if (!isPlainClick(e)) return;
                e.preventDefault();
                void extend("older");
              }}>
                Older entries, {MONTH_NAMES[older.month - 1]} {older.year}
              </a>
              {/* Room for the month that loads next, so nothing below moves when it arrives. */}
              <div className="jr-room" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
