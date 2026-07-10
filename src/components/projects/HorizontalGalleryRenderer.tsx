"use client";

import { useRef } from "react";
import SanityImage from "@/components/SanityImage";
import Caption from "./Caption";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { hasImageAsset } from "@/lib/sanityImage";
import type { HorizontalGalleryBlock } from "@/lib/placeholder-data";

type Props = { section: HorizontalGalleryBlock };

/**
 * A horizontally scrollable row of images. Keyboard accessible (focus the row,
 * then use the arrow keys) with a quiet "Scroll" affordance. Honors
 * prefers-reduced-motion by jumping instantly rather than smooth-scrolling.
 */
export default function HorizontalGalleryRenderer({ section }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const images = (section.images ?? []).filter(hasImageAsset);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    const behavior: ScrollBehavior = prefersReduced ? "auto" : "smooth";
    const step = el.clientWidth * 0.8;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      el.scrollBy({ left: step, behavior });
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      el.scrollBy({ left: -step, behavior });
    }
  };

  if (images.length === 0) return null;

  return (
    <div className="project-section">
      <div
        ref={scrollRef}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Image gallery — scroll horizontally"
        className="hos-hscroll flex gap-4 md:gap-6 overflow-x-auto px-6 md:px-16 pb-4 snap-x snap-mandatory focus:outline-none focus-visible:ring-1 focus-visible:ring-border"
      >
        {images.map((img, i) => (
          <figure
            key={img.url || i}
            className="shrink-0 snap-start w-[80vw] sm:w-[58vw] md:w-[42vw] lg:w-[32vw]"
          >
            <div
              className="overflow-hidden"
              style={{
                position: "relative",
                aspectRatio: `${img.width || 4} / ${img.height || 3}`,
              }}
            >
              <SanityImage
                image={img}
                context="body"
                fill
                className="object-cover"
              />
            </div>
            <Caption text={img.caption} />
          </figure>
        ))}
      </div>
      <p
        className="mx-auto max-w-6xl px-6 md:px-16 mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40"
        aria-hidden="true"
      >
        Scroll →
      </p>
    </div>
  );
}
