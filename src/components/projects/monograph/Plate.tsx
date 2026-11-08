"use client";

import { useEffect, useRef, useState } from "react";
import SanityImage from "@/components/SanityImage";
import type { PlatePhoto } from "@/lib/projectsData";
import { attachSwipe, clearSwipeStyles } from "./swipe";

/** How long each photograph holds before the next fades in. */
const HOLD_MS = 8000;

type Props = {
  photos: PlatePhoto[];
  /** The plate is the current project's. */
  active: boolean;
  /** Load this plate's first photograph (a neighbour waiting underneath). */
  load: boolean;
  /** The page's largest paint: load at once, never held back. */
  priority: boolean;
  /** The cycle may run (nothing is pausing it). */
  running: boolean;
  /** Phone: swiping the photograph moves through its photographs. */
  swipe: boolean;
  reduced: boolean;
  /** Touching the photograph (phone), to pause the cycle. */
  onTouch: (down: boolean) => void;
};

/** A photograph's focal point (its Sanity hotspot) as an object position. */
export function photoPosition(photo: PlatePhoto): string | undefined {
  const h = photo.hotspot;
  return h ? `${Math.round(h.x * 1000) / 10}% ${Math.round(h.y * 1000) / 10}%` : undefined;
}

/**
 * A project's plate: its photographs stacked, one showing at a time. While
 * its project is current and nothing pauses it, the next photograph fades
 * in every 8 s over --dur-plate on --ease-slow (styles/projects.css). On
 * phones a thin line of segments inside the bottom edge shows which
 * photograph is up, and the photograph itself can be swiped.
 */
export default function Plate({ photos, active, load, priority, running, swipe, reduced, onTouch }: Props) {
  const [shown, setShown] = useState(0);
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set(load || active ? [0] : []));
  const zoneRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const count = photos.length;
  const cycles = count > 1;

  // Load what is needed, during render so it is in the same paint: the
  // first photograph once the plate may be seen, and the next one up.
  const wanted = active ? [shown, (shown + 1) % Math.max(1, count)] : load ? [0] : [];
  if (wanted.some((i) => i < count && !loaded.has(i))) {
    setLoaded(new Set([...loaded, ...wanted.filter((i) => i < count)]));
  }

  // Back to the first photograph whenever the project stops being current.
  const [wasActive, setWasActive] = useState(active);
  if (wasActive !== active) {
    setWasActive(active);
    if (!active) setShown(0);
  }

  useEffect(() => {
    if (!active || !cycles || !running || reduced) return;
    const t = window.setInterval(() => setShown((s) => (s + 1) % count), HOLD_MS);
    return () => window.clearInterval(t);
  }, [active, cycles, running, reduced, count, shown]);

  // Phone: swipe the photograph through its photographs.
  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone || !swipe || !active || !cycles) return;
    return attachSwipe(zone, {
      current: () => layerRefs.current[shown] ?? null,
      neighbour: (dir) => layerRefs.current[shown + dir] ?? null,
      canGo: (dir) => shown + dir >= 0 && shown + dir < count,
      commit: (dir) => {
        setLoaded((l) => new Set([...l, shown + dir]));
        setShown(shown + dir);
      },
      onTouch,
      reduced: () => reduced,
    });
  }, [swipe, active, cycles, shown, count, onTouch, reduced]);

  // After a move, the photographs' own styles take over again.
  useEffect(() => {
    layerRefs.current.forEach((el) => clearSwipeStyles(el));
  }, [shown]);

  return (
    <div ref={zoneRef} className="mono-plate" data-photo-zone="">
      {photos.map((photo, i) => (
        <div
          key={photo.url + i}
          ref={(el) => {
            layerRefs.current[i] = el;
          }}
          className="mono-photo"
          data-shown={i === shown ? "" : undefined}
        >
          {loaded.has(i) && (
            <SanityImage
              image={{ url: photo.url, lqip: photo.lqip ?? undefined }}
              context="body"
              alt={photo.alt || undefined}
              fill
              priority={priority && i === 0}
              develop={false}
              sizes="(min-width: 1024px) 480px, calc(100vw - 48px)"
              className="object-cover"
              objectPosition={photoPosition(photo)}
            />
          )}
        </div>
      ))}
      {count === 0 && <span className="mono-plate-empty" aria-hidden="true" />}
      {cycles && (
        <span className="mono-segments" aria-hidden="true">
          {photos.map((photo, i) => (
            <span key={photo.url + i} data-on={i === shown ? "" : undefined} />
          ))}
        </span>
      )}
    </div>
  );
}
