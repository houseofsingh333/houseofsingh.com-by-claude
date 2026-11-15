# SEO and search visibility audit, November 2026

Report only. Nothing in code, content or Sanity was changed for this audit.

**Date:** 14 November 2026
**Sites:** houseofsingh.com (every sitemap URL plus every page reachable from them) and studios.houseofsingh.com (crawled from the home page and its sitemap, read only)
**Method:** production only, no local server. A small read only crawler (Node, cheerio, image-size) and Lighthouse 12 through npx, run from a temporary folder outside the repo. Nothing was added to package.json. Search checks used a general web search engine (not Google itself; see the limits at the end).

**Rule:** Only profiles Maninder has confirmed are treated as his. Common name matches are never attributed to him.

---

## Decisions, 14 November 2026

**Approved and in progress**
- og:url on every page.
- Behance last in Person `sameAs`.
- Mississauga added as `homeLocation` in Person data (address and visible wording stay Toronto).
- Journal photographs cropped to their frame and sizes corrected.
- Titles: `/journal` "Journal, photographs and notes | House of Singh", `/projects` "Projects by Maninder Singh | House of Singh", `/terms` "Terms of Use for houseofsingh.com | House of Singh".
- Journal month pages `noindex, follow` and out of the sitemap.
- `/editions/artists` and `/editions/terms` `noindex, follow`.

**Done in Sanity**
- Contact: "Contact Maninder Singh in Toronto".
- 35 Akhri: "35 Akhri, a collective photography zine".
- Wish: "Wish, a dandelion lit up | House of Singh Journal".

**Skipped**
- Shop title.
- Journal heading order.
- Home blocking time.

**Next**
- A4, journal sitemap lastmod.

**Studios**
- Separate project. Person `sameAs` and `homeLocation` must be matched there.

**Location**
- Studios to say "Mississauga, working across Toronto and the GTA". The personal site keeps Toronto.

---

## The short version

1. **Technically, both sites are in very good shape.** There are no missing titles, descriptions or canonicals. Every share image is exactly 1200 by 630. No meaningful image lacks alt text, and every image has width and height. JSON-LD parses on every page. Text renders without JavaScript, and no search or AI crawler is blocked.
2. **The real problem is visibility, not code.** Neither site appeared for any of the 11 test searches, including the exact project names "35 Akhri", "Zamana" and "Sikhs in the 6ix", which no one else competes for. The search engine used here appears not to have houseofsingh.com indexed at all. For Maninder's name, his Behance profile is what shows. Google itself could not be checked from here, so the first job is to open Google Search Console and Bing Webmaster Tools and see what they report (D1).
3. **Location is inconsistent.** Every title, description and structured data block on both sites says Toronto. The press listed on About says "Mississauga's Maninder Singh" (Modern Mississauga, 2025), and the studio's grants are Mississauga grants. The Studios site never says Mississauga in its visible text, only in its structured data. Searches for "branding agency Mississauga" and "creative studio Mississauga" cannot be won while the pages do not say it. Maninder needs to decide the one true line, then it goes everywhere at once (decision 1 below).
4. **Studios is missing a packaging page.** Packaging appears in the studio's stated expertise and in three strong published articles (cost per SKU, Bill 96, Made in Canada), with a fourth on green claims linked but not yet live, but there is no packaging service page for "packaging design Toronto" to land on (C1).
5. **Off site presence carries most of the lead value.** The pages ranking for the four Studios searches are directories (Clutch, DesignRush, Sortlist, The Manifest, UpCity) and listicles, plus Google Business Profiles in the map results. House of Singh Studios is on none of them (D2, D3).

---

## Decisions needed from Maninder before any fixes

1. **Location line.** Pick one, used on both sites, every profile and Google Business Profile:
   a. "Based in Mississauga, working across Toronto and the GTA" (matches the press and the grants; strongest for the Mississauga searches)
   b. "Toronto" alone (as now; gives up the Mississauga searches)
   c. "Toronto and Mississauga" (works, but Google Business Profile still needs one real base)
   CLAUDE.md requires Person facts to stay identical on both sites, so this changes on both together.
2. **Journal month pages.** Each journal entry page shows its whole month, which is the approved J4 layout, so an entry and its month archive carry almost the same text (see 1.10). Options: leave as is; or mark the 46 month archive pages `noindex, follow` so Google indexes only the entries (links still followed; no visual change). I recommend the second, but it touches the Journal, so it is your call.
3. **Shop title.** `/editions` has the title "Shop, House of Singh Editions" (29 characters). The Shop is protected, so even a title change needs your approval.

---

## PART 1. Technical audit

### houseofsingh.com: summary

