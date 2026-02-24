"use client";

import { useState } from "react";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import SanityImage from "@/components/SanityImage";
import ScrollReveal from "@/components/ScrollReveal";
import type { HomeIntroData } from "@/lib/placeholder-data";

const FALLBACK_ROLES = [
  "Creative Director",
  "Multidisciplinary Designer",
  "Photographer",
];

const FALLBACK_BIO =
  "Based in Toronto, Maninder Singh blends design and photography to craft stories that feel both visually refined and emotionally resonant. His practice spans brand identities, editorial work, and fine art — always grounded in intention and detail.";

const FALLBACK_PORTRAIT = "/images/hero-placeholder-1.svg";

export default function IntroSection({ data }: { data: HomeIntroData }) {
  const [revealed, setRevealed] = useState(false);

  const roles =
    data.founderRoles && data.founderRoles.length > 0
      ? data.founderRoles
      : FALLBACK_ROLES;
  const portrait = data.portrait ?? FALLBACK_PORTRAIT;
  const founderName = data.founderName ?? "Maninder Singh";

  return (
    <section className="px-6 md:px-16 section-py">
      {/* Section label */}
      <ScrollReveal>
        <div className="mb-16">
          <p className="text-xs tracking-widest uppercase text-muted-foreground">
            About
          </p>
          <div className="w-full h-px bg-border mt-4" />
        </div>
      </ScrollReveal>

      {/* Asymmetric overlap layout */}
      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Portrait — left */}
        <ScrollReveal
          delay={0.15}
          offset={30}
          duration={0.9}
          className="md:col-span-5 md:col-start-1 relative z-10"
        >
          <div
            className="relative w-full aspect-square md:aspect-[3/4] overflow-hidden bg-secondary"
            onMouseEnter={() => setRevealed(true)}
          >
            <SanityImage
              image={portrait}
              context="body"
              alt={`${founderName} — ${roles.join(", ")}`}
              fill
              className={`object-cover object-top transition-all duration-1000 ${
                revealed ? "grayscale-0 scale-100" : "grayscale scale-[1.03]"
              }`}
            />
          </div>
        </ScrollReveal>

        {/* Text content — right */}
        <div className="md:col-span-5 md:col-start-7 flex flex-col gap-8 md:gap-10 md:pt-16 lg:pt-28">
          {/* Founder name label */}
          <ScrollReveal delay={0.25} offset={16}>
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
              {founderName}
            </p>
          </ScrollReveal>

          {/* Roles stacked */}
          <ScrollReveal delay={0.35} offset={16}>
            <div className="space-y-0">
              {roles.map((role) => (
                <p
                  key={role}
                  className="font-editorial text-2xl md:text-[2rem] lg:text-[2.5rem] font-light text-foreground leading-[1.3]"
                >
                  {role}
                </p>
              ))}
            </div>
          </ScrollReveal>

          {/* Bio */}
          <ScrollReveal delay={0.45} offset={16}>
            {data.founderBio ? (
              <div className="text-[15px] md:text-base text-muted-foreground leading-[1.8] max-w-lg [&>p]:mb-4 [&>p:last-child]:mb-0">
                <PortableText value={data.founderBio} />
              </div>
            ) : (
              <p className="text-[15px] md:text-base text-muted-foreground leading-[1.8] max-w-lg">
                {FALLBACK_BIO}
              </p>
            )}
          </ScrollReveal>

          {/* About link */}
          <ScrollReveal delay={0.55} offset={12}>
            <Link
              href="/about"
              className="inline-flex items-center gap-3 text-xs tracking-widest uppercase text-foreground group w-fit"
            >
              <span className="border-b border-foreground/30 pb-1 group-hover:border-foreground transition-colors duration-300">
                About
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
