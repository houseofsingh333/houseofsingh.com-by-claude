import { sanityFetch } from "@/sanity/fetch";
import { journalFeedQuery } from "@/sanity/queries";
import { devPlaceholder } from "@/lib/placeholders";
import { fallbackJournalEntries } from "@/lib/placeholder-data";
import { parseSanityDate } from "@/lib/dates";
import type { JournalEntry } from "@/lib/types";

/*
 * The journal archive: /journal shows the most recent month, and every
 * month has its own cached address, /journal/archive/<year>/<month>
 * (month without a leading zero, for example /journal/archive/2025/7).
 */

/** Every journal entry, newest first as the feed query orders them. */
export async function loadJournalEntries(): Promise<JournalEntry[]> {
  const data = await sanityFetch<JournalEntry[] | null>({ query: journalFeedQuery });
  return data?.length ? data : devPlaceholder(fallbackJournalEntries, []);
}

export { journalMonthHref } from "./journalLinks";

/** Every year and month that has at least one entry. */
export function monthsWithEntries(entries: JournalEntry[]): { year: number; month: number }[] {
  const seen = new Map<string, { year: number; month: number }>();
  for (const e of entries) {
    const d = parseSanityDate(e.date);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    if (!seen.has(key)) seen.set(key, { year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return [...seen.values()];
}
