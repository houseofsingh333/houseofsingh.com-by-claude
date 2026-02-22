/**
 * Punjabi journal list — /pa/journal
 */
import type { Metadata } from "next";
import JournalList from "@/components/journal/JournalList";
import { sanityFetch } from "@/sanity/fetch";
import { journalFeedQuery } from "@/sanity/queries";
import {
  fallbackJournalEntries,
  type JournalEntry,
} from "@/lib/placeholder-data";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Thoughts, process notes, and behind-the-scenes stories from House of Singh.",
};

export default async function PaJournalPage() {
  const data = await sanityFetch<JournalEntry[] | null>({
    query: journalFeedQuery,
  });

  const entries = data?.length ? data : fallbackJournalEntries;

  return <JournalList entries={entries} />;
}
