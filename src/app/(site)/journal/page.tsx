import type { Metadata, ResolvingMetadata } from "next";
import { fullTitle } from "@/lib/page-title";
import { shareCard } from "@/lib/share-metadata";
import JournalPage from "@/components/journal/room/JournalPage";
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
 * The journal, opened at the newest entry (the calendar and the reading
 * room, components/journal/room). A cached page: each entry
 * (/journal/[slug]) and each month (/journal/archive/<year>/<month>) is the
 * same page opened elsewhere, at its own cached address. Old addresses
 * with ?year=&month= are sent to the month (next.config.ts).
 */
export default function Journal() {
  return <JournalPage at={{ kind: "latest" }} />;
}
