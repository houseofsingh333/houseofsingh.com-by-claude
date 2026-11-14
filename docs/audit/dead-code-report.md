# Dead code audit after #98 to #102 (Phase 1, report only)

Branch `dead-code-audit`, from `main` at `5bb7aee` (#102 merged), 14 Nov 2026.
Nothing has been removed. Phase 2 removes only what Maninder approves from the A and B lists.

## How it was checked

1. **Static scan:** knip 5 over the whole repository. Every candidate was then searched by name in `src`, `scripts`, `tests`, `docs`, `.github`, `next.config.ts`, `vercel.json`, the Sanity config and the brand files: string references, dynamic class names (`pp-${kind}`), imports, Sanity type and field names, and test helpers.
2. **Style coverage:** Chrome's CSS coverage recorded across the whole Chromium browser suite at 390 and 1440 (192 tests: every page type, the menu, every form and its errors, At a glance, the aperture through its scroll, page changes, 404). An extra temporary pass covered:
   - every page read through with motion on and with motion reduced;
   - every page without JavaScript;
   - the menu open, with the Studio item hovered and the newsletter open and wrong;
   - Home's first visit animation.

   A rule "never matched" only if no state, at either size, ever used it.
3. **Shop in full mode:** four builds with `EDITIONS_MODE=full`, at four points in time (sealed, early access, open, closed), covering:
   - the Collection, For artists with the proposal form and its errors, the archive, terms, thank you and verify;
   - phone and desktop, motion on and reduced, with and without JavaScript.
   Production has the Collection but **no pieces and no collaborators yet**. So the piece, sold out and collaborator pages cannot render. For those, the evidence is static: every Shop class in `editions.css` was searched for in the code.
4. **Assets:** every file in `public/` searched by name in code, styles, emails, the manifest, structured data and scripts.
5. **Sanity:** every schema field searched in the code outside the schema files. Production documents counted by field (read only).
6. **Operations:** every `process.env` name, all 16 API routes (who calls each), the one cron in `vercel.json` and the 5 GitHub workflows.

## Summary

| Class | Items | Bytes (source) |
|---|---|---|
| A, certainly dead | 9 | 5,580 |
| B, probably dead | 8 | 21,696 (of which 16,958 is a finished script, archived rather than deleted) |
| C, keep | 16 groups | not counted |

What reaches visitors: **none of A or B is downloaded by any page today.** The unused code is never imported into a page, the unused styles are a few hundred bytes inside stylesheets, and the unused files in `public` are never requested. So the gain is a cleaner codebase, a cleaner Studio (seven empty fields go) and under 1 KB less style source. Page speed will not change measurably.

Not found anywhere (all in use):
- dependencies;
- API routes, all 16 called (the Stripe webhook by Stripe);
- the daily email cron;
- the 5 workflows;
- environment variables.

The old Home's components were already deleted in #101, and the Home stylesheet has no rule that never matched.

## Before numbers

- **Script per page** (compressed, before load, the budget check, Chromium):

  | Page | KB |
  |---|---|
  | Home | 159 |
  | About | 157 |
  | Projects | 160 |
  | Project | 155 |
  | Journal | 162 |
  | Entry | 162 |
  | Month | 162 |
  | Contact | 159 |
  | Shop | 158 |
  | For artists | 155 |
  | Shop terms | 152 |
  | Privacy | 153 |
  | Terms | 153 |
  | Unsubscribe | 152 |
  | 404 | 152 |

- **Style files** (uncompressed):

  | Stylesheet | KB | Loaded by |
  |---|---|---|
  | Site wide | 60.3 | every page |
  | Shop | 36.7 | Shop pages only |
  | Projects | 20.7 | |
  | Home | 14.4 | |
  | About | 10.4 | |
  | Journal | 10.0 | |

  Each page loads the site wide file plus its own area's file.
- **Lighthouse**, medians of five on the last `main` run:

  | Page | Mobile | Desktop |
  |---|---|---|
  | Home | 96 | 100 |
  | About | 92 | 100 |
  | Projects | 93 | 100 |
  | Zamana | 93 | 100 |
  | Journal | 90 | 100 |

- **Build output** `.next`: 496.9 MB including the build cache. 62 script files totalling 7.87 MB uncompressed (Studio included).
- **Repository:**
  - 459 tracked files, 310 of them in `src`;
  - `src` is 1.41 MB;
  - the stylesheets total 200 KB;
  - 8 dependencies and 12 development dependencies.

## A, certainly dead

No reference anywhere, and the feature that used it is gone.

| # | What | Where | Size | Evidence | Removing it could affect |
|---|---|---|---|---|---|
| A1 | `fallbackHeroSlides`, the old hero's placeholder slides | `src/lib/placeholder-data.ts` | 651 B | knip: unused export. No import anywhere. Its only reader, the hero slideshow, was deleted in #101 (`620a070`). | Nothing. Local placeholder mode only, and nothing reads it. |
| A2 | `fallbackHomepageProjects`, the three project exhibition's placeholders | `src/lib/placeholder-data.ts` | 2,058 B | knip: unused export. No import. The exhibition was deleted in #101. | Nothing. |
| A3 | `heroSlidesQuery`, the old hero's query | `src/sanity/queries.ts` | 281 B | knip: unused export. No import. The menu reads the first slide through its own query (`queries.ts` line 49), which stays. | Nothing. The Home slides schema and document are untouched. |
| A4 | `splitFirstSentence` | `src/lib/portableText.ts` | 430 B | knip: unused export. Its last caller (the artist chapter) was deleted in #101 (`git log -S`). | Nothing. |
| A5 | `mediaMatchesNow`, `prefersReducedMotionNow` | `src/hooks/useMediaQuery.ts` | 479 B | knip: unused exports. Their comment names "the header intro". The intro overlay was deleted in #101. The hooks above them (`useMediaQuery`, `usePrefersReducedMotion`) stay. | Nothing. |
| A6 | `@keyframes scrollPulse`, the old hero's scroll cue | `src/app/styles/motion.css` | 125 B | Defined, never named by any `animation` (searched all styles and code). Its last user was removed in #101. | Nothing. The new opening's cue uses `opening-cue`. |
| A7 | `hos_newsletter_dismissed`, set before each test | `tests/e2e/helpers.ts` line 76, `tests/e2e/overflow.spec.ts` line 20 | 2 lines, about 120 B | The corner newsletter card that read this key was removed in PR 1 (#101). No code reads the key. | Nothing. The `hos_intro_seen` line beside it stays. |
| A8 | The "Newsletter card" copy: seven fields and their group (Heading, Text, Email field placeholder, Subscribe button, Not now button, Thank you heading, Thank you text) | `src/lib/siteCopy.ts` lines 178 to 196, the group in `src/sanity/schemas/siteSettings.ts` line 48 and its header comment | about 1,000 B | No component reads any of the seven (searched by name). **Production: 0 of 1 Site Settings documents hold a value in any of them.** | The Studio's Site Settings loses an empty "Newsletter card" tab. The footer and menu newsletters keep their own fields. **Schema change: needs `npx sanity@latest schema deploy` afterwards.** Removed last, in stage (e). |
| A9 | `HeroSlide` and `HomepageProject` types | `src/lib/types.ts` | 436 B | Used only by A1 and A2. | Nothing. |

## B, probably dead

Referenced only by dead code, by docs or comments, or sitting in a protected area where I want your explicit yes.

| # | What | Where | Size | Evidence | Removing it could affect |
|---|---|---|---|---|---|
| B1 | Three unused fields in Home's Introduction query: `founderRoles`, `founderBio` (with its `homeBio` fallback) and `introQuote` | `homeIntroQuery` in `src/sanity/queries.ts`, `HomeIntroData` in `src/lib/types.ts`, `fallbackHomeIntro` | 231 B query, plus types | The new Introduction reads only `founderName` and `portrait` (`src/app/(site)/page.tsx` lines 69 and 70). The other three are fetched and dropped. | Home asks Sanity for less. Nothing visible. About keeps its own query with all of them. The schema fields stay: production holds data in them (see C6). |
| B2 | `hero-placeholder-2.svg`, `hero-placeholder-3.svg` | `public/images/` | 482 B | Referenced only by A1 and A2. `hero-placeholder-1.svg` stays: the About and Introduction placeholders use it. | Nothing. Local placeholder mode only. |
| B4 | `instagram-placeholder-1.svg` to `-4.svg` | `public/images/` | 3,419 B | No reference anywhere. `contactPage.instagramPhotos` is kept on purpose (see C6), but the page never falls back to these files. Outside the old Home, and dead since an earlier Contact change. | Nothing. Only the comment in `src/lib/placeholders.ts` mentions them. |
| B5 | Four Shop rules from the first piece page design: `.ed-piece-main`, `.ed-piece-more`, `.ed-piece-maker`, `.ed-piece-foot` | `src/app/styles/editions.css` lines 383, 384 and 418 to 426 | 193 B | These four class names appear nowhere in the code (the only Shop classes of 367 rules that do not). The piece page was redesigned in Shop round 3 (`a69189a`) to `.ed-piece-panel`. **Inside the protected Shop, so your explicit yes is needed.** The selectors are shared with `.ed-piece-panel`, so only the dead names are removed and the panel's rules stay word for word. | Nothing, if approved. |
| B6 | `--animate-fade-in`, `--animate-editorial-fade-in` and their `@keyframes fadeIn`, `editorialFadeIn` | `src/app/styles/tokens.css` lines 165 and 166, `src/app/styles/motion.css` lines 6 to 26 | 413 B | No `animate-fade-in` or `animate-editorial-fade-in` class in any component. No other `animation` names the two keyframes (`editorialSlideUp` beside them is used and stays). In `tokens.css`, but they are not the protected `--ease-*` or `--dur-*` tokens; **your yes is needed because the file is protected.** | Nothing visible. |
| B7 | Comments and docs that still describe the old Home | `ScrollProgress.tsx` ("the exhibition rooms"), `SpotlightBillboard.tsx` and `SelectedWork.tsx` (the exhibition), `placeholders.ts` (hero slides, Instagram placeholders), `siteSettings.ts` header comment (Newsletter card), `project.ts` `featuredOnHomepage` description ("appears in the homepage Projects section"; it now chooses the menu photograph's default), `docs/content-import.md` and `docs/content-import/hero/item.md` ("homepage hero slides"), `docs/indexnow.md` ("a hero slide, Home") | text only | Each names something #101 removed. | Nothing in behaviour. The `featuredOnHomepage` description is Studio text, so it updates after a schema deploy. Fields and names unchanged. |
| B8 | `content-fixes.mjs`, a one time content script | `scripts/` | 16,958 B | knip: unused file. Not in any doc or workflow. Its job, the Q5 content fixes, is done. | Nothing. Moved to `scripts/archive/` with the other finished one time scripts, not deleted (Maninder, 14 Nov). |
| B9 | The image sitemap still lists the Home slide photograph under `/` | `src/lib/sitemapEntries.ts` line 32 | 1 expression | Home no longer shows the slide (it is the menu's default photograph). The crest, portrait and Selected work cover are what Home shows. | This is a correction, not a removal: it changes what the sitemap tells search engines. Listed for your decision; I would do it as its own small change. |

## C, keep

These look unused to a scan but serve a rare path or are protected.

| # | What | Why it stays |
|---|---|---|
| C1 | 14 scripts knip calls unused: `scripts/archive/*` (4), `editions-collection-01`, `editions-remove-samples`, `editions-sample-update`, `editions-seed`, `editions-tax-rates`, `favicons`, `indexnow-test`, `kit-import`, `private-records-migrate`, `share-image` | Operational, run by hand. Each is documented in `docs/editions-setup.md`, `docs/email.md`, `docs/indexnow.md` or `layout.tsx`, or kept as a record (`scripts/archive/README.md`). Shop setup ones are protected. |
| C2 | 21 unused exports and 26 unused exported types in the Shop, email, inbox, IndexNow, guardrails and Studio structure (`stripeTestMode`, `kitHasTag`, `STUCK_AGE_MS`, `DIGEST_DAYS`, `PLACED_TYPES`, `MAX_BYTES` and others) | Protected areas. Most are used inside their own file and only the word `export` is unused, so removing it saves nothing. `PLACED_TYPES` is used by `scripts/guardrails-test.ts`. |
| C3 | `transitioning` in `tests/e2e/helpers.ts` | Test helper (protected). |
| C4 | The Home slides schema (`heroSlide`) and its one document, including its `heading` and `caption` | Protected. The menu uses the first slide as Home's photograph, and the guardrails, IndexNow and the Studio's Home folder read it. |
| C5 | `ScrollProgress`, `@property --p`, every reduced motion, no JavaScript and print rule, the head script, the error and 404 pages | Protected fallbacks. ScrollProgress drives the aperture where there are no scroll timelines (Safari). |
| C6 | Schema fields holding production data that the site reads rarely or not at all: `aboutPage.homeBio` (data in 1 document), `contactPage.instagramPhotos` (data in 1 document, kept on purpose), `project.featuredOnHomepage` (5 projects; chooses the menu photograph's default) | Sanity content is never deleted, and a field holding data stays. |
| C7 | Styles that never matched in the browser runs but serve real states: hover, focus and pressed states; no JavaScript styles (the Journal, Projects); a phone held sideways (Projects); the project page layouts `pp-pair`, `pp-half`, `pp-three` and `pp-single` (chosen per project from its photographs, `pp-${kind}`); the record playing; Practice's hover panels; WebKit scrollbar rules; reduced motion page change rules. 62 rules outside the Shop in all. | Each serves a state a visitor reaches. None is left from the old Home. |
| C8 | The Shop's styles for pieces, the grid, Buy, the bars, Made by, In the making, the archive shelf, codes and the rest | They cannot render until pieces exist (production has none). Every class but the four in B5 is in the Shop's code. Protected. |
| C9 | `--featured-panel`, `--editorial-duration`, `--text-display-name` | Unused, but in the protected palette and motion tokens, or (`--text-display-name`) the Tailwind name of the new 88/48 size, whose `--type-display-name` the Introduction uses (`home.css` line 173). Only with your separate approval. |
| C10 | `public/fonts/instrument-sans-OFL.txt` | The licence for the Instrument Sans files we serve. The licence asks that it travel with the fonts. |
| C11 | `EDITIONS_ENABLED`, `GST_NUMBER` | The Shop's older on switch, used when `EDITIONS_MODE` is unset; and the GST/HST number for receipts when tax is charged. Shop and protected. |
| C12 | All 16 API routes, the daily cron, the 5 workflows | Each has a caller: a form, the Studio, the site watch, Stripe or Vercel's cron. |
| C13 | `hero-placeholder-1.svg`, `project-placeholder-*.svg` | Used by local placeholder mode. |
| C14 | The email, inbox, Kit and Resend code, the CASL lines, and the email crest image | Protected. All in use. |
| C15 | Unlisted dependencies knip noted: `postcss`, `groq-js`, `@sanity/client`, `sharp`, `tsx` | Not removals. They arrive through other packages and work today. Listing them in `package.json` is a separate small hygiene change, not part of this cleanup. |
| C16 | `public/fonts/playfair-display-latin-wght-normal.woff2`, the old variable Playfair (38,404 B) | Kept on purpose (Maninder, 14 Nov): when C1 replaced it with the static 400 cut, it stayed because emails sent before C1, already in inboxes, still link to it. Nothing on the site loads it. |

## Decision (14 Nov)

Approved for removal: A1 to A9; B1, B2, B4, B5, B6, B7. B8 moves to `scripts/archive/`. B9 as its own small commit. B3 kept (now C16). The C list stays as it is, C15 not now. Also approved: any old seller wording in the docs updated to "Maninder Singh, operating as House of Singh".

## Phase 2

Stages, one commit each, each verified:
- (a) code: A1 to A5, A9, B1;
- (b) styles: A6, B5, B6;
- (c) files in `public`: B2 and B4;
- (d) dependencies: none found;
- (e) schema: A8, then the schema deploy reminder.

A7, B7 and B8 go with the stage they belong to. B9 would be a separate small change, only if you want it.
