"use client";

import type { FeaturedOutlet } from "@/lib/types";

export default function FeaturedOn({ outlets }: { outlets: FeaturedOutlet[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      {outlets.map((outlet) => {
        const inner = outlet.logo ? (
          <img
            src={typeof outlet.logo === "string" ? outlet.logo : outlet.logo.url}
            alt={outlet.name}
            className="h-5 md:h-6 w-auto opacity-50 hover:opacity-100 transition-opacity duration-300"
          />
        ) : (
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
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
  );
}
