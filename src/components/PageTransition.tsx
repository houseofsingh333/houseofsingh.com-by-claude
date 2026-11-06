"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { EASE_SLOW } from "@/lib/animation";

/** EASE_SLOW as a CSS easing string for the Web Animations API. */
const EASE = `cubic-bezier(${EASE_SLOW.join(", ")})`;
const FADE_IN_MS = 200;
const RISE_PX = 6;

/**
 * Global page transition on every client side navigation, using the
 * browser's Web Animations API (no animation library).
 *
 * The new page fades in over 200 ms while rising 6px, on EASE_SLOW. There
 * is no fade out: in the App Router the old page is already gone when the
 * route changes, so fading "it" out only flashed the new page to blank and
 * back. Nothing runs on the first page load, and nothing runs at all when
 * the visitor prefers reduced motion. The wrapper is keyed by path, so pages
 * remount on navigation as before.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const firstPath = useRef(pathname);

  // Layout effect: the fade in is applied before the new page is first
  // painted, so the page never shows at full opacity before it starts.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || pathname === firstPath.current) return;
    firstPath.current = pathname;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fadeIn = el.animate(
      [
        { opacity: 0, transform: `translateY(${RISE_PX}px)` },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: FADE_IN_MS, easing: EASE },
    );
    return () => fadeIn.cancel();
  }, [pathname]);

  return (
    <div key={pathname} ref={ref}>
      {children}
    </div>
  );
}
