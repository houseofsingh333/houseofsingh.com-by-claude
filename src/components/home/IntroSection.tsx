"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import SanityImage from "@/components/SanityImage";
import ScrollReveal from "@/components/ScrollReveal";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
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

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const prefersReducedMotion = usePrefersReducedMotion();

  // Desktop hover state for desaturation
  const [isHovered, setIsHovered] = useState(false);

  // Mobile IntersectionObserver: one-shot color reveal
  const imageRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (isDesktop || prefersReducedMotion) return;
    const el = imageRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isDesktop, prefersReducedMotion]);

  // Determine filter based on state
  const getSaturated = () => {
    if (prefersReducedMotion) return false; // stay desaturated
    if (isDesktop) return isHovered;
    return inView;
  };

  const saturated = getSaturated();

  const imageFilter = saturated
    ? "saturate(1) brightness(1)"
    : "saturate(0.15) brightness(1.05)";

  const imageTransition = prefersReducedMotion
    ? "none"
    : isDesktop
      ? "filter 0.8s ease"
      : "filter 1s ease";

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

      {/* Two-column layout */}
      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-y-8 md:gap-x-8 md:gap-y-0 items-start">
        {/* Portrait + caption — left */}
        <div className="md:col-span-5 md:col-start-1 relative md:self-stretch">
          {/* Sticky wrapper: pins the portrait while the taller text column
              scrolls; releases automatically when the column bottom arrives.
              Offset clears the fixed 68px scrolled header. Mobile: not sticky. */}
          <div className="md:sticky md:top-24">
            <ScrollReveal delay={0.15} offset={6} duration={0.6}>
            <div
              ref={imageRef}
              className="relative w-full aspect-square md:aspect-[4/5] max-h-[65vh] overflow-hidden bg-background"
              onMouseEnter={isDesktop && !prefersReducedMotion ? () => setIsHovered(true) : undefined}
              onMouseLeave={isDesktop && !prefersReducedMotion ? () => setIsHovered(false) : undefined}
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

        {/* Text content — right */}
        <div className="md:col-span-5 md:col-start-7 flex flex-col gap-8 md:gap-10 md:pt-8 lg:pt-14">
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
                className="text-muted-foreground max-w-[440px] leading-[1.75] [&>p]:mb-4 [&>p:last-child]:mb-0"
                style={{
                  fontSize: "clamp(15px, 1.5vw, 17px)",
                }}
              >
                <PortableText value={data.founderBio} />
              </div>
            ) : (
              <p
                className="text-muted-foreground max-w-[440px] leading-[1.75]"
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
