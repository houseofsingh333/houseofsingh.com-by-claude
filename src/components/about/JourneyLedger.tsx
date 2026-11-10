"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import SanityImage from "@/components/SanityImage";
import { useInView } from "@/hooks/useInView";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { hotspotPosition } from "@/lib/projectHero";
import { revealProps } from "@/lib/reveal";
import type { SanityImageAsset } from "@/lib/sanityImage";
import type { AboutMilestone } from "@/lib/types";
import { linkStudio } from "@/components/StudioLink";

/** A mouse or trackpad: the turning ledger. Otherwise (touch): the sideways swipe. */
const FINE_POINTER = "(pointer: fine)";
/** One sideways trackpad gesture turns one milestone: a gesture starts after this much quiet. */
const GESTURE_GAP_MS = 160;
/** And turns are at least this far apart. */
const TURN_MS = 500;
/** How long the outgoing photograph stays while the next one fades in (--dur-image). */
const CROSSFADE_MS = 1000;
/** Arrival: the ledger's lines rise in one by one, this far apart. */
const ARRIVE_STEP_MS = 70;
/** A swipe moves on once it covers this share of the photograph's width, or is a flick. */
const SWIPE_SHARE = 0.18;
const FLICK_PX_PER_MS = 0.35;
/** Movement before a touch is read as sideways (a swipe) or upright (the page scrolling). */
const DECIDE_PX = 8;

/** Newest first: by year, latest first; within a year, the order set in Sanity. */
function newestFirst(milestones: AboutMilestone[]): AboutMilestone[] {
  return milestones
    .map((m, i) => ({ m, i, y: Number.parseInt(m.year, 10) || 0 }))
    .sort((a, b) => b.y - a.y || a.i - b.i)
    .map((x) => x.m);
}

type Photo = { k: number; prev: number | null };
type Action = { type: "go"; k: number } | { type: "settle" };
function reducer(state: Photo, action: Action): Photo {
  if (action.type === "settle") return { ...state, prev: null };
  if (action.k === state.k) return state;
  return { k: action.k, prev: state.k };
}

/** The distance from the current milestone, capped at 3, for the fades. */
const dist = (i: number, k: number) => Math.min(Math.abs(i - k), 3);

/**
 * Chapter V on the About page, the Journey (canvas "Homepage Journal: three
 * options", page "About, Journey": "FINAL desktop" and "NEW phone: swipe
 * the photograph sideways"). Milestones newest first.
 *
 * One principle on every screen: up and down always moves the page;
 * sideways and taps move through the years. Nothing here captures vertical
 * scrolling. Which layout is chosen by the pointer, not the screen width
 * (both are in the page; styles/about.css shows one):
 *
 * A mouse or trackpad, the turning ledger: five whole lines, the year
 * leading each, the current one on the brass reading line at full
 * strength with its description, the others fading by distance; its
 * photograph beside it. It turns by the two round buttons under the
 * photograph, a click on a line, the arrow keys, or a sideways trackpad
 * swipe (one milestone a gesture; an upright wheel is never read).
 *
 * Touch (phones and tablets of any width), the sideways swipe: the
 * photograph as a carousel that follows the finger and settles on
 * release; a strip of years moving with it (tap one to go there); the
 * title and description beneath. touch-action: pan-y keeps upright
 * movement for the page.
 *
 * Fades (approved for readability, 9 Nov): beside the current one 0.64,
 * the lightest that keeps text at contrast; further out 0.16 and 0.08,
 * marked inactive until they come within one. Reduced motion: everything
 * at once, no develop.
 */
