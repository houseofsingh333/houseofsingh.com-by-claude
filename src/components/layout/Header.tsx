"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import NavOverlay from "./NavOverlay";
import NewsletterModal from "@/components/NewsletterModal";
import type { NavItem } from "@/lib/placeholder-data";

/* ═══════════════════════════════════════════════════════════════════
   TUNING KNOBS — adjust these to match slowness.com precisely
   ═══════════════════════════════════════════════════════════════════ */

/** Multiplier applied to viewport height to set total fade distance.
 *  1.0 = one full viewport of scrolling to fully fade.
 *  Lower (0.4-0.6) = quicker fade.  Higher (1.2-1.5) = slower fade.
 *  slowness.com uses roughly 0.7–0.9. */
const FADE_DISTANCE_MULTIPLIER = 0.85;

/** Max upward drift (px) on the crest as it fades out.
 *  Creates a gentle "lift-away" feel.  0 = no movement. */
const MAX_TRANSLATE_PX = 8;

/** Px of scroll before fade begins.  0 = start immediately.
 *  Set to 40-60 if you want a "dead zone" at the very top. */
const START_OFFSET_PX = 0;

/** Progress threshold at which State 2 (scrolled bar) starts
 *  appearing (0–1).  0.75 = bar starts at 75% of fade distance.
 *  Lower = earlier crossfade.  Higher = more gap between states. */
const STATE2_ENTER = 0.75;

/** Easing — maps linear 0→1 to curved 0→1.
 *  easeOutQuad: quick start, gentle deceleration (recommended).
 *  Uncomment easeInOutCubic for a more "S-curve" feel. */
const easeOutQuad = (t: number) => t * (2 - t);
// const easeInOutCubic = (t: number) =>
//   t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const EASING = easeOutQuad;

/* ═══════════════════════════════════════════════════════════════════ */

const SESSION_KEY = "hos_intro_seen";

type Props = {
  items: NavItem[];
};

