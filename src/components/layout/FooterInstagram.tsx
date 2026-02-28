"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import type { InstagramPhoto } from "@/components/contact/InstagramPhotoPlate";

type Props = {
  photos: InstagramPhoto[];
  /** Crossfade interval in ms. Default 5000. */
  interval?: number;
  /** CSS transition duration for crossfade. Default "1.2s". */
  fadeDuration?: string;
};

/**
 * Compact square Instagram crossfade for the footer.
 * Cycles through curated Instagram photos with CSS opacity transitions.
 * Uses the same data source as the contact page InstagramPhotoPlate.
 */
export default function FooterInstagram({
  photos,
  interval = 5000,
  fadeDuration = "1.2s",
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReduced = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(true);

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
    <div>
      <a
        href={currentPhoto.permalink || "https://www.instagram.com/houseofsingh"}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative aspect-square w-full overflow-hidden bg-secondary/20"
        aria-label="View on Instagram"
      >
        <div
          style={
            { "--plate-fade-duration": fadeDuration } as React.CSSProperties
          }
          className="absolute inset-0 footer-ig-drift"
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

      {/* INSTAGRAM label */}
      <a
        href="https://www.instagram.com/houseofsingh"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-3 text-[10px] tracking-widest uppercase text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-300"
      >
        Instagram
      </a>
    </div>
  );
}
