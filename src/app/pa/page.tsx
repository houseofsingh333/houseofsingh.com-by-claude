/**
 * Punjabi homepage — /pa
 * Same data fetching as English homepage; lang context is set to "pa"
 * by middleware → root layout → LangProvider.
 */
import HeroSlider from "@/components/home/HeroSlider";
import IntroSection from "@/components/home/IntroSection";
import ProjectsPreview from "@/components/home/ProjectsPreview";
import SpotlightSection from "@/components/home/SpotlightSection";
import JournalPreview from "@/components/home/JournalPreview";
import SpotifyEmbed from "@/components/home/SpotifyEmbed";
import StudioRedirect from "@/components/home/StudioRedirect";
import { sanityFetch } from "@/sanity/fetch";
import {
  heroSlidesQuery,
  siteSettingsQuery,
  projectCategoriesQuery,
  journalFeedQuery,
  spotlightProjectQuery,
} from "@/sanity/queries";
import {
  fallbackHeroSlides,
  fallbackProjectCategories,
  fallbackJournalEntries,
  fallbackSpotlightProject,
  fallbackSiteSettings,
  type HeroSlide,
  type ProjectCategory,
  type JournalEntry,
  type SpotlightProject,
  type SiteSettings,
} from "@/lib/placeholder-data";

export default async function PaHomePage() {
  const [slides, settings, categories, journal, spotlight] = await Promise.all([
    sanityFetch<HeroSlide[] | null>({ query: heroSlidesQuery }),
    sanityFetch<SiteSettings | null>({ query: siteSettingsQuery }),
    sanityFetch<ProjectCategory[] | null>({ query: projectCategoriesQuery }),
    sanityFetch<JournalEntry[] | null>({ query: journalFeedQuery }),
    sanityFetch<SpotlightProject | null>({ query: spotlightProjectQuery }),
  ]);

  const heroSlides = slides?.length
    ? slides.length >= 3
      ? slides
      : [...slides, ...fallbackHeroSlides.slice(slides.length)]
    : fallbackHeroSlides;
  const projectCategories = categories?.length
    ? categories
    : fallbackProjectCategories;
  const journalEntries = journal?.length ? journal : fallbackJournalEntries;
  const spotlightProject = spotlight ?? fallbackSpotlightProject;
  const spotifyUrl =
    settings?.spotifyPlaylistUrl ?? fallbackSiteSettings.spotifyPlaylistUrl;

  return (
    <>
      <HeroSlider slides={heroSlides} />
      <IntroSection />
      <ProjectsPreview categories={projectCategories} />
      <SpotlightSection project={spotlightProject} />
      <JournalPreview entries={journalEntries} />
      <SpotifyEmbed playlistUrl={spotifyUrl} />
      <StudioRedirect />
    </>
  );
}
