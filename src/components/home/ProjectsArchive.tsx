"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import ScrollReveal from "@/components/ScrollReveal";
import type { HomepageProject } from "@/lib/placeholder-data";

type Props = {
  projects: HomepageProject[];
};

/* ─── Shared card renderer ─── */

function ProjectCard({
  project,
  isFocused,
  prefersReducedMotion,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  style,
  className = "",
}: {
  project: HomepageProject;
  isFocused: boolean;
  prefersReducedMotion: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      data-archive-card
      className={`archive-card group flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 ${className}`}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {/* Image — 4:5 portrait ratio */}
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
}

/* ─── Main export ─── */

export default function ProjectsArchive({ projects }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const focusedIndex = hoveredIndex ?? activeIndex;

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Center-card detection + edge gradient state + progress
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      // Find card closest to scroll center
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

      setActiveIndex((prev) => (prev === closest ? prev : closest));

      // Edge gradient visibility
      const atStart = el.scrollLeft <= 2;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2;
      setCanScrollLeft(!atStart);
      setCanScrollRight(!atEnd);

      // Scroll progress (0–1)
      const maxScroll = el.scrollWidth - el.clientWidth;
      setScrollProgress(maxScroll > 0 ? el.scrollLeft / maxScroll : 0);
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Drag-to-scroll on desktop
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let hasDragged = false;

    const onDown = (e: MouseEvent) => {
      isDown = true;
      hasDragged = false;
      startX = e.pageX;
      scrollStart = el.scrollLeft;
      el.classList.add("archive-dragging");
    };

    const onMove = (e: MouseEvent) => {
      if (!isDown) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 3) hasDragged = true;
      el.scrollLeft = scrollStart - dx;
    };

    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove("archive-dragging");
    };

    const onClick = (e: MouseEvent) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
        hasDragged = false;
      }
    };

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    el.addEventListener("click", onClick, { capture: true });

    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      el.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

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

      {/* Scroll strip with edge fade gradients */}
      <div className="relative">
        {/* Left fade */}
        <div
          className="archive-fade-left pointer-events-none absolute left-0 top-0 bottom-0 z-10"
          style={{ opacity: canScrollLeft ? 1 : 0 }}
          aria-hidden="true"
        />
        {/* Right fade */}
        <div
          className="archive-fade-right pointer-events-none absolute right-0 top-0 bottom-0 z-10"
          style={{ opacity: canScrollRight ? 1 : 0 }}
          aria-hidden="true"
        />

        <div
          ref={scrollRef}
          className="archive-scroll flex overflow-x-auto pt-10 md:pt-14 pb-4"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorX: "contain",
          }}
        >
          {projects.map((project, i) => (
            <ProjectCard
              key={project._id}
              project={project}
              isFocused={focusedIndex === i}
              prefersReducedMotion={prefersReducedMotion}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(i)}
              onBlur={() => setHoveredIndex(null)}
              style={{ scrollSnapAlign: "start" }}
            />
          ))}
        </div>

        {/* Scroll progress bar */}
        <div className="archive-progress-track" aria-hidden="true">
          <div
            className="archive-progress-bar"
            style={{ transform: `scaleX(${scrollProgress})` }}
          />
        </div>
      </div>
    </section>
  );
}
