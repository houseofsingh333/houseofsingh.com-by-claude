import HomeOpening from "@/components/home/opening/HomeOpening";
import Introduction from "@/components/home/introduction/Introduction";
import SelectedWork, { type SelectedProject } from "@/components/home/selected/SelectedWork";
import SpotlightBillboard from "@/components/home/SpotlightBillboard";
import JournalFilmstrip from "@/components/home/filmstrip/JournalFilmstrip";
import RecordChapter from "@/components/home/record/RecordChapter";
import PracticeChapter from "@/components/home/practice/PracticeChapter";
import { siteCopy } from "@/lib/siteCopy";
import { sanityFetch } from "@/sanity/fetch";
import { homeIntroQuery, siteSettingsQuery, selectedProjectQuery, journalFeedQuery, spotlightQuery } from "@/sanity/queries";
import { fallbackJournalEntries, fallbackSiteSettings, fallbackHomeIntro } from "@/lib/placeholder-data";
import type { HomeIntroData, JournalEntry, SiteSettings, SpotlightData } from "@/lib/types";
import { devPlaceholder } from "@/lib/placeholders";
import JsonLd from "@/components/JsonLd";
import { buildProfilePageJsonLd } from "@/lib/structured-data";
import { parseSanityDate } from "@/lib/dates";
import { roman } from "@/lib/roman";
// This area's own styles, loaded with its pages alone (globals.css).
import "@/app/styles/home.css";

/** The six latest journal entries, newest first (dates read as local dates). */
function latestJournal(entries: JournalEntry[]): JournalEntry[] {
  return [...entries]
    .sort((a, b) => parseSanityDate(b.date).getTime() - parseSanityDate(a.date).getTime())
    .slice(0, 6);
}

// The home page keeps the site's title, description and share image: the
// crest (src/app/opengraph-image.png, made by scripts/share-image.mjs;
// approved 12 Nov, in place of the first hero slide).

export default async function HomePage() {
  const [intro, settings, selected, journal, spotlight] = await Promise.all([
    sanityFetch<HomeIntroData | null>({ query: homeIntroQuery }),
    sanityFetch<SiteSettings | null>({ query: siteSettingsQuery }),
    sanityFetch<SelectedProject | null>({ query: selectedProjectQuery }),
    sanityFetch<JournalEntry[] | null>({ query: journalFeedQuery }),
    sanityFetch<SpotlightData | null>({ query: spotlightQuery }),
  ]);

  // Placeholder content is used only when NEXT_PUBLIC_USE_PLACEHOLDERS=1
  // locally. In production an empty Sanity answer renders nothing for that
  // chapter rather than fake content.
  const homeIntro = intro ?? devPlaceholder<HomeIntroData | null>(fallbackHomeIntro, null);
  const journalEntries = journal?.length ? journal : devPlaceholder(fallbackJournalEntries, []);
  // Every chapter text from Site Settings, or today's text when empty.
  const copy = siteCopy(settings);
  const spotifyUrl = settings?.spotifyPlaylistUrl ?? fallbackSiteSettings.spotifyPlaylistUrl;

  // The chapters number themselves in the order shown (14 Nov): I
  // Introduction, II Selected work, then In the studio now (only while its
  // Spotlight is on), the notebook, the record and the practice.
  let n = 0;
  const next = () => roman(++n);
  const introNumeral = next();
  const selectedNumeral = selected ? next() : "";
  const spotlightNumeral = spotlight?.enabled ? next() : "";
  const journalNumeral = journalEntries.length > 0 ? next() : "";
  const recordNumeral = next();
  const practiceNumeral = next();

  return (
    <>
      <JsonLd data={buildProfilePageJsonLd()} />
      <h1 className="sr-only">House of Singh, Maninder Singh: creative director, photographer and multidisciplinary designer</h1>
      <HomeOpening scrollWord={copy.openingScroll} />
      <Introduction
        numeral={introNumeral}
        name={homeIntro?.founderName ?? "Maninder Singh"}
        portrait={homeIntro?.portrait ?? null}
        copy={copy}
      />
      {selected && <SelectedWork numeral={selectedNumeral} project={selected} copy={copy} />}
      {spotlight?.enabled && <SpotlightBillboard numeral={spotlightNumeral} spotlight={spotlight} copy={copy} />}
      {journalEntries.length > 0 && (
        <JournalFilmstrip numeral={journalNumeral} entries={latestJournal(journalEntries)} label={copy.notebookLabel} />
      )}
      <RecordChapter numeral={recordNumeral} playlistUrl={spotifyUrl} copy={copy} />
      <PracticeChapter numeral={practiceNumeral} copy={copy} cards={settings?.studioWorkCards} />
    </>
  );
}
