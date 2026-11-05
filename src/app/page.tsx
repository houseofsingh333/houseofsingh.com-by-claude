import CinematicHero from "@/components/home/CinematicHero";
import IntroSection from "@/components/home/IntroSection";
import ProjectsArchive from "@/components/home/ProjectsArchive";
import SpotlightBillboard from "@/components/home/SpotlightBillboard";
import JournalPreview from "@/components/home/JournalPreview";
import SpotifyEmbed from "@/components/home/SpotifyEmbed";
import StudioRedirect from "@/components/home/StudioRedirect";
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
  type HeroSlide,
  type HomeIntroData,
  type HomepageProject,
  type JournalEntry,
  type SiteSettings,
} from "@/lib/placeholder-data";
import type { SpotlightData } from "@/lib/types";
import { devPlaceholder } from "@/lib/placeholders";
import JsonLd from "@/components/JsonLd";
import { buildProfilePageJsonLd } from "@/lib/structured-data";

type SanityHomepageProject = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  thumbnail: HomepageProject["thumbnail"];
  thumbnailAlt: string;
  excerpt: string;
};

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
  const spotifyUrl =
    settings?.spotifyPlaylistUrl ?? fallbackSiteSettings.spotifyPlaylistUrl;

  return (
    <>
      <JsonLd data={buildProfilePageJsonLd()} />
      <h1 className="sr-only">House of Singh, Maninder Singh: creative director, photographer and multidisciplinary designer</h1>
      <CinematicHero slides={heroSlides} />
      {homeIntro && <IntroSection data={homeIntro} />}
      {homepageProjects.length > 0 && (
        <ProjectsArchive projects={homepageProjects} />
      )}
      {spotlight?.enabled && <SpotlightBillboard spotlight={spotlight} />}
      {journalEntries.length > 0 && <JournalPreview entries={journalEntries} />}
      <SpotifyEmbed playlistUrl={spotifyUrl} />
      <StudioRedirect />
    </>
  );
}
