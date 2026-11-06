"use client";

import { useRef, useEffect } from "react";
import SanityImage from "@/components/SanityImage";
import ScrollReveal from "@/components/ScrollReveal";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useColourReveal } from "@/hooks/useColourReveal";
import type { SanityImageAsset } from "@/lib/sanityImage";

/**
 * The homepage intro's left column: the founder portrait with its scroll
 * driven colour reveal and the tablet only image collapse, plus the name
 * caption. The only client part of the intro; the roles, bio and link render
 * on the server in IntroSection.
 */
export default function IntroPortrait({
  portrait,
  founderName,
  roles,
}: {
  portrait: SanityImageAsset | string | null;
  founderName: string;
  roles: string[];
}) {
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  const prefersReducedMotion = usePrefersReducedMotion();

  // Portrait colour reveal — scroll-driven on every device (no hover path:
  // an iPad in landscape is 1024px+ yet has no hover). Shared with the About
  // page portrait so the two cannot drift.
  const imageRef = useRef<HTMLDivElement>(null);
  const { revealed: saturated } = useColourReveal(imageRef);

  // Tablet-only scroll-driven image collapse (768–1023px).
  // rAF-throttled: one rect read + one CSS-var write per frame, passive
  // listener. Height is a layout property, so CSS scroll-driven animations
  // would offer no compositor benefit and have patchy Safari/Firefox
  // support on tablets — a rAF handler is equally smooth and universal.
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTablet || prefersReducedMotion) return;
    const track = trackRef.current;
    if (!track) return;

    // Must match the CSS vars in globals.css (.intro-collapse-track)
    const FULL_VH = 72;
    const COMPACT_VH = 38;
    const STICKY_TOP = 80; // px — clears the fixed 68px header

    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const dist = window.innerHeight * ((FULL_VH - COMPACT_VH) / 100);
      const progress = Math.min(
        1,
        Math.max(0, (STICKY_TOP - rect.top) / dist),
      );
      const h = FULL_VH - (FULL_VH - COMPACT_VH) * progress;
      track.style.setProperty("--intro-img-h", `${h}vh`);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      track.style.removeProperty("--intro-img-h");
    };
  }, [isTablet, prefersReducedMotion]);


  const imageFilter = saturated
    ? "saturate(1) brightness(1)"
    : "saturate(0.15) brightness(1.05)";

  const imageTransition = prefersReducedMotion
    ? "none"
    : "filter var(--dur-image) var(--ease-slow)";

  return (
    <>
      {/* Portrait + caption — left */}
    <div
      ref={trackRef}
      className="intro-collapse-track lg:col-span-5 lg:col-start-1 relative lg:self-stretch"
    >
      {/* Sticky wrapper. Desktop: pins the portrait while the taller text
          column scrolls; releases when the column bottom arrives. Tablet:
          pins at the top of the collapse track while the frame shrinks.
          Offset clears the fixed 68px scrolled header. Mobile: not sticky. */}
      <div className="intro-collapse-sticky lg:sticky lg:top-24">
        <ScrollReveal delay={0.15}>
        <div
          ref={imageRef}
          className="intro-collapse-frame relative w-full aspect-square lg:aspect-[4/5] max-h-[65vh] md:max-lg:max-h-none md:max-lg:aspect-auto overflow-hidden bg-background"
        >
          <div
            className="absolute inset-0"
            style={{
              filter: imageFilter,
              transition: imageTransition,
            }}
          >
            <SanityImage
              image={portrait}
              context="body"
              alt={`${founderName} — ${roles.join(", ")}`}
              fill
              className="object-cover [object-position:35%_20%]"
            />
          </div>
          <div
            className="archive-grain absolute inset-0 z-10 pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {/* Name caption below image */}
        <p
          className="mt-[14px] uppercase text-muted-foreground"
          style={{
            fontSize: "10px",
            letterSpacing: "0.2em",
          }}
        >
          {founderName}
        </p>
        </ScrollReveal>
      </div>
    </div>
    </>
  );
}
