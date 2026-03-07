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

  const heroSlides = slides?.length
    ? slides.length >= 3
      ? slides
      : [...slides, ...fallbackHeroSlides.slice(slides.length)]
    : fallbackHeroSlides;
  const homeIntro = intro ?? fallbackHomeIntro;

  // Featured projects: use manually curated list, else latest 6, else fallback
  const homepageProjects: HomepageProject[] =
    featured && featured.length > 0
      ? featured
      : latest && latest.length > 0
        ? latest
        : fallbackHomepageProjects;

  const journalEntries = journal?.length ? journal : fallbackJournalEntries;
  const spotifyUrl =
    settings?.spotifyPlaylistUrl ?? fallbackSiteSettings.spotifyPlaylistUrl;

  return (
    <>
      <CinematicHero slides={heroSlides} />
      <IntroSection data={homeIntro} />
      <ProjectsArchive projects={homepageProjects} />
      {spotlight?.enabled && <SpotlightBillboard spotlight={spotlight} />}
      <JournalPreview entries={journalEntries} />
      <SpotifyEmbed playlistUrl={spotifyUrl} />
      <StudioRedirect />
    </>
  );
}