export default function Header({ items }: Props) {
  /* ── Overlay state (event-driven, NOT scroll-driven) ── */
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  /* ── Intro state ── */
  const [introVisible, setIntroVisible] = useState(false);
  const [introFading, setIntroFading] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* ── Refs for rAF scroll fade (zero re-renders) ── */
  const state1Ref = useRef<HTMLElement>(null);
  const state2Ref = useRef<HTMLElement>(null);
  const scrollYRef = useRef(0);
  const fadeDistRef = useRef(0);
  const rafRef = useRef(0);
  const introDoneRef = useRef(false);
  const reducedMotionRef = useRef(false);

  /* Keep introDoneRef in sync with React state */
  useEffect(() => {
    introDoneRef.current = introDone;
  }, [introDone]);

  /* ── State 0: decide whether to play intro ── */
  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let skip = false;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) skip = true;
    } catch {
      skip = true;
    }
    if (!skip && reducedMotionRef.current) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      skip = true;
    }

    if (skip) {
      setIntroDone(true);
    } else {
      document.body.style.overflow = "hidden";
      setIntroVisible(true);
    }
  }, []);

  /* Video ended → fade out overlay, reveal site */
  const handleVideoEnded = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setIntroFading(true);
    setTimeout(() => {
      setIntroVisible(false);
      setIntroFading(false);
      setIntroDone(true);
      document.body.style.overflow = "";
    }, 500);
  }, []);

  /* ── Measure fade distance on mount + resize ── */
  useEffect(() => {
    const measure = () => {
      fadeDistRef.current = window.innerHeight * FADE_DISTANCE_MULTIPLIER;
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* ══════════════════════════════════════════════════════════════════
     rAF scroll-driven fade
     ─ passive scroll listener stores scrollY in a ref
     ─ rAF loop reads it and sets CSS variables directly on DOM nodes
     ─ zero React re-renders, zero class toggles on scroll
     ══════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const onScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = () => {
      const s1 = state1Ref.current;
      const s2 = state2Ref.current;

      if (s1 && s2) {
        const done = introDoneRef.current;
        const y = scrollYRef.current;
        const dist = fadeDistRef.current || window.innerHeight;

        if (!done) {
          /* Before intro finishes — both headers hidden */
          applyState(s1, 0, 0);
          applyState(s2, 0, 0);
        } else if (reducedMotionRef.current) {
          /* Reduced motion — binary toggle, no animation */
          const scrolled = y > 60;
          applyState(s1, scrolled ? 0 : 1, 0);
          applyState(s2, scrolled ? 1 : 0, 0);
        } else {
          /* Normal — continuous scroll-driven crossfade */
          const raw = Math.max(0, y - START_OFFSET_PX) / dist;
          const progress = Math.min(1, EASING(Math.min(1, raw)));

          /* State 1 (crest): 1 → 0 with upward drift */
          const s1Opacity = 1 - progress;
          const s1Translate = -(progress * MAX_TRANSLATE_PX);
          applyState(s1, s1Opacity, s1Translate);

          /* State 2 (scrolled bar): fades in after STATE2_ENTER */
          const s2Progress = Math.max(0, progress - STATE2_ENTER) / (1 - STATE2_ENTER);
          const s2Opacity = Math.min(1, s2Progress);
          applyState(s2, s2Opacity, 0);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleNewsletterOpen = useCallback(() => {
    setMenuOpen(false);
    setTimeout(() => setNewsletterOpen(true), 200);
  }, []);

  return (
    <>
      {/* ═══ STATE 0 : Video intro overlay ═══ */}
      {introVisible && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
          style={{
            opacity: introFading ? 0 : 1,
            transition: "opacity 500ms ease-in-out",
            pointerEvents: introFading ? "none" : "auto",
          }}
        >
          <div className="relative w-[480px] max-w-[85vw] overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              preload="auto"
              onEnded={handleVideoEnded}
              className="w-full h-auto object-cover"
            >
              <source
                src="/images/HOS Logo Animation.mp4"
                type="video/mp4"
              />
            </video>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: "inset 0 0 40px 20px white",
              }}
            />
          </div>
        </div>
      )}

      {/* ═══ STATE 1 : Crest + controls — top-edges at 32px rail ═══ */}
      <header
        ref={state1Ref}
        className="fixed inset-x-0 top-0 z-50"
        style={{
          opacity: "var(--hosHeaderOpacity, 0)" as unknown as number,
          transform: "translate3d(0, var(--hosHeaderTranslateY, 0px), 0)",
          willChange: "opacity, transform",
          pointerEvents: "none",
        }}
        inert
      >
        {/* Crest — center, CSS mask so it renders in currentColor */}
        <div className="absolute top-[32px] left-1/2 -translate-x-1/2 pointer-events-none">
          <div
            className="text-foreground w-[104px] h-[104px] md:w-[225px] md:h-[225px] -mt-6 md:-mt-[51px]"
            style={{
              backgroundColor: "currentColor",
              WebkitMaskImage: "url(/images/hos-logo.svg)",
              maskImage: "url(/images/hos-logo.svg)",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
            role="img"
            aria-label="House of Singh crest"
          />
        </div>

        {/* Dot menu — left, top edge at 32px rail */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="absolute top-[32px] left-5 md:left-8 z-10 min-h-[44px] min-w-[44px] p-0 flex items-center gap-2 group"
          style={{ pointerEvents: "auto" }}
        >
          <span className="block w-2.5 h-2.5 rounded-full bg-foreground" />
          <span className="text-xs tracking-widest uppercase text-foreground transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
            Menu
          </span>
        </button>
      </header>

      {/* ═══ STATE 2 : Scrolled white bar header ═══ */}
      <header
        ref={state2Ref}
        className="fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center justify-between px-5 md:px-8 bg-white border-b border-border/40"
        style={{
          opacity: "var(--hosHeaderOpacity, 0)" as unknown as number,
          transform: "translate3d(0, var(--hosHeaderTranslateY, 0px), 0)",
          willChange: "opacity, transform",
          pointerEvents: "none",
        }}
        inert
      >
        {/* Left: dot icon (opens NavOverlay) */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="flex items-center gap-2 group min-h-[44px] min-w-[44px]"
        >
          <span className="block w-2.5 h-2.5 rounded-full bg-foreground" />
          <span className="text-xs tracking-widest uppercase text-foreground transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
            Menu
          </span>
        </button>

        {/* Center: text mark */}
        <Link
          href="/"
          aria-label="House of Singh — Home"
          className="absolute left-1/2 -translate-x-1/2 select-none"
        >
          <span className="text-xs sm:text-sm font-medium tracking-[0.2em] sm:tracking-[0.25em] uppercase text-foreground">
            House of Singh
          </span>
        </Link>
      </header>

      <NavOverlay
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNewsletterOpen={handleNewsletterOpen}
        items={items}
      />

      <NewsletterModal
        isOpen={newsletterOpen}
        onClose={() => setNewsletterOpen(false)}
      />
    </>
  );
}

/* ── Helper: apply opacity + translate + interactivity to a header ── */
function applyState(el: HTMLElement, opacity: number, translateY: number) {
  el.style.setProperty("--hosHeaderOpacity", String(opacity));
  el.style.setProperty("--hosHeaderTranslateY", `${translateY}px`);

  /* Toggle interactivity: inert disables focus + aria in one shot */
  const interactive = opacity > 0.1;
  if (interactive) {
    el.removeAttribute("inert");
    el.style.pointerEvents = "auto";
  } else {
    el.setAttribute("inert", "");
    el.style.pointerEvents = "none";
  }
}
