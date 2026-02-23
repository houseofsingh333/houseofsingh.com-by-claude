"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/** Matches hero slider feel: 1.5 s crossfade, 6 s per image. */
const SLIDE_INTERVAL = 6000;

type ImageItem = {
  url: string;
  alt?: string;
  lqip?: string;
};

type Props = {
  title: string;
  href: string;
  gifUrl?: string | null;
  images?: ImageItem[] | null;
};

/**
 * A single category block for the homepage Projects section.
 *
 * Renders:
 *   A. Header row — title (left) + "View →" (right), fully clickable Link.
 *   B. Image preview — GIF (priority) or crossfading image array.
 *
 * The header row retains the existing `projects-mobile-link` sticky + underline
 * interaction. The image area scrolls naturally and never blocks tap targets.
 */
export default function CategoryBlock({
  title,
  href,
  gifUrl,
  images,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReduced, setPrefersReduced] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Crossfade timer — only for image arrays with 2+ items
  useEffect(() => {
    if (gifUrl || !images || images.length <= 1 || prefersReduced) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [gifUrl, images, prefersReduced]);

  const hasMedia = !!gifUrl || (!!images && images.length > 0);

  return (
    <>
      {/* ── A. Header row — fully clickable ── */}
      <Link href={href} className="projects-mobile-link">
        <span className="projects-mobile-title font-editorial text-[15px] font-light tracking-wide">
          {title}
        </span>
        <span className="projects-mobile-arrow inline-flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-muted-foreground/50">
          <span>View</span>
          <span>→</span>
        </span>
      </Link>

      {/* ── B. Image preview area ── */}
      <div className="relative aspect-[3/2] overflow-hidden">
        {gifUrl ? (
          /* GIF — single animated image */
          <img
            src={gifUrl}
            alt={`${title} preview`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : images && images.length > 0 ? (
          /* Crossfade slideshow */
          images.map((img, i) => (
            <img
              key={img.url}
              src={img.url}
              alt={img.alt || `${title} preview`}
              loading={i === 0 ? "eager" : "lazy"}
              className="category-preview-img"
              style={{ opacity: i === activeIndex ? 1 : 0 }}
            />
          ))
        ) : (
          /* Fallback — subtle placeholder to maintain layout */
          <div className="w-full h-full bg-secondary/50" />
        )}
      </div>
    </>
  );
}
