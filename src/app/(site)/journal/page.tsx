import type { Metadata, ResolvingMetadata } from "next";
import { pagePhoto } from "@/lib/pagePhotos";
import { fullTitle } from "@/lib/page-title";
import { shareCard, withSharePhoto } from "@/lib/share-metadata";
import JournalPage from "@/components/journal/room/JournalPage";
import { JOURNAL_DESCRIPTION, JOURNAL_TITLE } from "@/lib/pageDescriptions";
import JsonLd from "@/components/JsonLd";
import { loadJournalIndex } from "@/lib/journalData";
import { sanityFetch } from "@/sanity/fetch";
import { siteSettingsQuery } from "@/sanity/queries";
import { buildJournalJsonLd } from "@/lib/structured-data";
import type { SiteSettings } from "@/lib/types";
// This area's own styles, loaded with its pages alone (globals.css).
import "@/app/styles/journal.css";

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
    ...withSharePhoto(await shareCard(parent, fullTitle(JOURNAL_TITLE), JOURNAL_DESCRIPTION), await pagePhoto("journal"), JOURNAL_TITLE),
  };
}

/**
 * The journal, opened at the newest entry (the calendar and the reading
 * room, components/journal/room). A cached page: each entry
 * (/journal/[slug]) and each month (/journal/archive/<year>/<month>) is the
 * same page opened elsewhere, at its own cached address. Old addresses
 * with ?year=&month= are sent to the month (next.config.ts).
 */
export default async function Journal() {
  // The same fetches the page itself makes (shared, cached).
  const [index, settings] = await Promise.all([
    loadJournalIndex(),
    sanityFetch<SiteSettings | null>({ query: siteSettingsQuery }),
  ]);
  const jsonLd = buildJournalJsonLd(index.slice(0, 20), { title: JOURNAL_TITLE, description: JOURNAL_DESCRIPTION }, settings);
  return (
    <>
      <JsonLd data={jsonLd} />
      <JournalPage at={{ kind: "latest" }} />
    </>
  );
}
