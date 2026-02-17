"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const SESSION_KEY = "hos-intro-seen";
const HOLD_MS = 800;

/**
 * First-visit opening animation:
 * 1. Logo appears dead-center on a blank overlay (matches background color)
 * 2. Holds for ~800ms
 * 3. Logo scales down and translates to the header position (top-center)
 * 4. Overlay fades away to reveal page content beneath
 *
 * Uses sessionStorage so returning navigations do not replay.
 * Respects prefers-reduced-motion: skips entirely.
 */
export default function IntroLogo() {
  const prefersReduced = useReducedMotion();
  const [phase, setPhase] = useState<"hold" | "animate" | "done">("done");

  useEffect(() => {
    // Skip if reduced motion preferred
    if (prefersReduced) return;

    // Skip if already seen this session
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // sessionStorage not available (SSR, private browsing edge cases)
      return;
    }

    // First visit — run the intro
    setPhase("hold");

    // Prevent scrolling during intro
    document.body.style.overflow = "hidden";

    const holdTimer = setTimeout(() => {
      setPhase("animate");
    }, HOLD_MS);

    return () => clearTimeout(holdTimer);
  }, [prefersReduced]);

  useEffect(() => {
    if (phase === "done") {
      document.body.style.overflow = "";
    }
  }, [phase]);

  const handleAnimationComplete = () => {
    if (phase === "animate") {
      // Mark as seen
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* noop */
      }
      // Small delay after logo lands in header before revealing content
      setTimeout(() => {
        setPhase("done");
      }, 100);
    }
  };

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <>
          {/* Full-screen background overlay */}
          <motion.div
            key="intro-overlay"
            className="fixed inset-0 z-[9999] bg-background"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          />

          {/* Logo element that animates from center to header position */}
          <motion.div
            key="intro-logo"
            className="fixed z-[10000] pointer-events-none"
            initial={{
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              scale: 2.5,
              opacity: 0,
            }}
            animate={
              phase === "hold"
                ? {
                    top: "50%",
                    left: "50%",
                    x: "-50%",
                    y: "-50%",
                    scale: 2.5,
                    opacity: 1,
                  }
                : {
                    top: "20px",
                    left: "50%",
                    x: "-50%",
                    y: "0%",
                    scale: 1,
                    opacity: 1,
                  }
            }
            exit={{ opacity: 0 }}
            transition={
              phase === "hold"
                ? { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
                : {
                    duration: 0.9,
                    ease: [0.25, 0.1, 0.25, 1],
                  }
            }
            onAnimationComplete={handleAnimationComplete}
          >
            <span className="text-[11px] md:text-sm font-medium tracking-widest uppercase text-foreground whitespace-nowrap">
              House of Singh
            </span>
          </motion.div>
      </>
    </AnimatePresence>
  );
}