| Check | Result |
|---|---|
| Pages crawled | 150 (141 in sitemap, plus 6 filter views and 2 noindex Shop pages, plus the calendar file) |
| Status codes | 150 of 150 return 200. No 4xx, no 5xx, no redirect chains, no internal links to redirects |
| Titles | All present and unique where it matters. 13 under 30 characters (list below). None over 60 |
| Descriptions | All present, all 70 to 160 characters. One duplicate group, on the canonicalised filter views only |
| Canonicals | All present, absolute and self referencing, except the 6 filter views, which correctly point to `/projects` |
| Open Graph image | Present on all 147 indexable pages, loads, exactly 1200 by 630, 22 to 264 KB |
| og:url | Missing on 60 pages (home, about, journal, contact, projects, legal pages, all 46 month archives). Present on entries and projects |
| Twitter tags | Card, title, description and image on every page |
| h1 | Exactly one on every page |
| Heading order | 39 journal entries have h2 headings before their h1 (see 1.10) |
| Images | 0 missing alt. 373 marked decorative (`alt=""`), all inside the journal month layout. 0 missing width and height |
| Image weight | 36 photographs over 300 KB at the 1920 wide fallback size, the largest 946 KB (see 1.6) |
| Structured data | Parses on every page. Person, Organization, WebSite sitewide; ProfilePage, AboutPage, FAQPage, CollectionPage, Blog, BlogPosting (84), VisualArtwork and CreativeWork (4 projects), BreadcrumbList (133). No missing required properties found |
| Robots | Only `/editions/artists` and `/editions/terms` are noindex, nofollow, as intended by the Shop design |
| Sitemap | 141 URLs, all 200, all indexable, none canonicalised elsewhere. 0 orphans |
| robots.txt | Allows everything except `/studio-sanity` and `/api`. Points to the sitemap |
| llms.txt | Present (6 KB), accurate "who is who" opening, projects and recent journal |
| AI crawlers | GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Googlebot, Bingbot, CCBot and Applebot all receive the full page (tested by user agent, all 200) |
| Without JavaScript | Main text is in the HTML on every page; `lang="en-CA"` |
| IndexNow | Configured and answering (`/api/indexnow` reports key and webhook set) |
| Search Console tag | No `google-site-verification` meta tag. Fine if verified by DNS; otherwise the `siteSettings.googleVerification` field is empty |

### Studios: summary

| Check | Result |
|---|---|
| Pages crawled | 71 (42 in sitemap, 22 parameter variants of `/start`, `/contact`, `/brand-pulse`, 6 articles missing from the sitemap, 1 broken) |
| Status codes | 70 return 200. **1 broken internal link:** `/insights/green-claims-packaging-canada-2026` (404), linked from `/insights/packaging-design-cost-canada` |
| Titles | All present. `/services` and `/services/brand-identity` are 61 characters (one over). `/insights/how-to-brief-a-design-studio...` is 28. `/services/visual-media` ends in "House of Singh" instead of "House of Singh Studios" |
| Descriptions | All present and in range. Duplicates only on the parameter variants, which canonicalise correctly |
| Canonicals | Correct everywhere, including all 22 parameter variants |
| Open Graph image | Present on all pages, exactly 1200 by 630. **18 article share images are PNGs of 0.7 to 1.7 MB** |
| h1 and headings | Exactly one h1 everywhere, no skipped levels |
| Images | 0 missing alt, 0 missing dimensions, 0 over 300 KB (all WebP) |
| Structured data | Parses. ProfessionalService plus Organization, Person, Service (4), CreativeWork (6), Article (22), FAQPage (8), BreadcrumbList |
| Structured data gaps | Organization `sameAs` includes `https://x.com/hosdesignstudio`, which is a **404**. Address is Toronto only, with no street, telephone, geo, opening hours or price range |
| Sitemap | 42 URLs, all 200. **6 published articles are missing:** `made-in-canada-vs-product-of-canada-branding`, `how-to-name-a-business-in-canada`, `bill-96-packaging-signage-design-guide`, `logo-vs-brand-kit-vs-brand-identity`, `rebrand-rollout-checklist`, `full-cost-of-rebranding-in-canada` |
| robots.txt, llms.txt | Both present and correct; llms.txt is 10 KB and clear |
| AI crawlers | All allowed and served the full page |
| Without JavaScript | Main text in HTML everywhere; articles run 800 to 3,000 words |
| External links | 1 dead (the X profile above). Others flagged only because LinkedIn, X, Clutch and BDO refuse automated checks |

### 1.1 Titles (houseofsingh.com)

Under 30 characters:

| Page | Title | Note |
|---|---|---|
| `/journal` | Journal \| House of Singh (24) | Says nothing about photography or Maninder |
| `/projects` | Projects \| House of Singh (25) | Same |
| `/contact` | Contact \| House of Singh (24) | Same |
| `/terms` | Terms of Use \| House of Singh (29) | Fine as is |
| `/editions` | Shop, House of Singh Editions (29) | Protected; your call |
| `/projects/35-akhri` | 35 Akhri \| House of Singh (25) | Compare Zamana: "Zamana by House of Singh \| Vintage Sikh Photo Project" |
| `/journal/wish` | Wish \| House of Singh Journal (29) | Typical of journal entries |

