"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { EASE_SMOOTH } from "@/lib/animation";

const SESSION_KEY = "hos-intro-seen";
const HOLD_MS = 800;
const LOGO_SRC = "/images/hos-logo.svg";

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
          transition={{ duration: 0.8, ease: EASE_SMOOTH }}
        />

        {/* Logo that animates from center to header position */}
        <motion.div
          key="intro-logo"
          className="fixed z-[10000] pointer-events-none"
          initial={{
            top: "50%",
            left: "50%",
            x: "-50%",
            y: "-50%",
            scale: 1,
            opacity: 0,
          }}
          animate={
            phase === "hold"
              ? {
                  top: "50%",
                  left: "50%",
                  x: "-50%",
                  y: "-50%",
                  scale: 1,
                  opacity: 1,
                }
              : {
                  top: "6px",
                  left: "50%",
                  x: "-50%",
                  y: "0%",
                  scale: 0.48,
                  opacity: 1,
                }
          }
          exit={{ opacity: 0 }}
          transition={
            phase === "hold"
              ? { duration: 0.6, ease: EASE_SMOOTH }
              : {
                  duration: 2.2,
                  ease: [0.16, 1, 0.3, 1],
                }
          }
          onAnimationComplete={handleAnimationComplete}
        >
          <Image
            src={LOGO_SRC}
            alt="House of Singh"
            width={300}
            height={300}
            priority
          />
        </motion.div>
      </>
    </AnimatePresence>
  );
}
