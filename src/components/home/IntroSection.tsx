"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { proseComponents } from "@/components/proseComponents";
import SanityImage from "@/components/SanityImage";
import ScrollReveal from "@/components/ScrollReveal";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useColourReveal } from "@/hooks/useColourReveal";
import type { HomeIntroData } from "@/lib/placeholder-data";

const FALLBACK_ROLES = [
  "Creative Director",
  "Multidisciplinary Designer",
  "Photographer",
];

const FALLBACK_BIO =
  "Depth over noise. Craft over trend. Always evolving, never in a rush. A creative practice rooted in Toronto, built on intention and quiet consistency.";

const FALLBACK_PORTRAIT = "/images/hero-placeholder-1.svg";

export default function IntroSection({ data }: { data: HomeIntroData }) {
  const roles =
    data.founderRoles && data.founderRoles.length > 0
      ? data.founderRoles
      : FALLBACK_ROLES;
  const portrait = data.portrait ?? FALLBACK_PORTRAIT;
  const founderName = data.founderName ?? "Maninder Singh";

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

  const imageTransition = prefersReducedMotion ? "none" : "filter 1s ease";

  return (
    <section className="px-6 md:px-16 section-py">
      {/* Section label */}
      <ScrollReveal>
        <div className="mb-16">
          <p className="text-xs tracking-widest uppercase text-muted-foreground">
            The Creative
          </p>
          <div className="w-full h-px bg-border mt-4" />
        </div>
      </ScrollReveal>

      {/* Two-column layout on desktop (1024px+); stacked on tablet/mobile.
          Tablet (768–1023px) adds a scroll-driven image collapse via the
          .intro-collapse-* classes in globals.css. */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-8 lg:gap-y-0 items-start">
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
            <ScrollReveal delay={0.15} offset={6} duration={0.6}>
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

        {/* Text content — right on desktop, below the image on tablet/mobile */}
        <div className="lg:col-span-5 lg:col-start-7 flex flex-col gap-8 lg:gap-10 lg:pt-14">
          {/* Roles — calm, restrained */}
          <ScrollReveal delay={0.5} offset={10}>
            <div className="space-y-1">
              {roles.map((role) => (
                <p
                  key={role}
                  className="text-[13px] tracking-[0.18em] uppercase text-muted-foreground"
                >
                  {role}
                </p>
              ))}
            </div>
          </ScrollReveal>

          {/* Bio — sans-serif body style */}
          <ScrollReveal delay={0.6} offset={10}>
            {data.founderBio ? (
              <div
                className="text-muted-foreground max-w-[440px] md:max-lg:max-w-[560px] leading-[1.75]"
                style={{
                  fontSize: "clamp(15px, 1.5vw, 17px)",
                }}
              >
                <PortableText
                  value={data.founderBio}
                  components={proseComponents}
                />
              </div>
            ) : (
              <p
                className="text-muted-foreground max-w-[440px] md:max-lg:max-w-[560px] leading-[1.75]"
                style={{
                  fontSize: "clamp(15px, 1.5vw, 17px)",
                }}
              >
                {FALLBACK_BIO}
              </p>
            )}
          </ScrollReveal>

          {/* About link */}
          <ScrollReveal delay={0.7} offset={10}>
            <Link
              href="/about"
              className="inline-flex items-center gap-3 uppercase text-foreground group w-fit"
              style={{
                fontSize: "11px",
                letterSpacing: "0.18em",
              }}
            >
              <span
                className="group-hover:border-foreground/40 transition-colors duration-300"
                style={{
                  borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
                  paddingBottom: "4px",
                }}
              >
                More about him
              </span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
