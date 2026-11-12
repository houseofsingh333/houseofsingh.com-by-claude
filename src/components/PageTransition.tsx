"use client";

import { ViewTransition } from "react";
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
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const still = usePrefersReducedMotion();
  const kind = still ? "none" : "page";
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
