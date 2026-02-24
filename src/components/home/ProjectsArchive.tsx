"use client";

import { useRef, useState, useEffect, useCallback } from "react";
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

/* ─── Desktop: original horizontal scroll strip ─── */

function DesktopStrip({
  projects,
  prefersReducedMotion,
}: {
  projects: HomepageProject[];
  prefersReducedMotion: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

  // Vertical wheel → horizontal scroll on desktop
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let pendingDelta = 0;
    let rafId = 0;

    const applyScroll = () => {
      if (pendingDelta !== 0) {
        el.scrollLeft += pendingDelta;
        pendingDelta = 0;
      }
      rafId = 0;
    };

    const handleWheel = (e: WheelEvent) => {
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      if (absX >= absY) return;

      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 40;
      else if (e.deltaMode === 2) dy *= el.clientHeight;

      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
      if ((atStart && dy < 0) || (atEnd && dy > 0)) return;

      e.preventDefault();
      pendingDelta += dy;
      if (!rafId) {
        rafId = requestAnimationFrame(applyScroll);
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const focusedIndex = hoveredIndex ?? activeIndex;

  return (
    <div
      ref={scrollRef}
      className="archive-scroll hidden md:flex gap-8 overflow-x-auto px-16 pt-14 pb-4 scrollbar-hide"
      style={{ scrollSnapType: "x proximity" }}
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
          style={{
            scrollSnapAlign: "start",
            width: "clamp(280px, 38vw, 520px)",
          }}
        />
      ))}
      <div className="flex-shrink-0 w-px" aria-hidden="true" />
    </div>
  );
}

/* ─── Mobile: scroll-driven infinite loop strip ─── */

const MOBILE_CARD_WIDTH = 260; // px
const MOBILE_GAP = 20; // px — matches gap-5
const PAGE_GUTTER = 24; // px — matches px-6
const SCROLL_SPEED = 0.6; // translateX multiplier relative to scroll delta

function MobileStrip({
  projects,
  prefersReducedMotion,
}: {
  projects: HomepageProject[];
  prefersReducedMotion: boolean;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const translateXRef = useRef(0);
  const lastScrollY = useRef(0);
  const rafId = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Triple the items for seamless looping
  const tripled = [...projects, ...projects, ...projects];
  const count = projects.length;
  // Width of one full set of cards
  const singleSetWidth = count * MOBILE_CARD_WIDTH + (count - 1) * MOBILE_GAP;

  // Initialize translateX so the middle copy starts roughly centered
  useEffect(() => {
    // Start at the beginning of the second copy, offset so first card of
    // second copy aligns with the left gutter
    translateXRef.current = -singleSetWidth;
    lastScrollY.current = window.scrollY;

    if (stripRef.current) {
      stripRef.current.style.transform = `translate3d(${translateXRef.current}px, 0, 0)`;
    }
  }, [singleSetWidth]);

  // Determine which card is closest to viewport center
  const computeActiveIndex = useCallback(
    (tx: number) => {
      const viewportCenter = window.innerWidth / 2;
      // The strip starts at PAGE_GUTTER offset, so card positions are:
      // cardLeft = PAGE_GUTTER + tx + i * (MOBILE_CARD_WIDTH + MOBILE_GAP)
      let closest = 0;
      let minDist = Infinity;

      for (let i = 0; i < tripled.length; i++) {
        const cardLeft =
          PAGE_GUTTER + tx + i * (MOBILE_CARD_WIDTH + MOBILE_GAP);
        const cardCenter = cardLeft + MOBILE_CARD_WIDTH / 2;
        const dist = Math.abs(viewportCenter - cardCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      }

      // Map back to original index
      return closest % count;
    },
    [tripled.length, count],
  );

  // Scroll-driven movement via rAF
  useEffect(() => {
    const section = sectionRef.current;
    const strip = stripRef.current;
    if (!section || !strip) return;

    const onScroll = () => {
      if (rafId.current) return;

      rafId.current = requestAnimationFrame(() => {
        rafId.current = 0;

        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;
        lastScrollY.current = currentY;

        // Check if section is in view
        const rect = section.getBoundingClientRect();
        const inView = rect.bottom > 0 && rect.top < window.innerHeight;
        if (!inView) return;

        // Apply delta to translateX (scroll down → cards move left)
        translateXRef.current -= delta * SCROLL_SPEED;

        // Wrap using modulo for seamless loop
        // Keep translateX within [-2*singleSetWidth, 0] range
        // When it goes past the third copy, wrap back to second
        // When it goes before the first copy, wrap forward to second
        if (translateXRef.current < -2 * singleSetWidth) {
          translateXRef.current += singleSetWidth;
        } else if (translateXRef.current > 0) {
          translateXRef.current -= singleSetWidth;
        }

        strip.style.transform = `translate3d(${translateXRef.current}px, 0, 0)`;

        setActiveIndex(computeActiveIndex(translateXRef.current));
      });
    };

    // Set initial active index
    setActiveIndex(computeActiveIndex(translateXRef.current));

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [singleSetWidth, computeActiveIndex]);

  return (
    <div
      ref={sectionRef}
      className="mobile-strip-section md:hidden overflow-hidden pt-10 pb-4"
    >
      <div
        ref={stripRef}
        className="mobile-strip flex will-change-transform"
        style={{
          gap: `${MOBILE_GAP}px`,
          paddingLeft: `${PAGE_GUTTER}px`,
          paddingRight: `${PAGE_GUTTER}px`,
        }}
      >
        {tripled.map((project, i) => {
          const originalIndex = i % count;
          const isFocused = activeIndex === originalIndex;

          return (
            <ProjectCard
              key={`${project._id}-${i}`}
              project={project}
              isFocused={isFocused}
              prefersReducedMotion={prefersReducedMotion}
              className="mobile-strip-card"
              style={{
                width: `${MOBILE_CARD_WIDTH}px`,
                minWidth: `${MOBILE_CARD_WIDTH}px`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main export ─── */

export default function ProjectsArchive({ projects }: Props) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
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

      {/* Desktop: original horizontal scroll strip */}
      <DesktopStrip
        projects={projects}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* Mobile: scroll-driven infinite loop strip */}
      <MobileStrip
        projects={projects}
        prefersReducedMotion={prefersReducedMotion}
      />
    </section>
  );
}
