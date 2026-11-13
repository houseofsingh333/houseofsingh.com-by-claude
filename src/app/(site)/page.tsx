import CinematicHero from "@/components/home/CinematicHero";
import IntroSection from "@/components/home/IntroSection";
import Exhibition from "@/components/home/exhibition/Exhibition";
import SpotlightBillboard from "@/components/home/SpotlightBillboard";
import JournalFilmstrip from "@/components/home/filmstrip/JournalFilmstrip";
import RecordChapter from "@/components/home/record/RecordChapter";
import PracticeChapter from "@/components/home/practice/PracticeChapter";
import { siteCopy } from "@/lib/siteCopy";
import { sanityFetch } from "@/sanity/fetch";
import {
  heroSlidesQuery,
  homeIntroQuery,
  siteSettingsQuery,
  homepageFeaturedProjectsQuery,
  latestProjectsQuery,
  journalFeedQuery,
  spotlightQuery,
} from "@/sanity/queries";
import {
  fallbackHeroSlides,
  fallbackHomepageProjects,
  fallbackJournalEntries,
  fallbackSiteSettings,
  fallbackHomeIntro,
} from "@/lib/placeholder-data";
import type {
  HeroSlide,
  HomeIntroData,
  HomepageProject,
  JournalEntry,
  SiteSettings,
  SpotlightData,
} from "@/lib/types";
import { devPlaceholder } from "@/lib/placeholders";
import JsonLd from "@/components/JsonLd";
import { buildProfilePageJsonLd } from "@/lib/structured-data";
import { parseSanityDate } from "@/lib/dates";
// This area's own styles, loaded with its pages alone (globals.css).
import "@/app/styles/home.css";

type SanityHomepageProject = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  thumbnail: HomepageProject["thumbnail"];
  thumbnailAlt: string;
  excerpt: string;
};

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
  const [slides, intro, settings, featured, latest, journal, spotlight] =
    await Promise.all([
      sanityFetch<HeroSlide[] | null>({ query: heroSlidesQuery }),
      sanityFetch<HomeIntroData | null>({ query: homeIntroQuery }),
      sanityFetch<SiteSettings | null>({ query: siteSettingsQuery }),
      sanityFetch<SanityHomepageProject[] | null>({
        query: homepageFeaturedProjectsQuery,
      }),
      sanityFetch<SanityHomepageProject[] | null>({
        query: latestProjectsQuery,
      }),
      sanityFetch<JournalEntry[] | null>({ query: journalFeedQuery }),
      sanityFetch<SpotlightData | null>({ query: spotlightQuery }),
    ]);

  // Placeholder content (demo slides, intro, projects, journal) is used only
  // when NEXT_PUBLIC_USE_PLACEHOLDERS=1 locally. In production an empty
  // Sanity answer renders nothing for that section rather than fake content.
  const realSlides = slides ?? [];
  const heroSlides =
    realSlides.length >= 3
      ? realSlides
      : [
          ...realSlides,
          ...devPlaceholder(fallbackHeroSlides, []).slice(realSlides.length),
        ];
  const homeIntro =
    intro ?? devPlaceholder<HomeIntroData | null>(fallbackHomeIntro, null);

  // Featured projects: use manually curated list, else latest 6
  const homepageProjects: HomepageProject[] =
    featured && featured.length > 0
      ? featured
      : latest && latest.length > 0
        ? latest
        : devPlaceholder(fallbackHomepageProjects, []);

  const journalEntries = journal?.length
    ? journal
    : devPlaceholder(fallbackJournalEntries, []);
  // Every chapter text from Site Settings, or today's text when empty.
  const copy = siteCopy(settings);
  const spotifyUrl =
    settings?.spotifyPlaylistUrl ?? fallbackSiteSettings.spotifyPlaylistUrl;

  return (
    <>
      <JsonLd data={buildProfilePageJsonLd()} />
      <h1 className="sr-only">House of Singh, Maninder Singh: creative director, photographer and multidisciplinary designer</h1>
      <CinematicHero slides={heroSlides} labels={{ previous: copy.heroPreviousLabel, next: copy.heroNextLabel }} />
      {homeIntro && <IntroSection data={homeIntro} copy={copy} />}
      {homepageProjects.length > 0 && (
        <Exhibition projects={homepageProjects} copy={copy} />
      )}
      {spotlight?.enabled && <SpotlightBillboard spotlight={spotlight} copy={copy} />}
      {journalEntries.length > 0 && (
        <JournalFilmstrip entries={latestJournal(journalEntries)} label={copy.notebookLabel} />
      )}
      <RecordChapter playlistUrl={spotifyUrl} copy={copy} />
      <PracticeChapter copy={copy} cards={settings?.studioWorkCards} />
    </>
  );
}
