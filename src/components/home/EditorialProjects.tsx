"use client";

import { useRef, useState, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { usePrefersReducedMotion, useMediaQuery } from "@/hooks/useMediaQuery";
import type { HomepageProject } from "@/lib/placeholder-data";

/* ─── Constants ─── */

const DESKTOP_RATIOS = ["16/9", "4/5", "3/2", "16/9"];
const DRIFT_CLASSES = ["ep-drift-a", "ep-drift-b", "ep-drift-c"];

/* ─── Project Card ─── */

function ProjectCard({
  project,
  index,
  isDesktop,
  isMobile,
  prefersReduced,
}: {
  project: HomepageProject;
  index: number;
  isDesktop: boolean;
  isMobile: boolean;
  prefersReduced: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (prefersReduced) {
      setRevealed(true);
      return;
    }
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReduced]);

  const aspectRatio = isMobile
    ? "4/3"
    : DESKTOP_RATIOS[index % DESKTOP_RATIOS.length];
  const driftClass =
    isDesktop && !prefersReduced
      ? DRIFT_CLASSES[index % DRIFT_CLASSES.length]
      : "";

  /* Mobile: entire card fades up together */
  const cardStyle: CSSProperties =
    prefersReduced || !isMobile
      ? {}
      : {
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(30px)",
          transition:
            "opacity 800ms cubic-bezier(0.25, 0.1, 0.25, 1), transform 800ms cubic-bezier(0.25, 0.1, 0.25, 1)",
        };

  /* Desktop / tablet: image clip-path curtain reveal (bottom to top) */
  const clipStyle: CSSProperties =
    prefersReduced || isMobile
      ? {}
      : {
          clipPath: revealed ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
          transition: "clip-path 1.2s cubic-bezier(0.65, 0, 0.35, 1)",
        };

  /* Desktop / tablet: text fades up 200ms after clip starts */
  const textStyle: CSSProperties =
    prefersReduced || isMobile
      ? {}
      : {
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(20px)",
          transition:
            "opacity 700ms cubic-bezier(0.25, 0.1, 0.25, 1) 200ms, transform 700ms cubic-bezier(0.25, 0.1, 0.25, 1) 200ms",
        };

  return (
    <div ref={cardRef} style={cardStyle}>
      <Link
        href={`/projects/${project.slug}`}
        aria-label={`View project: ${project.title}`}
        className="ep-card block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-4"
      >
        {/* Image */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio, ...clipStyle }}
        >
          {/* Ken Burns drift (outer — animates independently) */}
          <div className={`w-full h-full ${driftClass}`}>
            {/* Hover zoom (inner — composes with drift) */}
            <div className="w-full h-full will-change-transform ep-img-zoom">
              <SanityImage
                image={project.thumbnail}
                context="hero"
                alt={project.thumbnailAlt}
                fill
                priority={false}
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* Text */}
        <div style={{ marginTop: "16px", ...textStyle }}>
          <p
            className="uppercase"
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              color: "var(--muted-foreground)",
              lineHeight: 1.4,
            }}
          >
            {project.category}
          </p>
          <h3
            className="ep-card-title font-medium text-foreground"
            style={{
              fontSize: isMobile ? "16px" : "20px",
              lineHeight: 1.3,
              marginTop: "6px",
            }}
          >
            {project.title}
          </h3>
        </div>
      </Link>
    </div>
  );
}

/* ─── Main export ─── */

type Props = {
  projects: HomepageProject[];
};

export default function EditorialProjects({ projects }: Props) {
  const prefersReduced = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 767px)");

  const displayProjects = projects.slice(0, 4);

  return (
    <section
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

      {/* Vertical card stack */}
      <div className="px-6 md:px-16" style={{ marginTop: "48px" }}>
        {displayProjects.map((project, i) => (
          <div
            key={project._id}
            style={{
              marginTop: i > 0 ? (isMobile ? "48px" : "80px") : undefined,
            }}
          >
            <ProjectCard
              project={project}
              index={i}
              isDesktop={isDesktop}
              isMobile={isMobile}
              prefersReduced={prefersReduced}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
