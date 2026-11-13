# Studio guardrails

Approved 13 Nov 2026. The Studio warns before content that would hurt the site's quality or speed is published, so a mistake like a PNG portrait cannot slip in unnoticed. A **warning** (amber) still lets you publish; an **error** (red) must be fixed first.

The rules live in `src/sanity/guardrails.ts` and are attached to every photograph field and every alt text field when the Studio loads (`withGuardrails` in `src/sanity/schemas/index.ts`), so a new photograph field is covered without remembering to. The Studio explains them on its own **Content rules** page (top of the Studio's list). `scripts/guardrails-test.ts` runs each one against the real schema, the way the Studio does, and runs in CI on every pull request.

## The rules

| What | When | Level |
|---|---|---|
| A photograph that is a PNG with no transparency | Any photograph field (logos are not checked) | Warning: export it as JPEG, quality about 83 |
| A file over 5 MB | Any photograph field | Warning |
| A hero slide or a project cover under 2400px wide | `heroSlide.image`, `project.coverImage` | Warning |
| The same, under 1600px wide | As above | **Error** (cannot be published) |
| Any other photograph under 1600px wide | Every other photograph field, Journal covers and the Spotlight included | Warning |
| Alt text missing on a photograph not marked Decorative | Every alt text field | **Error** (as before) |
| Alt text that says nothing: "House of Singh", "image", "photo", "hero", a camera name like IMG_1234, or the file's own name | Every alt text field | Warning |
| Alt text over 125 characters | Every alt text field | Warning |
| A search title (SEO, Meta Title) over 60 characters | The SEO section | Warning |
| A search description (SEO, Meta Description) under 70 or over 160 characters | The SEO section (empty is fine: the page uses its own) | Warning |

Logos are recognised by their field's name (logo, crest, icon, favicon) and skipped. A field can set `options.photoKind` (`"cover"` or `"photo"`) to choose its width, or `options.guardrails: false` to opt out.

## How each was checked

`npx tsx scripts/guardrails-test.ts` (31 checks), including, through the real schema: a hero slide 1400px wide (error); a project cover that is a 6 MB, 2000px PNG (one warning naming all three); the About portrait as a PNG (warning: the mistake that slipped in); a logo (no checks); a Journal cover 1080px wide, a phone photograph (warning only); a section photograph 1400px wide (warning only); alt text "House of Singh", alt text equal to the file's name, a Shop photograph's alt text "image" (warnings); missing alt text (still an error); a decorative photograph (nothing); a 10 character search description and a 70 character search title (warnings).

In the Studio itself, after deploying: upload a PNG photograph or a narrow cover to a draft and see the amber or red note under the field, and the publish button's own note.

## After merging

Nothing to deploy for the schema: the rules run in the Studio, which is part of the site (houseofsingh.com/studio), and the Studio's fields are unchanged. (`npx sanity@latest schema deploy` is harmless to run if in doubt.)
