# House of Singh — Brand Book

A single source of truth for how House of Singh looks, feels, moves, and speaks across every surface: the website, the product interface, and social media. This document is intentionally lean. Every rule here exists to protect one thing: a calm, editorial, crafted brand that signals taste and restraint.

Maintained for Maninder Singh, Creative Director. Version 1.0.

---

## 1. Brand Foundation

### What House of Singh is
House of Singh is the personal brand and creative platform of Maninder Singh, a Toronto based creative director, photographer, and multidisciplinary designer. It is the public face of the work: design, photography, writing, and the projects that sit under its umbrella. It is distinct from House of Singh Studios, which is the client facing design studio.

### The one line
The creative world of Maninder Singh. Design, photography, and intentional living, based in Toronto.

### Brand personality
Five words anchor everything:

1. **Calm.** Nothing shouts. Confidence is shown through restraint, not volume.
2. **Editorial.** It reads like a considered magazine, not a busy feed. Whitespace, rhythm, and typography do the work.
3. **Crafted.** Every detail is intentional. Nothing looks defaulted or accidental.
4. **Grounded.** Honest, human, rooted in real culture and real practice. Never hype.
5. **Timeless.** Choices that will not look dated in three years. No trend chasing.

### How the brand should make people feel
A visitor should feel they have stepped into a quiet, well lit room made by someone with taste. Slowed down. Paying attention. The opposite of the noisy, fast, algorithmic internet.

### The test for any decision
Before shipping anything, design or copy or post, ask: *does this feel calm, considered, and crafted, or does it feel loud, rushed, and generic?* If it is the latter, it is off brand, no matter how impressive it looks.

---

## 2. Visual Identity

### 2.1 Color

The palette is deliberately tight. A warm neutral base, a soft charcoal for text, a muted grey for support, and a single warm accent used sparingly. Discipline in color is what makes the brand feel premium.

| Role | Hex | Live token | Usage |
|------|-----|-----------|-------|
| Canvas | `#F9F7F5` | `--background` | The default page background. Warm off white. The brand lives on this. |
| Charcoal | `#1A1A1A` | `--foreground` is `hsl(30 10% 12%)` | Primary text, headings. A soft near black, never pure `#000000`. |
| Muted grey | `#76706B` | `--muted-foreground` is `hsl(30 5% 44%)` | Captions, labels, secondary text, metadata. The quietest readable grey on the canvas: do not fade it further with opacity. |
| Muted grey, inverse | `#A8A39F` | `--muted-foreground-inverse` is `hsl(30 5% 64%)` | Secondary text on the dark charcoal band. 6.56:1 on charcoal. |
| Border, hairline | `hsl(40 10% 88%)` | `--border` | Dividers, input underlines, thin rules. |
| Antique brass | `#A8895C` | `--accent` | The single accent. Used rarely for emphasis. 3.07:1 on the canvas: for small graphics and hairlines, and for text only at 28px or larger (the italic chapter numerals I, II, III), where it reads as large text. Never for smaller text. |
| Error, brick | `#9B4B3B` | `--error` is `hsl(10 45% 42%)` | Error messages and the hairline under an invalid field. Warm and muted, never a bright alarm red. 5.67:1 on the canvas, 5.02:1 on the Featured On panel. Functional only, never decorative. |
| White | `#FFFFFF` | `--paper` | Rare. Contrast moments inside cards or over images only, and the white paper mat of a framed press cutting (About, In print). |

**Do not lighten the muted grey.** `--muted-foreground` was originally `hsl(30 5% 50%)` (`#868079`). Measured against the canvas it gives only **3.65:1**, below the WCAG AA minimum of 4.5:1 for normal text, so every caption, label, and piece of metadata on the site failed contrast. It was darkened to `hsl(30 5% 44%)`, which measures **4.57:1** and passes. It still sits far quieter than charcoal (15.34:1), so the hierarchy is unchanged. If this value is ever lightened again for aesthetic reasons, the whole secondary type layer silently fails accessibility — check the contrast ratio before changing it.

