/**
 * Easing curves for motion driven from JavaScript, where a CSS variable
 * cannot be used directly (the motion library needs the four numbers).
 * They mirror the CSS tokens in globals.css; change both together.
 *
 * Used by CinematicHero (the home hero slideshow, the only component that
 * still uses the motion library). PageTransition reads the CSS tokens
 * directly.
 */

/** Mirrors --ease-slow: a soft sine, for reveals, fades and crossfades. */
export const EASE_SLOW = [0.37, 0, 0.63, 1] as const;
