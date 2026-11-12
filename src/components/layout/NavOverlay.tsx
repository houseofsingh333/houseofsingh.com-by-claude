"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import SanityImage from "@/components/SanityImage";
import TorontoTime from "@/components/TorontoTime";
import { roman } from "@/lib/roman";
import { hotspotPosition } from "@/lib/projectHero";
import type { MenuPhoto, NavItem } from "@/lib/types";
import type { SiteCopy } from "@/lib/siteCopy";

/** id of the menu panel, referenced by the menu buttons' aria-controls. */
export const SITE_MENU_ID = "site-menu";

/** Where the photograph half of the menu begins. */
const WIDE = "(min-width: 1024px)";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onNewsletterOpen: () => void;
  items: NavItem[];
  /** Menu photographs by page link (Site Settings, Menu; else a default). */
  photos: Record<string, MenuPhoto>;
  /** The menu's small texts (Site Settings, Menu). */
  copy: MenuCopy;
};

export type MenuCopy = Pick<SiteCopy, "menuClose" | "menuInstagram" | "menuNewsletter" | "menuTimeLabel">;

/**
 * The menu (approved 10 Nov, after slowness.com; canvas page "Menu").
 *
 * From 1024 wide: a canvas panel slides in from the left over the left half
 * (--dur-menu-panel, --ease-slow) while the right half fills with one large
 * photograph, inset 24px, fading in and settling from a 1.04 scale. The
 * page is fully covered. The photograph is the current page's on opening
 * and changes only when a page name is pointed at or focused (a 700ms
 * crossfade, no timer). Closing: the photograph fades first, then the panel
 * slides out. Clicking the photograph closes the menu, as do Close and
 * Escape.
 *
 * Below 1024: the panel covers 85 percent of the width with a soft shadow,
 * no photograph; the page shows on the strip beside it under a light veil,
 * and tapping the strip closes the menu.
 *
 * Inside: "× Close", the five pages in small uppercase Instrument Sans
 * with muted Roman numerals (the shared hairline under the one pointed at
 * and the current page), and a bottom line with Studio, Instagram,
 * Newsletter and "10:42 pm in Toronto". No Playfair, no House of Singh.
 *
 * While open it is a modal dialog: the page behind is inert and does not
 * scroll (its position is kept, html[data-menu-open]), the page header
 * fades out with the panel and back as it closes (html[data-menu-closing]),
 * focus moves to the first page, Tab stays inside, Escape closes, and
 * focus returns to the dot (Header). Reduced motion: no slide, no zoom.
 */
