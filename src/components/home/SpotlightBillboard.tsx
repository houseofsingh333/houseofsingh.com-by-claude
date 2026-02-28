"use client";

import { useRef, useState, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { usePrefersReducedMotion, useMediaQuery } from "@/hooks/useMediaQuery";
import type { SpotlightProject } from "@/lib/placeholder-data";

type Props = {
  project: SpotlightProject;
};

function revealStyle(
  revealed: boolean,
  translateY: number,
  duration: number,
  delay: number,
  prefersReduced: boolean,
): CSSProperties {
  if (prefersReduced) return {};
  return {
    opacity: revealed ? 1 : 0,
    transform: revealed ? "translateY(0px)" : `translateY(${translateY}px)`,
    transition: `opacity ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}ms`,
  };
}

const TITLE_ID = "spotlight-billboard-title";

export default function SpotlightBillboard({ project }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const prefersReduced = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (prefersReduced) {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReduced]);

  const ctaHref = `/projects/${project.slug}`;

  return (
    <section
      ref={sectionRef}
      aria-labelledby={TITLE_ID}
      className="spotlight-section"
    >
      {/* ── Image layer ── */}
      <div
        className="spotlight-img-wrap"
        role="img"
        aria-label={project.title}
      >
        <SanityImage
          image={project.image}
          context="hero"
          alt={project.title}
          priority={false}
          fill
          className={`object-cover object-center${isDesktop && !prefersReduced ? " spotlight-kb" : ""}`}
        />
      </div>

      {/* ── Content layer ── */}
      <div className="spotlight-content">
        <div className="spotlight-content-inner">
          {/* Section label */}
          <p
            className="spotlight-label"
            style={revealStyle(revealed, 20, 600, 0, prefersReduced)}
          >
            Spotlight
          </p>

          {/* Title */}
          <h2
            id={TITLE_ID}
            className="spotlight-title-el"
            style={revealStyle(revealed, 30, 700, 150, prefersReduced)}
          >
            {project.title}
          </h2>

          {/* Description */}
          {project.description && (
            <p
              className="spotlight-desc"
              style={revealStyle(revealed, 25, 600, 300, prefersReduced)}
            >
              {project.description}
            </p>
          )}

          {/* CTA */}
          <div style={revealStyle(revealed, 20, 500, 450, prefersReduced)}>
            <Link
              href={ctaHref}
              className="spotlight-cta"
              aria-label={`View project: ${project.title}`}
            >
              View project
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
