import HeroSlider from "@/components/home/HeroSlider";
import IntroSection from "@/components/home/IntroSection";
import ProjectsPreview from "@/components/home/ProjectsPreview";
import SpotifyEmbed from "@/components/home/SpotifyEmbed";
import StudioRedirect from "@/components/home/StudioRedirect";
import { heroSlides, projects } from "@/lib/placeholder-data";

export default function HomePage() {
  return (
    <>
      <HeroSlider slides={heroSlides} />
      <IntroSection />
      <ProjectsPreview projects={projects} />
      <SpotifyEmbed />
      <StudioRedirect />
    </>
  );
}
