"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import NavOverlay from "./NavOverlay";
import NewsletterModal from "@/components/NewsletterModal";
import { useTheme } from "@/components/ThemeProvider";
import type { NavItem } from "@/lib/placeholder-data";

const SESSION_KEY = "hos-intro-seen";
const SCROLL_SHOW = 60;
const SCROLL_HIDE = 20;

/*
  Intro phases (State 0):
    idle    → checking sessionStorage
    enter   → overlay + crest rendered at center / 500px / opacity 0
    fadein  → crest opacity transitions 0→1  (600ms)
    hold    → pause at center                 (500ms)
    moving  → crest transitions to top / 400px (700ms)
    landing → overlay fades out               (300ms)
    done    → normal page
*/
type IntroPhase =
  | "idle"
  | "enter"
  | "fadein"
  | "hold"
  | "moving"
  | "landing"
  | "done";

type Props = {
  items: NavItem[];
};

export default function Header({ items }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [intro, setIntro] = useState<IntroPhase>("idle");
  const { theme, toggle } = useTheme();

  /* ── State 0: intro sequence ── */
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        setIntro("done");
        return;
      }
    } catch {
      setIntro("done");
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      setIntro("done");
      return;
    }

    document.body.style.overflow = "hidden";
    setIntro("enter");
  }, []);

  /* Phase chain: enter → fadein → hold → moving  (landing triggered by transitionEnd) */
  useEffect(() => {
    if (intro === "enter") {
      const raf = requestAnimationFrame(() => setIntro("fadein"));
      return () => cancelAnimationFrame(raf);
    }
    if (intro === "fadein") {
      const t = setTimeout(() => setIntro("hold"), 600);
      return () => clearTimeout(t);
    }
    if (intro === "hold") {
      const t = setTimeout(() => setIntro("moving"), 500);
      return () => clearTimeout(t);
    }
    if (intro === "landing") {
      const t = setTimeout(() => {
        setIntro("done");
        document.body.style.overflow = "";
      }, 350);
      return () => clearTimeout(t);
    }
  }, [intro]);

  const handleCrestTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      if (intro === "moving" && e.propertyName === "top") {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {}
        setIntro("landing");
      }
    },
    [intro],
  );

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
  const introActive =
    intro !== "idle" && intro !== "done";
  const introDone = intro === "idle" || intro === "done";
  const showState1 = introDone && !scrolled;
  const showState2 = introDone && scrolled;

  /* ── Intro crest positioning ── */
  const isCentered =
    intro === "enter" || intro === "fadein" || intro === "hold";

  return (
    <>
      {/* ═══ STATE 0 : Intro overlay + animated crest ═══ */}
      {introActive && (
        <div
          className="fixed inset-0 z-[9999] bg-background"
          style={{
            opacity: intro === "landing" ? 0 : 1,
            transition: "opacity 300ms ease-in-out",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: isCentered ? "50%" : "32px",
              transform: isCentered
                ? "translate(-50%, -50%)"
                : "translate(-50%, 0)",
              width: isCentered ? 500 : 400,
              opacity: intro === "enter" ? 0 : 1,
              transitionProperty: "top, transform, width, opacity",
              transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)",
              transitionDuration: isCentered ? "600ms" : "700ms",
            }}
            onTransitionEnd={handleCrestTransitionEnd}
          >
            <Image
              src="/images/hos-logo.svg"
              alt="House of Singh"
              width={500}
              height={500}
              priority
              className="dark:invert w-full h-auto"
            />
          </div>
        </div>
      )}

      {/* ═══ STATE 1 : Crest at top center (separate from nav bar) ═══ */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 flex justify-center pointer-events-none transition-opacity duration-[250ms] ease-in-out ${
          showState1 ? "opacity-100" : "opacity-0"
        }`}
        style={{ paddingTop: 32 }}
        aria-hidden
      >
        <Image
          src="/images/hos-logo.svg"
          alt=""
          width={400}
          height={400}
          priority
          style={{ width: 400, height: "auto" }}
          className="dark:invert"
        />
      </div>

      {/* ═══ STATE 1 : Transparent nav bar (dot left, theme toggle right) ═══ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center justify-between px-5 md:px-8 transition-opacity duration-[250ms] ease-in-out ${
          showState1 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!showState1}
      >
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          tabIndex={showState1 ? 0 : -1}
          className="flex items-center min-h-[44px] min-w-[44px]"
        >
          <span className="block w-2 h-2 rounded-full bg-foreground" />
        </button>

        <button
          onClick={toggle}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          tabIndex={showState1 ? 0 : -1}
          className="text-foreground hover:text-muted-foreground transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>
      </header>

      {/* ═══ STATE 2 : Scrolled white strip header ═══ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center justify-between px-5 md:px-8 bg-background/95 backdrop-blur-sm border-b border-border/40 transition-opacity duration-[250ms] ease-in-out ${
          showState2 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!showState2}
      >
        {/* Left: dot menu */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          tabIndex={showState2 ? 0 : -1}
          className="flex items-center min-h-[44px] min-w-[44px]"
        >
          <span className="block w-2 h-2 rounded-full bg-foreground" />
        </button>

        {/* Center: text mark only — no crest */}
        <Link
          href="/"
          tabIndex={showState2 ? 0 : -1}
          aria-label="House of Singh — Home"
          className="absolute left-1/2 -translate-x-1/2 select-none"
        >
          <span className="text-[13px] font-medium tracking-[0.25em] uppercase text-foreground">
            House of Singh
          </span>
        </Link>

        {/* Right: menu button */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          tabIndex={showState2 ? 0 : -1}
          className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 min-h-[44px] flex items-center"
        >
          Menu
        </button>
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