**Implementation note on the accent.** Antique brass is the `--accent` token (`#A8895C`), available in Tailwind as `bg-accent`, `text-accent` and `border-accent`. Today it is used only for the breathing upcoming project dot. Any new accent moment uses the token, never the raw hex.

**The accent discipline rule.** Antique brass is the one warm note in the system. It appears rarely and intentionally: a small pulsing dot on an upcoming project, a thin hairline, a hover state, a single point of emphasis. If brass appears in more than a few small places on a screen, it is overused and the screen should be reviewed. Scarcity is what gives the accent its power.

**What not to do with color.**
- Do not introduce new colors outside this palette without updating this document.
- Do not use pure black. Charcoal only.
- Do not use the brass as a large fill or a background for big areas. It is a touch, not a field.
- Do not place charcoal text on the brass for long passages. Reserve that pairing for tiny labels only.

#### The Shop palette (House of Singh Editions only)

Each Collection of House of Singh Editions has its own colour, used only for its square (the opening view of the Shop) and its spine (the archive). These six colours are fixed and live in `src/lib/editions/palette.ts`; the Collection document chooses one. They are never used anywhere else on the site, never for text on the canvas, and never as a background behind a page. Each has its own ink for the words on the square, chosen so the smallest label reads at 4.5:1 or more.

| Colour | Square | Ink | Quiet ink (labels) |
|------|-----|-----|-----|
| Saffron | `#E6CFA4` | `#3A2E1F` | `#5E4C34` |
| Indigo | `#3E4A5C` | `#F3EFE9` | `#C9CED6` |
| Olive | `#8A8B6A` | `#141410` | `#1F1E16` |
| Sand | `#DCCFBA` | `#2E2820` | `#5E5446` |
| Oxblood | `#5C2A2A` | `#F4ECE6` | `#D9C7BE` |
| Slate | `#5A6068` | `#F3F1EE` | `#E4E5E7` |

