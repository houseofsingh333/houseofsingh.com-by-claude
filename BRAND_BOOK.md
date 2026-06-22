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
| Muted grey | `#6B6B6B` | `--muted-foreground` is `hsl(30 5% 50%)` | Captions, labels, secondary text, metadata. |
| Border, hairline | `hsl(40 10% 88%)` | `--border` | Dividers, input underlines, thin rules. |
| Antique brass | `#A8895C` | not yet a token | The single accent. Used rarely for emphasis. |
| White | `#FFFFFF` | — | Rare. Contrast moments inside cards or over images only. |

**Implementation note on the accent.** Antique brass is currently used only as the pulsing upcoming-project dot and is not yet a named token in the CSS. To make it a true brand accent, it should be added as a variable (for example `--accent: #A8895C`) and used consistently for the few approved accent moments. Until then, the brand is effectively running on the neutral palette alone.

**The accent discipline rule.** Antique brass is the one warm note in the system. It appears rarely and intentionally: a small pulsing dot on an upcoming project, a thin hairline, a hover state, a single point of emphasis. If brass appears in more than a few small places on a screen, it is overused and the screen should be reviewed. Scarcity is what gives the accent its power.

**What not to do with color.**
- Do not introduce new colors outside this palette without updating this document.
- Do not use pure black. Charcoal only.
- Do not use the brass as a large fill or a background for big areas. It is a touch, not a field.
- Do not place charcoal text on the brass for long passages. Reserve that pairing for tiny labels only.

### 2.2 Typography

Two typefaces, both from Google Fonts. One elegant serif for display, one quiet grotesque for everything else. The contrast between them is the brand's typographic signature.

**Display and headings: Playfair Display.** Elegant, high contrast serif. Used for page titles, section headings, project titles, pull quotes, and key editorial moments. This is the voice of the brand at full presence.

**Body and interface: Instrument Sans.** Clean, slightly warm grotesque. Used for body copy, captions, labels, navigation, buttons, form fields, and all interface text. It is quiet by design so it never competes with Playfair.

**Type principles.**
- Body text runs small and calm, with generous line height (1.6 to 1.7) for an unhurried reading rhythm.
- Labels and eyebrows are uppercase, small, with wide letter spacing (0.1em to 0.2em), in muted grey.
- Headings are sentence case or natural case, never all caps. All caps is reserved for small labels only.
- One display weight and one or two body weights. Avoid a wide spread of weights, which reads busy.
- Never use Inter, Roboto, Arial, or default system fonts in produced brand material. They signal the generic, defaulted look the brand exists to avoid.

**Implementation note.** The site currently sets display type via `--font-editorial` (Playfair Display, with Georgia and serif as fallback). Body type currently runs on a system font stack and should be upgraded to Instrument Sans to match this brand book. This is a deliberate, separate change to make when ready.

**The real type scale (from the live site).** These are the actual values in use, to be treated as the reference. Sizes are not yet centralized as tokens; when we tokenize them, these are the source values.

| Role | Size | Weight | Line height | Letter spacing | Family |
|------|------|--------|-------------|----------------|--------|
| Display, hero (spotlight title) | `clamp(42px, 6vw, 88px)` | 300 | 1.05 | -0.01em | Editorial |
| Display, section CTA heading | `clamp(28px, 3.5vw, 44px)` | inherited | — | — | Editorial |
| Heading, question (rapidfire) | 18px (16px mobile) | 500 | — | — | Editorial |
| Body, reading | 16px | 400 | 1.7 (1.6 mobile) | — | Body |
| Body, teaser | 15px to 16px | 400 | 1.7 | — | Body |
| Label, eyebrow, button | 13px | 400 to 500 | — | 0.1em to 0.15em | Body, uppercase |
| Label, small (spotlight) | 11px | 400 | 1.4 | 0.2em | Body, uppercase |
| Caption, legal, meta | 11px | 400 | — | 0.04em to 0.08em | Body, uppercase |

### 2.3 Spacing and layout

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

**The real motion tokens (from the live site).**
- Signature editorial easing: `cubic-bezier(0.22, 1, 0.36, 1)`, stored as `--editorial-ease`. This is the brand's primary curve. Use it for the considered moments.
- Editorial duration token: `--editorial-duration` is 1200ms, for full editorial reveals.
- Everyday interaction timings sit in the 200ms to 400ms range (hovers, inputs, buttons). Larger reveals run 550ms to 1200ms.
- The upcoming dot pulse runs at 2.8s, infinite, the slow breathing reference.
- Every animation has a `prefers-reduced-motion` fallback that resolves to a static state. This is mandatory for anything new.

### 4.3 Components

- **Buttons and links.** Quiet and typographic. Often a simple label with a hairline or a subtle hover, rather than a heavy filled shape. The brass may appear as a restrained hover or underline accent.
- **Forms.** Clean, generous, calm. Comfortable field spacing, clear muted labels, gentle focus states. No visual noise.
- **Cards.** Let the image and a small caption do the work. Avoid borders, heavy shadows, or busy chrome. Space separates content, not boxes.
- **Labels and eyebrows.** Uppercase, small, wide letter spacing, muted grey. The consistent signal of category and metadata across the brand.
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
- Use the brand type where text appears on graphics: Playfair Display for statements, Instrument Sans for support.
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

**Palette:** Canvas `#F9F7F5` (`--background`) · Charcoal `#1A1A1A` (`--foreground`) · Muted grey `#6B6B6B` (`--muted-foreground`) · Border `hsl(40 10% 88%)` (`--border`) · Antique brass `#A8895C` (accent, to be tokenized) · White `#FFFFFF`

**Type:** Playfair Display via `--font-editorial` (display) · Instrument Sans (body and interface, to be wired in). Display hero `clamp(42px, 6vw, 88px)`, body 16px at 1.7 line height, labels 11px to 13px uppercase with 0.1em to 0.2em tracking.

**Spacing:** Section rhythm `--section-space-sm/md/lg`. Desktop large is 144px, the airy signature.

**Logo:** Crest (formal, anchoring) · Crest plus wordmark (introducing the brand) · Wordmark (everyday, tight spaces)

**Feel:** Calm, editorial, crafted, grounded, timeless.

**Motion:** Signature easing `cubic-bezier(0.22, 1, 0.36, 1)` (`--editorial-ease`), editorial duration 1200ms, everyday 200 to 400ms. Slow, gentle, minimal. Respect reduced motion. The 2.8s breathing brass dot is the reference.

**The test:** Calm, considered, crafted, or loud, rushed, generic? Ship only the former.

---

*End of Brand Book v1.0. When the brand evolves, update this document first, then let it flow down into the website, the CLAUDE.md, and all social material.*
