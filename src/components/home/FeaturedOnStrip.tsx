"use client";

import ScrollReveal from "@/components/ScrollReveal";
import type { FeaturedOutlet } from "@/lib/types";

export default function FeaturedOnStrip({
  outlets,
}: {
  outlets: FeaturedOutlet[];
}) {
  return (
    <section className="px-6 md:px-16 section-py-sm">
      {/* Section label */}
      <ScrollReveal>
        <div className="mb-10 md:mb-14">
          <p className="text-xs tracking-widest uppercase text-muted-foreground">
            Featured On
          </p>
          <div className="w-full h-px bg-border mt-4" />
        </div>
      </ScrollReveal>

      {/* Logos row */}
      <ScrollReveal delay={0.15}>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-14 lg:gap-x-20">
          {outlets.map((outlet) => {
            const inner = outlet.logo ? (
              <img
                src={
                  typeof outlet.logo === "string"
                    ? outlet.logo
                    : outlet.logo.url
                }
                alt={outlet.name}
                className="h-4 md:h-5 lg:h-6 w-auto opacity-35 hover:opacity-80 transition-opacity duration-500"
              />
            ) : (
              <span className="text-[11px] md:text-xs tracking-[0.2em] uppercase text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-500">
                {outlet.name}
              </span>
            );

            return outlet.url ? (
              <a
                key={outlet.name}
                href={outlet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                {inner}
              </a>
            ) : (
              <span key={outlet.name} className="inline-block">
                {inner}
              </span>
            );
          })}
        </div>
      </ScrollReveal>
    </section>
  );
}
