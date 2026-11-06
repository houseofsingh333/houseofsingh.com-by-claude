"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const RISE_PX = 6;

/** A motion token from globals.css, with a fallback if it is missing. */
function token(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

/** A CSS time ("600ms", or ".6s" as the minifier writes it) in milliseconds. */
function toMs(time: string, fallback: number): number {
  const n = parseFloat(time);
  if (!Number.isFinite(n)) return fallback;
  return /ms$/.test(time) ? n : /s$/.test(time) ? n * 1000 : fallback;
}

/**
 * Global page transition on every client side navigation, using the
 * browser's Web Animations API (no animation library).
 *
 * The new page fades in while rising 6px, over --dur-page (600ms) on
 * --ease-slow, read from globals.css so the tokens stay the single source.
 * There is no fade out: in the App Router the old page is already gone when
 * the route changes. Nothing runs on the first page load, and nothing at all
 * when the visitor prefers reduced motion. The wrapper is keyed by path, so
 * pages remount on navigation as before.
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

    const duration = toMs(token("--dur-page", "600ms"), 600);
    const easing = token("--ease-slow", "cubic-bezier(0.37, 0, 0.63, 1)");
    const fadeIn = el.animate(
      [
        { opacity: 0, transform: `translateY(${RISE_PX}px)` },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration, easing },
    );
    return () => fadeIn.cancel();
  }, [pathname]);

  return (
    <div key={pathname} ref={ref}>
      {children}
    </div>
  );
}
