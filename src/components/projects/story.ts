/*
 * Shared layout and type for a project page's story (intro and text blocks).
 * The page's content column is PAGE_COLUMN; reading text sits in its left
 * 640px (READING_COLUMN) at 17px on phone and 18px from 768px, line height
 * 1.7, in charcoal.
 */

/** The page column every block aligns to: title, text and inset images. */
export const PAGE_COLUMN = "mx-auto w-full max-w-5xl px-6 md:px-16";

/** The reading measure inside the page column. */
export const READING_COLUMN = "max-w-[640px]";

/** Story text: intro and body. */
export const STORY_TEXT = "text-body-l leading-[1.7] text-foreground";

/** Section headings in the story. */
export const STORY_HEADING =
  "font-editorial font-normal text-display-m leading-[1.2] text-foreground text-balance";
