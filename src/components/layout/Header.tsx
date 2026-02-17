"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import NavOverlay from "./NavOverlay";
import NewsletterModal from "@/components/NewsletterModal";
import type { NavItem } from "@/lib/placeholder-data";

const SHOW_THRESHOLD = 60;
const HIDE_THRESHOLD = 30;

type Props = {
  items: NavItem[];
};

export default function Header({ items }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Scroll listener with hysteresis to prevent flicker */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled((prev) => {
          if (!prev && y >= SHOW_THRESHOLD) return true;
          if (prev && y < HIDE_THRESHOLD) return false;
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

  return (
    <>
      {/* Sticky header strip — only visible after scroll */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center justify-between px-5 md:px-8 transition-all duration-300 ease-in-out ${
          scrolled
            ? "opacity-100 pointer-events-auto bg-background/95 backdrop-blur-sm border-b border-border/40"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!scrolled}
      >
        {/* Left: dot menu */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          tabIndex={scrolled ? 0 : -1}
          className="flex items-center min-h-[44px] min-w-[44px]"
        >
          <span className="block w-2 h-2 rounded-full bg-foreground" />
        </button>

        {/* Center: text mark */}
        <Link
          href="/"
          tabIndex={scrolled ? 0 : -1}
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
          tabIndex={scrolled ? 0 : -1}
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
