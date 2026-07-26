"use client";

import { useEffect, type RefObject } from "react";

/**
 * Desktop click-and-drag affordance for a horizontally scrollable container.
 *
 * Extracted verbatim from the original ProjectsArchive implementation so the
 * Journey timeline and the projects archive share one behaviour and cannot
 * drift apart. Touch devices already scroll natively via `overflow-x: auto`,
 * so this only adds the mouse path.
 *
 * Tracks `scrollLeft` against the pointer delta, swaps the cursor from
 * `grab` to `grabbing` while dragging, and suppresses the click that follows
 * a drag so cards inside the container do not navigate. All listeners are
 * removed and inline cursor styles cleared on unmount.
 *
 * @param ref      the scroll container
 * @param enabled  set false to skip entirely (e.g. on touch layouts)
 */
export function useDragToScroll(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean = true,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let dragged = false;
    const DRAG_THRESHOLD = 3;

    const onMouseDown = (e: MouseEvent) => {
      // Only primary button
      if (e.button !== 0) return;
      isDown = true;
      dragged = false;
      startX = e.clientX;
      scrollStart = el.scrollLeft;
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > DRAG_THRESHOLD) {
        dragged = true;
      }
      el.scrollLeft = scrollStart - dx;
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = "grab";
      el.style.userSelect = "";
    };

    // Prevent link clicks when dragging
    const onClick = (e: MouseEvent) => {
      if (dragged) {
        e.preventDefault();
        dragged = false;
      }
    };

    el.style.cursor = "grab";
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    el.addEventListener("click", onClick, { capture: true });

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("click", onClick, { capture: true });
      el.style.cursor = "";
    };
  }, [ref, enabled]);
}
