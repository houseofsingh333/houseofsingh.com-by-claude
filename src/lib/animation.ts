/**
 * Shared animation easing curves and timing constants.
 *
 * EASE_SLOW and EASE_SMOOTH drive the home hero (CinematicHero, the only
 * component that still uses the motion library) and the page transition
 * (PageTransition, Web Animations API). The scroll reveal CSS uses the same
 * curve as EASE_SMOOTH (src/lib/reveal.ts). Keep easing presets here.
 */

/** Smooth general-purpose easing — subtle deceleration. */
export const EASE_SMOOTH = [0.25, 0.1, 0.25, 1] as const;

/** Slow cinematic easing — material-style deceleration. */
export const EASE_SLOW = [0.4, 0, 0.2, 1] as const;
