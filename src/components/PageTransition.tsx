"use client";

import { ViewTransition, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

/**
 * Global page transition on every client side navigation, using the
 * browser's View Transitions API through React's <ViewTransition> (no
 * animation library, no script timing).
 *
 * Keyed by path, so each navigation is an exit of the old page and an enter
 * of the new one. One follows the other, never both at once (see "Page
 * transitions" in styles/motion.css): the old page, header and all, fades
 * out to the canvas over --dur-page-out; the new page, already at its top
 * (or where Back left it), fades in over --dur-page-in. Nothing runs on the
 * first page load; browsers without View Transitions change page normally.
 * With reduced motion no transition starts at all ("none"), so the page
 * changes at once, with no frame of the old and new pages together.
 *
 * Where the new page opens: at its top, always, unless it is Back or
 * Forward (the browser returns to where the page was left) or the link
 * names an anchor. Next.js skips the scroll when it judges the new page
 * already on screen, and misjudged project and Journal entry pages entered
 * from a page left a little scrolled (they opened part way down); this
 * makes the rule explicit (CLAUDE.md guardrail 12, tests/e2e/navigation).
 */

/** The path a Back or Forward is returning to, until that page has shown. */
let traversalTo: string | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    traversalTo = window.location.pathname;
  });
}
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const still = usePrefersReducedMotion();
  const kind = still ? "none" : "page";
  const first = useRef(true);
  // After the new page has rendered, before its snapshot is taken: it fades
  // in already at its top.
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (traversalTo === pathname) {
      traversalTo = null;
      return;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return (
    <ViewTransition
      key={pathname}
      enter={kind}
      exit={kind}
      default="none"
    >
      <div>{children}</div>
    </ViewTransition>
  );
}
