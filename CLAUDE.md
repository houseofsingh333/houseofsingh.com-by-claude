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
- **Styling:** Tailwind CSS v4. Configuration lives in the `@theme` block in `globals.css`. There is no `tailwind.config` file. Do not add one. Do not introduce a different styling system.
- **Hosting:** Vercel. The `main` branch deploys to production.
- **Language:** TypeScript throughout.

**Architecture rules:**
- Keep components modular and separated by responsibility.
- Minimize dependencies. Do not add a library when a small amount of native code will do. Justify any new dependency before adding it.
- Avoid Vite specific logic and React Router. This is Next App Router.
- For any task, first identify whether it affects UI, CMS schema, routing, data fetching, or deployment, and say so.
- If a request would break this architecture, stop and say so rather than complying.

---

## 4. Hard guardrails (these have bitten us, do not repeat)

1. **The Sanity schema is not auto deployed.** Schema changes in code do not appear in the Studio until `npx sanity@latest schema deploy` is run in the terminal. Always remind Maninder of this when schema changes are made.
2. **Do not commit until Maninder confirms on the preview.** Build the change, report it, and wait. Commit only when told, unless he has said otherwise for that task.
3. **`main` deploys to production.** Be deliberate about what lands there. Use the working branch for in progress work.
4. **Work in stages for large changes, and checkpoint each stage** with its own commit once the build is verified clean. Do not hold a huge multi part change as one uncommitted blob.
5. **Verify before declaring done.** Run `npm run build` and `npx tsc --noEmit` and confirm both are clean before reporting a task complete.
6. **Render rich text through the shared `proseComponents` PortableText renderer.** Do not rely on fragile descendant selectors like `[&>p]` for paragraph spacing. That approach broke once already; use explicit components.
7. **Parse Sanity dates with the local timezone utility,** not raw UTC parsing, to avoid off by one day bugs.
8. **Respect `prefers-reduced-motion` on every animation.** Provide a calm static fallback. This is mandatory, not optional.
9. **Alt text is hard required on meaningful images** in the schema. Do not reintroduce silent empty alt fallbacks. Decorative images must be explicitly marked decorative.

---

## 5. The brand system (build within this)

The full detail is in `BRAND_BOOK.md`. The essentials Claude Code must honor:

### Palette
- Canvas `#F9F7F5` (`--background`), the warm off white everything sits on.
- Charcoal `#1A1A1A` (`--foreground`), primary text. Never pure black.
- Muted grey `#6B6B6B` (`--muted-foreground`), captions, labels, secondary text.
- Border hairline `hsl(40 10% 88%)` (`--border`).
- Antique brass `#A8895C`, the single accent, used rarely (the pulsing upcoming dot, a hairline, a hover, one point of emphasis). It is not yet a CSS token; if accent use grows, propose adding `--accent` rather than scattering the hex.
- Do not introduce colors outside this palette without updating `BRAND_BOOK.md` first.

### Type
- Display and headings: Playfair Display via `--font-editorial`.
- Body and interface: Instrument Sans is the intended body font. The site may still be on a system stack; if so, the upgrade to Instrument Sans is a known, approved target.
- Labels and eyebrows: uppercase, small (11px to 13px), wide letter spacing (0.1em to 0.2em), muted grey.
- Headings are natural or sentence case, never all caps. All caps is for small labels only.
- Never use Inter, Roboto, Arial, or default system fonts as the brand body face in finished work. Generic fonts are the look we exist to avoid.

### Spacing and layout
- Generous and airy. Whitespace is the product. When unsure, add space.
- Use the section spacing tokens `--section-space-sm/md/lg`. The 144px desktop spacing is the signature pacing; do not compress it to fit more in.
- Mostly left aligned, editorial. Center only for single focal moments.
- Comfortable max widths on text. Never edge to edge reading columns.

### Motion
- Calm and minimal. Soft fades and quiet reveals, never fast or springy.
- Signature easing `cubic-bezier(0.22, 1, 0.36, 1)` (`--editorial-ease`); editorial duration token 1200ms; everyday interactions 200ms to 400ms.
- The 2.8s breathing brass dot is the reference for brand motion.
- One well orchestrated reveal beats many scattered micro animations.

### UI and UX principles
- Calm over dense. Less per screen. One clear focus.
- Restraint in interaction. Standard, predictable patterns. The brand expresses through type, space, and photography, not novel controls.
- Buttons and links are quiet and typographic, often a label with a hairline or subtle hover, not heavy filled shapes.
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

## 8. Frontend craft standard (avoid generic AI output)

Default model output drifts toward generic, on distribution design, the look people call AI slop. Resist it. For House of Singh specifically that means:

- Distinctive, editorial typography (Playfair plus Instrument Sans), never the generic defaults.
- A committed, cohesive palette driven by CSS variables, not timid evenly spread colors.
- Atmosphere and restraint over decoration. Depth from photography and whitespace, not gradients, glows, or noise.
- High impact, calm motion at key moments, not scattered fidgety micro interactions.
- Context specific choices that feel genuinely designed for this brand, not cookie cutter components.

The test for anything you build or suggest: does it feel calm, considered, and crafted, or does it feel loud, rushed, and generic? Ship only the former.

---

*Keep this file current. When the stack, brand, or workflow changes, update CLAUDE.md and BRAND_BOOK.md together so they never drift from the real site.*
