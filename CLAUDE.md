# CLAUDE.md — House of Singh

Read this first, every session, before writing any code. This file is the operating brief for the House of Singh website. It defines the stack, the rules that must never be broken, the brand system to build within, and how we work together. When in doubt, follow this document. If something here is wrong or outdated, flag it before proceeding.

---

## 1. What this project is

House of Singh is the personal brand and creative platform of Maninder Singh, a Toronto based creative director, photographer, and multidisciplinary designer. This repo is the website: an editorial, photography led portfolio and journal. It is distinct from House of Singh Studios (the separate client facing design studio).

The brand is calm, editorial, crafted, grounded, and timeless. Every output must protect that. The full brand system lives in `BRAND_BOOK.md` in this repo; treat it as the source of truth for all visual and brand decisions and read it when working on anything design related.

---

## 2. Who you are working with

Maninder is the founder and creative director. He is not a developer. This means:

- Explain things in plain English. If a technical term is unavoidable, define it briefly.
- Provide copy paste ready file paths and code.
- Address him as Maninder or sir.
- Never use hyphens, dashes, or emojis in written communication.
- Be direct and honest. Act as a co founder and CTO with skin in the game. Pressure test ideas, flag risks, and surface tradeoffs before building.
- When a requirement is ambiguous, ask before writing code, not after.

---

## 3. Stack and architecture (do not deviate)

