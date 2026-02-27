/**
 * Shared animation easing curves and timing constants.
 *
 * Used by CinematicHero, PageTransition, ScrollReveal.
 * Keep all motion easing presets here to avoid duplication.
 */

/** Smooth general-purpose easing — subtle deceleration. */
export const EASE_SMOOTH = [0.25, 0.1, 0.25, 1] as const;

/** Slow cinematic easing — material-style deceleration. */
export const EASE_SLOW = [0.4, 0, 0.2, 1] as const;
