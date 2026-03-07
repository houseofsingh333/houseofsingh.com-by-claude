"use client";

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
        <SectionDivider label="The Moniker" />

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
            {/* Logo — left */}
            <div className="md:col-span-4 flex justify-center">
              <img
                src="/images/hos-logo.svg"
                alt="House of Singh"
                className="w-36 md:w-44 opacity-40"
              />
            </div>

            {/* Text — right */}
            <div className="md:col-span-8 space-y-6">
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
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
