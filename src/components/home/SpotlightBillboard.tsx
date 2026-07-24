"use client";

import { useRef, useState, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { usePrefersReducedMotion, useMediaQuery } from "@/hooks/useMediaQuery";
import type { SpotlightData } from "@/lib/types";

type Props = {
  spotlight: SpotlightData;
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

export default function SpotlightBillboard({ spotlight }: Props) {
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

  if (!spotlight.image) return null;
  if (
    typeof spotlight.image === "object" &&
    spotlight.image !== null &&
    !("url" in spotlight.image && spotlight.image.url)
  )
    return null;

  const isExternal =
    spotlight.linkUrl?.startsWith("http://") ||
    spotlight.linkUrl?.startsWith("https://");

  return (
    <section
      ref={sectionRef}
      aria-labelledby={spotlight.title ? TITLE_ID : undefined}
      className="spotlight-section"
    >
      {/* ── Background image with cinematic filter ── */}
      <div className="spotlight-img-wrap" aria-hidden="true">
        <SanityImage
          image={spotlight.image}
          context="banner"
          alt=""
          priority={false}
          fill
          className={`spotlight-img${isDesktop && !prefersReduced ? " spotlight-kb" : ""}`}
        />
      </div>

      {/* ── Gradient overlay ── */}
      <div className="spotlight-gradient" aria-hidden="true" />

      {/* ── Film grain texture ── */}
      <div className="spotlight-grain" aria-hidden="true" />

      {/* ── Content layer ── */}
      <div className="spotlight-content">
        <div className="spotlight-content-inner">
          {/* Label with dash prefix */}
          {spotlight.label && (
            <p
              className="spotlight-label"
              style={revealStyle(revealed, 20, 600, 0, prefersReduced)}
            >
              <span className="spotlight-label-dash" aria-hidden="true" />
              {spotlight.label}
            </p>
          )}

          {/* Title */}
          {spotlight.title && (
            <h2
              id={TITLE_ID}
              className="spotlight-title-el"
              style={revealStyle(revealed, 30, 700, 150, prefersReduced)}
            >
              {spotlight.title}
            </h2>
          )}

          {/* Teaser */}
          {spotlight.teaser && (
            <p
              className="spotlight-teaser"
              style={revealStyle(revealed, 25, 600, 300, prefersReduced)}
            >
              {spotlight.teaser}
            </p>
          )}

          {/* CTA */}
          {spotlight.linkText && spotlight.linkUrl && (
            <div style={revealStyle(revealed, 20, 500, 450, prefersReduced)}>
              {isExternal ? (
                <a
                  href={spotlight.linkUrl}
                  className="spotlight-cta"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${spotlight.linkText} (opens in new tab)`}
                >
                  {spotlight.linkText}
                  <span className="spotlight-cta-arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </a>
              ) : (
                <Link
                  href={spotlight.linkUrl}
                  className="spotlight-cta"
                  aria-label={spotlight.linkText}
                >
                  {spotlight.linkText}
                  <span className="spotlight-cta-arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Category tag (vertical, bottom right) ── */}
      {spotlight.category && (
        <div
          className="spotlight-category"
          style={revealStyle(revealed, 0, 800, 600, prefersReduced)}
          aria-hidden="true"
        >
          {spotlight.category}
        </div>
      )}
    </section>
  );
}