- **Framework:** Next.js, App Router. Server components by default. Use client components only when interactivity genuinely requires it, and keep them small and leaf level.
- **CMS:** Sanity. Project ID `31g7gu7n`, dataset `production`.
- **Styling:** Tailwind CSS v4. Configuration lives in the `@theme` block in `src/app/styles/tokens.css`; `globals.css` imports the site wide stylesheets in `src/app/styles/` (tokens, base, layout and footer, contact, legal, shared, motion), and their order is the cascade order; each area's own stylesheet (`home.css`, `about.css`, `journal.css`, `projects.css`, `editions.css`) is imported by its own pages (the Shop's by its layout) and loads after them, so a page carries only its own styles. A rule more than one area needs goes in `shared.css`. There is no `tailwind.config` file. Do not add one. Do not introduce a different styling system.
- **Hosting:** Vercel. Production deploys from `main`. All work happens on `feature/next-work`, is pushed there (creating a Vercel preview), and reaches production only through a pull request into `main` that Maninder merges after checking the preview. Never push directly to `main`. Old branches were deleted on 4 Nov 2026; only main and feature/next-work exist.
- **Dependencies:** Use npm ci, never npm install.
- **CI:** Every pull request must show the ci check green before merging. ci runs the type check, lint, build and every automated check in `tests/` (see the Definition of done in section 7, and `tests/README.md`).
- **Language:** TypeScript throughout.
- **Messages never missed:** every message sent through a form (contact, project interest, For artists) is saved privately, then emailed to Maninder at once (the email queue's highest priority, retried every fifteen minutes by the site watch, which opens an alert if one is stuck), confirmed to the sender without repeating their words, listed daily until marked Replied (or Reviewed) or Archived, and kept in the Studio's Inbox (`lib/inbox`, `docs/email.md`, Messages through the forms).
- **Reliability:** a weekly, encrypted backup of the Sanity dataset (`docs/backup-and-restore.md`); uptime and error alerts by email through GitHub (`docs/monitoring.md`); one Studio registration, pinned in `sanity.cli.ts` (`docs/sanity-studio.md`); the Studio's guardrails, which warn before a heavy or mislabelled photograph or a weak search description is published (`docs/studio-guardrails.md`); every key, token and secret, with its permission and rotation date, in `docs/security/key-register.md` (never the values), and a Monday reminder issue when one is due.

**Architecture rules:**
- Keep components modular and separated by responsibility.
- Minimize dependencies. Do not add a library when a small amount of native code will do. Justify any new dependency before adding it.
- Avoid Vite specific logic and React Router. This is Next App Router.
- Links inside the site use `@/components/Link`, never `next/link` directly: it is Next's Link, but holds back prefetching until the first page load has finished (so the pages a visitor might open next never compete with the page being opened).
- For any task, first identify whether it affects UI, CMS schema, routing, data fetching, or deployment, and say so.
- If a request would break this architecture, stop and say so rather than complying.

---

## 4. Hard guardrails (these have bitten us, do not repeat)

1. **The Sanity schema is not auto deployed.** Schema changes in code do not appear in the Studio until `npx sanity@latest schema deploy` is run in the terminal. Always remind Maninder of this when schema changes are made.
2. **Do not commit until Maninder confirms on the preview.** Build the change, report it, and wait. Commit only when told, unless he has said otherwise for that task.
3. **`main` deploys to production.** Be deliberate about what lands there. Use the working branch for in progress work.
4. **Work in stages for large changes, and checkpoint each stage** with its own commit once the build is verified clean. Do not hold a huge multi part change as one uncommitted blob.
5. **Verify before declaring done.** Run `npm run build` and `npx tsc --noEmit` and confirm both are clean before reporting a task complete, then the checks in the Definition of done (section 7).
6. **Render rich text through the shared `proseComponents` PortableText renderer.** Do not rely on fragile descendant selectors like `[&>p]` for paragraph spacing. That approach broke once already; use explicit components.
7. **Parse Sanity dates with the local timezone utility,** not raw UTC parsing, to avoid off by one day bugs.
8. **Respect `prefers-reduced-motion` on every animation.** Provide a calm static fallback. This is mandatory, not optional.
9. **Alt text is hard required on meaningful images** in the schema. Do not reintroduce silent empty alt fallbacks. Decorative images must be explicitly marked decorative.
10. **Local development:** either reach Sanity, or run `NEXT_PUBLIC_USE_PLACEHOLDERS=1 npm run dev`.
11. **The Content Security Policy is strict and lives in `next.config.ts`** (`contentSecurityPolicy`). The one exception: the home page alone allows `'unsafe-eval'` in `script-src`, because Spotify's iFrame API (which tells the record in Chapter VI when the music plays) calls eval and is refused without it. Never widen that to other routes or sitewide; add any new host to the policy deliberately and document why.
12. **Never put `scroll-behavior: smooth` on `<html>`.** It made every new page glide up from the previous page's depth (pages seemed to open where the last one was left) and made Back glide instead of arriving. Pages scroll instantly; only same page anchor links glide, through `src/components/SmoothAnchors.tsx`. Every forward page change opens at the top through `src/components/PageTransition.tsx` (Next.js alone misjudged project pages entered from a page left a little scrolled). `tests/e2e/navigation.spec.ts` checks where pages open, Back and Forward, the Projects return, anchors, that a page change never shows two pages at once, and that the header arrives with the new page already in its top state rather than crossfading on its own (the page tells it through `PAGE_TOP_EVENT`; fixed 13 Nov) (`npm test -- navigation`).

### Protected: never change without Maninder's explicit approval

These are approved and settled. Do not change them as a side effect of other work, a cleanup, a fix or a speed pass, however small the change looks. If a task seems to need a change to one of them, stop, say so, and ask Maninder first; a general instruction to "fix" or "improve" is not approval.

1. **The header:** the crest to wordmark interaction on scroll (State 1 crest, State 2 wordmark bar) and the menu dot.
2. **The approved layouts:**
   - Home.
   - Projects: V1a (One by one) and G1 (At a glance).
   - Journal: J4 on desktop, Phone B on phones.
   - The project page ("Zamana, refined").
   - The automatic photograph layout.
3. **The brand palette and the two fonts:** the colour tokens in `src/app/styles/tokens.css`, Playfair Display and Instrument Sans. (The Shop alone adds Noto Serif Gurmukhi for the Collection's Gurmukhi numerals and a few Shop only colours, approved 11 Nov 2026 and recorded in `BRAND_BOOK.md`, The Shop palette.)
4. **The typography hierarchy and the italic rule:** the type scale and the one label style (`BRAND_BOOK.md` 2.2, `--type-label-*`), and Playfair italic only for Maninder's quote beside his portrait.
5. **The motion tokens:** the `--ease-*` and `--dur-*` values and how they are used.
6. **The security policy exception:** `'unsafe-eval'` for Spotify on the home page only; never widened, never removed without a replacement for the record.
7. **House of Singh Editions (the Shop):** its concept, states, design decisions, schema and checkout as written in `docs/shop-house-of-singh-editions.md` (setup in `docs/editions-setup.md`). How much of it a site shows is `EDITIONS_MODE`: `off` (no footer link, `/editions` is a 404), `anticipation` (the live site before launch: `/editions` shows the sealed Shop, the Collection's card with Notify me and its sections, linked from the footer's Pages list (never the site menu), indexable and in the sitemap; For artists and the terms of sale stay reachable; pieces, prices, the archive, checkout and early access are closed), `full` (Vercel Preview, and Production at launch); `/editions?preview=EDITIONS_PREVIEW_SECRET` shows one browser the full Shop on a Vercel preview only; on Production no cookie is read, so the Shop's pages in anticipation are prepared ahead and refreshed every minute like the others (approved 13 Nov). It is linked only from the footer's Pages list, and every other `/editions` page is noindex, outside the sitemap, llms.txt and the structured data. Email (Kit for the list, Resend for the website's own emails) is described in `docs/email.md`.

---

## 5. The brand system (build within this)

The full detail is in `BRAND_BOOK.md`. The essentials Claude Code must honor:

### Palette
- Canvas `#F9F7F5` (`--background`), the warm off white everything sits on.
- Charcoal `#1A1A1A` (`--foreground`), primary text. Never pure black.
- Muted grey `#76706B` (`--muted-foreground` is `hsl(30 5% 44%)`), captions, labels, secondary text. This value meets WCAG AA (4.57:1) on the canvas; the earlier `hsl(30 5% 50%)` failed at 3.65:1. Do not lighten it without re-checking contrast, and do not fade it with opacity variants (`/40`, `/60` and so on) for readable text; hierarchy comes from size, letter spacing and uppercase labels.
- Muted grey, inverse `#A8A39F` (`--muted-foreground-inverse` is `hsl(30 5% 64%)`), secondary text on the dark charcoal band. 6.56:1 on charcoal.
- Border hairline `hsl(40 10% 88%)` (`--border`).
- Antique brass `#A8895C` (`--accent`), the single accent, used rarely (the pulsing upcoming dot, a hairline, a hover, one point of emphasis). Always use the token, never the raw hex. It is 3.07:1 on the canvas, so use it for text only at 28px or larger (the chapter numerals), never for smaller text.
- Error brick `#9B4B3B` (`--error` is `hsl(10 45% 42%)`), for error messages and invalid field hairlines only. 5.67:1 on the canvas. Never use Tailwind's default reds.
- Do not introduce colors outside this palette without updating `BRAND_BOOK.md` first.

### Type
- **Serif for names and numbers, sans for sentences.** Playfair Display (`--font-editorial`, weight 400 only) is only for page, chapter, project and journal titles (including in lists, cards and the studio panels), Roman numerals, Journey years and journal dates, the Toronto time, and the About portrait quote. Every sentence is Instrument Sans, with these approved exceptions: the site's opening statement, the first sentence of the homepage introduction, in Playfair 400 at display-m (34/26); the closing line above the footer and About's pull quote ("What drives him..."), both Playfair 400 at display-m (approved 14 Nov); and, in the Shop only, the four section headings "In the making", "What this is, and what it is not", "Good to know" and "Make something with House of Singh" (and the "House of Singh × you" line) in Playfair 400 at display-l (`BRAND_BOOK.md`, The Shop's headings).
- One type scale, every size a token (`--type-*` in `src/app/styles/tokens.css`, Tailwind `text-display-xl`, `text-display-l`, `text-display-m`, `text-display-s`, `text-numeral`, `text-date`, `text-statement`, `text-body-l`, `text-body`, `text-small`, `text-legal`, and `type-label`). Never a one off size; map anything new to the nearest token.
- Body and interface: Instrument Sans, live on every page (regular 400 and medium 500), self hosted from `public/fonts` through next/font in `src/app/layout.tsx` (`--font-instrument`, with a size adjusted Arial fallback so nothing shifts). The Studio keeps its own font.
- Labels and eyebrows: one style everywhere, the label token (`--type-label-size` 12px, `--type-label-leading` 1.5, `--type-label-tracking` 0.12em, uppercase, regular; the `type-label` class in components). Muted grey at rest, charcoal with the drawn hairline when active. Never a one off label size; a label never wraps.
- Playfair italic only for Maninder's quote beside his portrait (About, chapter I). Everything else is regular Playfair.
- Display and body sizes are fluid (`clamp()` from the 390 value to the 1280 value); headings and statements balance their lines, paragraphs avoid a lone last word. The full type scale and what uses each size is in `BRAND_BOOK.md` (2.2).
- Headings are natural or sentence case, never all caps. All caps is for small labels only.
- Never use Inter, Roboto, Arial, or default system fonts as the brand body face in finished work. Generic fonts are the look we exist to avoid.

### Spacing and layout
- Generous and airy. Whitespace is the product. When unsure, add space.
- Use the section spacing tokens `--section-space-sm/md/lg`. The 144px desktop spacing is the signature pacing; do not compress it to fit more in.
- Mostly left aligned, editorial. Center only for single focal moments.
- Comfortable max widths on text. Never edge to edge reading columns.

### Motion
- Calm and minimal. Soft fades and quiet reveals, never fast or springy.
- Use the motion tokens in `src/app/styles/tokens.css`, never hard coded values: `--ease-slow` (`cubic-bezier(0.37, 0, 0.63, 1)`, a soft sine) for scroll reveals, fades, crossfades, image fade ins and the old page fading out; `--ease-soft-out` (`cubic-bezier(0.33, 1, 0.68, 1)`) for hover and focus. Durations: `--dur-reveal` 1400ms with a 12px rise (`--rise-reveal`), `--dur-image` 1000ms, `--dur-hover` 500ms, `--dur-page` 600ms, a page change in two steps that never overlap (approved 12 Nov: `--dur-page-out` 200ms, the old page and header fading to the canvas, then `--dur-page-in` 400ms on `--editorial-ease`; the Shop's phone bars leave at once; reduced motion changes page at once; the `<html>` inline `view-transition-name: root` in `src/app/layout.tsx` keeps the header in the transition, do not remove it), `--dur-develop` 1400ms (a content photograph developing to full tone when first in view), `--dur-plate` 1400ms (a Projects page plate crossfading to its next photograph). Tailwind: `ease-(--ease-slow)`, `ease-(--ease-soft-out)`, `duration-(--dur-hover)`.
- Keep quick on purpose: focus rings and form error messages appear at once; the popup opens in at most 500ms. The menu (approved 10 Nov, after slowness.com): from 1024 wide a canvas panel slides over the left half (`--dur-menu-panel`, 750ms, `--ease-slow`) and the right half fills with one photograph that fades in and settles from 1.04 (the `--dur-menu-*` and `--delay-menu-*` tokens), changing only when a page name is pointed at or focused; below 1024 an 85 percent panel over an 18 percent veil, no photograph. No Playfair in the menu: names in the small token, uppercase, numerals in the legal token, muted. The page behind keeps its scroll position, and the page header fades out with the panel and back as it closes (the crest to wordmark interaction is unchanged); choosing another page closes the menu at once, with no slide, so the page change shows only the page fading (approved 12 Nov). A page loaded or reloaded already scrolled down shows the wordmark bar at once. The old fast curve `cubic-bezier(0.22, 1, 0.36, 1)` (`--editorial-ease`) is no longer the default; it remains for the popup opening and a new page fading in.
- The 2.8s breathing brass dot is the reference for brand motion.
- One well orchestrated reveal beats many scattered micro animations.

### UI and UX principles
- Calm over dense. Less per screen. One clear focus.
- Restraint in interaction. Standard, predictable patterns. The brand expresses through type, space, and photography, not novel controls.
- Buttons and links are quiet and typographic, often a label with a hairline or subtle hover, not heavy filled shapes.
- Calls to action: primary actions (Book a call, Visit House of Singh Studios) use the outlined button (`OutlineCta`); every secondary action uses the one text link (`TextLink`: 14px, 500, uppercase, 0.12em, a permanent hairline and an arrow that moves 4px on hover; `back` puts the arrow on the left; `TextButton` for actions that are not pages). A form's step forward (Next, Review, Submit) uses `OutlineButton`. Never a third style, with one approved exception: the Shop's Buy is a solid charcoal button (`BRAND_BOOK.md`, Calls to action), and every other Shop action is a text link.
- Chapter marks: every chapter opens with `ChapterMark`, the Roman numeral in brass (30px) and a visible label in the label token beside it, editable in Sanity; a chapter title, where there is one, sits below.
- Cards let the image and a small caption do the work. Avoid borders, heavy shadows, busy chrome.
- Accessibility is non negotiable: contrast, keyboard navigation, alt text, reduced motion.

### Photography
- Photography leads and carries the brand. Give images room. Honest, warm, natural treatment. No heavy filters or trendy effects. Never cover a busy part of an image with the logo or text.

---

## 6. Voice and copy

When writing any user facing copy, captions, or content:

- Calm, grounded, reflective, confident without arrogance.
- Reflective over promotional. Insight and honesty over selling.
- No hype, no motivational speaker energy, no trend chasing, no virality bait.
- First person and human where appropriate.
- For House of Singh personal brand content (scripts, captions, social), the detailed system lives in the content playbooks. Follow them: the voice system, language strategy, content lanes, posting rhythm, reel formats, and personal boundaries.

---

## 7. How we work (the loop)

1. Maninder describes what he wants. If ambiguous, ask focused questions first.
2. For UI decisions, prefer showing a mockup or preview before committing to code, so he can see it before it is built.
3. State whether the task touches UI, CMS, routing, data fetching, or deployment.
4. For anything non trivial, audit and report before building. Diagnose root causes rather than patching symptoms.
5. Build the smallest correct change. Provide file paths and copy paste ready code.
6. Verify: `npm run build` and `npx tsc --noEmit` clean.
7. Report what changed, with a short verification checklist and any required environment variables.
8. Wait for confirmation on the preview before committing, then checkpoint with a clear commit message.

When fixes do not resolve on the first attempt, stop patching and diagnose the root cause.

---

### Definition of done

Before Maninder is asked to merge, every change passes all of this. CI runs it on every pull request (`.github/workflows/ci.yml`); the required check, ci, is green only when all of it is. How to run it on a Mac: `tests/README.md`.

1. **Type check, lint and build** are clean: `npx tsc --noEmit`, `npm run lint`, `npm run build`; and the checks that need no browser pass (the Shop, the email queue, the import tool, the Studio guardrails and the messages sent through the forms: `scripts/editions-test.ts`, `scripts/email-test.ts`, `scripts/import-content-test.mjs`, `scripts/guardrails-test.ts`, `scripts/inbox-test.ts`).
2. **Journeys** pass on a phone (390) and a desktop (1440): every page type opens, the menu, every form state, the sealed Shop and Notify me, For artists, unsubscribe, the 404.
3. **Page changes:** every new page opens at its top, Back and Forward return to where the reader was, and no frame shows two pages.
4. **Screenshots** match the approved ones. An intended change is approved with the `approve-visuals` label, after looking at the differences, never by loosening the check.
5. **Accessibility:** axe finds zero violations on every page type and state (an exception is allowed only inside a protected design awaiting Maninder's approval, listed in `tests/e2e/a11y.spec.ts`; none today).
6. **No sideways scroll** at any width from 320 to 2560.
7. **The crawl:** zero broken internal links, zero console errors.
8. **Budgets:** each page within its JavaScript size and Lighthouse limits (`tests/budgets.json`). A limit is raised only deliberately, with the reason in the pull request.
9. **The Vercel preview** passes the same browser checks (once the bypass key is set), and Maninder has looked at it.
10. **Reported honestly:** what changed, what was checked, and anything that did not pass or was skipped.

## 8. Frontend craft standard (avoid generic AI output)

Default model output drifts toward generic, on distribution design, the look people call AI slop. Resist it. For House of Singh specifically that means:

- Distinctive, editorial typography (Playfair plus Instrument Sans), never the generic defaults.
- A committed, cohesive palette driven by CSS variables, not timid evenly spread colors.
- Atmosphere and restraint over decoration. Depth from photography and whitespace, not gradients, glows, or noise.
- High impact, calm motion at key moments, not scattered fidgety micro interactions.
- Context specific choices that feel genuinely designed for this brand, not cookie cutter components.

The test for anything you build or suggest: does it feel calm, considered, and crafted, or does it feel loud, rushed, and generic? Ship only the former.

---

## 9. Entities (structured data and naming)

Three entities are shared across this site and the studio site. Their `@id` values are join keys: never rename or reformat them, or search engines and language models will treat one entity as two.

| Entity | `@id` | Owned by |
|---|---|---|
| Maninder Singh (Person) | `https://houseofsingh.com/#maninder-singh` | This site |
| House of Singh (Organization, parent brand) | `https://houseofsingh.com/#organization` | This site |
| House of Singh Studios (Organization) | `https://studios.houseofsingh.com/#organization` | studios.houseofsingh.com |

- **This site owns the Person and the parent brand.** It is the only place they are fully defined. The studio Organization is referenced by `@id` only and is never redefined here.
- **Person facts must stay identical to the studio site:** `jobTitle`, `description`, `memberOf`, `knowsAbout`, and `sameAs`, including the order of the `sameAs` profiles. Change them on both sites together, never on one alone.
- **The Person `image` is the one exception** (approved 13 Nov): this site's Person image is the About portrait in this site's own Sanity project (`31g7gu7n`), pinned as `PERSON_IMAGE` in `src/lib/structured-data.ts`; the studio site keeps its own. The studio's Sanity project (`00iree4d`) is the live studio site's: never delete it, and never point this site at it again.
- **Naming rule:** House of Singh Studios is a **venture** of House of Singh. Never call it a division or a subsidiary.
- **Dates:** House of Singh has been active since 2014. House of Singh Studios was founded in Canada in 2023.
- **Never published on this site:** the trademark registration number and the studio's exact founding day and month. Write "registered Canadian trademark" and "founded in 2023", nothing more specific. This repo is public, so that includes code, docs and commit messages.
- **Title order, everywhere:** "creative director, photographer and multidisciplinary designer". Do not reorder it.
- The JSON-LD lives in `src/lib/structured-data.ts` and renders as one `@graph` sitewide (Person, Organization, WebSite), plus one node per page type linked to those ids: `ProfilePage` (home), `AboutPage`, `CollectionPage` with an `ItemList` (Projects), `VisualArtwork` or `CreativeWork` with `ImageObject`s (each project), `Blog` and `CollectionPage` (Journal and each month), `BlogPosting` (each entry, with `contentLocation` from `src/lib/places.ts`) and `BreadcrumbList`. The plain language version for language models is `/llms.txt` and `/llms-full.txt`, generated from Sanity by `src/lib/llms.ts`; its fixed "who is who" opening is written there. Keep the two consistent.

---

*Keep this file current. When the stack, brand, or workflow changes, update CLAUDE.md and BRAND_BOOK.md together so they never drift from the real site.*
