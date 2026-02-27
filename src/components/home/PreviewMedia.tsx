"use client";

import { useState, useEffect } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

type ImageItem = {
  url: string;
  alt?: string;
  lqip?: string;
};

type Props = {
  title: string;
  gifUrl?: string | null;
  images?: ImageItem[] | null;
  /** Crossfade interval in ms. Default 8000. */
  interval?: number;
  /** CSS transition duration for crossfade. Default "2s". */
  fadeDuration?: string;
  /** Additional className for the outer container. */
  className?: string;
};

/**
 * Shared preview media renderer — GIF (priority), crossfading image
 * array, or a subtle fallback placeholder.
 *
 * Used by both mobile CategoryBlock and the desktop Projects columns.
 * Crossfade timing is configurable via props so each context can set
 * its own editorial pace.
 */
export default function PreviewMedia({
  title,
  gifUrl,
  images,
  interval = 8000,
  fadeDuration = "2s",
  className = "",
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReduced = usePrefersReducedMotion();

  // Crossfade timer — only for image arrays with 2+ items
  useEffect(() => {
    if (gifUrl || !images || images.length <= 1 || prefersReduced) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [gifUrl, images, interval, prefersReduced]);

  return (
    <div
      className={className}
      style={{ "--preview-fade-duration": fadeDuration } as React.CSSProperties}
    >
      {gifUrl ? (
        <img
          src={gifUrl}
          alt={`${title} preview`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : images && images.length > 0 ? (
        images.map((img, i) => (
          <img
            key={img.url}
            src={img.url}
            alt={img.alt || `${title} preview`}
            loading={i === 0 ? "eager" : "lazy"}
            className="preview-media-img"
            style={{ opacity: i === activeIndex ? 1 : 0 }}
          />
        ))
      ) : (
        <div className="w-full h-full bg-secondary/30" />
      )}
    </div>
  );
}
