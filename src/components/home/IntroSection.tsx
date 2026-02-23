"use client";

import { useState } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import ScrollReveal from "@/components/ScrollReveal";
import type { HomeAboutData } from "@/lib/placeholder-data";
import { fallbackHomeAbout } from "@/lib/placeholder-data";

type Props = {
  data?: HomeAboutData | null;
};

export default function IntroSection({ data }: Props) {
  const [revealed, setRevealed] = useState(false);

  const image = data?.homeAboutImage ?? fallbackHomeAbout.homeAboutImage;
  const roles = data?.homeAboutRoles?.length
    ? data.homeAboutRoles
    : fallbackHomeAbout.homeAboutRoles!;
  const bio = data?.homeAboutBio ?? fallbackHomeAbout.homeAboutBio!;
  const quote = data?.homeAboutQuote ?? fallbackHomeAbout.homeAboutQuote!;

  const imageAlt =
    (typeof image === "object" && image !== null && "alt" in image
      ? (image as { alt?: string }).alt
      : undefined) ?? "Maninder Singh — Creative Director, Designer & Photographer";

  return (
    <section className="px-6 md:px-16 py-20 md:py-36">
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
        {/* Portrait — left, tall, overlaps into the text zone */}
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
              image={image}
              context="body"
              alt={imageAlt}
              fill
              className={`object-cover object-top transition-all duration-1000 ${
                revealed ? "grayscale-0 scale-100" : "grayscale scale-[1.03]"
              }`}
            />
          </div>
        </ScrollReveal>

        {/* Text content — right, vertically centered against portrait */}
        <div className="md:col-span-5 md:col-start-7 flex flex-col gap-10 md:pt-16 lg:pt-28">
          {/* Roles stacked as a typographic element */}
          <ScrollReveal delay={0.3} offset={16}>
            <div className="space-y-0">
              {roles.map((role, i) => (
                <p
                  key={role}
                  className="font-editorial text-lg md:text-2xl lg:text-[1.75rem] font-light text-foreground leading-[1.5]"
                  style={{ opacity: 1 - i * 0.2 }}
                >
                  {role}
                </p>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4} offset={16}>
            <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.8] max-w-sm">
              {bio}
            </p>
          </ScrollReveal>

          {/* Pull quote */}
          <ScrollReveal delay={0.5} offset={16}>
            <blockquote className="font-editorial text-base md:text-xl font-light leading-[1.5] text-foreground/80 border-l-2 border-foreground/10 pl-4 md:pl-6">
              {quote}
            </blockquote>
          </ScrollReveal>

          <ScrollReveal delay={0.6} offset={12}>
            <Link
              href="/about"
              className="inline-flex items-center gap-3 text-xs tracking-widest uppercase text-foreground group w-fit"
            >
              <span className="border-b border-foreground/30 pb-1 group-hover:border-foreground transition-colors duration-300">
                Discover
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
