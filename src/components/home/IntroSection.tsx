"use client";

import { useState } from "react";
import Link from "next/link";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const PORTRAIT_IMAGE = "/images/hero-placeholder-1.svg";

export default function IntroSection() {
  const [revealed, setRevealed] = useState(false);
  const { ref: sectionRef, visible } = useScrollReveal(0.1);

  return (
    <section ref={sectionRef} className="px-8 md:px-16 py-24 md:py-36">
      {/* Section label */}
      <div
        className={`mb-16 transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <p className="text-xs tracking-widest uppercase text-muted-foreground">
          About
        </p>
        <div className="w-full h-px bg-border mt-4" />
      </div>

      {/* Asymmetric overlap layout */}
      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Portrait — left, tall, overlaps into the text zone */}
        <div
          className={`md:col-span-5 md:col-start-1 relative z-10 transition-all duration-1000 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "200ms" }}
          onMouseEnter={() => setRevealed(true)}
        >
          <div className="w-full aspect-[3/4] overflow-hidden bg-secondary">
            <img
              src={PORTRAIT_IMAGE}
              alt="Maninder Singh — Creative Director, Designer & Photographer"
              className={`w-full h-full object-cover object-top transition-all duration-1000 ${
                revealed ? "grayscale-0 scale-100" : "grayscale scale-[1.03]"
              }`}
            />
          </div>
        </div>

        {/* Text content — right, vertically centered against portrait */}
        <div
          className={`md:col-span-5 md:col-start-7 flex flex-col gap-10 md:pt-16 lg:pt-28 transition-all duration-1000 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          {/* Roles stacked as a typographic element */}
          <div className="space-y-0">
            {["Creative Director", "Multidisciplinary Designer", "Photographer"].map(
              (role, i) => (
                <p
                  key={role}
                  className="font-editorial text-xl md:text-2xl lg:text-[1.75rem] font-light text-foreground leading-[1.5]"
                  style={{ opacity: 1 - i * 0.2 }}
                >
                  {role}
                </p>
              )
            )}
          </div>

          <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.8] max-w-sm">
            Based in Toronto, Maninder Singh blends design and photography to
            craft stories that feel both visually refined and emotionally
            resonant. His practice spans brand identities, editorial work, and
            fine art — always grounded in intention and detail.
          </p>

          {/* Pull quote */}
          <blockquote className="font-editorial text-lg md:text-xl font-light leading-[1.5] text-foreground/80 border-l-2 border-foreground/10 pl-6">
            Guided by a deep curiosity for life&apos;s quiet wonders, creating
            work that reflects the rhythm of nature and human connection.
          </blockquote>

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
        </div>
      </div>
    </section>
  );
}
