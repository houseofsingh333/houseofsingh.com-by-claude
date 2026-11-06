"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { EASE_SLOW } from "@/lib/animation";

/** EASE_SLOW as a CSS easing string for the Web Animations API. */
const EASE = `cubic-bezier(${EASE_SLOW.join(", ")})`;
const FADE_OUT_MS = 150;
const FADE_IN_MS = 200;
const RISE_PX = 6;

/**
 * Global page transition on every client side navigation, using the
 * browser's Web Animations API (no animation library).
 *
 * Same sequence and timing as the earlier motion library version: the
 * content fades out over 150 ms, then fades in over 200 ms while rising
 * 6px, both on EASE_SLOW. Nothing runs on the first page load, and nothing
 * runs at all when the visitor prefers reduced motion. The wrapper is keyed
 * by path, so pages remount on navigation exactly as before.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const firstPath = useRef(pathname);

  // Layout effect: starts in the same frame the new route is committed, as
  // the motion library did, so no frame shows the page before the fade.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || pathname === firstPath.current) return;
    firstPath.current = pathname;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fadeOut = el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: FADE_OUT_MS,
      easing: EASE,
      fill: "forwards",
    });
    let fadeIn: Animation | null = null;
    fadeOut.finished
      .then(() => {
        fadeIn = el.animate(
          [
            { opacity: 0, transform: `translateY(${RISE_PX}px)` },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: FADE_IN_MS, easing: EASE },
        );
        fadeOut.cancel();
      })
      .catch(() => {
        /* cancelled by a newer navigation */
      });

    return () => {
      fadeOut.cancel();
      fadeIn?.cancel();
    };
  }, [pathname]);

  return (
    <div key={pathname} ref={ref}>
      {children}
    </div>
  );
}
