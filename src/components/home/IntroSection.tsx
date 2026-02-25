"use client";

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
  const roles =
    data.founderRoles && data.founderRoles.length > 0
      ? data.founderRoles
      : FALLBACK_ROLES;
  const portrait = data.portrait ?? FALLBACK_PORTRAIT;
  const founderName = data.founderName ?? "Maninder Singh";
  const nameParts = founderName.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

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

      {/* Two-column layout */}
      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-y-8 md:gap-x-8 md:gap-y-0 items-start">
        {/* Portrait + name overlap — left */}
        <div className="md:col-span-5 md:col-start-1 relative">
          <ScrollReveal delay={0.15} offset={8} duration={0.6}>
            <div className="relative w-full aspect-square md:aspect-[4/5] max-h-[65vh] overflow-hidden bg-background">
              <SanityImage
                image={portrait}
                context="body"
                alt={`${founderName} — ${roles.join(", ")}`}
                fill
                className="object-cover object-top grayscale blur-[1px]"
              />
              <div
                className="archive-grain absolute inset-0 z-10 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </ScrollReveal>

          {/* Name — overlaps right edge on desktop, stacks below on mobile */}
          <div className="mt-6 md:mt-0 md:absolute md:-right-8 lg:-right-12 md:bottom-8 md:z-20">
            <ScrollReveal delay={0.3} offset={8} duration={0.6}>
              <p className="text-3xl md:text-4xl lg:text-5xl font-light uppercase tracking-wide text-foreground leading-none">
                {firstName}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.4} offset={8} duration={0.6}>
              <p className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wide text-foreground leading-none mt-1">
                {lastName}
              </p>
            </ScrollReveal>
          </div>
        </div>

        {/* Text content — right */}
        <div className="md:col-span-5 md:col-start-7 flex flex-col gap-6 md:gap-8 md:pt-16 lg:pt-28">
          {/* Roles — calmer, smaller */}
          <ScrollReveal delay={0.35} offset={12}>
            <div className="space-y-1">
              {roles.map((role) => (
                <p
                  key={role}
                  className="text-sm tracking-widest uppercase text-muted-foreground"
                >
                  {role}
                </p>
              ))}
            </div>
          </ScrollReveal>

          {/* Bio */}
          <ScrollReveal delay={0.45} offset={12}>
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
