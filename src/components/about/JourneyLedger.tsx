"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useSyncExternalStore, type KeyboardEvent } from "react";
import SanityImage from "@/components/SanityImage";
import { useInView } from "@/hooks/useInView";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { hotspotPosition } from "@/lib/projectHero";
import { revealProps } from "@/lib/reveal";
import type { SanityImageAsset } from "@/lib/sanityImage";
import type { AboutMilestone } from "@/lib/types";

/** Two columns and the turning ledger from here; below, the phone picker. */
const TWO_COLUMNS = "(min-width: 1024px)";
/** One wheel or trackpad gesture turns one milestone: a gesture starts after this much quiet. */
const GESTURE_GAP_MS = 160;
/** And turns are at least this far apart. */
const TURN_MS = 500;
/** How long the outgoing photograph stays while the next one fades in (--dur-image). */
const CROSSFADE_MS = 1000;
/** Arrival: the lines rise in one by one, this far apart. */
const ARRIVE_STEP_MS = 70;

// ——— The first visit hint, remembered in localStorage ———
const HINT_KEY = "hos_journey_hint_seen";
const hintListeners = new Set<() => void>();
function hintSeen(): boolean {
  try {
    return window.localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return true; // No storage (private mode, blocked): no hint rather than one that never leaves.
  }
}
function markHintSeen() {
  try {
    window.localStorage.setItem(HINT_KEY, "1");
  } catch {
    /* storage unavailable: the hint still hides for this visit */
  }
  hintDismissed = true;
  hintListeners.forEach((l) => l());
}
let hintDismissed = false;
function useHintVisible(): boolean {
  return useSyncExternalStore(
    (cb) => {
      hintListeners.add(cb);
      return () => hintListeners.delete(cb);
    },
    () => !hintDismissed && !hintSeen(),
    () => false,
  );
}

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

/**
 * Chapter V on the About page, the Journey as a turning ledger (canvas
 * "Homepage Journal: three options", page "About, Journey", "FINAL desktop"
 * and "FINAL phone"). The milestones newest first, the year leading each
 * line; the one on the reading line (between the brass hairline and the
 * light one) at full strength with its description, the others fading by
 * distance. Its photograph sits beside the ledger and follows it.
 *
 * From 1024px: a window of five whole lines. A wheel or trackpad gesture
 * over it turns it one milestone (and at either end passes to the page),
 * as do the arrow keys, a click on a line and the two round buttons under
 * the photograph. Pointing at a line only previews it.
 * Below 1024px: one column, the photograph above a native scroll picker
 * of three whole lines that snaps to the reading line.
 *
 * Fades (approved for readability, 9 Nov): the lines next to the reading
 * line rest at 0.64, the lightest that keeps their text at 4.5:1; those
 * further out at 0.16 and 0.08, marked inactive until they come within one
 * line. All motion is CSS (styles/about.css, Journey ledger); reduced
 * motion: everything at once.
 */
