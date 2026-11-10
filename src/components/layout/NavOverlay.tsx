"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import SanityImage from "@/components/SanityImage";
import TorontoTime from "@/components/TorontoTime";
import { roman } from "@/lib/roman";
import type { MenuPhoto, NavItem } from "@/lib/types";
import type { SiteCopy } from "@/lib/siteCopy";

/** id of the menu panel, referenced by the menu buttons' aria-controls. */
export const SITE_MENU_ID = "site-menu";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onNewsletterOpen: () => void;
  items: NavItem[];
  /** Menu photographs by page link. */
  photos: Record<string, MenuPhoto>;
  /** The menu's small texts (Site Settings, Menu). */
  copy: MenuCopy;
};

export type MenuCopy = Pick<SiteCopy, "menuClose" | "menuInstagram" | "menuNewsletter" | "menuTimeLabel">;

const SMALL_LINK =
  "type-label text-muted-foreground hover:text-foreground transition-colors duration-(--dur-hover) ease-(--ease-soft-out) py-2";

/**
 * The menu as a panel from the left (approved 10 Nov, after slowness.com):
 * half the screen on desktop and tablets, most of it on phones, sliding in
 * over --dur-menu-panel on --ease-slow. The page stays in place on the
 * right under a light veil; a click or tap on the veil closes the menu.
 * Inside: Close, the pages in Playfair numbered I to V in brass, a small
 * photograph that changes with the page under the pointer or focus (each
 * page's Menu photograph in Sanity, or a default), then Studio, Instagram,
 * the newsletter and the time in Toronto (styles/layout.css, "Menu").
 *
 * While open it is a modal dialog: the rest of the page is inert and does
 * not scroll (its position is kept), focus moves to the first page, Tab
 * stays inside, Escape closes, and focus returns to the dot (Header).
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
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  useFocusTrap({
    active: isOpen,
    containerRef: panelRef,
    keepRefs: [veilRef],
    onEscape: onClose,
    initialFocusRef: firstLinkRef,
  });

  // The page behind does not scroll while the menu is open. Hiding the
  // root's overflow keeps its scroll position exactly (nothing is moved or
  // restored), and the scrollbar's gutter stays so nothing shifts sideways.
  useEffect(() => {
    if (!isOpen) return;
    const html = document.documentElement;
    html.setAttribute("data-menu-open", "");
    return () => html.removeAttribute("data-menu-open");
  }, [isOpen]);

  // The page under the pointer or focus; the current page until then.
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? Math.max(0, current);
  // Photographs load only once the menu has been opened, never with the page.
  const [opened, setOpened] = useState(false);
  if (isOpen && !opened) setOpened(true);

  return (
    <div className="menu-shell" inert={!isOpen} data-open={isOpen ? "" : undefined}>
      {/* The veil over the page: a click or tap anywhere on it closes. */}
      <div ref={veilRef} aria-hidden="true" className="menu-veil" onClick={onClose} />
      <div
        ref={panelRef}
        id={SITE_MENU_ID}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="menu-panel"
      >
        <button type="button" onClick={onClose} aria-label={`${copy.menuClose} menu`} className="menu-close">
          {copy.menuClose}
        </button>

        <nav aria-label="Site menu" className="menu-body">
          <ul className="menu-list" onMouseLeave={() => setHovered(null)}>
            {pages.map((item, i) => (
              <li key={item.href}>
                <Link
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={item.href}
                  onClick={onClose}
                  onMouseEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                  aria-current={i === current ? "page" : undefined}
                  data-active={i === active ? "" : undefined}
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

          {/* Decorative here: it only echoes the page under the pointer. */}
          <figure aria-hidden="true" className="menu-photo">
            <div className="menu-photo-frame">
              {opened &&
                pages.map((item, i) => {
                  const photo = photos[item.href];
                  if (!photo) return null;
                  return (
                    <div key={item.href} className="menu-photo-layer" data-active={i === active ? "" : undefined}>
                      <SanityImage
                        image={photo.image}
                        context="thumbnail"
                        alt={photo.alt ?? undefined}
                        fill
                        sizes="260px"
                        className="object-cover"
                        develop={false}
                      />
                    </div>
                  );
                })}
            </div>
            <figcaption className="menu-photo-caption">
              {photos[pages[active]?.href]?.caption ?? ""}
            </figcaption>
          </figure>
        </nav>

        <div className="menu-foot">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            {outside.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className={SMALL_LINK}
              >
                {item.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
            <a
              href="https://www.instagram.com/houseofsingh"
              target="_blank"
              rel="noopener noreferrer"
              className={SMALL_LINK}
            >
              {copy.menuInstagram}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <button type="button" onClick={onNewsletterOpen} className={SMALL_LINK}>
              {copy.menuNewsletter}
            </button>
          </div>
          <p className="type-label text-muted-foreground">
            {copy.menuTimeLabel} <TorontoTime />
          </p>
        </div>
      </div>
    </div>
  );
}