The seal on the square is brass (`--accent`) with charcoal words (5.0:1), the crest while a Collection is sealed, and an outline in the square's ink once it is sold out. **Shop design round 2** (approved 11 Nov 2026): while a Collection is sealed or in early access its card carries the number in Gurmukhi numerals and a different seal: the crest inside a ring of words ("HOUSE OF SINGH EDITIONS" over and under, Instrument Sans) in dark brown `#3A2E22` (8.7:1 on saffron), turning once a minute (still with reduced motion). Four more Shop only colours, set in `styles/editions.css` and never used elsewhere: the tint `#F1ECE4` (the phone's time box and the For artists panel; small text on it is `#3A3530` or charcoal, since muted grey reads only 4.2:1 there), the soft charcoal `#3A3530` (the Collection's sentence and answers, 11.4:1), the brass of the × in "House of Singh × you" `#B0916A` (decorative, large, hidden from screen readers) and the seal's brown. The canvas asked for a lighter helper grey `#9A948D`; it reads only 2.8:1, so the helper lines use the muted grey (4.57:1). **Round 3** adds two: the dark brass `#8A6D47` for "2 left" (4.51:1 on the canvas, so small text passes), and the hairline `#E4DED5` around the phone bars, which are now warm stone `#F1ECE4` with charcoal words (the Collection's colour stays on its card).

**The Shop's third face, for numerals only.** Noto Serif Gurmukhi (400, the Gurmukhi characters only, self hosted from `public/fonts`, loaded on Shop pages alone, `--font-gurmukhi`) sets the Collection's number in Gurmukhi numerals on its card and on the phone's floating bar. It sets nothing else. The Shop's small labels are muted grey, never brass, because brass is text only at 28px or larger. The full Shop is described in `docs/shop-house-of-singh-editions.md`.

### 2.2 Typography

Two typefaces, both from Google Fonts. One elegant serif for names and numbers, one quiet grotesque for everything else. The contrast between them is the brand's typographic signature.

**Serif for names and numbers, sans for sentences.** This is the rule that decides which face a piece of text takes (approved 10 Nov 2026).
- **Playfair Display** is used only for names and numbers: page titles, chapter titles, project titles and journal titles (including in lists and cards and the studio panels), the Roman chapter numerals, the Journey years and the journal's day and month, the time in Toronto, and Maninder's quote beside his portrait (the one italic).
- **Instrument Sans** is used for every sentence: chapter statements and introductions, the closing invitation, the practice line, the turntable note, About's story, practice text, answers and pull quote, the Privacy and Terms summaries, captions, body copy, labels, navigation, buttons and form fields. A prominent single line or short statement takes the statement size (26/20); longer introductions take body-l.

**The one exception: the site's opening statement** (approved 10 Nov 2026). The first sentence of the homepage introduction, Chapter II ("Maninder Singh is a creative director, photographer, and multidisciplinary designer working out of Toronto."), is set in Playfair 400 at display-m (34/26), with balanced line breaks. No other sentence on the site is set in Playfair.

**The Shop's headings** (Shop design round 2, approved 11 Nov 2026). On House of Singh Editions four section headings are set in Playfair 400 at display-l though they are short sentences: "In the making", "What this is, and what it is not", "Good to know" and "Make something with House of Singh" (on the Shop page and on For artists), with the line "House of Singh × you" leading to the proposal form. Every other sentence in the Shop stays in Instrument Sans.

**Chapter marks: one system** (approved 10 Nov 2026). Every chapter on every page opens with its Roman numeral in brass at the numeral token (30px) and, beside it on one baseline, a visible label in the label token (12px, uppercase, 0.12em, muted grey; canvas grey on the charcoal band). Where a chapter has a title, it sits below in its own heading style; where it has none, the label is the chapter's heading. Every label is editable in Sanity (Site Settings for Home, the About Page for About). Home: II The artist, III The work, IV In the studio now, V Notebook (title: Journal), VI Listening (title: On my turntable), VII The practice. About: I The portrait, II The story, III House of Singh, IV In print, V A walk through the years, VI Rapid fire (title: In conversation). Component: `ChapterMark`.

**Weights.** Playfair 400 only (no light 300, no bold). Instrument Sans 400, and 500 for emphasis (strong text, titles in the Journey). Never a synthesised bold.

**Type principles.**
- Body text runs calm, with generous line height (1.6 to 1.75) for an unhurried reading rhythm.
- Labels and eyebrows use the one label style below: 12px, uppercase, 0.12em letter spacing, in muted grey.
- Headings are sentence case or natural case, never all caps. All caps is reserved for small labels only.
- Never use Inter, Roboto, Arial, or default system fonts in produced brand material. They signal the generic, defaulted look the brand exists to avoid.

**Implementation note.** Both faces are live and self hosted from `public/fonts` through next/font (`src/app/layout.tsx`): Playfair Display as `--font-editorial`, declared at weight 400 only, and Instrument Sans (regular 400 and medium 500) as `--font-instrument`, the body and interface face on every page (the Sanity Studio keeps its own). Each has a size adjusted fallback (Times New Roman, Arial) used only for the moment before the font arrives, so nothing moves when it does.

**The type scale.** One scale for the whole site, as tokens in `src/app/styles/tokens.css` (`--type-*`) and as Tailwind sizes (`text-display-xl`, `text-body` and so on). Fluid sizes are a `clamp()` that equals the phone value at 390 and the desktop value at 1280 and scales smoothly between them. Every size on the site is one of these; never a one off size. Where a usage had no exact role, it takes the nearest token.

| Token | Desktop 1280 | Phone 390 | Face | Used for |
|------|------|------|------|------|
| `display-xl` | 72px | 40px | Playfair 400 | Page and project titles (Contact, Privacy and Terms, a project, the next project, the home spotlight, error pages) |
| `display-l` | 52px | 34px | Playfair 400 | Chapter titles (Journal, On my turntable, In conversation, a contact step), the About quote, One by one's title, the Projects and Journal page headings |
| `display-m` | 34px | 26px | Playfair 400 | The site's opening statement (the one sentence in Playfair), the time in Toronto and large single values; legal section titles, story headings, the filter's choices |
| `display-s` | 24px | 20px | Playfair 400 | Titles in lists and cards: At a glance, journal entries, the filmstrip, the studio panels, press cuttings, the newsletter note |
| `numeral` | 30px | 30px | Playfair 400, brass | Roman chapter numerals (brass text is never under 28px) |
| `date` | 44px | 40px | Playfair 400 | Journey years, the journal's day and month |
| `statement` | 26px | 20px | Instrument Sans 400 | Prominent single lines and short statements: Chapter II's opening, the practice line, the closing invitation, About's pull quote and answers, contact choices and fields |
| `body-l` | 19px | 17px | Instrument Sans 400 | Introductions and statements: About's story and practice text, project intros and excerpts, the turntable note, legal summaries, questions, Journey titles (500) |
| `body` | 17px | 16px | Instrument Sans 400 | Reading text: project stories, journal entries, legal text, the home introduction, footer links, form fields |
| `small` | 14px | 14px | Instrument Sans 400 | Captions and descriptions |
| **label** | **12px** | **12px** | **Instrument Sans 400, uppercase, 0.12em** | Every small label (below) |
| `legal` | 11px | 11px | Instrument Sans 400 | The footer's bottom line (copyright, Privacy, Terms) |

Two drawings keep their own proportional lettering and are not part of the scale: the record sleeve's title in Chapter VI (drawn to the sleeve's size) and the newsletter postmark. The header wordmark is the logo, not text.

**The label: one style, every small label.** Every small uppercase label on the site uses one token, taken from "In Toronto it is" in the footer: 12px, line height 1.5, letter spacing 0.12em, uppercase, regular weight (`--type-label-size`, `--type-label-leading`, `--type-label-tracking` in `src/app/styles/tokens.css`; the `type-label` class in components). That covers view switches, filters, categories, counters, dates, eyebrows, meta lines under titles, "Enter the project", "Next project", the Journal's month and weekday letters, footer labels and the menu's small links. Colour is set where it is used: muted grey at rest, charcoal when active, with the drawn hairline beneath an active control. A label never wraps: a row of labels wraps between them, never inside one. Never set a one off label size. The header's "Menu" uses it too (0.12em).

**The menu: no Playfair.** The menu's page names use the small token (14px), Instrument Sans 400, uppercase, 0.12em, with the shared hairline under the one pointed at and the current page; their Roman numerals use the legal token (11px) in muted grey, never brass (brass text stays at 28px and above); the bottom line (Studio, Instagram, Newsletter and "10:42 pm in Toronto") the small token in sentence case; Close the label token with the × sign.

**Italic in one place only.** Playfair italic is used for one line on the whole site: Maninder's quote beside his portrait in About, chapter I. Everything else in Playfair is regular, including chapter numerals and the next project preview. Do not introduce italic anywhere else.

**Line breaks.** Headings, quotes and short statements balance their lines (`text-wrap: balance`), so none ends on one or two words; paragraphs avoid a lone last word (`text-wrap: pretty`); statements longer than balancing can handle keep their last two words together (`keepLastWords`). Reading columns stay about 60 to 75 characters wide; single line statements may run wider. No text may overflow or be clipped at any width from 375 to 1600. A heading whose column can be narrower than its size needs is capped to that column (`cqi`), so it never leaves a word on its own line.

### 2.3 Spacing and layout

**Below the crest.** Nothing ever covers the crest or sits level with it. A page's header row (the Projects heading, filter and views; the Journal heading and years) starts below the crest's lowest drawn point with a calm gap: 128px on phones (crest drawn to 89px), 180px from 768px (crest drawn to 155px). A project's photograph (the Projects plate and grid, a project's hero) starts below that row, at `--plate-top`: 188px on phones, 240px on tablets, 300px at 1280. Both values live in `src/app/styles/tokens.css`.

