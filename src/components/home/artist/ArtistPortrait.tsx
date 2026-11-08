"use client";

import { useRef } from "react";
import SanityImage from "@/components/SanityImage";
import { useColourReveal } from "@/hooks/useColourReveal";
import type { SanityImageAsset } from "@/lib/sanityImage";

/**
 * Chapter II's portrait: 4:5, with its colour reveal (it starts soft and
 * nearly grey and warms to full colour as it reaches the middle of the
 * screen; full colour at once with reduced motion), and a small caption.
 */
export default function ArtistPortrait({
  portrait,
  alt,
  caption,
}: {
  portrait: SanityImageAsset | string | null;
  alt: string;
  caption: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { revealed, prefersReducedMotion } = useColourReveal(ref);
  return (
    <figure className="m-0 flex flex-col gap-3">
      <div ref={ref} className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
        <div
          className="absolute inset-0"
          style={{
            filter: revealed ? "saturate(1) brightness(1)" : "saturate(0.15) brightness(1.05)",
            transition: prefersReducedMotion ? "none" : "filter var(--dur-image) var(--ease-slow)",
          }}
        >
          <SanityImage
            image={portrait}
            context="body"
            alt={alt}
            fill
            sizes="(min-width: 1024px) 440px, 100vw"
            // Has its own grey to colour reveal: no develop on top.
            develop={false}
            className="object-cover [object-position:35%_20%]"
          />
        </div>
      </div>
      <figcaption className="type-label text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}
