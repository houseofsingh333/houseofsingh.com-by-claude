import HeroSlider from "@/components/home/HeroSlider";
import IntroSection from "@/components/home/IntroSection";
import ProjectsPreview from "@/components/home/ProjectsPreview";
import SpotifyEmbed from "@/components/home/SpotifyEmbed";
import StudioRedirect from "@/components/home/StudioRedirect";
import { sanityFetch } from "@/sanity/fetch";
import { heroSlidesQuery, siteSettingsQuery } from "@/sanity/queries";
import {
  fallbackHeroSlides,
  fallbackProjects,
  type HeroSlide,
  type SiteSettings,
} from "@/lib/placeholder-data";

export default async function HomePage() {
  const [slides, settings] = await Promise.all([
    sanityFetch<HeroSlide[] | null>({ query: heroSlidesQuery }),
    sanityFetch<SiteSettings | null>({ query: siteSettingsQuery }),
  ]);

  const heroSlides = slides?.length ? slides : fallbackHeroSlides;
  const spotifyUrl = settings?.spotifyPlaylistUrl;

  return (
    <>
      <HeroSlider slides={heroSlides} />
      <IntroSection />
      <ProjectsPreview projects={fallbackProjects} />
      <SpotifyEmbed playlistUrl={spotifyUrl} />
      <StudioRedirect />
    </>
  );
}
