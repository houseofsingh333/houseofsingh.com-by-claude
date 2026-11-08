"use client";

import { ViewTransition, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MonographProject } from "@/lib/projectsData";
import Plate from "./Plate";
import { attachSwipe, clearSwipeStyles, playMove, type SwipeTarget } from "./swipe";
import type { ProjectsCopy } from "./types";

type Props = {
  projects: MonographProject[];
  index: number;
  onGo: (i: number) => void;
  copy: ProjectsCopy;
  /** One by one is the view in use. */
  active: boolean;
  arriving: boolean;
  reduced: boolean;
  /** The project the page opened on (its plate and caption arrive). */
  firstIndex: number;
  /** Leaving for a project page (Enter the project, or the photograph). */
  onLeave: (slug: string) => void;
};

const PHONE = "(max-width: 1023px)";
const pad = (n: number) => String(n).padStart(2, "0");

function subscribePhone(cb: () => void) {
  const q = window.matchMedia(PHONE);
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
}

function subscribeHidden(cb: () => void) {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
}

/** Category, year, role and "Upcoming", as one small line. */
function metaOf(p: MonographProject, upcoming: string): string {
  return [...p.categories, p.year ? String(p.year) : null, p.role, p.isUpcoming ? upcoming : null]
    .filter(Boolean)
    .join(", ");
}

/** Keys typed into a field or a control that uses arrows are left alone. */
function typing(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el?.closest?.("input, textarea, select, [contenteditable=''], [contenteditable='true'], [role='slider']");
}

/**
 * One by one (frame V1a on desktop, FINAL on phone): every project is in
 * the page, stacked in one place; the current one shows, the others wait
 * hidden (and inert). Desktop: the plate on the left (it opens the project),
 * the caption column on the right, level with it, with the counter, the
 * title, category and year, the excerpt, Enter the project, and Previous
 * and Next; moving on crossfades the photograph in place as it develops.
 * Arrow keys move between projects. Phone:
 * one card per screen, swiped between projects (styles/projects.css and
 * swipe.ts), with small arrows and the counter beneath.
 */
export default function OneByOne({ projects, index, onGo, copy, active, arriving, reduced, firstIndex, onLeave }: Props) {
  const router = useRouter();
  const isPhone = useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE).matches, () => false);
  const hidden = useSyncExternalStore(subscribeHidden, () => document.hidden, () => false);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const n = projects.length;
  const current = projects[index];
  const cycles = !!current && current.plates.length > 1 && !reduced;
  const running = active && !paused && !hovering && !focused && !hidden && !touching;

  const go = useCallback((dir: 1 | -1) => onGo((index + dir + n) % n), [index, n, onGo]);

  // Arrow keys move between projects while this view is in use.
  useEffect(() => {
    if (!active || n < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || typing(e.target)) return;
      if (document.querySelector(".mono-veil[data-open]")) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, go, n]);

  // Phone: the card swipe, between projects (the photograph has its own).
  const target = useCallback(
    (): SwipeTarget => ({
      current: () => slideRefs.current[index] ?? null,
      neighbour: (dir) => slideRefs.current[index + dir] ?? null,
      canGo: (dir) => index + dir >= 0 && index + dir < n,
      commit: (dir) => onGo(index + dir),
      ignore: (t) => !!(t as HTMLElement | null)?.closest?.("[data-photo-zone]"),
      reduced: () => reduced,
    }),
    [index, n, onGo, reduced],
  );
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !isPhone || !active) return;
    return attachSwipe(stage, target());
  }, [isPhone, active, target]);

  // A new project is current: whatever a move left behind is cleared.
  useLayoutEffect(() => {
    slideRefs.current.forEach((el) => clearSwipeStyles(el));
  }, [index]);

  const phoneMove = (dir: 1 | -1) => {
    const width = stageRef.current?.getBoundingClientRect().width ?? 320;
    void playMove(target(), dir, width);
  };

  const onTouch = useCallback((down: boolean) => setTouching(down), []);

  if (!current) return null;
  const nextTitle = projects[(index + 1) % n]?.title ?? "";

  return (
    <div className="mono-one-inner">
      <div
        ref={stageRef}
        className="mono-stage"
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHovering(false)}
        onFocus={(e) => e.target.matches(":focus-visible") && setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        {projects.map((p, i) => {
          const isActive = i === index;
          return (
            <article
              key={p.id}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className="mono-slide"
              data-active={isActive ? "" : undefined}
              data-first={arriving && i === firstIndex ? "" : undefined}
              data-slug={p.slug}
              aria-labelledby={`mono-title-${p.slug}`}
              inert={!isActive}
            >
              <ViewTransition name={`project-${p.slug}`} share="project-plate" default="none">
                {/* Desktop: the photograph opens the project, like "Enter the project". */}
                <div
                  className="mono-plate-frame"
                  onClick={(e) => {
                    if (isPhone || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    onLeave(p.slug);
                    router.push(`/projects/${p.slug}`);
                  }}
                >
                  <Plate
                    photos={p.plates}
                    active={isActive && active}
                    load={Math.abs(i - index) <= 1}
                    priority={i === firstIndex}
                    running={running && isActive}
                    swipe={isPhone && isActive}
                    reduced={reduced}
                    onTouch={onTouch}
                  />
                </div>
              </ViewTransition>
              <div className="mono-caption">
                <div className="mono-count" style={{ "--i": 0 } as CSSProperties}>
                  <span className="mono-counter">
                    {pad(i + 1)} / {pad(n)}
                  </span>
                  {isActive && cycles && (
                    <button type="button" className="mono-pause" onClick={() => setPaused((v) => !v)}>
                      {paused ? copy.play : copy.pause}
                    </button>
                  )}
                </div>
                <h2 id={`mono-title-${p.slug}`} className="mono-title" style={{ "--i": 1 } as CSSProperties}>
                  {p.title}
                </h2>
                <p className="mono-meta" style={{ "--i": 2 } as CSSProperties}>
                  {metaOf(p, copy.upcoming)}
                </p>
                {p.excerpt && (
                  <p className="mono-excerpt" style={{ "--i": 3 } as CSSProperties}>
                    {p.excerpt}
                  </p>
                )}
                <Link href={`/projects/${p.slug}`} onClick={() => onLeave(p.slug)} className="mono-enter" style={{ "--i": 4 } as CSSProperties}>
                  {copy.enter}
                </Link>
                <div className="mono-nav" style={{ "--i": 5 } as CSSProperties}>
                  <button type="button" onClick={() => go(-1)}>
                    <span aria-hidden="true">&larr;</span> {copy.previous}
                  </button>
                  <button type="button" className="mono-next" onClick={() => go(1)}>
                    {copy.next} <span aria-hidden="true">&rarr;</span>
                  </button>
                  <span className="mono-next-title" aria-hidden="true">
                    {nextTitle}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Phone: small arrows with the counter between them. */}
      <div className="mono-phone-nav">
        <button type="button" aria-label={copy.previousProject} onClick={() => phoneMove(-1)}>
          <span aria-hidden="true">&larr;</span>
        </button>
        <span className="mono-counter">
          {pad(index + 1)} / {pad(n)}
        </span>
        <button type="button" aria-label={copy.nextProject} onClick={() => phoneMove(1)}>
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
}
