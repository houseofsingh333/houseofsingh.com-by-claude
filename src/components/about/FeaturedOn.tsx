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
  isLast,
}: {
  outlet: FeaturedOutlet;
  index: number;
  isLast: boolean;
}) {
  const date = formatDate(outlet.date);
  const hasImage = !!outlet.image;

  // Metadata line: combine publication name and date
  const meta = date ? `${outlet.name}  ·  ${date}` : outlet.name;

  const rowContent = (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 py-12 md:py-16 lg:py-20">
      {/* Image column */}
      {hasImage && (
        <div className="md:col-span-5 px-4 md:px-0">
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
            : "md:col-span-8 md:col-start-3 flex flex-col justify-center"
        }
      >
        {/* Metadata: publication name + date */}
        <p className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground/50 mb-4 md:mb-5">
          {meta}
        </p>

        {/* Title — visual anchor of the row */}
        <h3 className="font-editorial text-xl md:text-2xl lg:text-[1.75rem] font-light leading-[1.3] text-foreground group-hover:text-foreground/70 transition-colors duration-500 mb-4 md:mb-5 max-w-lg">
          {outlet.title || outlet.name}
        </h3>

        {/* Description */}
        {outlet.description && (
          <p className="text-sm md:text-[15px] text-muted-foreground/70 leading-[1.8] max-w-lg mb-6 md:mb-7">
            {outlet.description}
          </p>
        )}

        {/* Read More */}
        {outlet.url && (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.14em] uppercase text-muted-foreground/60 group-hover:text-foreground transition-colors duration-500"
            aria-hidden="true"
          >
            Read More
            <ArrowRight
              size={11}
              strokeWidth={1.5}
              className="transition-transform duration-500 group-hover:translate-x-0.5"
            />
          </span>
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
          className="block group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          {rowContent}
        </a>
      ) : (
        <div className="group">{rowContent}</div>
      )}
      {/* Divider between rows — softer contrast, omit after last */}
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
