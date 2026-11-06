import { PortableText } from "@portabletext/react";
import { proseComponents } from "@/components/proseComponents";
import type { AboutPageData } from "@/lib/types";
import {
  FALLBACK_BIO_PARAGRAPHS,
  FALLBACK_MONIKER_PARAGRAPHS,
} from "./about-constants";
import AboutPortrait from "./AboutPortrait";
import FeaturedOn from "./FeaturedOn";
import PracticeReveal from "./PracticeReveal";
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
        {/* Layout mirrors the homepage IntroSection: 5/5 columns starting at
            col-1 and col-7, gap-x-8, items-start, 440px text measure. */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8 md:gap-x-8 md:gap-y-0 items-start">
          {/* Portrait — left. Same sticky technique as the homepage
              IntroSection: self-stretch gives the column full row height so
              the sticky child has travel room, and the wrapper pins at
              top-24 (clears the 68px fixed header). Desktop only; below
              1024px the section simply stacks. If the text column is shorter
              than the image the track never exceeds the sticky element, so
              sticky never engages — no jumping, no gaps. */}
          <div className="md:col-span-5 md:col-start-1 relative lg:self-stretch">
            <div className="about-portrait-sticky lg:sticky lg:top-24">
              <AboutPortrait image={portrait} alt={`${founderName} — ${roles[0]}`} />
            </div>
          </div>

          {/* Text — right, left-aligned at the same column start as homepage intro */}
          <div className="md:col-span-5 md:col-start-7 md:pt-8 lg:pt-14">
            <div className="max-w-[440px]">
              <h2 className="text-xs tracking-[0.25em] uppercase text-foreground mb-4">
                {founderName}
              </h2>
              <div className="space-y-1 mb-10">
                {roles.map((role) => (
                  <p
                    key={role}
                    className="font-editorial text-lg md:text-xl font-light text-muted-foreground leading-[1.5]"
                  >
                    {role}
                  </p>
                ))}
              </div>
              <div className="text-sm md:text-[15px] text-muted-foreground leading-[1.9]">
                {founderBio ? (
                  <PortableText value={founderBio} components={proseComponents} />
                ) : (
                  FALLBACK_BIO_PARAGRAPHS.map((p, i) => (
                    <p key={i} className="mb-6 last:mb-0">
                      {p}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— 3 · House of Singh ——— */}
      <section className="px-6 md:px-16 section-py-lg">
        <SectionDivider label="The Practice — House of Singh" />

        {/* The logo and text reveal is the only client part; the text itself
            is rendered here, on the server. */}
        <PracticeReveal>
          {monikerText ? (
            <PortableText value={monikerText} components={proseComponents} />
          ) : (
            FALLBACK_MONIKER_PARAGRAPHS.map((p, i) => (
              <p key={i} className="mb-6 last:mb-0">
                {p}
              </p>
            ))
          )}
        </PracticeReveal>
      </section>

      {/* ——— 4 · Featured On ——— */}
      {featuredOn && featuredOn.length > 0 && (
        <section
          className="featured-panel px-6 md:px-16 section-py-lg"
          style={{
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
