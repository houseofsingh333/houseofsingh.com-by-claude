"use client";

import SanityImage from "@/components/SanityImage";
import ScrollReveal from "@/components/ScrollReveal";
import type { FeaturedOutlet } from "@/lib/types";

function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function ExternalLinkIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0 text-current transition-colors duration-300"
    >
      <path
        d="M6 2.5H3.5a1 1 0 0 0-1 1V12.5a1 1 0 0 0 1 1H12.5a1 1 0 0 0 1-1V10M9.5 2.5H13.5V6.5M13.5 2.5L7 9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeaturedRow({
  outlet,
  index,
  isLast,
}: {
  outlet: FeaturedOutlet;
  index: number;
  isLast: boolean;
}) {
  const date = formatDate(outlet.date);
  const hasImage = !!outlet.image;

  const rowContent = (
    <div className="featured-row flex items-center gap-6 py-6 md:py-7">
      {/* Thumbnail */}
      {hasImage && (
        <div className="featured-row-thumb hidden md:block shrink-0 w-[220px] h-[140px] overflow-hidden bg-secondary border border-black/[0.08]">
          <SanityImage
            image={outlet.image!}
            context="thumbnail"
            alt={outlet.title || outlet.name}
            fill={false}
            className="w-full h-full object-cover transition-transform duration-[450ms] ease-in-out group-hover:scale-105"
          />
        </div>
      )}

      {/* Text zone */}
      <div className="flex-1 min-w-0">
        {/* Line 1: publication · date */}
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50 mb-2">
          {outlet.name}
          {date && (
            <>
              <span className="mx-2">·</span>
              {date}
            </>
          )}
        </p>

        {/* Line 2: title */}
        <h3 className="font-editorial text-[clamp(16px,2vw,22px)] font-normal leading-tight text-foreground">
          {outlet.title || outlet.name}
        </h3>

        {/* Line 3: publication link with icon */}
        {outlet.url && (
          <p className="mt-[15px] text-[12px] tracking-[0.18em] uppercase text-foreground/80 flex items-center gap-1.5 group-hover:text-foreground transition-colors duration-300">
            <span>VIEW ARTICLE</span>
            <ExternalLinkIcon />
          </p>
        )}
      </div>
    </div>
  );

  return (
    <ScrollReveal delay={index * 0.12}>
      {outlet.url ? (
        <a
          href={outlet.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group hover:opacity-70 transition-opacity duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          {rowContent}
        </a>
      ) : (
        <div className="group">{rowContent}</div>
      )}
      {!isLast && <div className="w-full h-px bg-border/70" />}
    </ScrollReveal>
  );
}

export default function FeaturedOn({
  outlets,
}: {
  outlets: FeaturedOutlet[];
}) {
  if (!outlets || outlets.length === 0) return null;

  return (
    <div role="list" aria-label="Press and media features">
      {outlets.map((outlet, i) => (
        <div key={outlet.title || outlet.name} role="listitem">
          <FeaturedRow
            outlet={outlet}
            index={i}
            isLast={i === outlets.length - 1}
          />
        </div>
      ))}
    </div>
  );
}
