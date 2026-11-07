"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { categorySlug } from "@/lib/projectCategories";
import type { MonographProject } from "@/lib/projectsData";
import { durationMs, token } from "./motion";
import { photoPosition } from "./Plate";

type Props = {
  projects: MonographProject[];
  /** The category slug shown (null: all work). */
  filter: string | null;
  reduced: boolean;
  /** Open a project One by one (a plain click on its plate). */
  onOpen: (index: number) => void;
};

/** How long plates that leave take to fade out before the rest move up. */
const LEAVE_MS = 500;

function matches(p: MonographProject, filter: string | null): boolean {
  return !filter || p.categories.some((c) => categorySlug(c) === filter);
}

/** A plain click: no modifier keys, the main button. Anything else follows the link. */
function plainClick(e: MouseEvent): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

/**
 * At a glance (frame G2 on desktop, two columns on phone): every project as
 * a 4:5 plate with its title and category, three columns with the middle
 * one set lower. Each plate is a real link to its project page (so it is in
 * the server HTML and works without JavaScript); a plain click opens the
 * project One by one instead.
 *
 * Filtering: the plates that leave fade out, then the ones that stay glide
 * from where they were to where they now belong (measured before and after,
 * moved with transforms only), and any that join fade in. Reduced motion:
 * the grid simply changes.
 */
export default function AtAGlance({ projects, filter, reduced, onOpen }: Props) {
  // The filter the grid is laid out for; it follows `filter` once any
  // leaving plates have faded.
  const [laidOut, setLaidOut] = useState(filter);
  const [leaving, setLeaving] = useState<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const before = useRef<Map<string, DOMRect> | null>(null);

  // A new filter: fade out what leaves, then lay out again.
  const [asked, setAsked] = useState(filter);
  if (asked !== filter) {
    setAsked(filter);
    if (reduced) setLaidOut(filter);
    else setLeaving(filter);
  }

  useLayoutEffect(() => {
    if (leaving === null) return;
    const t = window.setTimeout(() => {
      const rects = new Map<string, DOMRect>();
      cardRefs.current.forEach((el, id) => {
        if (el.offsetParent !== null) rects.set(id, el.getBoundingClientRect());
      });
      before.current = rects;
      setLeaving(null);
      setLaidOut(filter);
    }, LEAVE_MS);
    return () => window.clearTimeout(t);
  }, [leaving, filter]);

  // After the new layout: each plate that stayed starts where it was and
  // glides to its new place; plates that join fade in.
  useLayoutEffect(() => {
    const rects = before.current;
    before.current = null;
    if (!rects) return;
    const easing = token("--ease-slow", "cubic-bezier(0.37, 0, 0.63, 1)");
    const duration = durationMs("--dur-image", 1000);
    cardRefs.current.forEach((el, id) => {
      if (el.offsetParent === null) return;
      const was = rects.get(id);
      if (!was) {
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing, fill: "backwards" });
        return;
      }
      const now = el.getBoundingClientRect();
      const dx = was.left - now.left;
      const dy = was.top - now.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration, easing });
    });
  }, [laidOut]);

  let shown = 0;
  return (
    <ul className="mono-grid" role="list">
      {projects.map((p, i) => {
        const inGrid = matches(p, laidOut);
        const fading = leaving !== null && inGrid && !matches(p, leaving);
        const at = inGrid ? shown++ : -1;
        const photo = p.plates[0];
        return (
          <li
            key={p.id}
            ref={(el) => {
              if (el) cardRefs.current.set(p.id, el);
              else cardRefs.current.delete(p.id);
            }}
            className="mono-card"
            hidden={!inGrid}
            data-leaving={fading ? "" : undefined}
            data-col3={at >= 0 ? at % 3 : undefined}
            style={{ "--r3": Math.floor(at / 3), "--r2": Math.floor(at / 2) } as CSSProperties}
          >
            <Link
              href={`/projects/${p.slug}`}
              className="mono-card-link"
              onClick={(e) => {
                if (!plainClick(e)) return;
                e.preventDefault();
                onOpen(i);
              }}
            >
              <span className="mono-card-plate">
                {photo ? (
                  <SanityImage
                    image={{ url: photo.url, lqip: photo.lqip ?? undefined }}
                    context="body"
                    alt={photo.alt || undefined}
                    fill
                    sizes="(min-width: 1024px) 30vw, 50vw"
                    className="object-cover"
                    objectPosition={photoPosition(photo)}
                  />
                ) : (
                  <span className="mono-plate-empty" aria-hidden="true" />
                )}
              </span>
              <span className="mono-card-title">{p.title}</span>
              {p.categories.length > 0 && <span className="mono-card-meta">{p.categories.join(", ")}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
