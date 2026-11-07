"use client";

import { useRef } from "react";
import SanityImage from "@/components/SanityImage";
import { useColourReveal } from "@/hooks/useColourReveal";
import type { SanityImageAsset } from "@/lib/sanityImage";

/**
 * The About page portrait, large, with the scroll driven grey to colour
 * reveal (shared hook with the homepage portrait).
 */
export default function AboutPortrait({
  image,
  alt,
}: {
  image: SanityImageAsset | string | null | undefined;
  alt: string;
}) {
  const portraitRef = useRef<HTMLDivElement>(null);
  const { revealed: saturated, prefersReducedMotion } = useColourReveal(portraitRef);

  return (
    <div ref={portraitRef} className="about-portrait relative w-full aspect-[4/5] overflow-hidden bg-secondary">
      <SanityImage
        image={image}
        context="body"
        alt={alt}
        fill
        priority
        sizes="(min-width: 1024px) 540px, 100vw"
        // Has its own grey to colour reveal: no develop on top.
        develop={false}
        className={`object-cover object-top ${saturated ? "grayscale-0" : "grayscale"} ${
          prefersReducedMotion ? "" : "transition-[filter] duration-(--dur-image) ease-(--ease-slow)"
        }`}
      />
    </div>
  );
}
