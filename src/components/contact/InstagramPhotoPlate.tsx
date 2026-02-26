"use client";

import { useState, useEffect, useCallback } from "react";

export type InstagramPhoto = {
  id: string;
  url: string;
  permalink: string;
  alt: string;
};

type Props = {
  photos: InstagramPhoto[];
  /** Crossfade interval in ms. Default 8000. */
  interval?: number;
  /** CSS transition duration for crossfade. Default "1.2s". */
  fadeDuration?: string;
};

/**
 * Rotating portrait image plate — editorial crossfade through
 * curated Instagram photos managed in Sanity.
 *
 * Follows the same crossfade pattern as PreviewMedia.tsx:
 * CSS opacity transitions, reduced-motion detection, Page Visibility API.
 */
export default function InstagramPhotoPlate({
  photos,
  interval = 8000,
  fadeDuration = "1.2s",
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Detect reduced-motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Page Visibility API — pause rotation when tab is hidden
  const handleVisibility = useCallback(() => {
    setIsVisible(document.visibilityState === "visible");
  }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [handleVisibility]);

  // Crossfade timer
  useEffect(() => {
    if (photos.length <= 1 || prefersReduced || !isVisible) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % photos.length);
    }, interval);

    return () => clearInterval(timer);
  }, [photos.length, interval, prefersReduced, isVisible]);

  if (photos.length === 0) return null;

  const currentPhoto = photos[activeIndex];

  return (
    <div className="relative w-full">
      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
        Instagram
      </p>

      <a
        href={currentPhoto.permalink}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative aspect-[4/5] overflow-hidden border border-border bg-secondary/30"
        aria-label="View on Instagram"
      >
        <div
          style={
            { "--plate-fade-duration": fadeDuration } as React.CSSProperties
          }
          className="absolute inset-0"
        >
          {photos.map((photo, i) => (
            <img
              key={photo.id}
              src={photo.url}
              alt={photo.alt || "Instagram photo"}
              loading={i === 0 ? "eager" : "lazy"}
              className="instagram-plate-img"
              style={{ opacity: i === activeIndex ? 1 : 0 }}
            />
          ))}
        </div>
      </a>
    </div>
  );
}
