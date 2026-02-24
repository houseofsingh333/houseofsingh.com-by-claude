"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import ScrollReveal from "@/components/ScrollReveal";
import type { HomepageProject } from "@/lib/placeholder-data";

type Props = {
  projects: HomepageProject[];
};

export default function ProjectsArchive({ projects }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Center-based focus detection
  const updateActiveCard = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollCenter = el.scrollLeft + el.clientWidth / 2;
    const cards = el.querySelectorAll<HTMLElement>("[data-archive-card]");
    let closest = 0;
    let minDist = Infinity;

    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(scrollCenter - cardCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateActiveCard();

    el.addEventListener("scroll", updateActiveCard, { passive: true });
    return () => el.removeEventListener("scroll", updateActiveCard);
  }, [updateActiveCard]);

  // Convert vertical scroll to horizontal on desktop
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // Only intercept vertical scrolls when hovering the container
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;

      // Let page scroll naturally if at edges and scrolling in that direction
      if ((atStart && e.deltaY < 0) || (atEnd && e.deltaY > 0)) return;

      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  const focusedIndex = hoveredIndex ?? activeIndex;

  return (
    <section className="section-py">
      {/* Section header */}
      <ScrollReveal>
        <div className="px-6 md:px-16">
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
          <div className="w-full h-px bg-border" />
        </div>
      </ScrollReveal>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="archive-scroll flex gap-5 md:gap-8 overflow-x-auto px-6 md:px-16 pt-10 md:pt-14 pb-4 scrollbar-hide"
        style={{ scrollSnapType: "x proximity" }}
      >
        {projects.map((project, i) => {
          const isFocused = focusedIndex === i;

          return (
            <Link
              key={project._id}
              href={`/projects/${project.slug}`}
              data-archive-card
              className="archive-card group flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
              style={{
                scrollSnapAlign: "start",
                width: "clamp(280px, 38vw, 520px)",
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(i)}
              onBlur={() => setHoveredIndex(null)}
            >
              {/* Image — 4:5 portrait ratio (matches /projects subpage) */}
              <div className="relative aspect-[4/5] overflow-hidden mb-4 md:mb-5">
                {/* Grain overlay */}
                <div
                  className={`archive-grain absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ${
                    isFocused ? "opacity-0" : "opacity-100"
                  }`}
                />

                <div
                  className={`archive-img-wrap w-full h-full ${prefersReducedMotion ? "archive-img-reduced" : ""}`}
                  style={
                    prefersReducedMotion
                      ? {
                          filter: isFocused ? "grayscale(0)" : "grayscale(1)",
                          transition: "filter 300ms ease-in-out",
                        }
                      : {
                          filter: isFocused
                            ? "grayscale(0) contrast(1) brightness(1) blur(0px)"
                            : "grayscale(1) contrast(0.9) brightness(0.95) blur(0.6px)",
                          transition: "filter 300ms ease-in-out",
                        }
                  }
                >
                  <SanityImage
                    image={project.thumbnail}
                    context="thumbnail"
                    alt={project.thumbnailAlt}
                    fill
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              {/* Category */}
              <p
                className="text-[10px] tracking-[0.2em] uppercase mb-2 transition-opacity duration-300"
                style={{
                  color: "var(--muted-foreground)",
                  opacity: isFocused ? 0.7 : 0.35,
                }}
              >
                {project.category}
              </p>

              {/* Title */}
              <h3 className="archive-card-title font-editorial text-lg md:text-xl font-light text-foreground leading-snug">
                <span className="archive-title-text relative inline">
                  {project.title}
                  <span
                    className="absolute left-0 right-0 bottom-[-3px] h-px bg-foreground/30 origin-left transition-transform duration-500 ease-out"
                    style={{
                      transform: isFocused ? "scaleX(1)" : "scaleX(0)",
                    }}
                  />
                </span>
              </h3>
            </Link>
          );
        })}

        {/* Trailing spacer — ensures last card can scroll into center */}
        <div className="flex-shrink-0 w-px" aria-hidden="true" />
      </div>
    </section>
  );
}
