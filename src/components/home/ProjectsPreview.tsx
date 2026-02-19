"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
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
  const [expandedId, setExpandedId] = useState<string | null>(
    categories[0]?._id ?? null,
  );
  const isTouch = useTouchDevice();
  const prefersReduced = useReducedMotion();

  const ease = [0.25, 0.1, 0.25, 1] as const;

  /** Tablet/desktop touch: first tap expands, second tap navigates. */
  const handleTouchTap = (
    e: React.MouseEvent,
    cat: ProjectCategory,
  ) => {
    if (hoveredId === cat._id) return; // already expanded — let Link navigate
    e.preventDefault();
    setHoveredId(cat._id);
  };

  /** Mobile: tap a collapsed card to expand it. */
  const handleMobileTap = (cat: ProjectCategory) => {
    setExpandedId((prev) => (prev === cat._id ? null : cat._id));
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

      {/* ── Mobile: vertical tap-to-expand accordion ── */}
      <div className="flex flex-col md:hidden">
        {categories.map((cat) => {
          const isExpanded = expandedId === cat._id;
          const imgSrc = getCategoryImage(cat);

          return (
            <div key={cat._id} className="border-b border-border last:border-b-0">
              <motion.div
                initial={false}
                animate={{ height: isExpanded ? 280 : 80 }}
                transition={
                  prefersReduced
                    ? { duration: 0 }
                    : { duration: 0.5, ease }
                }
                className="relative overflow-hidden bg-secondary cursor-pointer"
                onClick={() => handleMobileTap(cat)}
                role="button"
                aria-expanded={isExpanded}
                aria-controls={`panel-${cat._id}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMobileTap(cat);
                  }
                }}
              >
                {/* Background image — visible when expanded */}
                <motion.div
                  className="absolute inset-0"
                  initial={false}
                  animate={{ opacity: isExpanded ? 0.25 : 0 }}
                  transition={
                    prefersReduced
                      ? { duration: 0 }
                      : { duration: 0.6, ease }
                  }
                >
                  <img
                    src={imgSrc}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{
                      transform: isExpanded ? "scale(1)" : "scale(1.08)",
                      transition: prefersReduced
                        ? "none"
                        : "transform 0.8s cubic-bezier(0.25,0.1,0.25,1)",
                    }}
                  />
                </motion.div>

                {/* Collapsed state — compact row */}
                <motion.div
                  className="absolute inset-0 flex items-center px-6"
                  initial={false}
                  animate={{ opacity: isExpanded ? 0 : 1 }}
                  transition={
                    prefersReduced
                      ? { duration: 0 }
                      : { duration: 0.35, ease }
                  }
                >
                  <span className="text-[10px] tracking-widest text-muted-foreground/50 mr-4 font-mono">
                    {String(cat.order).padStart(2, "0")}
                  </span>
                  <span className="font-editorial text-sm font-light text-foreground tracking-wider uppercase">
                    {cat.title}
                  </span>
                  <span className="ml-auto text-muted-foreground/40 text-xs">
                    +
                  </span>
                </motion.div>

                {/* Expanded state — centered content */}
                <motion.div
                  id={`panel-${cat._id}`}
                  role="region"
                  className="absolute inset-0 flex flex-col items-center justify-center px-6"
                  initial={false}
                  animate={{ opacity: isExpanded ? 1 : 0 }}
                  transition={
                    prefersReduced
                      ? { duration: 0 }
                      : { duration: 0.4, delay: isExpanded ? 0.15 : 0, ease }
                  }
                >
                  <p className="text-[10px] tracking-widest text-muted-foreground mb-3">
                    {String(cat.order).padStart(2, "0")}
                  </p>
                  <h3 className="font-editorial text-xl font-light text-foreground mb-5 tracking-wider uppercase">
                    {cat.title}
                  </h3>
                  <Link
                    href={`/projects?filter=${cat.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase text-muted-foreground active:text-foreground transition-colors duration-200"
                  >
                    <span>Explore</span>
                    <span className="text-xs">→</span>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
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
                transition: prefersReduced
                  ? "none"
                  : "flex 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)",
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
                  transition: prefersReduced
                    ? "none"
                    : "opacity 0.7s cubic-bezier(0.25,0.1,0.25,1)",
                }}
              >
                <img
                  src={imgSrc}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{
                    transform: isActive ? "scale(1)" : "scale(1.1)",
                    transition: prefersReduced
                      ? "none"
                      : "transform 1s cubic-bezier(0.25,0.1,0.25,1)",
                  }}
                />
              </div>

              {/* Collapsed — horizontal text at center */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-8"
                style={{
                  opacity: isActive ? 0 : 1,
                  transition: prefersReduced
                    ? "none"
                    : "opacity 0.5s cubic-bezier(0.25,0.1,0.25,1)",
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
                  transition: prefersReduced
                    ? "none"
                    : "opacity 0.5s cubic-bezier(0.25,0.1,0.25,1)",
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
