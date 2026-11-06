"use client";

import { useRef } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { X } from "lucide-react";
import Link from "next/link";
import type { NavItem } from "@/lib/placeholder-data";

/** id of the menu panel, referenced by the menu buttons' aria-controls. */
export const SITE_MENU_ID = "site-menu";

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
  const panelRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  // While open: the rest of the page is inert, focus moves to the first menu
  // link, Escape closes, and Tab loops inside the menu. Keyboard and screen
  // reader behaviour only; nothing here changes how the menu looks. Focus
  // returns to the visible menu button from Header, so restoreFocus is off.
  useFocusTrap({
    active: isOpen,
    containerRef: panelRef,
    keepRefs: [backdropRef],
    onEscape: onClose,
    initialFocusRef: firstLinkRef,
  });

  return (
    <>
      {/* Right-side backdrop */}
      <div
        ref={backdropRef}
        className={`fixed inset-0 z-40 transition-opacity duration-500 motion-reduce:transition-none ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Left-half panel. Inert while closed, so its links are out of the
          Tab order and hidden from screen readers; the slide is unchanged. */}
      <nav
        ref={panelRef}
        id={SITE_MENU_ID}
        aria-label="Site menu"
        inert={!isOpen}
        className={`fixed top-0 left-0 z-50 h-full w-full md:w-1/2 bg-background border-r border-border flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] motion-reduce:transition-none ${
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

        {/* Nav items */}
        <ul className="flex flex-col gap-0 px-6 md:px-8 pt-8 md:pt-12 flex-1 overflow-y-auto">
          {sorted.map((item, i) => (
            <li key={item.href} className="border-b border-border/50">
              {item.external ? (
                <a
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  aria-label="Studio, opens House of Singh Studios in a new tab"
                  className="group flex items-center py-4 md:py-5 text-lg md:text-2xl lg:text-3xl font-light tracking-tight text-foreground hover:text-muted-foreground transition-colors duration-(--dur-hover) ease-(--ease-soft-out) min-h-[48px]"
                >
                  <span className="inline-flex items-center gap-1.5">
                    {item.label}
                    <span
                      aria-hidden="true"
                      className="text-xs tracking-widest text-muted-foreground transition-transform duration-(--dur-hover) ease-(--ease-soft-out) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:transform-none"
                    >
                      ↗
                    </span>
                  </span>
                </a>
              ) : (
                <Link
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={item.href}
                  onClick={onClose}
                  className="block py-4 md:py-5 text-lg md:text-2xl lg:text-3xl font-light tracking-tight text-foreground hover:text-muted-foreground transition-colors duration-(--dur-hover) ease-(--ease-soft-out) min-h-[48px]"
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
            className="text-[11px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-(--dur-hover) ease-(--ease-soft-out) py-2"
          >
            Instagram
          </a>
          <span className="text-border">&middot;</span>
          <button
            onClick={onNewsletterOpen}
            className="text-[11px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-(--dur-hover) ease-(--ease-soft-out) py-2"
          >
            Newsletter
          </button>
        </div>
      </nav>
    </>
  );
}
