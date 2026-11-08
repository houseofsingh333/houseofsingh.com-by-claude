"use client";

import { useRef, useState } from "react";
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
 * The menu as an index room: a full screen canvas with the pages in large
 * Playfair, numbered I to V in brass, and a photograph that changes with
 * the page under the pointer or focus (each page's Menu photograph in
 * Sanity, or a default from the page). Below: Studio, Instagram and the
 * newsletter as small links, and the time in Toronto. It fades in within
 * 500ms (see "Menu, the index room" in styles/layout.css).
 *
 * While open the rest of the page is inert, focus moves to the first page,
 * Tab stays inside, Escape closes, and focus returns to the dot (Header).
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

  const panelRef = useRef<HTMLElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  useFocusTrap({
    active: isOpen,
    containerRef: panelRef,
    onEscape: onClose,
    initialFocusRef: firstLinkRef,
  });

  // The page under the pointer or focus; the current page until then.
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? Math.max(0, current);
  // Photographs load only once the menu has been opened, never with the page.
  const [opened, setOpened] = useState(false);
  if (isOpen && !opened) setOpened(true);

  return (
    <nav
      ref={panelRef}
      id={SITE_MENU_ID}
      aria-label="Site menu"
      inert={!isOpen}
      data-open={isOpen ? "" : undefined}
      className="menu-room"
    >
      <div className="menu-top">
        <button type="button" onClick={onClose} aria-label={`${copy.menuClose} menu`} className="menu-close">
          {copy.menuClose}
        </button>
        <span aria-hidden="true" />
      </div>

      <div className="menu-body">
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
                      sizes="420px"
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
      </div>

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
    </nav>
  );
}
