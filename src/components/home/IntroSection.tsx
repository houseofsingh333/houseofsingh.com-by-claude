"use client";

import { useRef, useState, useCallback, useEffect } from "react";
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
  "Blending design and photography to craft stories that feel both visually refined and emotionally resonant.";

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

  // Desktop spotlight state
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !isDesktop) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
      e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
      e.currentTarget.setAttribute("data-hovering", "true");
    },
    [prefersReducedMotion, isDesktop],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.removeAttribute("data-hovering");
    },
    [],
  );

  // Mobile touch reveal state
  const [isTouching, setIsTouching] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = useCallback(() => {
    if (prefersReducedMotion) return;
    setIsTouching(true);
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  }, [prefersReducedMotion, hasInteracted]);

  const handleTouchEnd = useCallback(() => {
    if (prefersReducedMotion) return;
    setIsTouching(false);
  }, [prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, []);

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
        <div className="md:col-span-5 md:col-start-1 relative">
          <ScrollReveal delay={0.15} offset={6} duration={0.6}>
            <div
              ref={containerRef}
              className="intro-portrait-container relative w-full aspect-square md:aspect-[4/5] max-h-[65vh] overflow-hidden bg-background"
              onMouseMove={!prefersReducedMotion && isDesktop ? handleMouseMove : undefined}
              onMouseLeave={!prefersReducedMotion && isDesktop ? handleMouseLeave : undefined}
              onTouchStart={!prefersReducedMotion && !isDesktop ? handleTouchStart : undefined}
              onTouchEnd={!prefersReducedMotion && !isDesktop ? handleTouchEnd : undefined}
              onTouchCancel={!prefersReducedMotion && !isDesktop ? handleTouchEnd : undefined}
              style={
                !prefersReducedMotion && isDesktop
                  ? { cursor: "crosshair" }
                  : undefined
              }
            >
              {/* Clear image layer (bottom) */}
              <SanityImage
                image={portrait}
                context="body"
                alt={`${founderName} — ${roles.join(", ")}`}
                fill
                className="object-cover [object-position:35%_20%] grayscale"
              />
              {/* Blurred image layer (top) */}
              <div
                className={`absolute inset-0 intro-blur-layer ${
                  !isDesktop && isTouching ? "intro-blur-layer--revealed" : ""
                }`}
              >
                <SanityImage
                  image={portrait}
                  context="body"
                  alt=""
                  fill
                  className="object-cover [object-position:35%_20%] grayscale blur-[8px]"
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

            {/* Mobile hint text */}
            {!isDesktop && !prefersReducedMotion && (
              <p
                className={`mt-2 uppercase text-muted-foreground transition-opacity duration-500 ${
                  hasInteracted ? "opacity-0" : "opacity-100"
                }`}
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.15em",
                }}
              >
                Hold to reveal
              </p>
            )}
          </ScrollReveal>
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

          {/* Bio — pull-quote style */}
          <ScrollReveal delay={0.6} offset={10}>
            {data.founderBio ? (
              <div
                className="font-editorial italic text-muted-foreground max-w-[420px] leading-[1.5] [&>p]:mb-4 [&>p:last-child]:mb-0"
                style={{
                  fontSize: "clamp(20px, 2.2vw, 28px)",
                }}
              >
                <PortableText value={data.founderBio} />
              </div>
            ) : (
              <p
                className="font-editorial italic text-muted-foreground max-w-[420px] leading-[1.5]"
                style={{
                  fontSize: "clamp(20px, 2.2vw, 28px)",
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