export default function NavOverlay({
  isOpen,
  onClose,
  onNewsletterOpen,
  items,
  photos,
  copy,
}: Props) {
  const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const pages = sorted.filter((item) => !item.external);
  const outside = sorted.filter((item) => item.external);
  const pathname = usePathname();
  const current = pages.findIndex((p) =>
    p.href === "/" ? pathname === "/" : pathname === p.href || pathname.startsWith(p.href + "/"),
  );

  const panelRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  // Focus opens on the current page (Home elsewhere), so the photograph
  // shown on opening is the current page's.
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  useFocusTrap({
    active: isOpen,
    containerRef: panelRef,
    keepRefs: [veilRef, photoRef],
    onEscape: onClose,
    initialFocusRef: firstLinkRef,
  });

  // The page behind does not scroll while the menu is open. Hiding the
  // root's overflow keeps its scroll position exactly (nothing is moved or
  // restored), and the scrollbar's gutter stays so nothing shifts sideways.
  // The page header fades out with the panel and back in as it closes
  // (data-menu-closing lasts as long as the panel's slide).
  const closingTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!isOpen) return;
    const html = document.documentElement;
    window.clearTimeout(closingTimer.current);
    html.removeAttribute("data-menu-closing");
    html.setAttribute("data-menu-open", "");
    return () => {
      html.removeAttribute("data-menu-open");
      html.setAttribute("data-menu-closing", "");
      const ms = parseFloat(getComputedStyle(html).getPropertyValue("--dur-menu-panel")) || 750;
      closingTimer.current = window.setTimeout(() => html.removeAttribute("data-menu-closing"), ms + 150);
    };
  }, [isOpen]);

  // Going to another page: the menu goes at once (no slide), so the page
  // change shows only the page fading out (audit P9, approved 12 Nov). The
  // mark lasts until the page change has started, then is removed.
  const leaveFor = (e: React.MouseEvent<HTMLAnchorElement>, here: boolean) => {
    const plain = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
    if (plain && !here) {
      const html = document.documentElement;
      html.setAttribute("data-menu-leaving", "");
      window.setTimeout(() => html.removeAttribute("data-menu-leaving"), 1500);
    }
    onClose();
  };

  // The page pointed at or focused; the current page until then (and again
  // on every opening).
  const [hovered, setHovered] = useState<number | null>(null);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setHovered(null);
  }
  const active = hovered ?? Math.max(0, current);

  // Photographs load only from 1024 wide, and only once the menu has been
  // opened, never with the page.
  const wide = useMediaQuery(WIDE);
  const [opened, setOpened] = useState(false);
  if (isOpen && wide && !opened) setOpened(true);

  return (
    <div className="menu-shell" inert={!isOpen} data-open={isOpen ? "" : undefined}>
      {/* Below 1024: the veil over the strip of page; a tap on it closes. */}
      <div ref={veilRef} aria-hidden="true" className="menu-veil" onClick={onClose} />

      {/* From 1024: the photograph half; a click on it closes. Decorative:
          it only echoes the page pointed at, and Close and Escape close too. */}
      <div ref={photoRef} aria-hidden="true" className="menu-photo" onClick={onClose}>
        <div className="menu-photo-frame">
          <div className="menu-photo-stack">
            {opened &&
              pages.map((item, i) => {
                const photo = photos[item.href];
                if (!photo) return null;
                return (
                  <div key={item.href} className="menu-photo-layer" data-href={item.href} data-active={i === active ? "" : undefined}>
                    <SanityImage
                      image={photo.image}
                      context="body"
                      alt={photo.alt ?? undefined}
                      fill
                      sizes="50vw"
                      className="object-cover"
                      objectPosition={typeof photo.image === "string" ? undefined : hotspotPosition(photo.image)}
                      develop={false}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div
        ref={panelRef}
        id={SITE_MENU_ID}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="menu-panel"
      >
        <button type="button" onClick={onClose} aria-label={`${copy.menuClose} menu`} className="menu-close">
          <span aria-hidden="true" className="menu-close-x">
            &#215;
          </span>
          {copy.menuClose}
        </button>

        <nav aria-label="Site menu" className="menu-body">
          <ul className="menu-list" onMouseLeave={() => setHovered(null)}>
            {pages.map((item, i) => (
              <li key={item.href} className="menu-item" style={{ ["--i" as string]: i }}>
                <Link
                  ref={i === Math.max(0, current) ? firstLinkRef : undefined}
                  href={item.href}
                  onClick={(e) => leaveFor(e, i === current)}
                  onMouseEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                  aria-current={i === current ? "page" : undefined}
                  className="menu-link hairline-host"
                >
                  <span aria-hidden="true" className="menu-num">
                    {roman(i + 1)}
                  </span>
                  <span className="menu-label hairline">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="menu-foot">
          <div className="menu-foot-links">
            {outside.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="menu-small hairline"
              >
                {item.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
            <a
              href="https://www.instagram.com/houseofsingh"
              target="_blank"
              rel="noopener noreferrer"
              className="menu-small hairline"
            >
              {copy.menuInstagram}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <button type="button" onClick={onNewsletterOpen} className="menu-small hairline">
              {copy.menuNewsletter}
            </button>
          </div>
          <p className="menu-small menu-time">
            <TorontoTime /> {copy.menuTimeLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
