"use client";

import { useRef, useState } from "react";
import SanityImage from "@/components/SanityImage";
import type { SanityImageAsset } from "@/lib/sanityImage";

export type PracticePanel = {
  key: string;
  client: string;
  service: string | null;
  href: string;
  image: SanityImageAsset;
  /** CSS object-position from the photograph's hotspot. */
  position?: string;
};

const DESKTOP = "(min-width: 1024px)";
const matches = (query: string) => typeof window !== "undefined" && window.matchMedia(query).matches;

/**
 * The studio photographs, side by side (Chapter VII). Each is a link to its
 * own address, opening in a new tab.
 *
 * Desktop: at rest the panels share the width and show only their client
 * names. Pointing at or focusing one widens it while the others narrow;
 * its photograph eases forward and its service fades in beside the client
 * name. Leaving the row returns all of them to equal widths. A touch
 * screen at this width: the first tap opens a panel out, the second
 * follows its link.
 * Phone: the first panel is wide, the others narrow. Tapping a narrow one
 * widens it; tapping the wide one follows its link. The wide panel's
 * client and service show beneath the row.
 * The widths, the zoom and the fades are CSS (styles/home.css, Practice),
 * driven by data-active and data-on; reduced motion: at once, no zoom.
 */
export default function PracticePanels({ panels }: { panels: PracticePanel[] }) {
  const [active, setActive] = useState<number | null>(null);
  // Whether the panel was already open when the pointer went down: a tap
  // on a closed panel opens it out instead of following the link.
  const wasOpen = useRef(false);
  const pointer = useRef<string>("mouse");
  const wide = active ?? 0;
  const shown = panels[wide] ?? panels[0];

  return (
    <div className="practice-work">
      <div
        className="practice-panels"
        data-count={panels.length}
        data-active={active ?? undefined}
        onMouseLeave={() => {
          if (matches(DESKTOP)) setActive(null);
        }}
        onBlur={(e) => {
          if (matches(DESKTOP) && !e.currentTarget.contains(e.relatedTarget as Node | null)) setActive(null);
        }}
      >
        {panels.map((p, i) => (
          <a
            key={p.key}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="practice-panel"
            data-on={active === i ? "" : undefined}
            onMouseEnter={() => {
              if (matches("(hover: hover)") && matches(DESKTOP)) setActive(i);
            }}
            onFocus={() => setActive(i)}
            onPointerDown={(e) => {
              pointer.current = e.pointerType;
              // On a phone the first panel is open before any choice.
              wasOpen.current = active === i || (active === null && i === 0 && !matches(DESKTOP));
            }}
            onClick={(e) => {
              if (e.detail === 0) return; // Enter on a focused (open) panel: follow the link.
              const tapToOpen = !matches(DESKTOP) || pointer.current !== "mouse";
              if (tapToOpen && !wasOpen.current) {
                e.preventDefault();
                setActive(i);
              }
            }}
          >
            <span className="practice-photo">
              <span className="practice-photo-zoom">
                <SanityImage
                  image={p.image}
                  context="body"
                  fill
                  sizes="(min-width: 1024px) 34vw, 70vw"
                  objectPosition={p.position}
                  className="object-cover"
                />
              </span>
            </span>
            <span className="practice-cap">
              <span className="practice-client">{p.client}</span>
              {p.service && (
                <>
                  <span className="sr-only">, </span>
                  <span className="practice-service type-label">{p.service}</span>
                </>
              )}
              <span className="sr-only"> (opens in a new tab)</span>
            </span>
          </a>
        ))}
      </div>
      {/* Phone: the open panel's client and service, beneath the row (each
          link already carries its own name for screen readers). */}
      <p aria-hidden="true" className="practice-shown">
        <span className="practice-client">{shown.client}</span>
        {shown.service && <span className="practice-service type-label">{shown.service}</span>}
      </p>
    </div>
  );
}