The brand is generous and airy. Whitespace is not empty space, it is the product. It is what makes the work feel considered and lets the photography breathe.

- Lead with whitespace. When unsure, add more space, not less.
- Use the defined section spacing scale rather than arbitrary values.
- Sections are separated by significant vertical breathing room so each piece of content arrives on its own.
- Content sits within comfortable max widths. Text columns stay narrow enough to read elegantly, never edge to edge across a wide screen.
- Alignment is mostly left, clean and editorial. Center sparingly for single focal moments.

**The real spacing scale (from the live site).** Section rhythm is tokenized and responsive:

| Token | Mobile (under 768px) | Desktop (768px and up) |
|-------|----------------------|------------------------|
| `--section-space-sm` | 64px | 96px |
| `--section-space-md` | 80px | 144px |
| `--section-space-lg` | 96px | 144px |

Applied via utility classes (`.section-py`, `.section-py-lg`, `.section-pb`, and so on). Page top offset is 300px mobile, 320px desktop. The large desktop section spacing of 144px is the signature of the brand's airy pacing; do not compress it to save space.

### 2.4 Imagery and photography

Photography is the heart of House of Singh. It carries more brand weight than any graphic element.

- Real, intentional, atmospheric photography. The kind of frames most people walk past.
- Let images sit in space with room around them. Avoid dense grids that feel like stock galleries.
- Keep image treatment honest. Light, natural grading consistent with a warm, calm tone. Avoid heavy filters, heavy saturation, or trendy effects.
- Never place busy graphics or the logo crest over a busy part of a photo. Respect the image.
- Every meaningful image needs descriptive alt text. This is both a brand quality standard and an accessibility and SEO requirement.