The project titles for 35 Akhri, Sifti da Ghar and Sikhs in the 6ix have no descriptor because their `seo.metaTitle` is empty in Sanity (Zamana's is filled in). Journal entry titles are one or two words plus "House of Singh Journal". That is right for the brand, and the descriptions carry the meaning.

Mismatched journal titles (the browser title differs from the h1): `/journal/house-of-singh-studios` (title "Studio", h1 "House of Singh Studios"), `/journal/darbar-sahib-2021` ("The dome" and "Darbar Sahib"), `/journal/lakeview-golf-experience` ("First Morning Round at Lakeview" and "Lakeview Golf Experience").

### 1.2 Descriptions

All in range on both sites. Good, specific copy on projects and About.

### 1.3 Canonicals

Correct on both sites. `/projects/view/*` and `/projects/category/*` canonicalise to `/projects` and stay out of the sitemap, which is the right treatment.

### 1.4 Open Graph and Twitter

Every share image on both sites is exactly 1200 by 630 and loads. Gaps:
- houseofsingh.com: `og:url` is missing on 60 pages. Low impact (platforms fall back to the canonical), but it is a one line fix in shared metadata.
- Studios: 18 article share images are 0.7 to 1.7 MB PNG. Some messaging apps, WhatsApp among them, may skip a preview when the image is this large, so a link shared in a message can arrive with no picture. Export again as JPEG at about 150 KB.

### 1.5 Headings

Both sites have exactly one h1 per page. The houseofsingh.com exception is in 1.10.

### 1.6 Images

- No missing alt text on either site, and every decorative image is marked decorative, as CLAUDE.md requires.
- houseofsingh.com: 36 photographs exceed 300 KB at the largest size the site offers (1920 wide WebP or AVIF, quality 75). The largest are tall phone photographs (1920 by 3413) at 600 to 946 KB. Browsers choose a smaller size from `srcset` on phones, so real visitors usually load less than this. See the Lighthouse results for the effect on actual pages.
- Studios: no images over 300 KB.

### 1.7 Links

- houseofsingh.com: zero broken links, zero redirects, zero chains. One external link redirects (Spotify's privacy page, harmless).
- Studios: one broken internal link (above) and one dead social profile (`x.com/hosdesignstudio`, linked from the footer and the structured data). Internal links carry tracking parameters (`?from=home_band_chip`, `?from=services`), creating 22 crawlable duplicate URLs. They are canonicalised correctly, so this is crawl waste, not a ranking problem.

### 1.8 Structured data

Both sites are well above average here. Notes:
- **Person `sameAs`** (pinned in `src/lib/structured-data.ts` and mirrored on Studios) lists RGD, LinkedIn, Instagram, X and Pinterest. **Behance is missing**, and Behance is the page that ranks for "Maninder Singh creative director". Add it on both sites together.
- **Person `jobTitle`** is "Founder and Creative Director" on both sites, identical, as required.
- **Person `address`** is Toronto on both sites (see decision 1).
- **Organization (House of Singh) `sameAs`** comes from Sanity (`siteSettings.sameAs`) and lists Instagram, X and Pinterest only.
- **Studios ProfessionalService** lacks `telephone`, `geo`, `openingHoursSpecification`, `priceRange` and a street address (or an explicit service area with no address). These matter most once a Google Business Profile exists to match against.
- No Product data on houseofsingh.com, which is correct while the Shop is in anticipation mode.

### 1.9 noindex and nofollow

Only the two Shop pages that are meant to be hidden. Nothing hidden by mistake on either site.

### 1.10 Sitemap versus crawl, and the journal

- houseofsingh.com: every sitemap URL is a clean, indexable 200 with internal links pointing to it. No orphans.
- **lastmod accuracy:** 57 journal entries share the exact same lastmod (`2026-11-09T16:18:56Z`) and 61 URLs carry 16 July 2026. Journal lastmod comes from Sanity's `_updatedAt` (`src/lib/sitemapEntries.ts`, line 98), so any bulk edit or migration marks every entry as freshly changed. Google learns to ignore a lastmod it cannot trust. Projects already use a deliberate `updatedAt` field; the journal should use its own date or a manual updated date.
- **The journal duplication.** Each entry page (`/journal/basecamp`) renders the whole month, with the other entries as h2 headings above and below the entry's own h1. That is the approved J4 layout. As a result, every entry in a month and the month's archive page (`/journal/archive/2023/5`) share almost all of their text: in May 2023, `/journal/basecamp`, `/journal/from-above`, `/journal/grey-tower` and others each show the same 347 words. Titles, descriptions, share images and BlogPosting data differ, which helps, but Google may treat many entries as duplicates and index only one per month. The layout is protected and should not change. The safe lever is decision 2 above.
- Studios: 6 articles published but not in the sitemap (listed above). Its sitemap appears to be a list that is not refreshed when articles are added.

### 1.11 robots.txt and llms.txt

Both correct on both sites. No AI crawler is blocked by robots.txt or by the firewall. Google's AI training opt out (Google-Extended) is not blocked either, so both sites can appear in Gemini and AI Overviews.

### 1.12 Text without JavaScript

Both sites render server side. Every page's main text is in the first HTML response.

### 1.13 Lighthouse

One run per page, Lighthouse 12, phone (simulated mid range phone on slow 4G) and desktop.

| Page | Phone: perf, a11y, best practices, SEO | Phone LCP | Desktop: perf, a11y, best practices, SEO | Desktop LCP |
|---|---|---|---|---|
| houseofsingh.com Home | 91, 100, 100, 100 | 3.1 s | 99, 100, 100, 100 | 0.8 s |
| About | 92, 100, 100, 100 | 3.4 s | 100, 100, 100, 100 | 0.7 s |
| Project (Zamana) | 94, 100, 100, 100 | 3.0 s | 100, 100, 100, 100 | 0.8 s |
| Journal entry (The saddle) | 93, 100, 100, 100 | 3.3 s | 100, 100, 100, 100 | 0.8 s |
| Shop | 99, 100, 100, 100 | 2.0 s | 100, 100, 100, 100 | 0.5 s |
| Studios Home | 99, 96, 79, 100 | 2.2 s | 100, 96, 78, 100 | 0.5 s |
| Studios Brand identity | 98, 100, 79, 100 | 2.1 s | 100, 100, 78, 100 | 0.4 s |

Layout shift is effectively zero everywhere. Total page weight is 364 to 524 KB on phone.

**houseofsingh.com.** SEO, accessibility and best practices are perfect on every page tested. The one soft spot is phone LCP at 3.0 to 3.4 seconds, against Google's "good" line of 2.5 seconds:
- Home: the largest element is the opening crest. It loads quickly, but 1.7 seconds pass before it is shown, which is the opening reveal. The home page is protected, so this is noted, not proposed.
- About, project and journal: the largest element is the lead photograph. A follow up check (three phone runs per page; medians: About 3.25 s, Zamana 2.95 s, The saddle 3.27 s) found the lead photograph already handled correctly. Each page preloads it at the top of the page head with high priority, the preload's sizes match the displayed image exactly, and the page opens an early connection to Sanity's image server. The phone files are small (AVIF: About 46 KB, Zamana 20 KB, The saddle 82 KB).
- The pages are served from Vercel's cache (cache HIT) with a real response time of about 0.15 seconds. The 0.6 seconds Lighthouse reports is its simulated network, not the server. On the real connection used for the test, the photograph was requested about 0.2 seconds after the page started and finished by 0.3 to 0.4 seconds.
- The 3 second phone LCP therefore comes mainly from Lighthouse's simulated slow network, where the photograph shares early bandwidth with three fonts, two stylesheets and the scripts. No preload or sizes change is needed. Only lighter files or fewer competing downloads would move the simulated figure (A7).

**Studios.** Best practices drops to 78 because Microsoft Clarity sets third party cookies (and logs a browser warning). Home accessibility drops to 96 because the animated argument line starts its words at 8 percent opacity, which Lighthouse reads as unreadable contrast while the animation runs (C13).

---

## PART 2. Content and search assessment

### What ranks today

The search engine used here is not Google, and its order differs, but it shows who holds each search and whether our pages are present at all.

| Search | Our pages | What holds the search |
|---|---|---|
| Maninder Singh photographer | None | Behance (Maninder's confirmed profile, first), then pages about other people who share the name |
| House of Singh | None | Only unrelated pages |
| Maninder Singh creative director | None | Behance (first, "Maninder Singh RGD, creative director at TEDxToronto") |
| Sikh photographer Toronto | None | Baljit Singh (another photographer), wedding vendor directories (Wezoree, WeddingWire) |
| Zamana photo series | None | Nothing relevant ranks: an open field |
| 35 Akhri | None | Nothing relevant ranks: an open field |
| Sikhs in the 6ix | None | Nothing relevant ranks: an open field |
| branding agency Mississauga | None | Clutch (Mississauga branding list), Semrush agency directory, Webtonic listicle, DesignRush (Elleseven), Yellow Pages |
| brand identity designer Toronto | None | NinjaPromo and Webtonic listicles, DesignRush, Clutch, Parachute Design (a real studio page with published prices), Creative Boom feature on Vanderbrand |
| packaging design Toronto | None | Webtonic listicle, DesignRush, Clutch, The Manifest, UpCity, Sortlist, New Design Group (a dedicated packaging service page) |
| creative studio Mississauga | None | Venue rental listings (Peerspace), Clutch, Sortlist, HelloDarwin |
| houseofsingh.com (the domain itself) | None | Only Behance, which links to it |
| "House of Singh Studios" | None | Only Behance |

**What this means.** When a site does not appear even for its own domain and its own invented project names, the cause is indexing, not content quality. Common Crawl (the public web archive many AI models learn from) captured 104 houseofsingh.com pages in August 2026 and only 2 in October; Studios had 19 in September and 8 in October. The site is reachable but has few links from elsewhere, so crawlers visit rarely. Google may be better than this engine, but no one can know without Search Console.

**What outranks us, and why.**
- **Directories** (Clutch, DesignRush, Sortlist, The Manifest, UpCity): huge authority, one page per city and service, and verified client reviews. Agencies get onto these by creating a profile, so this is a free way into those results (D3).
- **Listicles** (Webtonic, NinjaPromo, Shift8): "best branding agencies in Mississauga" articles by other agencies. Being named in one requires being on the directories and having a Google Business Profile first.
- **Studio sites that do rank** (Parachute, New Design Group, Strano and Pettigrew): one page per service ("brand identity", "packaging design"), the city in the title and h1, published price ranges, named clients and reviews. Studios already does most of this for brand identity, websites, strategy and media. It lacks a packaging page and any Mississauga wording, and it has no reviews anywhere.
- **Behance** wins Maninder's name because it is old, heavily linked and states name, title and city plainly. It also lists "The House of Singh LLP, New Delhi" as a past employer, which tells search engines and AI models that House of Singh may be an Indian firm. Worth correcting (D4).

### Page by page: who, what, where

**houseofsingh.com**

| Page | Who | What | Where | Text | Notes |
|---|---|---|---|---|---|
| Home | Yes, in the h1 | Yes | Toronto | 178 words | Strong h1 |
| About | Yes | Yes | Toronto (press says Mississauga) | 707 words | Best page on the site. Has press, milestones and FAQ. Could open with a short fact sheet (B5) |
| Projects | Yes | Yes | No | 200 words | Fine |
| Zamana | Yes | Yes | No | 346 words | Best project page. Its metaTitle is the model for the others |
| 35 Akhri | Yes | Yes | No | 144 words | Needs a metaTitle and 100 to 200 more words |
| Sifti da Ghar | Yes | Yes | Amritsar | 146 words | Same |
| Sikhs in the 6ix | Weak | Weak | Toronto, once | 57 words | Thinnest page on the site. It is the open call for the series, so it needs who it is for, what taking part involves, and where (B4) |
| Journal | Yes | Weak | Toronto | 49 words above the entries | Fine for a photo journal |
| Journal entries | Yes | Short captions | Sometimes, through the place data | Entry text 20 to 60 words | See 1.10 |
| Contact | Yes | Yes | Toronto | 53 words | Thin, but that is normal for a contact page |

**Linking between projects and the journal.** Projects link to each other through the All projects flow, and the journal links by month. Projects and journal entries do not link to each other: the two Darbar Sahib journal entries do not link to Sifti da Ghar (and Sifti da Ghar links to no journal entry), and the House of Singh Studios journal entry reaches the studio site only through the sitewide footer, not in its own text. A sentence with a link inside the entry text would help both pages (B6). Entry depth: a journal entry is three clicks from the home page (Journal, then month, then entry), which is fine.

**Studios**

| Page | Who | What | Where | Text | Notes |
|---|---|---|---|---|---|
| Home | Yes | Yes | Toronto only (in visible text) | 549 words | No Mississauga, no packaging service link |
| Services | Yes | Yes | Toronto | 272 words | Lists four services; no packaging |
| Brand identity | Yes | Yes | Toronto (Mississauga 6 times, all in structured data) | 1,121 words | Strong page. h1 "Brand identity design and rebranding in Toronto" |
| Strategy, Digital, Media | Yes | Yes | Toronto | 950 to 1,110 words each | Strong. Media's title says "House of Singh" without "Studios" |
| Work (6 case studies) | Client name only in title | Yes | Some (Oakville) | 290 to 660 words | Titles could carry service and city: "Bruno Bakehouse brand identity, Oakville" |
| Insights (22) | Yes | Yes | Canada | 800 to 3,000 words | The site's biggest asset for search. Well targeted (pricing in Toronto, packaging cost, Bill 96) |
| About | Yes | Yes | Toronto | 517 words | No founder fact line with location |
| Contact | Yes | Yes | Toronto | 123 words | No phone, no area served sentence |

---

## PART 3. AI visibility

**What could and could not be tested.** ChatGPT, Perplexity and Google's AI answers need a signed in account and cannot be queried from this machine, so their actual answers were not tested. What was tested is what those systems depend on: whether their crawlers can read the sites (yes, all of them), whether the search indexes they draw on contain the sites (ChatGPT search uses Bing, Perplexity uses its own index plus Bing, and Google AI uses Google's index), and whether the public record about Maninder is consistent.

**What they will likely find today**
- **Maninder Singh:** a common name. Behance is the clearest page, and it says Toronto, RGD and TEDxToronto, but also "The House of Singh LLP, New Delhi". Expect AI answers either to describe the Behance profile or to mix him up with other people who share his name.
- **House of Singh:** the name is shared with unrelated uses. Without the site in the index, an AI is likely to answer about those.
- **House of Singh Studios:** not found by name at all in this test.

**What is already right**
- Both llms.txt files are clear, consistent and say plainly that the brands are not affiliated with similarly named businesses.
- Shared `@id` values join the Person, House of Singh and House of Singh Studios across both sites.
- No AI crawler is blocked.

**What is missing**
1. **Being in the indexes at all** (Search Console, Bing Webmaster Tools, D1). IndexNow is already set up on houseofsingh.com. Studios should get it too (C10).
2. **One consistent fact line everywhere:** name, "RGD", the title in the approved order, location, and links to both sites. Instagram, LinkedIn, Behance, RGD, X, Pinterest and the Studios LinkedIn page should all say the same thing (D5).
3. **Directory listings:** Google Business Profile, Clutch, the RGD member directory (already in sameAs) and DesignRush. AI tools answer "who is a good branding studio in Mississauga" largely from these (D2, D3).
4. **Third party mentions:** Modern Mississauga (2025) and Frame (2020) exist. Each one that links to houseofsingh.com or Studios with the right name and location helps (D7).
5. **A short fact sheet on About** that AI tools can quote: where he is based, his roles, RGD, TEDxToronto, House of Singh since 2014 and House of Singh Studios since 2023 (B5). The llms.txt already has this, but people and Google read the page, not llms.txt.
6. **Behance in Person `sameAs`** so the strongest existing profile is tied to the entity (A1).

**Prompts for Maninder to run monthly** in ChatGPT (search on), Perplexity and Google, logged out where possible:
- "Who is Maninder Singh, the creative director and photographer in Toronto?"
- "What is House of Singh?"
- "What is House of Singh Studios?"
- "Recommend a branding studio in Mississauga" and "...packaging designer in Toronto"
- "What is the Zamana photo project?"

---

## PART 4. Improvement plan

Each group is ranked by impact: first Studios leads, then name searches for Maninder Singh and House of Singh, then everything else. Effort: small (under an hour), medium (half a day to a day), large (several days or ongoing).

### A. Code fixes in this repo (houseofsingh.com)

| # | Fix | Impact | Effort | Notes |
|---|---|---|---|---|
| A1 | Add Behance (`https://www.behance.net/manindersingh`) to `PERSON_SAME_AS` in `src/lib/structured-data.ts` | Name searches, AI identity | Small | Must change on Studios the same day (CLAUDE.md, section 9) |
| A2 | Apply the location decision to Person `address` and `description`, `SEO_DEFAULTS` description, `src/lib/llms.ts` "who is who", home and About metadata | Studios leads (Mississauga), name searches | Small | Waits for decision 1. Both sites together |
| A3 | Journal month archives: `robots: noindex, follow` in `src/app/(site)/journal/archive/[year]/[month]/page.tsx` and removal from the sitemap | Name searches (cleaner index), everything else | Small | Waits for decision 2. No visual change |
| A4 | Journal sitemap lastmod: use the entry's own date (or a deliberate updated field, as projects do) instead of `_updatedAt`, in `src/lib/sitemapEntries.ts` line 98 | Everything else | Small | Stops bulk edits from marking 57 entries as new |
| A5 | **Superseded** by the Decisions, 14 November 2026 (approved titles for Journal, Projects and Terms; Contact done in Sanity). Original suggestion: fuller section titles for Journal, Projects, Contact, for example "Journal: Photographs by Maninder Singh \| House of Singh" | Name searches | Small | Superseded |
| A6 | Add `openGraph.url` to the 60 pages that lack it (one shared helper) | Everything else | Small | Low impact; tidy |
| A7 | Image weight: review the 1920 wide fallback for tall photographs (quality or width cap for portrait ratios) | Everything else | Medium | Preload and sizes are already correct (1.13), so this is optional and for approval only. Must not change the automatic photograph layout |

### B. Sanity content fixes (houseofsingh.com)

| # | Document and field | Fix | Impact | Effort |
|---|---|---|---|---|
| B1 | Site settings, `googleVerification` | Paste the Search Console HTML tag code, unless the domain is verified by DNS | All of it (enables D1) | Small |
| B2 | Site settings, `sameAs` | Add Behance and the House of Singh LinkedIn (if one exists) to the Organization profiles | Name searches | Small |
| B3 | Project "35 Akhri", Project "Sifti da Ghar", Project "Sikhs in the 6ix", each `seo.metaTitle` | Write a descriptive title like Zamana's, for example "35 Akhri: a zine by 35 Panjabi photographers \| House of Singh" | Name and project searches | Small |
| B4 | Project "Sikhs in the 6ix", `story` and `excerpt` | 150 to 300 words: what the series is, who it is for, Toronto and the GTA, how to take part, who is behind it | Project searches, "Sikh photographer Toronto" | Small |
| B5 | About page, `founderBio` (or a new short chapter, which would be a schema change) | Open with a plain fact line: name, RGD, roles in the approved order, location, House of Singh since 2014, Studios since 2023 | Name searches, AI | Small |
| B6 | Journal entries "Darbar Sahib", "The dome", "House of Singh Studios" and others, `body` | One natural sentence with a link to the related project or the studio site | Everything else | Small |
| B7 | Projects "35 Akhri" and "Sifti da Ghar", `story` | Add 100 to 200 words each (context, year, people, place) | Project searches | Medium |
| B8 | Journal entries "House of Singh Studios", "The dome", "Lakeview Golf Experience", `seo.seoTitle` | Make the title match the h1 | Everything else | Small |
| B9 | Contact page, `seoDescription` | Apply the location decision | Studios leads, name | Small |

### C. Studios site fixes (separate project, list only)

| # | Fix | Impact | Effort |
|---|---|---|---|
| C1 | New service page: packaging design ("Packaging design in Toronto and Mississauga"), linked from Services, Home and the three packaging articles; add a Service node | Studios leads ("packaging design Toronto") | Medium |
| C2 | Apply the location decision in visible copy: home and Brand identity titles, h1s and intro lines, contact page, footer. If Mississauga is the base, one genuine Mississauga page (not a copy of the Toronto page) | Studios leads ("branding agency Mississauga", "creative studio Mississauga") | Medium |
| C3 | Remove or correct `https://x.com/hosdesignstudio` (404) in the footer and the Organization `sameAs` | Studios leads (trust), AI identity | Small |
| C4 | Fix the broken link to `/insights/green-claims-packaging-canada-2026` in the packaging cost article (publish the article or remove the link) | Studios leads | Small |
| C5 | Add the 6 missing articles to the sitemap, and generate the sitemap from Sanity so new articles join automatically | Studios leads | Small |
| C6 | ProfessionalService structured data: telephone, address or service area, geo, opening hours, price range, and `sameAs` for Google Business Profile, Clutch and Behance once they exist | Studios leads | Small |
| C7 | Case study titles with service and city ("Bruno Bakehouse brand identity, Oakville \| House of Singh Studios") | Studios leads | Small |
| C8 | Export again the 18 article share images as JPEG at about 150 KB | Studios leads (shared links show previews) | Small |
| C9 | `/services/visual-media` title: "House of Singh Studios". Trim `/services` and `/services/brand-identity` titles under 60 characters | Studios leads | Small |
| C10 | Add IndexNow to Studios, as on houseofsingh.com | Studios leads | Small |
| C11 | Remove tracking parameters from internal links (use analytics events instead) | Everything else | Small |
| C12 | A reviews or testimonials section once Google reviews exist, with Review data | Studios leads | Medium |
| C13 | Lighthouse: load Microsoft Clarity only after consent, or drop it (best practices 78 to 100); start the home argument animation at readable contrast or mark the moving copy so the real sentence stays readable (accessibility 96 to 100) | Everything else | Small |

### D. Off site actions for Maninder

| # | Action | Impact | Effort |
|---|---|---|---|
| D1 | **Google Search Console and Bing Webmaster Tools** for both sites. Verify, submit both sitemaps, request indexing for the home, About, project and Studios service pages. Then read the Pages report: it shows what Google has and has not indexed, and why. Everything else depends on this | Studios leads, name searches | Small |
| D2 | **Google Business Profile** for House of Singh Studios. Service area business (address hidden if you work from home), categories "Graphic designer" and "Brand consultant", the location from decision 1, website, hours, real photos. Ask 5 to 10 past clients (Bruno Bakehouse, Marell, Trilokchand and others) for reviews | Studios leads (the map results for every Mississauga and Toronto search) | Medium |
| D3 | **Directories:** Clutch (ranks for "branding agency Mississauga"), DesignRush, Sortlist, The Manifest, UpCity, and the RGD member and firm listings. Same name, location, description and link on each. Clutch reviews are verified by phone, so ask two or three clients | Studios leads | Medium |
| D4 | **Behance:** fix or explain "The House of Singh LLP, New Delhi", add both websites, use the same title line and location | Name searches, AI identity | Small |
| D5 | **One fact line on every profile** (Instagram, LinkedIn personal and company, X, Pinterest, RGD, Behance): "Maninder Singh RGD, creative director, photographer and multidisciplinary designer, [location]", with a link to houseofsingh.com, and to Studios on the studio profiles. Create or retire `@hosdesignstudio` on X | Name searches, AI identity | Small |
| D6 | **Press links:** ask Modern Mississauga to link its 2025 profile to houseofsingh.com and to Studios. Pitch Zamana, 35 Akhri and Sikhs in the 6ix to Sikh and Panjabi outlets (for example the Sikh Press Association and Naujawani) and to Toronto photography outlets. Each article with a link raises both sites | Name and project searches | Large, ongoing |
| D7 | **Instagram and other posts** about each project should link to the project page, not only to the home page | Project searches | Small, ongoing |
| D8 | **Monthly AI check:** run the prompts in Part 3 and log the answers | All | Small, ongoing |

### Recommended order

1. D1 (Search Console and Bing): today, nothing else can be measured without it.
2. Decisions 1, 2 and 3.
3. D2 and D3 (Google Business Profile, Clutch): the biggest lead impact.
4. C3, C4, C5, C10 (small Studios fixes) and A1 to A4 (small houseofsingh.com fixes), as one batch.
5. C1 and C2 (packaging page and location copy on Studios).
6. B3 to B6 (content in Sanity).
7. D4 to D7, ongoing.

---

## Limits of this audit

- **Rankings** come from a general web search engine, not Google. Google results in Toronto may differ. Search Console (D1) is the only reliable view of Google.
- **AI answers** (ChatGPT, Perplexity, Google AI) were not queried directly; only their inputs were checked.
- **Bing and DuckDuckGo** refused automated `site:` checks, so their index could not be confirmed either way.
- **Image sizes** were measured at the largest `src`; phones load smaller files from `srcset`.
- **Lighthouse** scores vary by a few points between runs and come from one run per page on a home connection (three runs per page for the LCP follow up in 1.13).
- The Studios site was crawled from production only, with no access to its code.

---

## Sources

Every web source this report relies on, with its exact URL. Each is labelled either **confirmed profile** (a profile Maninder has confirmed as his; Behance only) or **competitor/directory (context only)** (used only to show who holds a search; never attributed to Maninder or House of Singh).

**Confirmed profile**
- Behance, Maninder Singh: https://www.behance.net/manindersingh

**Competitor/directory (context only)**
- Clutch, branding agencies in Mississauga: https://clutch.co/ca/agencies/branding/mississauga?page=9
- Clutch, branding agencies in Mississauga: https://clutch.co/ca/agencies/branding/mississauga?page=13
- Semrush agency directory, Mississauga: https://vi.semrush.com/agencies/list/branding-reputation-management/mississauga/enterprise-business
- Webtonic, Mississauga branding agencies: https://www.webtonic.io/blog/best-branding-brand-identity-agencies-mississauga
- DesignRush, Elleseven Branding: https://www.designrush.com/agency/profile/elleseven-branding
- Yellow Pages, Mississauga listing: https://www.yellowpages.ca/bus/Ontario/Mississauga/Print-Web-Design-Ca/102050460.html
- NinjaPromo, Toronto branding agencies: https://ninjapromo.io/top-branding-agencies-in-toronto
- Webtonic, Toronto brand identity: https://www.webtonic.io/blog/best-branding-brand-identity-agencies-toronto
- Shift8, agency listicle: https://shift8web.ca/?p=9554
- Clutch, branding agencies in Toronto: https://clutch.co/ca/agencies/branding/toronto?page=14
- Parachute Design, brand identity: https://parachutedesign.ca/brand-identity/
- Creative Boom, Vanderbrand: https://www.creativeboom.com/work/vanderbrand-the-toronto-studio-crafting-identities-rooted-in-place-and-purpose/
- Webtonic, Toronto packaging design agencies (names Strano and Pettigrew): https://www.webtonic.io/blog/best-packaging-design-agencies-toronto
- DesignRush, packaging design in Toronto: https://www.designrush.com/agency/package-design/ca/toronto
- Clutch, packaging designers in Ontario: https://clutch.co/ca/agencies/packaging-design/ontario?page=2
- The Manifest, packaging designers in Toronto: https://themanifest.com/ca/packaging-design/agencies/toronto
- UpCity, packaging design in Toronto: https://upcity.com/ca/packaging-design/toronto
- Sortlist, packaging agencies in Toronto: https://www.sortlist.com/s/packaging/toronto-on-ca
- New Design Group, packaging: https://www.newdesigngroup.ca/?p=10108
- Clutch, creative agencies in Mississauga: https://clutch.co/ca/agencies/creative/mississauga
- Sortlist, creative agencies in Mississauga: https://www.sortlist.com/s/creative/mississauga-on-ca
- HelloDarwin, creative agencies in Mississauga: https://hellodarwin.com/fr/agences/creative/mississauga
- Peerspace, studio rental listing: https://www.peerspace.com/au/pages/listings/67de2341ba7ef9ef2813a6b1
- Homegrown, Baljit Singh: https://homegrown.co.in/homegrown-creators/baljit-singhs-photoseries-celebrates-maternal-figures-the-bonds-of-sisterhood
- Wezoree, Sikh photographers in Toronto: https://wezoree.com/vendors/toronto/photographers/filter/cultural-and-traditional-sikh/apply/
- WeddingWire, wedding photography listing: https://weddingwire.ca/wedding-photography/raspal-singh-photography--e54169

**Not a web search source.** Modern Mississauga (2025) and Frame (2020) are cited from the press list on houseofsingh.com/about, Maninder's own site, and were not found through search.
