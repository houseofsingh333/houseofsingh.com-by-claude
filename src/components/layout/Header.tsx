"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import NavOverlay, { SITE_MENU_ID, type MenuCopy } from "./NavOverlay";
import type { NewsletterCopy } from "@/components/NewsletterNote";
import IntroOverlay, { useIntroSequence } from "./IntroOverlay";

const NewsletterNote = dynamic(
  () => import("@/components/NewsletterNote"),
  { ssr: false },
);
import type { MenuPhoto, NavItem } from "@/lib/types";

const SCROLL_SHOW = 60;
const SCROLL_HIDE = 20;

type Props = {
  items: NavItem[];
  /** Menu photographs by page link (see buildMenuPhotos in the layout). */
  menuPhotos: Record<string, MenuPhoto>;
  /** The menu's and the newsletter card's texts (Site Settings). */
  menuCopy: MenuCopy;
  newsletterCopy: NewsletterCopy;
};

export default function Header({ items, menuPhotos, menuCopy, newsletterCopy }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { introVisible, introFading, introDone, dismissIntro } =
    useIntroSequence();
  const menuButton1Ref = useRef<HTMLButtonElement>(null);
  const menuButton2Ref = useRef<HTMLButtonElement>(null);
  const menuWasOpenRef = useRef(false);

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

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  /* Closing the menu by any means (Close, backdrop, Escape, a link) returns
     focus to whichever menu button is currently visible. Skipped on first
     render so the page never steals focus on load. */
  useEffect(() => {
    if (menuOpen) {
      menuWasOpenRef.current = true;
      return;
    }
    if (!menuWasOpenRef.current) return;
    menuWasOpenRef.current = false;
    const button = scrolled ? menuButton2Ref.current : menuButton1Ref.current;
    button?.focus({ preventScroll: true });
  }, [menuOpen, scrolled]);

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
        <IntroOverlay fading={introFading} onDismiss={dismissIntro} />
      )}

      {/* ═══ STATE 1 : Crest + controls — top-edges at 32px rail ═══ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-opacity duration-[250ms] ease-in-out ${
          showState1 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!showState1}
      >
        {/* Crest — center, links home. CSS mask so it renders in currentColor. */}
        <Link
          href="/"
          tabIndex={showState1 ? 0 : -1}
          aria-label="House of Singh, home"
          className="absolute top-[32px] left-1/2 -translate-x-1/2"
          style={{ pointerEvents: showState1 ? "auto" : "none" }}
        >
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
        </Link>

        {/* Dot menu — left, top edge at 32px rail.
            z-10 + pointer-events:auto — same fix as toggle (see comment there).
            Only while State 1 shows: once it fades, the crest and this dot
            must not catch taps on the page beneath them. */}
        <button
          ref={menuButton1Ref}
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls={SITE_MENU_ID}
          tabIndex={showState1 ? 0 : -1}
          className="absolute top-[32px] left-5 md:left-8 z-10 min-h-[44px] min-w-[44px] p-0 flex items-center gap-2 group"
          style={{ pointerEvents: showState1 ? "auto" : "none" }}
        >
          <span className="block w-2.5 h-2.5 rounded-full bg-foreground" />
          <span className="text-xs tracking-widest uppercase text-foreground transition-all duration-(--dur-hover) ease-(--ease-soft-out) opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
            Menu
          </span>
        </button>

      </header>

      {/* ═══ STATE 2 : Scrolled white bar header ═══ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center justify-between px-5 md:px-8 bg-background border-b border-border/40 transition-opacity duration-[250ms] ease-in-out ${
          showState2 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!showState2}
      >
        {/* Left: dot icon (opens NavOverlay) */}
        <button
          ref={menuButton2Ref}
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls={SITE_MENU_ID}
          tabIndex={showState2 ? 0 : -1}
          className="flex items-center gap-2 group min-h-[44px] min-w-[44px]"
        >
          <span className="block w-2.5 h-2.5 rounded-full bg-foreground" />
          <span className="text-xs tracking-widest uppercase text-foreground transition-all duration-(--dur-hover) ease-(--ease-soft-out) opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
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
        onClose={closeMenu}
        onNewsletterOpen={handleNewsletterOpen}
        items={items}
        photos={menuPhotos}
        copy={menuCopy}
      />

      <NewsletterNote
        isOpen={newsletterOpen}
        onClose={() => setNewsletterOpen(false)}
        copy={newsletterCopy}
      />
    </>
  );
}