---

## 3. The Logo

House of Singh uses three forms of its identity. The right one depends on context. This section defines each and when to use it.

### 3.1 The three lockups

**The crest.** The full emblem with the lion, horse, and elephant. This is the most formal and symbolic expression of the brand. It carries heritage and presence.
- Use when: the brand needs to make a considered, ceremonial, or anchoring statement. Site footer, about moments, loading states, a print piece, a cover.
- Do not use when: space is tight or the context is fast and casual. The crest loses its detail and dignity when shrunk too far.

**The crest plus wordmark.** The emblem paired with the House of Singh wordmark.
- Use when: introducing the brand to someone who may not know it. The top of a key page, a deck cover, a profile banner, a piece being shared outside the existing audience.
- This is the most complete and self explanatory lockup.

**The wordmark only.** House of Singh set cleanly in type.
- Use when: the context is small, horizontal, or already clearly branded. Site header navigation, social handle areas, body of documents, repeat mentions, tight UI.
- This is the everyday workhorse.

### 3.2 Clear space
Always leave generous clear space around the logo in any form. As a rule, keep clear space on all sides equal to at least the height of the wordmark's cap height, and more when the layout allows. The brand is airy; the logo should never feel crowded.

### 3.3 Minimum size
- The crest must never be reproduced so small that the lion, horse, and elephant lose definition. When in doubt, switch to the wordmark.
- The wordmark must remain comfortably legible. If it is getting hard to read, the layout needs rethinking, not a smaller logo.

### 3.4 Approved backgrounds
- Preferred: the warm canvas `#F9F7F5`.
- Acceptable: charcoal `#1A1A1A` for a reversed, darker moment.
- Over photography: only on a calm, uncluttered area of the image with enough contrast for full legibility.

### 3.5 What not to do with the logo
- Do not stretch, squash, or rotate it.
- Do not recolor it outside the approved palette.
- Do not add shadows, glows, gradients, or effects.
- Do not place it on a busy or low contrast background.
- Do not crowd it with other elements.
- Do not reconstruct or rearrange the crest's elements.

### 3.6 The site icon
The favicon and app icons (approved 12 Nov) are the crest's lion alone: the crest clipped to the lion's shield and cropped to the lion, its lines in charcoal `#221F1C` at their original weight on the canvas `#F9F7F5`. One source, `scripts/favicons.mjs`, makes every size (the browser icon at 16, 32 and 48, the 32 PNG, the 180 Apple touch icon, and 192 and 512 for the web app manifest). Change the icon there and run it again; never edit the PNGs by hand.

The share image (approved 12 Nov), what a link to the site shows when it is shared, is the crest's emblem alone: the eagle, the lion's shield, the horse and the elephant, without the HOUSE OF SINGH wordmark and without "Estd." and "MMXIV", its lines in charcoal `#221F1C` on the canvas `#F9F7F5`, centred on 1200 by 630 at 540 wide (13 Nov, from 480, so it reads at thumbnail size), so it stays whole in the square centre crop WhatsApp shows (45px clear either side). It is Home's share image and every page's without one of its own; About, Projects, each project, Journal, each entry, a month, Contact and the Shop keep their photograph or card. One source, `scripts/share-image.mjs`, makes `src/app/opengraph-image.png` and `twitter-image.png` and checks the square crop; change it there and run it again.

