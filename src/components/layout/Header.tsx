"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import NavOverlay from "./NavOverlay";
import NewsletterModal from "@/components/NewsletterModal";
import LanguageToggle from "./LanguageToggle";
import type { NavItem } from "@/lib/placeholder-data";

const SESSION_KEY = "hos_intro_seen";
const SCROLL_SHOW = 60;
const SCROLL_HIDE = 20;

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

  /* ── State 0: decide whether to play intro ── */
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
              preload="auto"
              onEnded={handleVideoEnded}
              className="w-full h-auto object-cover"
            >
              <source
                src="/images/HOS Logo Animation.mp4"
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

        {/* Language toggle — right, top edge at 32px rail.
            z-10 + pointer-events:auto ensures clicks register above
            the crest and any closed overlay layers (NavOverlay z-50,
            NewsletterModal z-60/61) that sit in the DOM with
            pointer-events:none. */}
        <div
          className="absolute top-[32px] right-5 md:right-8 z-10 flex items-center min-h-[44px]"
          style={{ pointerEvents: "auto" }}
        >
          <LanguageToggle tabIndex={showState1 ? 0 : -1} />
        </div>
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

        {/* Right: language toggle */}
        <LanguageToggle tabIndex={showState2 ? 0 : -1} />
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
