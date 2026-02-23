"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import CategoryBlock from "./CategoryBlock";
import type { ProjectCategory } from "@/lib/placeholder-data";

type Props = {
  categories: ProjectCategory[];
};

/** Returns true when the primary pointer is coarse (finger / stylus). */
function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    setIsTouch(query.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return isTouch;
}

/**
 * Resolve preview images for a category into a flat array of { url, alt, lqip }.
 * Handles both SanityImageAsset objects and plain string URLs.
 */
function resolvePreviewImages(
  cat: ProjectCategory,
): { url: string; alt?: string; lqip?: string }[] | null {
  if (!cat.previewImages || cat.previewImages.length === 0) return null;
  return cat.previewImages
    .map((img) => {
      if (typeof img === "string") return { url: img };
      return { url: img.url, alt: img.alt, lqip: img.lqip };
    })
    .filter((img) => !!img.url);
}

export default function ProjectsPreview({ categories }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isTouch = useTouchDevice();

  const handleEnter = useCallback(
    (id: string) => {
      if (!isTouch) setHoveredId(id);
    },
    [isTouch],
  );

  const handleLeave = useCallback(() => {
    if (!isTouch) setHoveredId(null);
  }, [isTouch]);

  return (
    <section className="px-6 md:px-16 py-12 md:py-36">
      {/* ── Section header ── */}
      <ScrollReveal>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-editorial text-2xl md:text-3xl font-light text-foreground">
            Projects
          </h2>
          <Link
            href="/projects"
            className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 border-b border-foreground/30 pb-0.5"
          >
            See all
          </Link>
        </div>
        <div className="w-full h-px bg-border mb-6 md:mb-14" />
      </ScrollReveal>

      {/* ── Mobile: editorial category index with image previews ── */}
      <div className="flex flex-col md:hidden">
        {categories.map((cat, i) => {
          const isLast = i === categories.length - 1;

          /*
           * Stacking order (z-index):
           *   Collaborations (last) on top, Photography above Design.
           *   Formula: last item gets highest z; remaining are reverse-ordered.
           */
          const zIndex = isLast
            ? categories.length
            : categories.length - 1 - i;

          const previewImages = resolvePreviewImages(cat);

          return (
            <div
              key={cat._id}
              className="relative"
              style={{ zIndex }}
            >
              <CategoryBlock
                title={cat.title}
                href={`/projects?filter=${cat.slug}`}
                gifUrl={cat.previewGif}
                images={previewImages}
              />

              {/* Hairline divider between blocks */}
              {!isLast && (
                <div
                  className="h-px"
                  style={{ background: "hsl(30 10% 12% / 0.12)" }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Desktop / Tablet: equal columns · editorial fade focus ── */}
      <div className="hidden md:flex h-[520px] overflow-hidden projects-editorial-grid">
        {categories.map((cat, i) => {
          const isHovered = hoveredId === cat._id;
          const hasSiblingHover = hoveredId !== null && !isHovered;
          const isLast = i === categories.length - 1;

          return (
            <Link
              key={cat._id}
              href={`/projects?filter=${cat.slug}`}
              className={`projects-col relative flex-1 bg-background overflow-hidden cursor-pointer focus-visible:z-10 outline-none${!isLast ? " projects-col-divider" : ""}`}
              style={{
                opacity: hasSiblingHover ? 0.45 : 1,
              }}
              onMouseEnter={() => handleEnter(cat._id)}
              onMouseLeave={handleLeave}
              onFocus={() => handleEnter(cat._id)}
              onBlur={handleLeave}
            >
              {/* Content — always centered */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                {/* Order number */}
                <p
                  className="projects-col-number text-[10px] tracking-widest mb-3"
                  style={{
                    opacity: isHovered ? 0.6 : 0.3,
                  }}
                >
                  {String(cat.order).padStart(2, "0")}
                </p>

                {/* Title with editorial underline */}
                <h3 className="projects-col-title font-editorial text-base font-light tracking-wider uppercase">
                  <span className="projects-col-title-text">
                    {cat.title}
                  </span>
                </h3>

                {/* CTA — fades in on hover */}
                <div
                  className="projects-col-cta mt-4 flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-muted-foreground"
                  style={{
                    opacity: isHovered ? 0.7 : 0,
                  }}
                >
                  <span>View</span>
                  <span className="text-xs">→</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