---

## 4. UI and UX Guidelines

These rules govern the website and any future product surface, so the brand feels identical in spirit whether someone is reading or interacting.

### 4.1 Core UX principles

1. **Calm over dense.** Show less per screen. Let one thing be the focus. Generous spacing, clear hierarchy, no clutter.
2. **Slow, editorial pacing.** The experience should feel unhurried. Content arrives with room around it. Nothing competes for attention all at once.
3. **Restraint in interaction.** Standard, predictable patterns. The brand expresses itself through typography, space, and photography, not through novelty controls or surprising behavior.
4. **Accessibility is non negotiable.** Sufficient contrast, keyboard navigability, descriptive alt text, and respect for reduced motion preferences. A calm brand is also a considerate one.

### 4.2 Motion

Motion is calm and minimal. It supports the content, never performs for its own sake.

- Slow, gentle transitions. Soft fades and quiet reveals over fast or bouncy movement.
- Favor one well orchestrated moment, such as a gentle staggered reveal on load, over many scattered micro animations.
- Easing is smooth and soft, never sharp or springy.
- The pulsing brass dot on upcoming projects is the reference for brand motion: slow, breathing, about a two and a half to three second cycle, never a fast blink.
- Always respect the user's reduced motion preference. When reduced motion is on, animations resolve to a calm static state.

**The motion tokens (in `src/app/styles/tokens.css`; always use these, never hard coded values).**

