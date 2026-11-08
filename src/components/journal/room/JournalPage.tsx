import { sanityFetch } from "@/sanity/fetch";
import { siteSettingsQuery } from "@/sanity/queries";
import { loadJournalIndex, loadJournalMonth, openingFor } from "@/lib/journalData";
import { monthsOf } from "@/lib/journalRoom";
import type { SiteSettings } from "@/lib/types";
import JournalRoom from "./JournalRoom";

type At = { kind: "latest" } | { kind: "entry"; slug: string } | { kind: "month"; year: number; month: number };

/**
 * The Journal page on the server: one page for /journal (the newest
 * entry), /journal/[slug] (opened at that entry) and
 * /journal/archive/[year]/[month] (opened at that month). The month it
 * opens at is rendered in full, with the calendar and links to every
 * month; the browser fetches the other months as the reader scrolls.
 */
export default async function JournalPage({ at }: { at: At }) {
  const [index, settings] = await Promise.all([
    loadJournalIndex(),
    sanityFetch<SiteSettings | null>({ query: siteSettingsQuery }),
  ]);
  const tagline = settings?.journalTagline?.trim() || null;
  const opening = openingFor(index, at);
  if (!opening) {
    return (
      <section className="jr" aria-labelledby="journal-title">
        <header className="jr-head">
          <div className="jr-head-text">
            <h1 id="journal-title" className="jr-heading">
              Journal
            </h1>
            {tagline && <p className="jr-tagline">{tagline}</p>}
          </div>
        </header>
        <p className="jr-empty">No entries yet.</p>
      </section>
    );
  }
  const entries = await loadJournalMonth(opening.month.year, opening.month.month);
  return (
    <JournalRoom
      index={index}
      months={monthsOf(index)}
      opening={{ key: opening.month.key, entries }}
      target={at.kind === "latest" ? null : opening.slug}
      headingSlug={at.kind === "entry" ? opening.slug : null}
      tagline={tagline}
    />
  );
}
