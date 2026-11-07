import SanityImage from "@/components/SanityImage";
import type { HeroSlide } from "@/lib/types";

/** The hero with reduced motion: the first slide, still, with no zoom. */
export default function HeroStill({ slide }: { slide: HeroSlide }) {
  return (
    <div className="relative w-full h-[100svh] bg-secondary overflow-hidden">
      <SanityImage
        image={slide.image}
        context="hero"
        alt={slide.imageAlt || slide.caption || "Hero"}
        priority
        fill
        className="object-cover"
      />
      <div className="hero-vignette absolute inset-0 pointer-events-none" />
      {slide.caption && (
        <div className="absolute bottom-8 left-5 md:bottom-10 md:left-8 z-10">
          <p className="text-xs tracking-[0.15em] uppercase text-white/70">
            {slide.caption}
          </p>
        </div>
      )}
    </div>
  );
}
