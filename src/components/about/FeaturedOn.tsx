"use client";

import { ArrowRight } from "lucide-react";
import SanityImage from "@/components/SanityImage";
import ScrollReveal from "@/components/ScrollReveal";
import type { FeaturedOutlet } from "@/lib/types";

function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function FeaturedRow({
  outlet,
  index,
}: {
  outlet: FeaturedOutlet;
  index: number;
}) {
  const date = formatDate(outlet.date);
  const hasImage = !!outlet.image;
  const hasRichContent = outlet.title || outlet.description || hasImage;

  // Fall back to simple inline display for legacy entries without rich content
  if (!hasRichContent) {
    return (
      <ScrollReveal delay={index * 0.08}>
        <div className="py-6">
          {outlet.url ? (
            <a
              href={outlet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              {outlet.name}
            </a>
          ) : (
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
              {outlet.name}
            </span>
          )}
        </div>
        <div className="w-full h-px bg-border" />
      </ScrollReveal>
    );
  }

  const rowContent = (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-10 md:py-12">
      {/* Image column */}
      {hasImage && (
        <div className="md:col-span-5">
          <div className="relative w-full aspect-[3/2] overflow-hidden bg-secondary">
            <SanityImage
              image={outlet.image!}
              context="thumbnail"
              alt={outlet.title || outlet.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Text column */}
      <div
        className={
          hasImage
            ? "md:col-span-6 md:col-start-7 flex flex-col justify-center"
            : "md:col-span-8 flex flex-col justify-center"
        }
      >
        {/* Date */}
        {date && (
          <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/60 mb-3">
            {date}
          </p>
        )}

        {/* Title */}
        <h3 className="font-editorial text-lg md:text-xl lg:text-[1.375rem] font-light leading-[1.35] text-foreground/80 group-hover:text-foreground transition-colors duration-300 mb-3">
          {outlet.title || outlet.name}
        </h3>

        {/* Publication name (when title is present, show name as byline) */}
        {outlet.title && (
          <p className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground/50 mb-4">
            {outlet.name}
          </p>
        )}

        {/* Description */}
        {outlet.description && (
          <p className="text-sm text-muted-foreground leading-[1.8] max-w-md mb-5">
            {outlet.description}
          </p>
        )}

        {/* Read More link — visible on desktop as interactive element */}
        {outlet.url && (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase text-muted-foreground/70 group-hover:text-foreground transition-colors duration-300"
            aria-hidden="true"
          >
            Read More
            <ArrowRight
              size={12}
              strokeWidth={1.5}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </span>
        )}
      </div>
    </div>
  );

  return (
    <ScrollReveal delay={index * 0.1}>
      {outlet.url ? (
        <a
          href={outlet.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          {rowContent}
        </a>
      ) : (
        <div className="group">{rowContent}</div>
      )}
      {/* Divider between rows */}
      <div className="w-full h-px bg-border" />
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
      {/* Opening divider */}
      <div className="w-full h-px bg-border" />

      {outlets.map((outlet, i) => (
        <div key={outlet.title || outlet.name} role="listitem">
          <FeaturedRow outlet={outlet} index={i} />
        </div>
      ))}
    </div>
  );
}
