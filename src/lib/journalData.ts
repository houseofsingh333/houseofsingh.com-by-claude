import { sanityFetch } from "@/sanity/fetch";
import { journalIndexQuery, journalMonthQuery } from "@/sanity/queries";
import { devPlaceholder } from "@/lib/placeholders";
import { fallbackJournalEntries } from "@/lib/placeholder-data";
import { monthBounds, monthKeyOf, monthsOf, type JournalDay, type JournalEntryFull, type JournalMonth } from "@/lib/journalRoom";

/*
 * The Journal page's data, on the server: every entry for the calendar
 * (light), and one month of entries in full. The page renders the month it
 * opens at; the browser asks for the others month by month as the reader
 * scrolls (api/journal/[year]/[month]).
 */

type RawDay = Omit<JournalDay, "id"> & { _id: string };

/** Placeholder entries, local development only (NEXT_PUBLIC_USE_PLACEHOLDERS). */
function placeholderEntries(): JournalEntryFull[] {
  return devPlaceholder(fallbackJournalEntries, []).map((e) => ({
    _id: e._id,
    slug: e.slug,
    title: e.title,
    date: e.date,
    excerpt: e.excerpt ?? null,
    coverImage: typeof e.coverImage === "string" ? { url: e.coverImage, alt: e.title } : (e.coverImage ?? null),
    body: null,
  }));
}

/** Every entry, newest first, for the calendar. */
export async function loadJournalIndex(): Promise<JournalDay[]> {
  const data = await sanityFetch<RawDay[] | null>({ query: journalIndexQuery });
  if (data?.length) {
    return data.map((d) => ({ id: d._id, slug: d.slug, title: d.title, date: d.date, thumb: d.thumb?.url ? { url: d.thumb.url, hotspot: d.thumb.hotspot ?? null } : null }));
  }
  return placeholderEntries().map((e) => ({ id: e._id, slug: e.slug, title: e.title, date: e.date, thumb: e.coverImage?.url ? { url: e.coverImage.url, hotspot: null } : null }));
}

/** The entries of one month in full, newest first. */
export async function loadJournalMonth(year: number, month: number): Promise<JournalEntryFull[]> {
  const { from, to } = monthBounds(year, month);
  const data = await sanityFetch<JournalEntryFull[] | null>({ query: journalMonthQuery, params: { from, to } });
  if (data) return data;
  return placeholderEntries().filter((e) => e.date >= from && e.date < to);
}

/** Where the page opens: which month, and which entry is brought into view. */
export type JournalOpening = { month: JournalMonth; slug: string | null };

/**
 * The month and entry the page opens at. "latest" is the newest entry; an
 * entry opens at its own month; a month without entries opens at the
 * nearest older month that has some (or the oldest one, past the end).
 */
export function openingFor(
  index: JournalDay[],
  at: { kind: "latest" } | { kind: "entry"; slug: string } | { kind: "month"; year: number; month: number },
): JournalOpening | null {
  const months = monthsOf(index);
  if (!months.length) return null;
  if (at.kind === "entry") {
    const e = index.find((d) => d.slug === at.slug);
    if (!e) return null;
    return { month: months.find((m) => m.key === monthKeyOf(e.date))!, slug: e.slug };
  }
  if (at.kind === "month") {
    const wanted = at.year * 12 + at.month;
    const m = months.find((x) => x.year * 12 + x.month <= wanted) ?? months[months.length - 1];
    const first = index.find((d) => monthKeyOf(d.date) === m.key);
    return { month: m, slug: first?.slug ?? null };
  }
  return { month: months[0], slug: index[0].slug };
}
