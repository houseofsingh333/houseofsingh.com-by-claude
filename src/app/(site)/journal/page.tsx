import type { Metadata, ResolvingMetadata } from "next";
import { fullTitle } from "@/lib/page-title";
import { shareCard } from "@/lib/share-metadata";
import JournalList from "@/components/journal/JournalList";
import { loadJournalEntries } from "@/lib/journalArchive";
import { JOURNAL_DESCRIPTION, JOURNAL_TITLE } from "@/lib/pageDescriptions";

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: JOURNAL_TITLE,
    description: JOURNAL_DESCRIPTION,
    alternates: {
      canonical: "/journal",
    },
    ...(await shareCard(parent, fullTitle(JOURNAL_TITLE), JOURNAL_DESCRIPTION)),
  };
}

/**
 * The journal, opening on the most recent month. A cached page (no
 * per visit rendering): every other month has its own cached address,
 * /journal/archive/<year>/<month>, which the year and month links point to.
 * Old addresses with ?year=&month= are sent there (next.config.ts).
 */
export default async function JournalPage() {
  const entries = await loadJournalEntries();
  return <JournalList entries={entries} requested={null} />;
}
