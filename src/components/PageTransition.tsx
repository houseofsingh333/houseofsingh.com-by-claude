"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

/**
 * Global page transition on every client side navigation, using the
 * browser's View Transitions API through React's <ViewTransition> (no
 * animation library, no script timing).
 *
 * Keyed by path, so each navigation is an exit of the old page and an enter
 * of the new one. The browser crossfades the two (see "Page transitions"
 * in styles/motion.css: --dur-page on --ease-slow). Header and footer are
 * outside the boundary and stay put. Nothing runs on the first page load; browsers
 * without View Transitions change page normally; with reduced motion the
 * change is instant (the CSS turns the animations off).
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <ViewTransition
      key={pathname}
      enter="page"
      exit="page"
      default="none"
    >
      <div>{children}</div>
    </ViewTransition>
  );
}
