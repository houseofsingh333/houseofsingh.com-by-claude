"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import ScrollReveal from "@/components/ScrollReveal";
import type { HomepageProject } from "@/lib/placeholder-data";

type Props = {
  projects: HomepageProject[];
};

/* ─── Card renderer ─── */

function ProjectCard({
  project,
  isFocused,
  prefersReducedMotion,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}: {
  project: HomepageProject;
  isFocused: boolean;
  prefersReducedMotion: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      data-archive-card
      className="archive-card group flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
      style={{ scrollSnapAlign: "start" }}
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
  const thumbRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

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

  // Center-card detection + scroll hint dismiss + scrollbar thumb
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let hintDismissed = false;

    const onScroll = () => {
      // 1. Center-card detection (grayscale→color focus)
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

      // 2. Dismiss "Scroll →" hint on first real scroll
      if (!hintDismissed && el.scrollLeft > 2) {
        hintDismissed = true;
        setShowScrollHint(false);
      }

      // 3. Update custom scrollbar thumb (via ref — no re-render)
      const thumb = thumbRef.current;
      if (thumb) {
        const ratio = el.clientWidth / el.scrollWidth;
        const thumbW = Math.max(ratio * 100, 8);
        const maxScroll = el.scrollWidth - el.clientWidth;
        const progress = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
        const thumbL = progress * (100 - thumbW);
        thumb.style.width = `${thumbW}%`;
        thumb.style.transform = `translateX(${(thumbL / thumbW) * 100}%)`;
      }
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // One-time nudge — subtle scroll hint, once per session, cancellable
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || prefersReducedMotion) return;

    const STORAGE_KEY = "projects-nudge-done";
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    let cancelled = false;
    let nudgeRaf: number;

    const cancelNudge = () => {
      cancelled = true;
    };

    // Ease-in-out cubic
    const easeInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        try {
          sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {
          /* noop */
        }

        // Cancel on any user interaction
        el.addEventListener("wheel", cancelNudge, { once: true });
        el.addEventListener("touchstart", cancelNudge, { once: true });
        el.addEventListener("mousedown", cancelNudge, { once: true });

        const duration = 650;
        const distance = 14;

        const start = performance.now();
        const animateOut = (now: number) => {
          if (cancelled) return;
          const t = Math.min((now - start) / duration, 1);
          el.scrollLeft = distance * easeInOut(t);
          if (t < 1) {
            nudgeRaf = requestAnimationFrame(animateOut);
          } else {
            const start2 = performance.now();
            const animateBack = (now2: number) => {
              if (cancelled) return;
              const t2 = Math.min((now2 - start2) / duration, 1);
              el.scrollLeft = distance * (1 - easeInOut(t2));
              if (t2 < 1) nudgeRaf = requestAnimationFrame(animateBack);
            };
            nudgeRaf = requestAnimationFrame(animateBack);
          }
        };

        setTimeout(() => {
          if (!cancelled) nudgeRaf = requestAnimationFrame(animateOut);
        }, 300);
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (nudgeRaf) cancelAnimationFrame(nudgeRaf);
      el.removeEventListener("wheel", cancelNudge);
      el.removeEventListener("touchstart", cancelNudge);
      el.removeEventListener("mousedown", cancelNudge);
    };
  }, [prefersReducedMotion]);

  // Drag-to-scroll — desktop click-and-drag affordance
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let dragged = false;
    const DRAG_THRESHOLD = 3;

    const onMouseDown = (e: MouseEvent) => {
      // Only primary button
      if (e.button !== 0) return;
      isDown = true;
      dragged = false;
      startX = e.clientX;
      scrollStart = el.scrollLeft;
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > DRAG_THRESHOLD) {
        dragged = true;
      }
      el.scrollLeft = scrollStart - dx;
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = "grab";
      el.style.userSelect = "";
    };

    // Prevent link clicks when dragging
    const onClick = (e: MouseEvent) => {
      if (dragged) {
        e.preventDefault();
        dragged = false;
      }
    };

    el.style.cursor = "grab";
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    el.addEventListener("click", onClick, { capture: true });

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("click", onClick, { capture: true });
      el.style.cursor = "";
    };
  }, []);

  return (
    <section className="section-py section-archive">
      {/* Section header */}
      <ScrollReveal>
        <div className="px-6 md:px-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-editorial text-2xl md:text-3xl font-light text-foreground">
              Projects
            </h2>
            <div className="flex items-baseline gap-6">
              <span
                className="archive-scroll-hint text-xs tracking-widest uppercase text-muted-foreground select-none hidden md:inline"
                data-hidden={!showScrollHint}
              >
                Scroll{" "}
                <span aria-hidden="true">&rarr;</span>
              </span>
              <Link
                href="/projects"
                className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 border-b border-foreground/30 pb-0.5"
              >
                See all
              </Link>
            </div>
          </div>
          <div className="w-full h-px bg-border" />
        </div>
      </ScrollReveal>

      {/* Scroll strip */}
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
          />
        ))}
      </div>

      {/* Custom micro scrollbar — desktop only (hidden below 1024px via CSS) */}
      <div className="archive-scrollbar-track mx-6 md:mx-16 mt-4">
        <div ref={thumbRef} className="archive-scrollbar-thumb" />
      </div>
    </section>
  );
}
