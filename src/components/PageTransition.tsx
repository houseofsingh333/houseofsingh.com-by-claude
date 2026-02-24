"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { EASE_SLOW } from "@/lib/animation";

/**
 * Global page transition — wraps route content with a subtle
 * crossfade + translateY on every client-side navigation.
 *
 * Fade out  ~150 ms → Fade in ~200 ms  (total ≤ 300 ms perceived)
 * Respects prefers-reduced-motion.
 * Skips animation for Sanity Studio routes.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  // Studio routes — skip wrapper entirely
  if (pathname.startsWith("/studio")) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: prefersReduced ? 0 : 6 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration: prefersReduced ? 0 : 0.2,
            ease: EASE_SLOW,
          },
        }}
        exit={{
          opacity: 0,
          transition: {
            duration: prefersReduced ? 0 : 0.15,
            ease: EASE_SLOW,
          },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