export default function JourneyLedger({ milestones, label }: { milestones: AboutMilestone[]; label: string }) {
  const items = useMemo(() => newestFirst(milestones), [milestones]);
  const last = items.length - 1;
  const [{ k, prev }, dispatch] = useReducer(reducer, { k: 0, prev: null });
  const fine = useMediaQuery(FINE_POINTER);

  const ledgerRef = useRef<HTMLDivElement>(null);
  const kRef = useRef(0);
  const settleTimer = useRef<number | undefined>(undefined);
  const arrived = useInView(ledgerRef, { threshold: 0.2 });

  /** Make milestone n the current one. */
  const go = useCallback(
    (n: number) => {
      const next = Math.max(0, Math.min(last, n));
      if (next === kRef.current) return;
      kRef.current = next;
      dispatch({ type: "go", k: next });
      window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => dispatch({ type: "settle" }), CROSSFADE_MS);
    },
    [last],
  );
  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  // The ledger: a sideways trackpad swipe turns it, one milestone a gesture.
  // Upright movement is never read, so the page always scrolls.
  useEffect(() => {
    const ledger = ledgerRef.current;
    if (!ledger || !fine) return;
    let lastWheel = 0;
    let lastTurn = 0;
    let turned = false;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 2) return;
      // Sideways: ours (this also keeps the browser's own back gesture out of it).
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheel > GESTURE_GAP_MS) turned = false;
      lastWheel = now;
      if (turned || now - lastTurn < TURN_MS || Math.abs(e.deltaX) < 8) return;
      turned = true;
      lastTurn = now;
      go(kRef.current + (e.deltaX > 0 ? 1 : -1));
    };
    ledger.addEventListener("wheel", onWheel, { passive: false });
    return () => ledger.removeEventListener("wheel", onWheel);
  }, [fine, go]);

  /** Arrow keys (and Home, End) on either layout; focus follows on the ledger's lines and the years. */
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[e.key];
    let target: number | null = step === undefined ? null : kRef.current + step;
    if (e.key === "Home") target = 0;
    if (e.key === "End") target = last;
    if (target === null || e.altKey || e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    target = Math.max(0, Math.min(last, target));
    go(target);
    const el = e.target as HTMLElement;
    const attr = el.closest("[data-jl-line]") ? "data-jl-line" : el.closest("[data-jl-year]") ? "data-jl-year" : null;
    if (attr) e.currentTarget.querySelector<HTMLElement>(`[${attr}="${target}"]`)?.focus({ preventScroll: true });
  };

  const current = items[k];

  return (
    <div className="jl">
      {/* ——— A mouse or trackpad: the turning ledger ——— */}
      <div className="jl-fine">
        <div ref={ledgerRef} role="region" aria-label={label} aria-describedby="jl-keys" className="jl-ledger" onKeyDown={onKeyDown}>
          <p id="jl-keys" className="sr-only">
            Use the arrow keys, or the newer and older buttons, to move through the years.
          </p>
          <span aria-hidden="true" className="jl-band" />
          <div className="jl-window">
            <ol className="jl-list" style={{ "--jl-k": k } as CSSProperties}>
              {items.map((m, i) => {
                const d = dist(i, k);
                const inactive = d >= 2;
                return (
                  <li key={`${m.year}-${i}`} className="jl-rise" {...revealProps({ revealed: arrived, delay: Math.max(0, i - k + 2) * ARRIVE_STEP_MS })}>
                    <button
                      type="button"
                      data-jl-line={i}
                      data-d={d}
                      className="jl-line"
                      aria-current={i === k ? "true" : undefined}
                      aria-disabled={inactive ? "true" : undefined}
                      tabIndex={i === k ? 0 : -1}
                      onClick={() => {
                        if (!inactive) go(i);
                      }}
                    >
                      <span className="jl-year">{m.year}</span>
                      <span className="jl-body">
                        <span className="jl-title hairline">{m.title}</span>
                        {m.text && <span className="jl-desc">{m.text}</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className="jl-side">
          <div className="jl-plate">
            {items.map((m, i) =>
              i === k || i === prev ? (
                <div key={i} className="jl-photo" data-on={i === k ? "" : undefined} data-out={i === prev && i !== k ? "" : undefined}>
                  <SanityImage
                    image={m.image}
                    context="body"
                    fill
                    sizes="(min-width: 1280px) 380px, 300px"
                    objectPosition={hotspotPosition(m.image as SanityImageAsset | null)}
                    className="object-cover"
                  />
                </div>
              ) : null,
            )}
          </div>
          <Turns k={k} last={last} go={go} className="jl-turns" />
        </div>
      </div>

      {/* ——— Touch: the sideways swipe ——— */}
      <Swipe items={items} k={k} go={go} label={label} onKeyDown={onKeyDown} />

      <p className="sr-only" aria-live="polite">
        {current ? `${current.year}, ${current.title}` : ""}
      </p>
    </div>
  );
}

/** The two round buttons: newer on the left, older on the right; dimmed at either end. */
function Turns({ k, last, go, className }: { k: number; last: number; go: (n: number) => void; className: string }) {
  return (
    <div className={className}>
      <button type="button" className="jl-turn" aria-label="Newer milestone" aria-disabled={k === 0 ? "true" : undefined} onClick={() => k > 0 && go(k - 1)}>
        <Arrow dir="left" />
      </button>
      <button type="button" className="jl-turn" aria-label="Older milestone" aria-disabled={k === last ? "true" : undefined} onClick={() => k < last && go(k + 1)}>
        <Arrow dir="right" />
      </button>
    </div>
  );
}

/**
 * Touch: the photograph as a sideways carousel, the strip of years moving
 * with it, the title and description beneath. The finger moves it while
 * dragging (--jl-drag); on release it settles (650ms, --ease-slow) one
 * milestone on if the swipe went far enough or was a flick. Upright
 * movement is the page's: the browser scrolls it (touch-action: pan-y)
 * and the swipe lets go.
 */
function Swipe({
  items,
  k,
  go,
  label,
  onKeyDown,
}: {
  items: AboutMilestone[];
  k: number;
  go: (n: number) => void;
  label: string;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  // The finger's recent speed (vx, px per ms) decides a flick, not the whole touch's average.
  const drag = useRef<{ id: number; x: number; y: number; dx: number; lx: number; lt: number; vx: number; sideways: boolean | null } | null>(null);
  const moved = useRef(false);
  const last = items.length - 1;
  const current = items[k];

  const setDrag = (px: number | null) => {
    const frame = frameRef.current;
    if (!frame) return;
    if (px === null) {
      frame.removeAttribute("data-dragging");
      frame.style.removeProperty("--jl-drag");
    } else {
      frame.setAttribute("data-dragging", "");
      frame.style.setProperty("--jl-drag", `${px}px`);
    }
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, lx: e.clientX, lt: performance.now(), vx: 0, sideways: null };
    moved.current = false;
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (d.sideways === null) {
      if (Math.abs(dx) < DECIDE_PX && Math.abs(dy) < DECIDE_PX) return;
      d.sideways = Math.abs(dx) > Math.abs(dy);
      if (!d.sideways) {
        drag.current = null; // upright: the page scrolls
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    moved.current = true;
    const now = performance.now();
    const inst = (e.clientX - d.lx) / Math.max(1, now - d.lt);
    d.vx = d.vx * 0.3 + inst * 0.7;
    d.lx = e.clientX;
    d.lt = now;
    // A little resistance past either end.
    const atEnd = (dx > 0 && k === 0) || (dx < 0 && k === last);
    d.dx = atEnd ? dx * 0.3 : dx;
    setDrag(d.dx);
  };
  const end = (e: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const d = drag.current;
    drag.current = null;
    setDrag(null);
    if (!d || !d.sideways || cancelled) return;
    const width = frameRef.current?.clientWidth || 1;
    // A pause before lifting the finger is not a flick.
    const flick = performance.now() - d.lt < 120 && Math.abs(d.vx) > FLICK_PX_PER_MS && Math.sign(d.vx) === Math.sign(d.dx);
    if (Math.abs(d.dx) > width * SWIPE_SHARE || flick) go(k + (d.dx < 0 ? 1 : -1));
  };

  return (
    <div role="region" aria-label={label} className="jl-touch" onKeyDown={onKeyDown}>
      <div
        ref={frameRef}
        className="jl-frame"
        style={{ "--jl-k": k } as CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => end(e, false)}
        onPointerCancel={(e) => end(e, true)}
        onClickCapture={(e) => {
          if (moved.current) e.preventDefault();
        }}
      >
        <div className="jl-track">
          {items.map((m, i) => (
            <div key={`${m.year}-${i}`} className="jl-slide" aria-hidden={i !== k ? "true" : undefined}>
              <SanityImage
                image={m.image}
                context="body"
                fill
                sizes="(min-width: 768px) 90vw, 100vw"
                objectPosition={hotspotPosition(m.image as SanityImageAsset | null)}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="jl-years" style={{ "--jl-k": k } as CSSProperties}>
        <div className="jl-years-track">
          {items.map((m, i) => {
            const d = dist(i, k);
            const inactive = d >= 2;
            return (
              <button
                key={`${m.year}-${i}`}
                type="button"
                data-jl-year={i}
                data-d={d}
                className="jl-year-tab"
                aria-label={`${m.year}, ${m.title}`}
                aria-current={i === k ? "true" : undefined}
                aria-disabled={inactive ? "true" : undefined}
                tabIndex={i === k ? 0 : -1}
                onClick={() => {
                  if (!inactive) go(i);
                }}
              >
                <span className="jl-year-text">{m.year}</span>
              </button>
            );
          })}
        </div>
        <span aria-hidden="true" className="jl-years-rule" />
      </div>

      {current && (
        <div key={k} className="jl-caption">
          <p className="jl-caption-title">{current.title}</p>
          {current.text && <p className="jl-caption-desc">{linkStudio(current.text)}</p>}
        </div>
      )}

      {/* Previous and next for keyboards and assistive technology; seen only when focused. */}
      <Turns k={k} last={last} go={go} className="jl-touch-turns" />
    </div>
  );
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      {dir === "left" ? <path d="M19 12H5m6-6-6 6 6 6" /> : <path d="M5 12h14m-6-6 6 6-6 6" />}
    </svg>
  );
}
