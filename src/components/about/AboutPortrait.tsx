"use client";

import { useRef } from "react";
import SanityImage from "@/components/SanityImage";
import { useColourReveal } from "@/hooks/useColourReveal";
import type { SanityImageAsset } from "@/lib/sanityImage";

/**
 * The About page founder portrait with its scroll driven grey to colour
 * reveal (shared hook with the homepage portrait). The only client part of
 * the founder section; the text beside it renders on the server.
 */
export default function AboutPortrait({
  image,
  alt,
}: {
  image: SanityImageAsset | string | null | undefined;
  alt: string;
}) {
  const portraitRef = useRef<HTMLDivElement>(null);
  const { revealed: saturated, prefersReducedMotion } =
    useColourReveal(portraitRef);

  return (
    <div
      ref={portraitRef}
      className="relative w-full aspect-[7/8] overflow-hidden bg-secondary"
    >
      <SanityImage
        image={image}
        context="body"
        alt={alt}
        fill
        className={`object-cover object-top ${
          saturated ? "grayscale-0 scale-100" : "grayscale scale-[1.03]"
        } ${prefersReducedMotion ? "" : "transition-all duration-(--dur-image) ease-(--ease-slow)"}`}
      />
    </div>
  );
}
