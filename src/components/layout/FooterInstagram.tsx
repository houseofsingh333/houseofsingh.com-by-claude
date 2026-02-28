"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import type { InstagramPhoto } from "@/components/contact/InstagramPhotoPlate";

type Props = {
  photos: InstagramPhoto[];
};

/**
 * Compact square Instagram crossfade for the footer.
 * Cycles through curated Instagram photos with CSS opacity transitions.
 */
export default function FooterInstagram({ photos }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReduced = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(true);

  const handleVisibility = useCallback(() => {
    setIsVisible(document.visibilityState === "visible");
  }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [handleVisibility]);

  useEffect(() => {
    if (photos.length <= 1 || prefersReduced || !isVisible) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % photos.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [photos.length, prefersReduced, isVisible]);

  if (photos.length === 0) return null;

  return (
    <div
      className="footer-ig-container"
      style={{ maxWidth: 280, aspectRatio: "1 / 1", overflow: "hidden" }}
    >
      <div className="footer-ig-drift" style={{ position: "relative", width: "100%", height: "100%" }}>
        {photos.map((photo, i) => (
          <img
            key={photo.id}
            src={photo.url}
            alt={photo.alt || "Instagram photo"}
            loading={i === 0 ? "eager" : "lazy"}
            className="instagram-plate-img"
            style={{
              opacity: i === activeIndex ? 1 : 0,
              transition: prefersReduced
                ? "none"
                : "opacity 1.4s ease-in-out",
            }}
          />
        ))}
      </div>
    </div>
  );
}
