"use client";

import { useRef } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { usePrefersReducedMotion, useMediaQuery } from "@/hooks/useMediaQuery";
import { useInView } from "@/hooks/useInView";
import { revealProps } from "@/lib/reveal";
import type { SpotlightData } from "@/lib/types";

type Props = {
  spotlight: SpotlightData;
};

const TITLE_ID = "spotlight-billboard-title";

export default function SpotlightBillboard({ spotlight }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // The text fades in, staggered, once the section is in view. CSS shows it
  // immediately under reduced motion or without JavaScript (revealProps).
  const revealed = useInView(sectionRef, { threshold: 0.15 });

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
              {...revealProps({ revealed, delay: 0 })}
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
              {...revealProps({ revealed, delay: 150 })}
            >
              {spotlight.title}
            </h2>
          )}

          {/* Teaser */}
          {spotlight.teaser && (
            <p
              className="spotlight-teaser"
              {...revealProps({ revealed, delay: 300 })}
            >
              {spotlight.teaser}
            </p>
          )}

          {/* CTA */}
          {spotlight.linkText && spotlight.linkUrl && (
            <div {...revealProps({ revealed, delay: 450 })}>
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
          {...revealProps({ revealed, rise: false, delay: 600 })}
          aria-hidden="true"
        >
          {spotlight.category}
        </div>
      )}
    </section>
  );
}
