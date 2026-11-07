import type { Metadata, ResolvingMetadata } from "next";
import { permanentRedirect } from "next/navigation";
import { fullTitle } from "@/lib/page-title";
import { shareCard } from "@/lib/share-metadata";
import JournalList from "@/components/journal/JournalList";
import NotFoundResponse from "@/components/NotFoundResponse";
import { journalMonthHref, loadJournalEntries, monthsWithEntries } from "@/lib/journalArchive";
import { journalMonthDescription, monthName } from "@/lib/pageDescriptions";

/*
 * One month of the journal, at its own cached address with its own
 * canonical. Months with entries are built ahead; any other valid month is
 * built on first visit and cached. A month with no entries still shows the
 * journal (with its "No entries" note) but is kept out of search results.
 */

type Params = { year: string; month: string };

/** The year and month in the address, if they are a valid month. */
function parse(params: Params): { year: number; month: number } | null {
  const year = Number(params.year);
  const month = Number(params.month);
  if (!/^\d{4}$/.test(params.year) || !/^\d{1,2}$/.test(params.month)) return null;
  if (!Number.isInteger(year) || month < 1 || month > 12) return null;
  return { year, month };
}

export async function generateStaticParams(): Promise<Params[]> {
  const entries = await loadJournalEntries();
  return monthsWithEntries(entries).map(({ year, month }) => ({ year: String(year), month: String(month) }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const when = parse(await params);
  if (!when) return {};
  const entries = await loadJournalEntries();
  const hasEntries = monthsWithEntries(entries).some((m) => m.year === when.year && m.month === when.month);
  const title = `Journal, ${monthName(when.year, when.month)}`;
  const description = journalMonthDescription(when.year, when.month);
  return {
    title,
    description,
    alternates: { canonical: journalMonthHref(when.year, when.month) },
    ...(hasEntries ? {} : { robots: { index: false, follow: true } }),
    ...(await shareCard(parent, fullTitle(title), description)),
  };
}

export default async function JournalMonthPage({ params }: { params: Promise<Params> }) {
  const raw = await params;
  const when = parse(raw);
  if (!when) return <NotFoundResponse />;
  // One address per month: /journal/archive/2025/07 goes on to .../2025/7.
  const canonical = journalMonthHref(when.year, when.month);
  if (`/journal/archive/${raw.year}/${raw.month}` !== canonical) permanentRedirect(canonical);
  const entries = await loadJournalEntries();
  return <JournalList entries={entries} requested={when} />;
}