export default function JourneyLedger({
  milestones,
  hint,
  label,
}: {
  milestones: AboutMilestone[];
  /** "Scroll", beside the first visit hint. */
  hint: string;
  /** The ledger region's name, distinct from the chapter's. */
  label: string;
}) {
  const items = useMemo(() => newestFirst(milestones), [milestones]);
  const last = items.length - 1;
  const [{ k, prev }, dispatch] = useReducer(reducer, { k: 0, prev: null });
  const twoColumns = useMediaQuery(TWO_COLUMNS);
  const hintVisible = useHintVisible();

  const regionRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const kRef = useRef(0);
  const settleTimer = useRef<number | undefined>(undefined);
  const arrived = useInView(regionRef, { threshold: 0.2 });

  /** Make milestone n the current one (photograph, fades, hint). */
  const go = useCallback(
    (n: number) => {
      const next = Math.max(0, Math.min(last, n));
      if (next === kRef.current) return;
      kRef.current = next;
      dispatch({ type: "go", k: next });
      window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => dispatch({ type: "settle" }), CROSSFADE_MS);
      if (!hintDismissed) markHintSeen();
    },
    [last],
  );
  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  /** Turn to milestone n: by moving the list (two columns) or scrolling the picker (phone). */
  const turnTo = useCallback(
    (n: number) => {
      const target = Math.max(0, Math.min(last, n));
      const win = windowRef.current;
      if (!twoColumns && win) {
        const row = rowHeight(win);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        win.scrollTo({ top: target * row, behavior: reduce ? "auto" : "smooth" });
        return; // The scroll itself makes it current.
      }
      go(target);
    },
    [go, last, twoColumns],
  );

  // Two columns: each wheel or trackpad gesture over the ledger turns it by
  // one; at either end the gesture passes to the page (never trapped),
  // unless it already turned the ledger.
  useEffect(() => {
    const region = regionRef.current;
    if (!region || !twoColumns) return;
    let lastWheel = 0;
    let lastTurn = 0;
    let turnedThisGesture = false;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch zoom
      const dy = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : 0;
      if (Math.abs(dy) < 1) return;
      const now = performance.now();
      const newGesture = now - lastWheel > GESTURE_GAP_MS;
      lastWheel = now;
      if (newGesture) turnedThisGesture = false;
      const dir = dy > 0 ? 1 : -1;
      const atEnd = (dir < 0 && kRef.current === 0) || (dir > 0 && kRef.current === last);
      if (atEnd && !turnedThisGesture) return; // to the page
      e.preventDefault();
      if (atEnd || turnedThisGesture || now - lastTurn < TURN_MS) return;
      lastTurn = now;
      turnedThisGesture = true;
      go(kRef.current + dir);
    };
    region.addEventListener("wheel", onWheel, { passive: false });
    return () => region.removeEventListener("wheel", onWheel);
  }, [go, last, twoColumns]);

  // Phone: the picker's scroll position chooses the current milestone.
  useEffect(() => {
    const win = windowRef.current;
    if (!win || twoColumns) return;
    // Entering the phone layout: show the current milestone on the reading line.
    win.scrollTop = kRef.current * rowHeight(win);
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        go(Math.round(win.scrollTop / rowHeight(win)));
      });
    };
    win.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      win.removeEventListener("scroll", onScroll);
    };
  }, [go, twoColumns]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[e.key];
    let target: number | null = step === undefined ? null : kRef.current + step;
    if (e.key === "Home") target = 0;
    if (e.key === "End") target = last;
    if (target === null || e.altKey || e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    target = Math.max(0, Math.min(last, target));
    turnTo(target);
    // Keyboard focus follows the reading line (one tab stop for the list).
    if ((e.target as HTMLElement).closest("[data-jl-line]")) {
      regionRef.current?.querySelector<HTMLElement>(`[data-jl-line="${target}"]`)?.focus({ preventScroll: true });
    }
  };

  const current = items[k];

  return (
    <div className="jl" data-arrived={arrived ? "" : undefined}>
      <div
        ref={regionRef}
        role="region"
        aria-label={label}
        aria-describedby="jl-keys"
        className="jl-ledger"
        data-glide-off=""
        onKeyDown={onKeyDown}
      >
        <p id="jl-keys" className="sr-only">
          Use the arrow keys to move through the years.
        </p>
        <span aria-hidden="true" className="jl-band" />
        <div aria-hidden="true" className="jl-hint" data-on={hintVisible ? "" : undefined}>
          <span className="jl-hint-track">
            <span className="jl-hint-dot" />
          </span>
          <span className="jl-hint-label">{hint}</span>
        </div>
        <div ref={windowRef} className="jl-window">
          <ol className="jl-list" style={{ "--jl-k": k } as React.CSSProperties}>
            {items.map((m, i) => {
              const d = Math.min(Math.abs(i - k), 3);
              const inactive = d >= 2;
              return (
                <li
                  key={`${m.year}-${i}`}
                  className="jl-rise"
                  {...revealProps({ revealed: arrived, delay: Math.max(0, i - k + 2) * ARRIVE_STEP_MS })}
                >
                  <button
                    type="button"
                    data-jl-line={i}
                    data-d={d}
                    className="jl-line"
                    aria-current={i === k ? "true" : undefined}
                    aria-disabled={inactive ? "true" : undefined}
                    tabIndex={i === k ? 0 : -1}
                    onClick={() => {
                      if (!inactive) turnTo(i);
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
                  sizes="(min-width: 1280px) 380px, (min-width: 1024px) 300px, min(480px, 92vw)"
                  objectPosition={hotspotPosition(m.image as SanityImageAsset | null)}
                  className="object-cover"
                />
              </div>
            ) : null,
          )}
        </div>
        <div className="jl-turns">
          <button
            type="button"
            className="jl-turn"
            aria-label="Newer milestone"
            aria-disabled={k === 0 ? "true" : undefined}
            onClick={() => k > 0 && turnTo(k - 1)}
          >
            <Arrow dir="left" />
          </button>
          <button
            type="button"
            className="jl-turn"
            aria-label="Older milestone"
            aria-disabled={k === last ? "true" : undefined}
            onClick={() => k < last && turnTo(k + 1)}
          >
            <Arrow dir="right" />
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {current ? `${current.year}, ${current.title}` : ""}
      </p>
    </div>
  );
}

/** The height of one line, from the CSS (--jl-row). */
function rowHeight(win: HTMLElement): number {
  return parseFloat(getComputedStyle(win).getPropertyValue("--jl-row")) || 104;
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      {dir === "left" ? <path d="M19 12H5m6-6-6 6 6 6" /> : <path d="M5 12h14m-6-6 6 6-6 6" />}
    </svg>
  );
}
