"use client";

import { useEffect, type RefObject } from "react";

/**
 * Desktop click-and-drag affordance for a horizontally scrollable container.
 *
 * Shared by the projects archive and the About Journey timeline so the two
 * behave identically and cannot drift apart.
 *
 * Uses Pointer Events rather than mouse events. The original mouse-event
 * version worked in Chrome but silently failed in Safari: the cards contain
 * images, and WebKit starts its own native image-drag / text-selection on
 * mousedown, which swallows the subsequent window mousemove events so
 * scrollLeft never updated. Pointer Events fix that properly:
 *
 *   - `preventDefault()` on pointerdown suppresses the native image drag and
 *     text selection that hijacked the gesture in Safari.
 *   - `setPointerCapture()` routes every later move/up event back to this
 *     element, so the drag survives the pointer leaving the container.
 *   - One code path covers mouse, trackpad and stylus.
 *
 * Touch is deliberately excluded — `overflow-x: auto` already gives touch
 * devices native momentum scrolling, and hijacking it would be worse.
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

    const lockSelection = (lock: boolean) => {
      // Safari needs the prefixed property; setProperty covers both without
      // relying on vendor-specific keys existing on CSSStyleDeclaration.
      el.style.setProperty("user-select", lock ? "none" : "");
      el.style.setProperty("-webkit-user-select", lock ? "none" : "");
    };

    const onPointerDown = (e: PointerEvent) => {
      // Let touch scroll natively; primary button only for mouse/pen.
      if (e.pointerType === "touch") return;
      if (e.button !== 0) return;

      isDown = true;
      dragged = false;
      startX = e.clientX;
      scrollStart = el.scrollLeft;

      // Stops WebKit's native image drag / text selection stealing the gesture.
      e.preventDefault();
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* capture is best-effort; the drag still works without it */
      }

      el.style.cursor = "grabbing";
      lockSelection(true);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > DRAG_THRESHOLD) {
        dragged = true;
      }
      el.scrollLeft = scrollStart - dx;
    };

    const endDrag = (e: PointerEvent) => {
      if (!isDown) return;
      isDown = false;
      try {
        if (el.hasPointerCapture(e.pointerId)) {
          el.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* noop */
      }
      el.style.cursor = "grab";
      lockSelection(false);
    };

    // Prevent link clicks when dragging
    const onClick = (e: MouseEvent) => {
      if (dragged) {
        e.preventDefault();
        dragged = false;
      }
    };

    el.style.cursor = "grab";
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("click", onClick, { capture: true });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("click", onClick, { capture: true });
      el.style.cursor = "";
      lockSelection(false);
    };
  }, [ref, enabled]);
}
