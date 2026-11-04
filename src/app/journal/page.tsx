import { Suspense } from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { fullTitle } from "@/lib/page-title";
import { shareCard } from "@/lib/share-metadata";
import JournalList from "@/components/journal/JournalList";
import { sanityFetch } from "@/sanity/fetch";
import { journalFeedQuery } from "@/sanity/queries";
import {
  fallbackJournalEntries,
  type JournalEntry,
} from "@/lib/placeholder-data";

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

export default async function JournalPage() {
  const data = await sanityFetch<JournalEntry[] | null>({
    query: journalFeedQuery,
  });

  const entries = data?.length ? data : fallbackJournalEntries;

  return (
    <Suspense>
      <JournalList entries={entries} />
    </Suspense>
  );
}
