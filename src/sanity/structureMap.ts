/**
 * Where each document type sits in the Studio's sidebar (sanity/structure.ts),
 * kept apart from the sidebar itself so the Studio checks can read it
 * without loading the Studio (scripts/guardrails-test.ts).
 */
import { INBOX_TYPES } from "../lib/inbox/kinds";

/** Single pages: opened directly, never created anew or duplicated. */
export const SINGLETON_TYPES = new Set([
  "aboutPage",
  "contactPage",
  "siteSettings",
  "navigation",
  "spotlight",
  "editionsSettings",
  "editionsShipping",
  "editionsSmallSupplier",
]);

/**
 * Where each document type is found. Every type the Studio stores is
 * listed once (scripts/guardrails-test.ts checks it); "hidden" types are
 * the site's own day counters, never edited by hand.
 */
export const PLACED_TYPES = {
  inbox: [...INBOX_TYPES],
  website: ["heroSlide", "spotlight", "aboutPage", "project", "journalEntry", "contactPage"],
  shop: ["editionsCollection", "editionsPiece", "editionsCollaborator", "editionsOrder", "editionsSettings", "editionsShipping", "editionsCategory", "editionsSmallSupplier"],
  settings: ["siteSettings", "navigation", "redirect"],
  system: ["newsletterSubscriber", "emailQueued", "signupPending", "editionsCollector", "editionsNotify"],
  hidden: ["emailDay"],
} as const;

