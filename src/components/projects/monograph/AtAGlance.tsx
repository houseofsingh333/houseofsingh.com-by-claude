"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
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
  /** Open a project One by one (a plain click on its photograph). */
  onOpen: (index: number, card: HTMLElement) => void;
  /** Changes each time the view arrives (page load or a switch): the plates arrive again. */
  arrival: number;
  /** The plate that grows into its place (shared element): it does not arrive. */
  sharedSlug: string | null;
  /** Back from this project's page: a brass line draws under its title, holds, then fades. */
  returnSlug: string | null;
};

/** How long plates that leave take to fade out before the rest move up. */
const LEAVE_MS = 500;
/** The flipbook: a pause before it starts, then each photograph holds this long. */
const FLIP_DELAY_MS = 500;
const FLIP_MS = 1600;
/** Arrival rhythm: between items in a row, and between rows. */
const ITEM_MS = 120;
const ROW_MS = 260;

function matches(p: MonographProject, filter: string | null): boolean {
  return !filter || p.categories.some((c) => categorySlug(c) === filter);
}

/** A plain click: no modifier keys, the main button. Anything else follows the link. */
function plainClick(e: MouseEvent): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

/**
 * At a glance (frame G1, "the full experience"; two columns on phone): every
 * project as a 4:5 photograph in three equal columns, its title in Playfair
 * with the category in small capitals on the same line. Each photograph is
 * a real link to its project page (in the server HTML, works without
 * JavaScript); a plain click grows it into the One by one plate instead.
 *
 * Arrival (each time the view comes in): the plates in the first screen
 * rise 12px and develop, left to right, row by row; rows further down only
 * develop as they scroll into view. Hover or keyboard focus: the photograph
 * eases closer and the title's hairline draws; after a moment its
 * photographs follow one another like a slow flipbook until the pointer
 * leaves. Filtering: plates that leave fade out, the rest glide to their
 * new places. Reduced motion: none of it moves; everything at full tone.
 */
