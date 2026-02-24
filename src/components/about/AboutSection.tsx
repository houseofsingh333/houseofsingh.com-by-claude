"use client";

import { PortableText } from "@portabletext/react";
import SanityImage from "@/components/SanityImage";
import type { AboutPageData } from "@/lib/types";
import {
  FALLBACK_BIO_PARAGRAPHS,
  FALLBACK_MONIKER_PARAGRAPHS,
} from "./about-constants";
import TestimonialCarousel from "./TestimonialCarousel";
import Timeline from "./Timeline";

export default function AboutSection({ data }: { data: AboutPageData }) {
  const {
    introQuote,
    founderName,
    founderRoles,
    founderBio,
    portrait,
    monikerText,
    milestones,
    testimonials,
  } = data;

  const roles = founderRoles ?? [
    "Creative Director",
    "Multidisciplinary Designer",
    "Photographer",
  ];

  return (
    <div className="overflow-hidden">
      {/* ——— 1 · Intro Quote ——— */}
      <section className="px-6 md:px-16 page-top-offset pb-20 md:pb-36 flex items-center justify-center">
        <p className="font-editorial text-xl md:text-3xl lg:text-[2.5rem] font-light leading-[1.4] text-center max-w-3xl animate-editorial-fade-in">
          &ldquo;
          {introQuote ??
            "The world is filled with beauty, waiting to be seen, felt, and celebrated."}
          &rdquo;
        </p>
      </section>

      {/* ——— 2 · Founder Section ——— */}
      <section className="px-6 md:px-16 pb-24 md:pb-36">
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
      <section className="px-6 md:px-16 py-24 md:py-36">
        <div className="mb-16">
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
            The Moniker
          </p>
          <div className="w-full h-px bg-border" />
        </div>

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

      {/* ——— 4 · Timeline ——— */}
      {milestones && milestones.length > 0 && (
        <section className="px-6 md:px-16 py-24 md:py-36">
          <div className="mb-16">
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
              Ten Years On
            </p>
            <div className="w-full h-px bg-border" />
          </div>
          <Timeline milestones={milestones} />
        </section>
      )}

      {/* ——— 5 · Words Shared ——— */}
      {testimonials && testimonials.length > 0 && (
        <section className="px-6 md:px-16 py-24 md:py-36">
          <div className="mb-12">
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
              Words Shared
            </p>
            <div className="w-full h-px bg-border" />
          </div>
          <TestimonialCarousel testimonials={testimonials} />
        </section>
      )}
    </div>
  );
}
