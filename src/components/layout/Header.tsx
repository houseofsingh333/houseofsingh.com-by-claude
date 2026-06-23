"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import NavOverlay from "./NavOverlay";
import { useIntro } from "@/components/IntroContext";

const NewsletterModal = dynamic(
  () => import("@/components/NewsletterModal"),
  { ssr: false },
);
import type { NavItem } from "@/lib/placeholder-data";

const SESSION_KEY = "hos_intro_seen";
const SCROLL_SHOW = 60;
const SCROLL_HIDE = 20;
/** Hard cap so a slow or broken video never traps the user on the overlay.
   Set above the real clip length (~5.06s) so a healthy intro plays in full;
   onError/onStalled already handle broken playback immediately. */
const INTRO_MAX_MS = 6500;

type Props = {
  items: NavItem[];
};

export default function Header({ items }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [introFading, setIntroFading] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introMaxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introDismissedRef = useRef(false);

  /* Signals the hero (via context) that the intro is over — no polling. */
  const { completeIntro } = useIntro();

  /* Dismiss the intro overlay. Idempotent: whichever trigger fires first
     (video ended, error, stalled, or the hard max-duration timer) wins. The
     hero is already painted underneath, so this only fades the overlay away. */
  const dismissIntro = useCallback(() => {
    if (introDismissedRef.current) return;
    introDismissedRef.current = true;
    if (introMaxTimerRef.current) clearTimeout(introMaxTimerRef.current);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    // Tell the hero to begin right away (matches the old video-end timing).
    completeIntro();
    setIntroFading(true);
    introTimerRef.current = setTimeout(() => {
      setIntroVisible(false);
      setIntroFading(false);
      setIntroDone(true);
      document.body.style.overflow = "";
    }, 500);
  }, [completeIntro]);

  /* ── State 0: decide whether to play intro ── */
  /* eslint-disable react-hooks/set-state-in-effect -- one-time init from browser APIs */
  useEffect(() => {
    let skip = false;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) skip = true;
    } catch {
      skip = true;
    }
    if (
      !skip &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      skip = true;
    }

    if (skip) {
      setIntroDone(true);
      completeIntro();
    } else {
      document.body.style.overflow = "hidden";
      setIntroVisible(true);
      // Hard safety net: dismiss even if the video never fires `ended`.
      introMaxTimerRef.current = setTimeout(dismissIntro, INTRO_MAX_MS);
    }
  }, [completeIntro, dismissIntro]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    return () => {
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
      if (introMaxTimerRef.current) clearTimeout(introMaxTimerRef.current);
    };
  }, []);

  /* ── Scroll listener with hysteresis (State 1 ↔ State 2) ── */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled((prev) => {
          if (!prev && y >= SCROLL_SHOW) return true;
          if (prev && y < SCROLL_HIDE) return false;
          return prev;
        });
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNewsletterOpen = useCallback(() => {
    setMenuOpen(false);
    setTimeout(() => setNewsletterOpen(true), 200);
  }, []);

  /* ── Derived state ── */
  const showState1 = introDone && !scrolled;
  const showState2 = introDone && scrolled;

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
          {/* Centered video container with overflow hidden */}
          <div className="relative w-[480px] max-w-[85vw] overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              preload="metadata"
              onEnded={dismissIntro}
              onError={dismissIntro}
              onStalled={dismissIntro}
              className="w-full h-auto object-cover"
            >
              <source
                src="/images/HOS_Logo_Animation.mp4"
                type="video/mp4"
              />
            </video>
            {/* Edge feather mask — blends video edges into white overlay */}
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
        className={`fixed inset-x-0 top-0 z-50 transition-opacity duration-[250ms] ease-in-out ${
          showState1 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!showState1}
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

        {/* Dot menu — left, top edge at 32px rail.
            z-10 + pointer-events:auto — same fix as toggle (see comment there). */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          tabIndex={showState1 ? 0 : -1}
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
        className={`fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center justify-between px-5 md:px-8 bg-white border-b border-border/40 transition-opacity duration-[250ms] ease-in-out ${
          showState2 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!showState2}
      >
        {/* Left: dot icon (opens NavOverlay) */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          tabIndex={showState2 ? 0 : -1}
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
          tabIndex={showState2 ? 0 : -1}
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
