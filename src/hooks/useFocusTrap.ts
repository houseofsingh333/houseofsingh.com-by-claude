"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Options = {
  /** Whether the trap is on (the menu or dialog is open). */
  active: boolean;
  /** The element focus is kept inside. */
  containerRef: RefObject<HTMLElement | null>;
  /** Elements that stay interactive alongside the container (e.g. a backdrop). */
  keepRefs?: RefObject<HTMLElement | null>[];
  /** Called on Escape. */
  onEscape: () => void;
  /** Element to focus when the trap turns on (next frame). Optional. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Return focus to whatever was focused before the trap turned on. */
  restoreFocus?: boolean;
};

/**
 * Keyboard and screen reader behaviour for an overlay (menu or dialog):
 * while active, everything outside the container is inert, Tab and
 * Shift+Tab (with or without Safari's Option) go through every item inside
 * it and loop, and Escape calls onEscape. Shared by the site
 * menu and the newsletter popup so the two cannot drift apart.
 */
export function useFocusTrap({
  active,
  containerRef,
  keepRefs = [],
  onEscape,
  initialFocusRef,
  restoreFocus = false,
}: Options) {
  // Latest callbacks and refs without re-running the effect on every render.
  const onEscapeRef = useRef(onEscape);
  const keepRefsRef = useRef(keepRefs);
  useEffect(() => {
    onEscapeRef.current = onEscape;
    keepRefsRef.current = keepRefs;
  });

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const keep = new Set<Element>(
      keepRefsRef.current.map((r) => r.current).filter(Boolean) as Element[],
    );

    // Make everything outside the container inert: walk up from it and mark
    // every sibling at each level, so this works however deeply it is nested.
    const madeInert: Element[] = [];
    let node: Element | null = container;
    while (node && node !== document.body && node.parentElement) {
      for (const el of Array.from(node.parentElement.children)) {
        if (el === node || keep.has(el) || el.tagName === "SCRIPT") continue;
        if (el.hasAttribute("inert")) continue;
        el.setAttribute("inert", "");
        madeInert.push(el);
      }
      node = node.parentElement;
    }

    const frame = requestAnimationFrame(() =>
      initialFocusRef?.current?.focus({ preventScroll: true }),
    );

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscapeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter(
        // Skip the hidden honeypot field, anything inert or aria-hidden,
        // and anything not shown (a closed panel, the other layout's copy).
        (el) =>
          el.tabIndex >= 0 &&
          !el.closest("[inert]") &&
          !el.closest('[aria-hidden="true"]') &&
          el.getClientRects().length > 0,
      );
      if (focusable.length === 0) return;
      // Every Tab is moved here, not left to the browser: Safari's Tab skips
      // links unless Option is held (or "Press Tab to highlight each item"
      // is on), so its own next stop could be outside the overlay, or none.
      // Tab and Option+Tab (Alt+Tab elsewhere) both go through every item,
      // in order, and loop; Shift goes back.
      e.preventDefault();
      const at = focusable.indexOf(document.activeElement as HTMLElement);
      const step = e.shiftKey ? -1 : 1;
      const next =
        at === -1
          ? e.shiftKey
            ? focusable[focusable.length - 1]
            : focusable[0]
          : focusable[(at + step + focusable.length) % focusable.length];
      next.focus();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      for (const el of madeInert) el.removeAttribute("inert");
      if (restoreFocus && previouslyFocused?.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [active, containerRef, initialFocusRef, restoreFocus]);
}
