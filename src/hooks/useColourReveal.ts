"use client";

import type { RefObject } from "react";
import { useInView } from "./useInView";
import { usePrefersReducedMotion } from "./useMediaQuery";

/**
 * Scroll-driven grayscale-to-colour reveal for the founder portraits.
 *
 * One code path for every device. There is deliberately no width breakpoint
 * and no input-capability detection: an earlier version treated 1024px+ as
 * "desktop" and used hover there, which left iPads in landscape (1024px wide,
 * no hover) permanently grey.
 *
 * Uses the same viewport-band trigger as the journal cards rather than a
 * visibility ratio. `threshold: 0.5` requires half the element to be on
 * screen, which an element taller than twice the viewport can never satisfy —
 * it would silently never fire. A negative `rootMargin` shrinks the observer
 * root to a band across the middle of the viewport and fires as soon as any
 * part of the element enters it, so behaviour does not depend on the image's
 * height at all.
 *
 * Fires once (useInView). Under reduced motion it reports revealed
 * immediately so the portrait renders in full colour with no transition.
 *
 * @param ref the element to observe
 */
export function useColourReveal(ref: RefObject<HTMLElement | null>) {
  const prefersReducedMotion = usePrefersReducedMotion();
  // Middle 30% band of the viewport — matches the journal cards.
  const inView = useInView(ref, { rootMargin: "-35% 0px -35% 0px" });

  return {
    /** True once the portrait should be shown in full colour. */
    revealed: prefersReducedMotion ? true : inView,
    prefersReducedMotion,
  };
}
