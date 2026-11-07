import type { Metadata, ResolvingMetadata } from "next";
import { fullTitle } from "@/lib/page-title";
import { shareCard } from "@/lib/share-metadata";
import JournalList from "@/components/journal/JournalList";
import { sanityFetch } from "@/sanity/fetch";
import { journalFeedQuery } from "@/sanity/queries";
import { devPlaceholder } from "@/lib/placeholders";
import { fallbackJournalEntries } from "@/lib/placeholder-data";
import type { JournalEntry } from "@/lib/types";

const TITLE = "Journal";
const DESCRIPTION =
  "Thoughts, process notes, and behind-the-scenes stories from House of Singh.";

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
      canonical: "/journal",
    },
    ...(await shareCard(parent, fullTitle(TITLE), DESCRIPTION)),
  };
}

/** A year and month from the address (?year=2025&month=7), if both are valid. */
function requestedMonth(params: { year?: string | string[]; month?: string | string[] }) {
  const year = Number(params.year);
  const month = Number(params.month);
  if (!Number.isInteger(year) || !Number.isInteger(month)) return null;
  if (month < 1 || month > 12 || year < 1900 || year > 9999) return null;
  return { year, month };
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string | string[]; month?: string | string[] }>;
}) {
  // The year and month are read here, on the server, so the list renders
  // complete in the HTML for every address (including the "Back to journal"
  // links from entries, which carry ?year=&month=). Reading them in the
  // browser with useSearchParams made Next.js skip the list in the server
  // HTML, so the footer showed mid screen until the list appeared.
  const [data, params] = await Promise.all([
    sanityFetch<JournalEntry[] | null>({ query: journalFeedQuery }),
    searchParams,
  ]);

  const entries = data?.length
    ? data
    : devPlaceholder(fallbackJournalEntries, []);

  return <JournalList entries={entries} requested={requestedMonth(params)} />;
}
