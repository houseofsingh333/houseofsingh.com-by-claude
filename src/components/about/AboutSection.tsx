"use client";

import { useRef, useState, useEffect } from "react";
import { PortableText } from "@portabletext/react";
import SanityImage from "@/components/SanityImage";
import type { AboutPageData } from "@/lib/types";
import {
  FALLBACK_BIO_PARAGRAPHS,
  FALLBACK_MONIKER_PARAGRAPHS,
} from "./about-constants";
import FeaturedOn from "./FeaturedOn";
import RapidFire from "./RapidFire";
import Timeline from "./Timeline";

function SectionDivider({ label, gap = "mb-16" }: { label: string; gap?: string }) {
  return (
    <div className={gap}>
      <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
        {label}
      </p>
      <div className="w-full h-px bg-border" />
    </div>
  );
}

export default function AboutSection({ data }: { data: AboutPageData }) {
  const {
    introQuote,
    founderName,
    founderRoles,
    founderBio,
    portrait,
    monikerText,
    featuredOn,
    milestones,
    rapidFire,
  } = data;

  const logoRef = useRef<HTMLDivElement>(null);
  const [logoRevealed, setLogoRevealed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const el = logoRef.current;
    if (!el) return;

    // Skip animation for users who prefer reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setReducedMotion(true);
      setLogoRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLogoRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const roles = founderRoles ?? [
    "Creative Director",
    "Multidisciplinary Designer",
    "Photographer",
  ];

  return (
    <div className="overflow-hidden">
      {/* ——— 1 · Intro Quote ——— */}
      <section className="px-6 md:px-16 page-top-offset section-pb flex items-center justify-center">
        <p className="font-editorial text-xl md:text-3xl lg:text-[2.5rem] font-light leading-[1.4] text-center max-w-3xl animate-editorial-fade-in">
          &ldquo;
          {introQuote ??
            "The world is filled with beauty, waiting to be seen, felt, and celebrated."}
          &rdquo;
        </p>
      </section>

      {/* ——— 2 · Founder Section ——— */}
      <section className="px-6 md:px-16 section-pb-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
          {/* Text — left */}
          <div className="md:col-span-6 flex flex-col gap-10 order-2 md:order-1">
            <div>
              <h2 className="text-xs tracking-[0.25em] uppercase text-foreground mb-4">
                {founderName}
              </h2>
              <div className="space-y-1 mb-8">
                {roles.map((role) => (
                  <p
                    key={role}
                    className="font-editorial text-lg md:text-xl font-light text-muted-foreground leading-[1.5]"
                  >
                    {role}
                  </p>
                ))}
              </div>
              <div className="space-y-6 max-w-md">
                {founderBio ? (
                  <div className="text-sm md:text-[15px] text-muted-foreground leading-[1.8] [&>p]:mb-6 last:[&>p]:mb-0">
                    <PortableText value={founderBio} />
                  </div>
                ) : (
                  FALLBACK_BIO_PARAGRAPHS.map((p, i) => (
                    <p
                      key={i}
                      className="text-sm md:text-[15px] text-muted-foreground leading-[1.8]"
                    >
                      {p}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Portrait — right */}
          <div className="md:col-span-5 md:col-start-8 order-1 md:order-2 group">
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-secondary">
              <SanityImage
                image={portrait}
                context="body"
                alt={`${founderName} — ${roles[0]}`}
                fill
                className="object-cover object-top grayscale scale-[1.03] group-hover:grayscale-0 group-hover:scale-100 transition-all duration-1000 ease-out"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ——— 3 · House of Singh ——— */}
      <section className="px-6 md:px-16 section-py-lg">
        <SectionDivider label="The Practice — House of Singh" />

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
            {/* Logo — left */}
            <div
              ref={logoRef}
              className="md:col-span-5 flex justify-center"
              style={{
                clipPath: logoRevealed
                  ? "circle(75% at 50% 50%)"
                  : "circle(0% at 50% 50%)",
                opacity: logoRevealed ? 0.6 : 0,
                transition:
                  "clip-path 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.8s ease",
              }}
            >
              <img
                src="/images/hos-logo.svg"
                alt="House of Singh"
                className="w-48 md:w-64"
              />
            </div>

            {/* Text — right */}
            <div
              className="md:col-span-7 space-y-6"
              style={
                reducedMotion
                  ? {}
                  : {
                      opacity: logoRevealed ? 1 : 0,
                      transform: logoRevealed
                        ? "translateY(0)"
                        : "translateY(16px)",
                      transition:
                        "opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s",
                    }
              }
            >
              {monikerText ? (
                <div className="text-sm md:text-[15px] text-muted-foreground leading-[1.8] [&>p]:mb-6 last:[&>p]:mb-0">
                  <PortableText value={monikerText} />
                </div>
              ) : (
                FALLBACK_MONIKER_PARAGRAPHS.map((p, i) => (
                  <p
                    key={i}
                    className="text-sm md:text-[15px] text-muted-foreground leading-[1.8]"
                  >
                    {p}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ——— 4 · Featured On ——— */}
      {featuredOn && featuredOn.length > 0 && (
        <section
          className="px-6 md:px-16 section-py-lg"
          style={{
            backgroundColor: "#ede9e4",
            paddingTop: "70px",
            paddingBottom: "70px",
          }}
        >
          <SectionDivider label="Featured On" />
          <FeaturedOn outlets={featuredOn} />
        </section>
      )}

      {/* ——— 5 · Journey Timeline ——— */}
      {milestones && milestones.length > 0 && (
        <section className="section-py-lg">
          <div className="px-6 md:px-16">
            <div className="mb-16">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
                  Journey
                </p>
                <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground flex items-center gap-1.5">
                  Scroll
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M5.5 5.5L3 8l2.5 2.5M10.5 5.5L13 8l-2.5 2.5"/></svg>
                </p>
              </div>
              <div className="w-full h-px bg-border" />
            </div>
          </div>
          <Timeline milestones={milestones} />
        </section>
      )}

      {/* ——— 6 · Rapid Fire — bottom of page, above footer ——— */}
      {rapidFire && rapidFire.length > 0 && (
        <section className="px-6 md:px-16 section-py-lg">
          <SectionDivider label="Rapidfire" gap="mb-8" />
          <RapidFire items={rapidFire} />
        </section>
      )}

    </div>
  );
}
