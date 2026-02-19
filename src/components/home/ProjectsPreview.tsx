"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import type { ProjectCategory } from "@/lib/placeholder-data";

type Props = {
  categories: ProjectCategory[];
};

const categoryPreviews: Record<string, string> = {
  photography: "/images/project-placeholder-1.svg",
  design: "/images/project-placeholder-2.svg",
  collaborations: "/images/project-placeholder-3.svg",
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

/** Resolve a category's preview image — CMS thumbnail URL or local fallback. */
function getCategoryImage(cat: ProjectCategory): string {
  if (cat.thumbnail) {
    const url =
      typeof cat.thumbnail === "string" ? cat.thumbnail : cat.thumbnail.url;
    if (url) return url;
  }
  return categoryPreviews[cat.slug] || "/images/project-placeholder-1.svg";
}

export default function ProjectsPreview({ categories }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isTouch = useTouchDevice();

  /** Tablet/desktop touch: first tap expands, second tap navigates. */
  const handleTouchTap = (
    e: React.MouseEvent,
    cat: ProjectCategory,
  ) => {
    if (hoveredId === cat._id) return; // already expanded — let Link navigate
    e.preventDefault();
    setHoveredId(cat._id);
  };

  return (
    <section className="px-6 md:px-16 py-20 md:py-36">
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
        <div className="w-full h-px bg-border mb-10 md:mb-14" />
      </ScrollReveal>

      {/* ── Mobile: stacked scroll-reveal cards ── */}
      <div className="flex flex-col gap-4 md:hidden">
        {categories.map((cat, i) => {
          const imgSrc = getCategoryImage(cat);

          return (
            <ScrollReveal key={cat._id} delay={i * 0.15}>
              <Link
                href={`/projects?filter=${cat.slug}`}
                className="group relative block h-[200px] overflow-hidden bg-secondary"
              >
                {/* Background image */}
                <img
                  src={imgSrc}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-20 transition-transform duration-700 group-active:scale-[1.02]"
                />

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <p className="text-[10px] tracking-widest text-muted-foreground/50 mb-2">
                    {String(cat.order).padStart(2, "0")}
                  </p>
                  <p className="font-editorial text-lg font-light text-foreground tracking-wider uppercase">
                    {cat.title}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-muted-foreground">
                    <span>View</span>
                    <span className="text-xs">→</span>
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          );
        })}
      </div>

      {/* ── Desktop / Tablet: horizontal accordion strips ── */}
      <div className="hidden md:flex gap-px bg-border h-[520px] overflow-hidden">
        {categories.map((cat) => {
          const isActive = hoveredId === cat._id;
          const hasActive = hoveredId !== null;
          const imgSrc = getCategoryImage(cat);

          return (
            <Link
              key={cat._id}
              href={`/projects?filter=${cat.slug}`}
              className="relative bg-background overflow-hidden group cursor-pointer focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
              style={{
                flex: isActive ? 4 : hasActive ? 0.5 : 1,
                transition: "flex 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)",
              }}
              onMouseEnter={
                isTouch ? undefined : () => setHoveredId(cat._id)
              }
              onMouseLeave={
                isTouch ? undefined : () => setHoveredId(null)
              }
              onClick={
                isTouch ? (e) => handleTouchTap(e, cat) : undefined
              }
            >
              {/* Background image */}
              <div
                className="absolute inset-0"
                style={{
                  opacity: isActive ? 0.2 : 0,
                  transition: "opacity 0.7s cubic-bezier(0.25,0.1,0.25,1)",
                }}
              >
                <img
                  src={imgSrc}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{
                    transform: isActive ? "scale(1)" : "scale(1.1)",
                    transition: "transform 1s cubic-bezier(0.25,0.1,0.25,1)",
                  }}
                />
              </div>

              {/* Collapsed — horizontal text at center */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-8"
                style={{
                  opacity: isActive ? 0 : 1,
                  transition: "opacity 0.5s cubic-bezier(0.25,0.1,0.25,1)",
                }}
              >
                <p className="text-[10px] tracking-widest text-muted-foreground/50 mb-2">
                  {String(cat.order).padStart(2, "0")}
                </p>
                <p className="font-editorial text-base font-light text-foreground tracking-wider uppercase">
                  {cat.title}
                </p>
              </div>

              {/* Expanded — full info */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-10"
                style={{
                  opacity: isActive ? 1 : 0,
                  transition: "opacity 0.5s cubic-bezier(0.25,0.1,0.25,1)",
                }}
              >
                <p className="text-[10px] tracking-widest text-muted-foreground mb-3">
                  {String(cat.order).padStart(2, "0")}
                </p>
                <h3 className="font-editorial text-3xl font-light text-foreground mb-4">
                  {cat.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs tracking-widest uppercase text-muted-foreground">
                    View
                  </span>
                  <span className="text-muted-foreground text-xs transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
