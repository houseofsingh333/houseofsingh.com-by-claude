"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import CategoryBlock from "./CategoryBlock";
import PreviewMedia from "./PreviewMedia";
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
    <section className="px-6 md:px-16 section-py">
      {/* ── Section header ── */}
      <ScrollReveal>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-normal text-foreground">
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

      {/* ── Desktop / Tablet: editorial columns with preview media ── */}
      <div className="hidden md:flex min-h-[520px] projects-editorial-grid">
        {categories.map((cat, i) => {
          const isHovered = hoveredId === cat._id;
          const hasSiblingHover = hoveredId !== null && !isHovered;
          const isLast = i === categories.length - 1;
          const previewImages = resolvePreviewImages(cat);

          return (
            <Link
              key={cat._id}
              href={`/projects?filter=${cat.slug}`}
              className={`projects-col relative flex-1 flex flex-col bg-background cursor-pointer focus-visible:z-10 outline-none${!isLast ? " projects-col-divider" : ""}`}
              style={{
                opacity: hasSiblingHover ? 0.45 : 1,
              }}
              onMouseEnter={() => handleEnter(cat._id)}
              onMouseLeave={handleLeave}
              onFocus={() => handleEnter(cat._id)}
              onBlur={handleLeave}
            >
              {/* Title row — title left, VIEW → right */}
              <div className="flex items-baseline justify-between px-8 pt-10 pb-6">
                <h3 className="projects-col-title text-base font-normal tracking-wider uppercase">
                  <span className="projects-col-title-text">
                    {cat.title}
                  </span>
                </h3>
                <span
                  className="projects-col-cta flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-muted-foreground"
                  style={{
                    opacity: isHovered ? 0.6 : 0.3,
                  }}
                >
                  <span>View</span>
                  <span className="text-xs">→</span>
                </span>
              </div>

              {/* Preview media — centered, 80% width, editorial frame */}
              <div className="flex-1 flex items-start justify-center px-8 pb-8">
                <div className="projects-col-media relative w-[80%] aspect-[3/2] overflow-hidden border border-foreground/10">
                  <PreviewMedia
                    title={cat.title}
                    gifUrl={cat.previewGif}
                    images={previewImages}
                    interval={8000}
                    fadeDuration="2s"
                    className="absolute inset-0"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
