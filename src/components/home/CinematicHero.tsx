"use client";

import type { CSSProperties } from "react";
import SanityImage from "@/components/SanityImage";
import { useIntro } from "@/components/IntroContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import type { HeroSlide } from "@/lib/types";
import HeroStill from "./HeroStill";
import { SLIDE_DURATION, SLIDE_SHOWN_MS, useSlideshow } from "./useSlideshow";

/*
 * Home hero slideshow, in CSS (no animation library). See "Hero slideshow" in
 * styles/home.css: each slide crossfades in over --hero-fade (about 2s) on
 * --ease-slow, on top of the previous slide, and drifts with a slow, gentle
 * Ken Burns zoom. Reduced motion: the first slide, still, with no zoom.
 */

// ——— Ken Burns presets: gentle (about 40% smaller moves than before) ———

type KenBurnsPreset = {
  from: { scale: number; x: string; y: string };
  to: { scale: number; x: string; y: string };
};

const KEN_BURNS_PRESETS: KenBurnsPreset[] = [
  { from: { scale: 1.0, x: "0%", y: "0%" }, to: { scale: 1.035, x: "-0.9%", y: "-0.6%" } },
  { from: { scale: 1.0, x: "0%", y: "0%" }, to: { scale: 1.03, x: "0.9%", y: "0%" } },
  { from: { scale: 1.035, x: "0%", y: "-0.3%" }, to: { scale: 1.0, x: "0%", y: "0.3%" } },
  { from: { scale: 1.0, x: "0%", y: "0%" }, to: { scale: 1.025, x: "0.6%", y: "0.6%" } },
  { from: { scale: 1.0, x: "0%", y: "0%" }, to: { scale: 1.03, x: "0.7%", y: "-0.5%" } },
  { from: { scale: 1.0, x: "0.3%", y: "0%" }, to: { scale: 1.04, x: "-0.6%", y: "0.2%" } },
  { from: { scale: 1.045, x: "0%", y: "0.3%" }, to: { scale: 1.01, x: "0%", y: "-0.2%" } },
];


type Props = {
  slides: HeroSlide[];
  /** The slide buttons' labels (Site Settings, Chapter I). */
  labels: { previous: string; next: string };
};

/** CSS variables for a slide's Ken Burns start and end. */
function kenBurnsVars(preset: KenBurnsPreset): CSSProperties {
  return {
    "--kb-from": `translate(${preset.from.x}, ${preset.from.y}) scale(${preset.from.scale})`,
    "--kb-to": `translate(${preset.to.x}, ${preset.to.y}) scale(${preset.to.scale})`,
  } as CSSProperties;
}

export default function CinematicHero({ slides, labels }: Props) {
  const prefersReduced = usePrefersReducedMotion();
  // Shared signal from the Header intro overlay — no polling.
  const { introComplete } = useIntro();
  const { current, previous, showCaption, isFirstSlide, loaded, goToSlide, cycle } =
    useSlideshow(slides.length, introComplete, prefersReduced);

  if (slides.length === 0) return null;

  const slide = slides[current];

  // ——— Reduced motion: static first slide, no animation ———
  if (prefersReduced) return <HeroStill slide={slides[0]} />;

  return (
    <div className="relative w-full h-[100svh] bg-secondary overflow-hidden">
      {/* ——— Image layers: crossfade + Ken Burns, in CSS ——— */}
      {slides.map((s, i) => {
        if (!loaded.has(i)) return null;
        const state =
          i === current ? "active" : i === previous ? "leaving" : "idle";
        return (
          <div
            key={s._id + "-" + i}
            className="hero-slide"
            data-state={state}
            // The first slide is shown at once, with no fade in.
            data-first={isFirstSlide && i === current ? "" : undefined}
            aria-hidden={state !== "active"}
          >
            <div
              className="hero-kb"
              style={kenBurnsVars(KEN_BURNS_PRESETS[i % KEN_BURNS_PRESETS.length])}
              // The zoom runs once the intro is done, restarting each time
              // the slide becomes active, and keeps running while it is
              // covered by the next slide.
              data-run={introComplete && state !== "idle" ? "" : undefined}
            >
              <SanityImage
                image={s.image}
                context="hero"
                alt={s.imageAlt || s.caption || "Hero"}
                priority={i === 0}
                fill
                className="object-cover"
              />
            </div>
          </div>
        );
      })}

      {/* ——— Vignette overlay — film still feel ——— */}
      <div className="absolute inset-0 pointer-events-none hero-vignette" />

      {/* ——— Bottom left: the place name, and a hairline that fills while
          the slide plays (it restarts with each slide). Previous and next
          are labelled buttons for keyboard and screen reader users; they
          stay out of sight until focused, so the photograph stays clear. */}
      <div className="absolute bottom-6 left-5 md:bottom-8 md:left-8 z-10 flex flex-col gap-2.5">
        {slide.caption && (
          <p
            className="hero-caption text-[12px] md:text-[13px] tracking-[0.14em] uppercase text-white"
            data-visible={showCaption ? "" : undefined}
            data-first={isFirstSlide ? "" : undefined}
          >
            {slide.caption}
          </p>
        )}
        {slides.length > 1 && (
          <span aria-hidden="true" className="hero-progress">
            <span
              key={`${current}-${cycle}`}
              className="hero-progress-fill"
              data-run={introComplete ? "" : undefined}
              style={{ animationDuration: `${isFirstSlide ? SLIDE_DURATION : SLIDE_SHOWN_MS}ms` }}
            />
          </span>
        )}
        {slides.length > 1 && (
          <div className="hero-nav flex gap-3">
            <button
              type="button"
              onClick={() => goToSlide((current - 1 + slides.length) % slides.length)}
              className="sr-only focus-visible:not-sr-only focus-visible:px-2 focus-visible:py-1 focus-visible:text-[12px] focus-visible:tracking-[0.14em] focus-visible:uppercase focus-visible:text-white"
            >
              {labels.previous}
            </button>
            <button
              type="button"
              onClick={() => goToSlide((current + 1) % slides.length)}
              className="sr-only focus-visible:not-sr-only focus-visible:px-2 focus-visible:py-1 focus-visible:text-[12px] focus-visible:tracking-[0.14em] focus-visible:uppercase focus-visible:text-white"
            >
              {labels.next}
            </button>
          </div>
        )}
      </div>

      {/* ——— Scroll indicator — right side ——— */}
      {introComplete && (
        <div className="absolute bottom-6 right-5 md:bottom-8 md:right-8 z-10 hidden md:flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-widest uppercase text-white/40">
            Scroll
          </span>
          <div className="w-px h-8 bg-white/20 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full h-3 bg-white/50"
              style={{ animation: "scrollPulse 2s ease-in-out infinite" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
