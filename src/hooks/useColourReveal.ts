"use client";

import { useEffect, useState, type RefObject } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "./useMediaQuery";

/**
 * Shared grayscale-to-colour reveal policy for the founder portraits.
 *
 * Extracted from the homepage IntroSection, which already implemented this,
 * so the homepage and About page portraits share one behaviour and cannot
 * drift apart.
 *
 *   - Desktop (1024px+): reveals on hover, as before.
 *   - Below 1024px: no hover exists on touch, so it reveals on scroll via
 *     IntersectionObserver at threshold 0.5 — full colour once the portrait
 *     sits around the middle of the viewport. Fires once, then disconnects.
 *   - Reduced motion: full colour immediately, with no transition. (Both
 *     components previously left the portrait permanently grey here, which
 *     was a bug: the image never reached its intended state.)
 *
 * @param ref the element to observe
 */
export function useColourReveal(ref: RefObject<HTMLElement | null>) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isHovered, setIsHovered] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // Desktop uses hover; reduced motion is already fully coloured.
    if (isDesktop || prefersReducedMotion) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, isDesktop, prefersReducedMotion]);

  const saturated = prefersReducedMotion
    ? true
    : isDesktop
      ? isHovered
      : inView;

  /** Spread onto the hover target. Desktop only — no-ops elsewhere. */
  const hoverHandlers =
    isDesktop && !prefersReducedMotion
      ? {
          onMouseEnter: () => setIsHovered(true),
          onMouseLeave: () => setIsHovered(false),
        }
      : {};

  return { saturated, isDesktop, prefersReducedMotion, hoverHandlers };
}
