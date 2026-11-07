/*
 * Reading the motion tokens (styles/tokens.css) from script, for the few
 * moves that run in JavaScript: the swipe, the filter's glide and the view
 * switch. The built stylesheet may rewrite a duration ("1000ms" becomes
 * "1s"), so durations are read with their unit.
 */

/** A custom property from :root, or the fallback when it is not set. */
export function token(name: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/** A duration token in milliseconds ("600ms", "0.6s" or ".6s"). */
export function durationMs(name: string, fallbackMs: number): number {
  const v = token(name, "");
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return fallbackMs;
  return v.endsWith("ms") ? n : v.endsWith("s") ? n * 1000 : fallbackMs;
}
