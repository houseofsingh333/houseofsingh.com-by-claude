import type { PortableTextBlock } from "@portabletext/react";
import { parseSanityDate } from "@/lib/dates";
import type { SanityImageAsset } from "@/lib/sanityImage";

/*
 * The Journal page (the calendar and the reading room): plain data and the
 * small date helpers both the server and the browser use. No server only
 * imports here, so the page's client component can share it.
 */

/** One entry as the calendar knows it (every entry is sent, so this stays light). */
export type JournalDay = {
  id: string;
  slug: string;
  title: string;
  /** "YYYY-MM-DD", a calendar day (read with local parts, never as UTC). */
  date: string;
  /** The cover, for the entry's photo circle. */
  thumb: { url: string; hotspot: { x: number; y: number } | null } | null;
};

/** One entry in full, as the reading room shows it. */
export type JournalEntryFull = {
  _id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string | null;
  coverImage: SanityImageAsset | null;
  body: PortableTextBlock[] | null;
};

/** A month that has entries: its key ("2026-7"), year and month (1 to 12). */
export type JournalMonth = { key: string; year: number; month: number };

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export function monthKey(year: number, month: number): string {
  return `${year}-${month}`;
}

/** Year, month (1 to 12) and day of a "YYYY-MM-DD" date, read locally. */
export function dateParts(date: string): { year: number; month: number; day: number } {
  const d = parseSanityDate(date);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

export function monthKeyOf(date: string): string {
  const { year, month } = dateParts(date);
  return monthKey(year, month);
}

/** The months that have entries, newest first (the index is newest first). */
export function monthsOf(days: JournalDay[]): JournalMonth[] {
  const seen = new Map<string, JournalMonth>();
  for (const e of days) {
    const { year, month } = dateParts(e.date);
    const key = monthKey(year, month);
    if (!seen.has(key)) seen.set(key, { key, year, month });
  }
  return [...seen.values()];
}

/** The address of a month of the journal (no leading zero). */
export function monthHref(year: number, month: number): string {
  return `/journal/archive/${year}/${month}`;
}

export function entryHref(slug: string): string {
  return `/journal/${slug}`;
}

/** Where the browser fetches a month's entries as the reader scrolls. */
export function monthDataHref(year: number, month: number): string {
  return `/api/journal/${year}/${month}`;
}

/** The first day of a month and of the month after it, for the month query. */
export function monthBounds(year: number, month: number): { from: string; to: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  return { from: `${year}-${pad(month)}-01`, to: `${next.y}-${pad(next.m)}-01` };
}

/** "5 July 2026" */
export function longDate(date: string): string {
  const { year, month, day } = dateParts(date);
  return `${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

/** "The saddle", "The saddle and Groundwork", "A, B and C". */
export function joinTitles(titles: string[]): string {
  if (titles.length < 2) return titles[0] ?? "";
  return `${titles.slice(0, -1).join(", ")} and ${titles[titles.length - 1]}`;
}

/** A small square crop of a Sanity image around its focal point, for a photo circle. */
export function circleSrc(url: string, size: number, hotspot: { x: number; y: number } | null): string {
  try {
    const u = new URL(url);
    if (u.hostname !== "cdn.sanity.io") return url;
    u.searchParams.set("w", String(size));
    u.searchParams.set("h", String(size));
    u.searchParams.set("fit", "crop");
    u.searchParams.set("q", "70");
    u.searchParams.set("auto", "format");
    if (hotspot) {
      u.searchParams.set("crop", "focalpoint");
      u.searchParams.set("fp-x", String(hotspot.x));
      u.searchParams.set("fp-y", String(hotspot.y));
    }
    return u.toString();
  } catch {
    return url;
  }
}

/** Days in a month, and how many blank cells come before day 1 (weeks start on Monday). */
export function monthGrid(year: number, month: number): { lead: number; days: number } {
  const lead = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const days = new Date(year, month, 0).getDate();
  return { lead, days };
}
