import { useSyncExternalStore } from "react";

function subscribe(query: string, callback: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot(query: string) {
  return window.matchMedia(query).matches;
}

const serverSnapshot = false;

/**
 * SSR-safe media query hook using useSyncExternalStore.
 * Avoids the setState-in-effect pattern flagged by React 19 lint rules.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => subscribe(query, cb),
    () => getSnapshot(query),
    () => serverSnapshot,
  );
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function useTouchDevice(): boolean {
  return useMediaQuery("(pointer: coarse)");
}
