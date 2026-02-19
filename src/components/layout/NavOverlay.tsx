"use client";

import { X } from "lucide-react";
import Link from "next/link";
import type { NavItem } from "@/lib/placeholder-data";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onNewsletterOpen: () => void;
  items: NavItem[];
};

export default function NavOverlay({
  isOpen,
  onClose,
  onNewsletterOpen,
  items,
}: Props) {
  const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <>
      {/* Right-side backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-500 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Left-half panel */}
      <nav
        className={`fixed top-0 left-0 z-50 h-full w-full md:w-1/2 bg-background border-r border-border flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <div className="flex items-center px-6 py-5 md:px-8 md:py-6">
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex items-center gap-2 group min-h-[44px]"
          >
            <X className="h-4 w-4 text-foreground" />
            <span className="text-xs tracking-widest uppercase text-foreground">
              Close
            </span>
          </button>
        </div>

        {/* Nav items — sans-serif font, mobile-optimized sizing */}
        <ul className="flex flex-col gap-0 px-6 md:px-8 pt-8 md:pt-12 flex-1 overflow-y-auto">
          {sorted.map((item) => (
            <li key={item.label} className="border-b border-border/50">
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center justify-between py-4 md:py-5 text-lg md:text-2xl lg:text-3xl font-light tracking-tight text-foreground hover:text-muted-foreground transition-colors duration-300 min-h-[48px]"
                >
                  {item.label}
                  <span className="text-xs tracking-widest text-muted-foreground">
                    ↗
                  </span>
                </a>
              ) : (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block py-4 md:py-5 text-lg md:text-2xl lg:text-3xl font-light tracking-tight text-foreground hover:text-muted-foreground transition-colors duration-300 min-h-[48px]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Bottom: Instagram + Newsletter */}
        <div className="px-6 md:px-8 pb-6 md:pb-8 pt-4 flex items-center gap-6">
          <a
            href="https://www.instagram.com/houseofsingh"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 py-2"
          >
            Instagram
          </a>
          <span className="text-border">&middot;</span>
          <button
            onClick={onNewsletterOpen}
            className="text-[11px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 py-2"
          >
            Newsletter
          </button>
        </div>
      </nav>
    </>
  );
}
