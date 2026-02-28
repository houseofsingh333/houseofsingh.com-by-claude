"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { usePrefersReducedMotion, useMediaQuery } from "@/hooks/useMediaQuery";
import type { HomepageProject } from "@/lib/placeholder-data";

/* ─── Layout configuration ─── */

type GridPosition = {
  gridColumn: string;
  gridRow: string;
  aspectRatio: string;
  marginTop?: string;
  sizes: string;
};

const LAYOUT_3: GridPosition[] = [
  {
    gridColumn: "1 / 8",
    gridRow: "1 / 3",
    aspectRatio: "4/5",
    sizes: "(min-width: 1280px) 58vw, (min-width: 768px) 100vw, 100vw",
  },
  {
    gridColumn: "8 / 13",
    gridRow: "1",
    aspectRatio: "3/2",
    marginTop: "80px",
    sizes: "(min-width: 1280px) 41vw, (min-width: 768px) 50vw, 100vw",
  },
  {
    gridColumn: "5 / 10",
    gridRow: "3",
    aspectRatio: "16/9",
    marginTop: "-40px",
    sizes: "(min-width: 1280px) 41vw, (min-width: 768px) 100vw, 100vw",
  },
];

const LAYOUT_4: GridPosition[] = [
  {
    gridColumn: "1 / 8",
    gridRow: "1 / 3",
    aspectRatio: "4/5",
    sizes: "(min-width: 1280px) 58vw, (min-width: 768px) 100vw, 100vw",
  },
  {
    gridColumn: "8 / 13",
    gridRow: "1",
    aspectRatio: "3/2",
    marginTop: "80px",
    sizes: "(min-width: 1280px) 41vw, (min-width: 768px) 50vw, 100vw",
  },
  {
    gridColumn: "1 / 5",
    gridRow: "3",
    aspectRatio: "1/1",
    sizes: "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw",
  },
  {
    gridColumn: "6 / 11",
    gridRow: "3",
    aspectRatio: "16/9",
    marginTop: "-40px",
    sizes: "(min-width: 1280px) 41vw, (min-width: 768px) 100vw, 100vw",
  },
];

/* Ken Burns animation class names (defined in globals.css) */
const DRIFT_CLASSES = [
  "kb-drift-a",
  "kb-drift-b",
  "kb-drift-c",
  "kb-drift-d",
];

/* ─── Project Card ─── */

function ProjectCard({
  project,
  index,
  layout,
  isDesktop,
  isInView,
  staggerDelay,
  prefersReducedMotion,
}: {
  project: HomepageProject;
  index: number;
  layout: GridPosition;
  isDesktop: boolean;
  isInView: boolean;
  staggerDelay: number;
  prefersReducedMotion: boolean;
}) {
  const driftClass = DRIFT_CLASSES[index % DRIFT_CLASSES.length];

  return (
    <Link
      href={`/projects/${project.slug}`}
      aria-label={`View project: ${project.title}`}
      className="pg-card group outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-4 block"
      style={{
        gridColumn: layout.gridColumn,
        gridRow: layout.gridRow,
        marginTop: layout.marginTop ?? undefined,
        opacity: prefersReducedMotion ? 1 : isInView ? 1 : 0,
        transform: prefersReducedMotion
          ? "none"
          : isInView
            ? "translateY(0)"
            : "translateY(40px)",
        transition: prefersReducedMotion
          ? "none"
          : `opacity 800ms cubic-bezier(0.25, 0.1, 0.25, 1) ${staggerDelay}ms, transform 800ms cubic-bezier(0.25, 0.1, 0.25, 1) ${staggerDelay}ms`,
      }}
    >
      {/* Image container */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: layout.aspectRatio }}
      >
        <div
          className={`w-full h-full will-change-transform pg-img-zoom ${isDesktop ? driftClass : ""}`}
        >
          <SanityImage
            image={project.thumbnail}
            context="thumbnail"
            alt={project.thumbnailAlt}
            fill
            className="object-cover object-center w-full h-full"
          />
        </div>
      </div>

      {/* Text block */}
      <div className="mt-4">
        <p
          className="uppercase leading-[1.4]"
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            color: "var(--muted-foreground)",
          }}
        >
          {project.category}
        </p>
        <h3
          className="pg-card-title font-medium leading-[1.3] mt-1.5 text-foreground"
          style={{ fontSize: "clamp(16px, 1.25vw, 20px)" }}
        >
          {project.title}
        </h3>
      </div>
    </Link>
  );
}

/* ─── Main export ─── */

type Props = {
  projects: HomepageProject[];
};

export default function ProjectsGrid({ projects }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const isHoveringRef = useRef(false);

  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isInView, setIsInView] = useState(false);

  // Determine layout: 3 or 4 projects
  const displayProjects = projects.length >= 4 ? projects.slice(0, 4) : projects.slice(0, 3);
  const layoutConfig = displayProjects.length >= 4 ? LAYOUT_4 : LAYOUT_3;

  /* ── Intersection Observer for scroll entrance ── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  /* ── Cursor follower (desktop only) ── */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isHoveringRef.current) return;
    const cursor = cursorRef.current;
    if (!cursor) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      cursor.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 16}px)`;
    });
  }, []);

  const handleCardEnter = useCallback(() => {
    isHoveringRef.current = true;
    const cursor = cursorRef.current;
    if (cursor) {
      cursor.style.opacity = "1";
      cursor.style.scale = "1";
    }
  }, []);

  const handleCardLeave = useCallback(() => {
    isHoveringRef.current = false;
    const cursor = cursorRef.current;
    if (cursor) {
      cursor.style.opacity = "0";
      cursor.style.scale = "0.8";
    }
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll<HTMLElement>(".pg-card");

    cards.forEach((card) => {
      card.addEventListener("mouseenter", handleCardEnter);
      card.addEventListener("mouseleave", handleCardLeave);
    });

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      cards.forEach((card) => {
        card.removeEventListener("mouseenter", handleCardEnter);
        card.removeEventListener("mouseleave", handleCardLeave);
      });
      document.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isDesktop, handleMouseMove, handleCardEnter, handleCardLeave, displayProjects.length]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="projects-heading"
      className="section-py"
      style={{ paddingBottom: "80px" }}
    >
      {/* Section header */}
      <div className="px-6 md:px-16">
        <div className="flex items-baseline justify-between">
          <p
            id="projects-heading"
            className="text-xs tracking-widest uppercase text-muted-foreground"
          >
            Projects
          </p>
          <Link
            href="/projects"
            className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            See all
          </Link>
        </div>
        <div className="w-full h-px bg-border mt-4" />
      </div>

      {/* Broken grid */}
      <div
        className="px-6 md:px-16 mt-12 pg-grid"
        style={{ gap: "24px 20px" }}
      >
        {displayProjects.map((project, i) => (
          <ProjectCard
            key={project._id}
            project={project}
            index={i}
            layout={layoutConfig[i]}
            isDesktop={isDesktop}
            isInView={isInView}
            staggerDelay={i * 120}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>

      {/* Cursor follower (desktop only) */}
      {isDesktop && (
        <div
          ref={cursorRef}
          className="fixed top-0 left-0 pointer-events-none z-50"
          style={{
            opacity: 0,
            scale: "0.8",
            transition: "opacity 300ms ease-out, scale 300ms ease-out",
            willChange: "transform",
          }}
        >
          <span
            style={{
              display: "block",
              background: "var(--foreground)",
              color: "var(--background)",
              fontSize: "12px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              padding: "8px 14px",
              borderRadius: "0",
              lineHeight: 1,
            }}
          >
            View
          </span>
        </div>
      )}
    </section>
  );
}