export default function AtAGlance({ projects, filter, reduced, onOpen, arrival, sharedSlug, returnSlug }: Props) {
  const [laidOut, setLaidOut] = useState(filter);
  // The filter being changed to, while the plates that leave fade (null: not changing).
  const [leaving, setLeaving] = useState<{ to: string | null } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [flip, setFlip] = useState(0);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const before = useRef<Map<string, DOMRect> | null>(null);

  // A new filter: fade out what leaves, then lay out again.
  const [asked, setAsked] = useState(filter);
  if (asked !== filter) {
    setAsked(filter);
    if (reduced) setLaidOut(filter);
    else setLeaving({ to: filter });
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

  // After the new layout: each plate that stayed glides from where it was;
  // plates that join fade in.
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

  // Arrival: plates in the first screen rise and develop in rhythm; the
  // rest wait and develop as they come into view.
  useLayoutEffect(() => {
    if (!arrival || reduced) return;
    const cards = [...cardRefs.current.entries()].filter(([, el]) => el.offsetParent !== null);
    if (!cards.length) return;
    const fold = window.innerHeight;
    const topOf = (el: HTMLElement) => Math.round(el.getBoundingClientRect().top);
    const rows = [...new Set(cards.map(([, el]) => topOf(el)))].sort((a, b) => a - b);
    const io = new IntersectionObserver(
      (list) => {
        for (const x of list) {
          if (!x.isIntersecting) continue;
          (x.target as HTMLElement).dataset.arrive = "develop";
          io.unobserve(x.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    const frames: number[] = [];
    for (const [id, el] of cards) {
      delete el.dataset.arrive;
      if (projects.find((p) => p.id === id)?.slug === sharedSlug) continue;
      const top = topOf(el);
      if (top < fold) {
        const col = cards.filter(([, other]) => topOf(other) === top && other.getBoundingClientRect().left < el.getBoundingClientRect().left).length;
        el.style.setProperty("--arrive-delay", `${rows.indexOf(top) * ROW_MS + col * ITEM_MS}ms`);
        el.dataset.arrive = "pre";
        frames.push(requestAnimationFrame(() => (el.dataset.arrive = "rise")));
      } else {
        el.dataset.arrive = "wait";
        io.observe(el);
      }
    }
    return () => {
      io.disconnect();
      frames.forEach(cancelAnimationFrame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrival]);

  // The flipbook: after a moment, the hovered project's photographs take
  // turns, looping until the pointer leaves (the cover then returns).
  const hoveredProject = projects.find((p) => p.id === hovered);
  const count = hoveredProject?.plates.length ?? 0;
  const flips = !reduced && count > 1;
  useEffect(() => {
    if (!flips) return;
    let t = window.setTimeout(function step() {
      setFlip((f) => (f + 1) % count);
      t = window.setTimeout(step, FLIP_MS);
    }, FLIP_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [flips, count, hovered]);

  const point = (id: string | null) => {
    setHovered(id);
    setFlip(0);
  };

  let shown = 0;
  return (
    <ul className="mono-grid" role="list">
      {projects.map((p, i) => {
        const inGrid = matches(p, laidOut);
        const fading = leaving !== null && inGrid && !matches(p, leaving.to);
        const at = inGrid ? shown++ : -1;
        const isHovered = hovered === p.id;
        const active = isHovered && flips ? flip : 0;
        return (
          <li
            key={p.id}
            ref={(el) => {
              if (el) cardRefs.current.set(p.id, el);
              else cardRefs.current.delete(p.id);
            }}
            className="mono-card"
            hidden={!inGrid}
            data-slug={p.slug}
            data-leaving={fading ? "" : undefined}
            data-return={returnSlug === p.slug ? "" : undefined}
            data-early={at >= 0 && at < 6 ? "" : undefined}
            style={{ "--r2": Math.floor(at / 2), "--c2": at % 2, "--r3": Math.floor(at / 3), "--c3": at % 3 } as CSSProperties}
          >
            <Link
              href={`/projects/${p.slug}`}
              className="mono-card-link"
              onPointerEnter={(e) => e.pointerType === "mouse" && point(p.id)}
              onPointerLeave={(e) => e.pointerType === "mouse" && point(null)}
              onFocus={(e) => e.currentTarget.matches(":focus-visible") && point(p.id)}
              onBlur={() => point(null)}
              onClick={(e) => {
                if (!plainClick(e)) return;
                e.preventDefault();
                point(null);
                onOpen(i, e.currentTarget.closest(".mono-card") as HTMLElement);
              }}
            >
              <span className="mono-card-plate" data-hovered={isHovered ? "" : undefined}>
                {p.plates.length ? (
                  p.plates.map((photo, k) =>
                    // The cover always; the others only once the flipbook needs them.
                    k === 0 || (isHovered && flips) ? (
                      <span key={photo.url + k} className="mono-card-photo" data-shown={k === active ? "" : undefined}>
                        <SanityImage
                          image={{ url: photo.url, lqip: photo.lqip ?? undefined }}
                          context="body"
                          alt={k === 0 ? photo.alt || undefined : ""}
                          fill
                          develop={k === 0}
                          sizes="(min-width: 1024px) 30vw, 50vw"
                          className="object-cover"
                          objectPosition={photoPosition(photo)}
                        />
                      </span>
                    ) : null,
                  )
                ) : (
                  <span className="mono-plate-empty" aria-hidden="true" />
                )}
              </span>
              <span className="mono-card-caption">
                <span className="mono-card-title">{p.title}</span>
                {p.categories.length > 0 && <span className="mono-card-meta">{p.categories.join(", ")}</span>}
                {/* Read only without JavaScript (crawlers, reading modes): the
                    short description One by one shows (audit P5). */}
                {p.excerpt && <span className="mono-card-excerpt">{p.excerpt}</span>}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
