"use client";

import { useRef, useState, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { usePrefersReducedMotion, useMediaQuery } from "@/hooks/useMediaQuery";
import type { HomepageProject } from "@/lib/placeholder-data";

/* ─── Constants ─── */

const DESKTOP_RATIOS = ["16/9", "4/5", "3/2", "16/9"];
const DRIFT_CLASSES = ["ep-drift-a", "ep-drift-b", "ep-drift-c"];
const COMPACT_DURATION = 600;
const COMPACT_EASING = "cubic-bezier(0.25, 0.1, 0.25, 1)";

/* ─── Project Card ─── */

type CardState = "hidden" | "revealed" | "compacted";

function ProjectCard({
  project,
  index,
  isDesktop,
  isMobile,
  prefersReduced,
  isLast,
}: {
  project: HomepageProject;
  index: number;
  isDesktop: boolean;
  isMobile: boolean;
  prefersReduced: boolean;
  isLast: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [cardState, setCardState] = useState<CardState>("hidden");
  const [imageHeight, setImageHeight] = useState<number | null>(null);

  const revealed = cardState === "revealed" || cardState === "compacted";
  const compacted = cardState === "compacted";
  const canCompact = !isMobile && !isLast;

  /* ── Reveal observer (existing behavior, unchanged) ── */
  useEffect(() => {
    if (prefersReduced) {
      setCardState((s) => (s === "hidden" ? "revealed" : s));
      return;
    }
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCardState((s) => (s === "hidden" ? "revealed" : s));
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReduced]);

  /* ── Measure natural image height after reveal (for smooth max-height transition) ── */
  useEffect(() => {
    if (
      cardState === "revealed" &&
      !isMobile &&
      imageRef.current &&
      imageHeight === null
    ) {
      requestAnimationFrame(() => {
        if (imageRef.current) {
          const h = imageRef.current.offsetHeight;
          if (h > 0) setImageHeight(h);
        }
      });
    }
  }, [cardState, imageHeight, isMobile]);

  /* ── Compact detection: scroll-based, desktop/tablet only, not last card ── */
  useEffect(() => {
    if (isMobile || isLast || cardState !== "revealed") return;

    const check = () => {
      const el = cardRef.current;
      if (!el) return false;
      if (el.getBoundingClientRect().bottom < 0) {
        setCardState("compacted");
        return true;
      }
      return false;
    };

    // Check immediately in case card is already above viewport
    if (check()) return;

    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (check()) {
          window.removeEventListener("scroll", onScroll);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [isMobile, isLast, cardState]);

  /* ── Derived values ── */

  const aspectRatio = isMobile
    ? "4/3"
    : DESKTOP_RATIOS[index % DESKTOP_RATIOS.length];

  const driftClass =
    isDesktop && !prefersReduced
      ? DRIFT_CLASSES[index % DRIFT_CLASSES.length]
      : "";

  // 180px desktop, 160px tablet
  const compactMaxHeight = isDesktop ? 180 : 160;

  /* ── Styles ── */

  /* Mobile: entire card fades up together */
  const mobileTransitions: CSSProperties =
    prefersReduced || !isMobile
      ? {}
      : {
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(30px)",
          transition:
            "opacity 800ms cubic-bezier(0.25, 0.1, 0.25, 1), transform 800ms cubic-bezier(0.25, 0.1, 0.25, 1)",
        };

  /* Spacing below card (marginBottom). Transitions from 80px to 16px on compact. */
  const spacingStyle: CSSProperties = isLast
    ? {}
    : {
        marginBottom: isMobile
          ? "48px"
          : compacted
            ? "16px"
            : "80px",
        ...(canCompact
          ? {
              transition: prefersReduced
                ? "none"
                : `margin-bottom ${COMPACT_DURATION}ms ${COMPACT_EASING}`,
            }
          : {}),
      };

  /* Desktop / tablet: image clip-path curtain reveal (bottom to top) */
  const clipProperties: CSSProperties =
    prefersReduced || isMobile
      ? {}
      : {
          clipPath: revealed ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
        };

  /* Image compact constraint */
  const compactProperties: CSSProperties =
    canCompact && imageHeight !== null
      ? {
          maxHeight: compacted
            ? `${compactMaxHeight}px`
            : `${imageHeight}px`,
        }
      : {};

  /* Build combined transition for image container */
  const imageTransitionParts: string[] = [];
  if (!prefersReduced && !isMobile) {
    imageTransitionParts.push(
      "clip-path 1.2s cubic-bezier(0.65, 0, 0.35, 1)",
    );
  }
  if (canCompact && imageHeight !== null) {
    imageTransitionParts.push(
      prefersReduced
        ? "max-height 0ms"
        : `max-height ${COMPACT_DURATION}ms ${COMPACT_EASING}`,
    );
  }

  const imageContainerStyle: CSSProperties = {
    aspectRatio,
    ...clipProperties,
    ...compactProperties,
    ...(imageTransitionParts.length > 0
      ? { transition: imageTransitionParts.join(", ") }
      : {}),
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
    <div ref={cardRef} style={{ ...mobileTransitions, ...spacingStyle }}>
      <Link
        href={`/projects/${project.slug}`}
        aria-label={`View project: ${project.title}`}
        className="ep-card block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-4"
      >
        {/* Image */}
        <div
          ref={imageRef}
          className="relative overflow-hidden"
          style={imageContainerStyle}
        >
          {/* Ken Burns drift (outer — animates independently, paused when compacted) */}
          <div
            className={`w-full h-full ${driftClass}`}
            style={
              compacted ? { animationPlayState: "paused" } : undefined
            }
          >
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

      {/* Vertical card stack — spacing via marginBottom on each card */}
      <div className="px-6 md:px-16" style={{ marginTop: "48px" }}>
        {displayProjects.map((project, i) => (
          <ProjectCard
            key={project._id}
            project={project}
            index={i}
            isDesktop={isDesktop}
            isMobile={isMobile}
            prefersReduced={prefersReduced}
            isLast={i === displayProjects.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