| Token | Value | Use |
|---|---|---|
| `--ease-slow` | `cubic-bezier(0.37, 0, 0.63, 1)`, a soft sine | The default curve: scroll reveals, fades, crossfades, image fade ins and the old page fading out. Tailwind: `ease-(--ease-slow)`. |
| `--ease-soft-out` | `cubic-bezier(0.33, 1, 0.68, 1)` | Hover and focus changes. Tailwind: `ease-(--ease-soft-out)`. |
| `--dur-reveal` | 1400ms, with `--rise-reveal` 12px | Scroll reveals: a slow fade with a gentle 12px rise. Pure fades (photos, the logo) do not rise. Staggered siblings keep their delays. |
| `--dur-image` | 1000ms | Image fade ins and grey to colour reveals. Crossfades between photos may run longer. |
| `--dur-hover` | 500ms | Hover and focus changes: colour, underline, a small nudge or zoom. Tailwind: `duration-(--dur-hover)`. |
| `--dur-page` | 600ms | A whole page change (out, then in), and content swapped by a click (form steps, filters). |
| `--dur-page-out`, `--dur-page-in` | 200ms, 400ms | A page change, one page after the other and never both at once (approved 12 Nov): the old page, header and all, fades out to the canvas over 200ms on `--ease-slow`; the new page, already at its top (or where Back left it), fades in over 400ms on `--editorial-ease`. The Shop's phone bars leave at once. Back and Forward return at once to where the page was left. Reduced motion: no transition, the page changes at once. The Projects view switch keeps its own crossfade over `--dur-page`. |
| `--dur-develop` | 1400ms | A content photograph developing like a print the first time it is in view: from a warm, pale, low contrast state to full tone, on `--ease-slow`. It runs alongside the blur up dissolve, never on priority images (the hero's first slide, page covers), and not on photos with their own grey to colour reveal. Reduced motion and no JavaScript: full tone from the start. |
| `--dur-plate` | 1400ms | One photograph crossfading to the next on a Projects page plate, on `--ease-slow`, every 8 s while nothing pauses it. Reduced motion: the plate does not cycle. |

- Kept quick on purpose, for usability: focus rings appear at once, form error messages appear at once, and the popup and the Projects filter open in at most 500ms. The menu (approved 10 Nov, after slowness.com) is a canvas panel that slides in from the left over 750ms on `--ease-slow` (`--dur-menu-panel`). From 1024 wide it covers the left half while the right half fills with one photograph, inset 24px, fading in over `--dur-menu-photo` and settling from a 1.04 scale over `--dur-reveal`, both after `--delay-menu-photo`; the page is fully covered. The photograph changes only when a page name is pointed at or focused (`--dur-menu-crossfade`), never on a timer. Closing, the photograph fades first (`--dur-menu-photo-out`), then the panel slides out (`--dur-menu-panel-out` after `--delay-menu-out`); a click on the photograph closes it. Choosing another page closes it at once, with no slide, so the page change shows only the page fading (approved 12 Nov). Below 1024 the panel covers 85 percent of the width with a soft shadow, no photograph, over an 18 percent charcoal veil on the strip of page, which closes it when tapped. The page header fades out with the panel and back as it closes; reduced motion shows and hides everything at once, with no slide and no zoom. Tap feedback on touch screens and anything that follows the scroll position stay immediate.
- The earlier fast curve, `cubic-bezier(0.22, 1, 0.36, 1)` (`--editorial-ease`), is no longer the default. It remains for the popup opening and, since 12 Nov, for a new page fading in (`--dur-page-in`).
- The upcoming dot pulse runs at 2.8s, infinite, the slow breathing reference.
- Every animation has a `prefers-reduced-motion` fallback that resolves to a static state. This is mandatory for anything new.

### 4.3 Components

- **Buttons and links.** Quiet and typographic. Often a simple label with a hairline or a subtle hover, rather than a heavy filled shape. The brass may appear as a restrained hover or underline accent.
- **Calls to action: two styles, one each** (approved 10 Nov 2026). Primary actions (Book a call, Visit House of Singh Studios) use the outlined button (`OutlineCta`). Every secondary action uses the one text link (`TextLink`): no box, Instrument Sans 500 at the small token (14px), uppercase, 0.12em, a permanent 1px hairline under the words and an arrow; on hover and focus the arrow moves 4px to the right while the hairline redraws from the left (`--dur-text-link`, 400ms). It is used for More about Maninder, Enter the project (homepage and Projects), View project, Read the journal, or write to me instead, All projects and Start a project (end of each project), and the contact confirmation's Explore my projects and Read the journal. Forms follow the same two styles (approved 10 Nov 2026): a form's step forward (Next, Review, Submit on the contact form; Submit on the project interest form) is the outlined button (`OutlineButton`, its arrow pointing on and sliding across, quiet and unfilled while it cannot be used); Back and Skip are the text link (`TextButton`). Back links take the back version of the text link, with the arrow on the left moving left: the contact form's Back and "All projects" at the top of each project page. **The Shop's one exception** (Shop design round 1, approved 11 Nov 2026): on House of Singh Editions, Buy (with its "Choose a size" and "Enter your postal code" states, and the phone bar's Buy) is a solid button, charcoal with canvas text, in the label style at the outlined button's size; it is the only solid button on the site. Every other Shop action is the text link, including Propose a collaboration, Send the proposal and Notify me.
- **Forms.** Clean, generous, calm. Comfortable field spacing, clear muted labels, gentle focus states. No visual noise.
- **Cards.** Let the image and a small caption do the work. Avoid borders, heavy shadows, or busy chrome. Space separates content, not boxes.
- **Labels and eyebrows.** The one label style (12px, uppercase, 0.12em, muted grey; charcoal with a hairline when active). The consistent signal of category and metadata across the brand.
- **Hairlines.** Thin rules, used sparingly, are a quiet way to divide content. Keep them light.

### 4.4 Consistency rules

- Use the defined spacing scale and palette tokens, never arbitrary one off values.
- Reuse established patterns rather than inventing new ones for each page. If a pattern exists, follow it.
- Any new component should look like it was always part of the system. If it stands out as different, it is wrong.

---

## 5. Social Media Guidelines

Social is where most people meet the brand first. The goal is that someone can move from an Instagram reel to the website and feel they are with the same person. Consistent voice, consistent restraint, consistent taste.

### 5.1 Cross platform principle
The brand does not become loud or generic just because the platform is fast. House of Singh keeps its calm, editorial character everywhere. The format adapts; the brand does not.

### 5.2 Visual consistency on social
- Use the same palette: warm canvas, charcoal, muted grey, brass as a rare accent.
- Use the brand type where text appears on graphics: Playfair Display for names, titles and numbers, Instrument Sans for sentences and support.
- Let photography lead. Clean frames with room to breathe, the same honest treatment as the site.
- Avoid trend driven templates, heavy text overlays, loud stickers, or busy effects. When everyone zigs loud, the brand zags quiet.
- A grid or feed should feel like a curated editorial spread, not a noticeboard.

### 5.3 Voice on social
The voice is the same calm, grounded, reflective voice used across the brand. (Detailed scripting, language strategy, content lanes, posting rhythm, and boundaries live in the House of Singh content playbooks; this section is the brand level summary.)

- First person, human, considered. Speaks like a person paying attention, not a brand broadcasting.
- Reflective over promotional. Insight, process, and honesty over selling.
- Comfortable with stillness and silence. Not every post needs a hook or a call to action.
- Never forced, never hype, never chasing virality at the cost of dignity.

### 5.4 What to post, at brand level
- The work: design, photography, projects.
- The practice: process, thinking, the craft behind the work.
- The world it lives in: culture, place, the things the brand notices.

### 5.5 What not to do on social
- Do not adopt a louder or more generic persona to fit a platform.
- Do not over post. Consistency and quality beat volume. Silence is acceptable.
- Do not use off brand colors, fonts, or noisy templates.
- Do not break the personal boundaries defined in the content playbooks.

---

## 6. Quick Reference

**Palette:** Canvas `#F9F7F5` (`--background`) · Charcoal `#1A1A1A` (`--foreground`) · Muted grey `#76706B` (`--muted-foreground`, `hsl(30 5% 44%)` — meets WCAG AA, do not lighten) · Border `hsl(40 10% 88%)` (`--border`) · Antique brass `#A8895C` (`--accent`) · Error brick `#9B4B3B` (`--error`, `hsl(10 45% 42%)`, error text only) · White `#FFFFFF`

**Type:** serif for names and numbers, sans for sentences. Playfair Display via `--font-editorial` (400 only; italic only for the About quote) · Instrument Sans (every sentence, body and interface, 400 and 500). One fluid scale of tokens (`--type-*`, section 2.2): display 72, 52, 34, 24; numerals 30; dates 44; statement 26; body 19, 17; small 14; label 12 uppercase 0.12em; legal 11.

**Spacing:** Section rhythm `--section-space-sm/md/lg`. Desktop large is 144px, the airy signature.

**Logo:** Crest (formal, anchoring) · Crest plus wordmark (introducing the brand) · Wordmark (everyday, tight spaces)

**Feel:** Calm, editorial, crafted, grounded, timeless.

**Motion:** Tokens in `src/app/styles/tokens.css`: `--ease-slow` `cubic-bezier(0.37, 0, 0.63, 1)` for reveals, fades and the page fade in; `--ease-soft-out` `cubic-bezier(0.33, 1, 0.68, 1)` for hover and focus; `--dur-reveal` 1400ms with a 12px rise, `--dur-image` 1000ms, `--dur-hover` 500ms, `--dur-text-link` 400ms (the text call to action), `--dur-record-turn` 3600ms (one turn of the homepage record, half of 33 1/3 rpm), `--dur-page` 600ms (a page change: `--dur-page-out` 200ms to the canvas, then `--dur-page-in` 400ms on `--editorial-ease`, never both pages at once), `--dur-develop` 1400ms (photographs developing to full tone), `--dur-plate` 1400ms (a Projects plate crossfading to its next photograph). Focus rings, form errors and the menu and popup opening stay quick. Slow, gentle, minimal. Respect reduced motion. The 2.8s breathing brass dot is the reference.

**The test:** Calm, considered, crafted, or loud, rushed, generic? Ship only the former.

---

*End of Brand Book v1.0. When the brand evolves, update this document first, then let it flow down into the website, the CLAUDE.md, and all social material.*
