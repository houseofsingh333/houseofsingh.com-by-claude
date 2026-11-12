# Phase 1: full award audit of houseofsingh.com

**Report only. No code was changed for this audit.**

- **Audited:** 12 November 2026 (Toronto), on Production after PR #68 was deployed (main at `8709fe2`).
- **Pages:** every page in the sitemap (143), plus For artists, Terms of sale, Unsubscribe, the closed Shop pages and three not found addresses. That is 149 addresses, at phone (390) and desktop (1440) size.
- **Page types:** each was also checked at 320, 375, 390, 768, 1024, 1280, 1440, 1920 and 2560 wide, without JavaScript, and at 200% zoom.

Evidence is in `docs/audit/phase-1/`.

## Summary

The site is in strong shape on most of the targets.

**What passes:**
- **Accessibility:** zero axe violations (WCAG 2.2 AA and best practice) on all 149 addresses, at both sizes.
- **Lighthouse:** 100 for Accessibility and Best Practices on every page type. SEO is 100 everywhere except For artists, which is hidden from search engines on purpose.
- **Layout shift:** CLS is 0.010 at most against the 0.05 target.
- **Desktop speed:** desktop Performance is 99 to 100.
- **Links and errors:** no broken links on the site and no console errors from the site itself.

**What misses**, and is ranked first below:
- **Mobile LCP:** on the six page types that open with a photograph (About, Projects, a project, Journal, an entry, a month), mobile LCP is 3.2 to 3.8 seconds in Lighthouse's slowed phone simulation, against the 2.0 second target. Mobile Performance there is 88 to 93, against 95. The cause is well understood and the fix is small (M1).
- **320 wide:** the home page and the Shop still scroll sideways (M2).
- **Not tested:** Safari (WebKit) and Firefox could not be run from the audit machine (M3).

| Target | Result |
|---|---|
| LCP under 2.0 s on mobile | **Missed** on 6 of 11 page types (3.23 to 3.83 s); met on Home, Contact, Shop, For artists, Privacy (0.92 to 1.16 s) |
| INP under 150 ms | Not measurable in a lab. Total Blocking Time, its lab stand-in, is at most 142 ms (Home, mobile) |
| CLS under 0.05 | **Met** everywhere (worst 0.010) |
| Lighthouse 95+ in all four | **Met** on desktop. **Missed** on mobile Performance for 6 page types. For artists SEO is 58 by design (noindex) |
| WCAG 2.2 AA, zero axe violations | **Met** on 149 of 149 addresses, phone and desktop |
| Zero console errors | **Met** for the site's own code. The only errors come from inside the Spotify player and from not found pages answering 404 |
| Zero broken links | **Met** on the site: the crawl visited 153 pages and checked 165 links, none broken. The 7 links to other sites could not be reached from the audit machine (see Not covered) |

## Findings, ranked

Severity: **must fix** (misses a stated target or blocks the award), **should fix**, **polish**. Effort: S (under 2 hours), M (half a day), L (a day or more).

### Must fix

| # | Area | Page | Finding and evidence | Proposed fix | Effort |
|---|---|---|---|---|---|
| M1 | 6 Performance | About, Projects, a project, Journal, an entry, a month (mobile) | Lighthouse mobile LCP 3.23 to 3.83 s, Performance 88 to 93 (`phase-1/lighthouse-medians.txt`, median of 3 runs). The largest element is the opening photograph (About portrait, project hero, Projects plate, entry photograph). Measured without throttling, the About portrait paints at 0.73 s, so the photographs are small and fast (41 to 82 KB). What the slowed phone pays for is shown in the next three rows. | One small change to the shared photograph component, then re-measure. | M |
| | | | **1. No early connection to cdn.sanity.io.** No preconnect, so the image server's connection starts late. | Add `<link rel="preconnect" href="https://cdn.sanity.io" crossorigin>`. | |
| | | | **2. Opening photograph not marked high priority.** Its early fetch (preload) lacks `fetchpriority="high"`. | Mark it with `fetchpriority="high"`. | |
| | | | **3. Competing early fetches and blocking CSS.** About also fetches its logo early, competing with the portrait, and 32 KB of render blocking CSS costs about 150 ms. | Stop the early fetch of any second image. | |
| M2 | 2 UI, 3 UX | Home and Shop at 320 wide | The page scrolls sideways at 320 (the narrowest phones still in use, such as the iPhone SE first generation). Home is 34 px too wide: "Read the journal" beside "Journal" and the "Visit House of Singh Studios" button. The Shop is 53 px too wide: the label "Released on the eve of Vaisakhi · in 153 days" never wraps and is 349 px in a 272 px column. Evidence: `phase-1/home-320.jpg`, `phase-1/shop-320.jpg`. Every other page type fits at every width from 320 to 2560. | Below 360 wide only: let the Shop label break after "·"; let the Studios button's words wrap onto two lines; let "Read the journal" sit on its own line beneath "Journal". | S |
| M3 | 4 Browsers | All | WebKit (Safari) and Firefox could not be tested. The audit machine's network refuses Playwright's browser downloads, and the request to allow them was declined. Safari is the main browser on iPhone, so it must be checked before any award entry. Everything in this report is from Chromium, with iPhone and desktop emulation. | On your Mac: `npx playwright install webkit firefox`, then run the test scripts against WebKit and Firefox (a short guide can be added), or allow the two download hosts for the cloud environment. Also check on a real iPhone. | S |

### Should fix

| # | Area | Page | Finding and evidence | Proposed fix | Effort |
|---|---|---|---|---|---|
| S1 | 8 Dependencies | Repository | `npm audit`: 46 known issues (1 critical in `tar`, 18 high, 25 moderate, 2 low). Almost all are in Sanity's command line tools and the build tooling, not in what visitors download. One is the Studio's copy of DOMPurify, used only by signed in editors. Two Dependabot PRs are waiting (#62 minor and patch group, #63 `@portabletext/react` 6 to 8). Dependabot security alerts are switched off for the repository. | A dedicated PR running the non breaking `npm audit fix`, checked by the build and tests. Review and merge #62. Assess #63 separately (a major version). Switch on Dependabot alerts in the repository settings. | M |
| S2 | 9 SEO | For artists, Terms of sale, Unsubscribe | These three pages take the home page's canonical address (`https://houseofsingh.com/`) and its 165 character description. They are noindex, so the harm is small, but the signal is wrong. | Give each its own canonical address (or none) and its own description. | S |
| S3 | 1 Interaction | Test suite | `tests/navigation-scroll.mjs` case 1 ("menu to About opens at the top") now fails on Production, on desktop and phone. With the sequential page change, the scroll reset to the top happens up to about 150 ms after the new page is in the document, while the screen shows only the canvas. The frames show it is never visible (`phase-1/menu-to-about-frames.jpg`). | Update the test to sample the scroll position once the page change has finished (no view transition running). | S |
| S4 | 2 UI | A project at 2560; About at 1920 and wider | At 2560 the Zamana hero crops to a close-up of the face, cutting into the turban (`phase-1/zamana-2560.jpg`). About's opening spreads thin: a small portrait far left, the quote far right (`phase-1/about-2560.jpg`). Both layouts are protected ("Zamana, refined", the approved layouts), so this needs your approval. | Cap the hero's height on very wide screens (for example about 80 percent of the window height), and cap the About opening's width so the portrait and quote stay together. Show you mockups first. | M |
| S5 | 1 Interaction, 2 UI | Home, first visit | The intro covers the page from 1.0 s to about 6.4 s on pure white (#FFFFFF), not the canvas (#F9F7F5), the one colour off the palette on the site. With reduced motion it is skipped, as it should be. | Use the canvas colour. Consider whether 5 seconds is the right length for a first visit. | S |
| S6 | 12 Reliability | Site | There is no monitoring beyond Vercel's own logs: no alert when the site or a form stops working. There is no scheduled backup of the Sanity content: Sanity keeps history, but there is no export you own. | A free uptime check on the home page and the sign up endpoints, with alerts to you. A weekly Sanity dataset export to private storage (not this public repository). | M |
| S7 | 5 Accessibility, 3 UX | Footer newsletter, Notify me | An invalid email shows the browser's own bubble ("Please include an '@' in the email address…"): off brand in wording and look, and different in every browser. | Turn off the browser bubble and show the site's own inline message, in the error brick colour, announced to screen readers. | S |
| S8 | 8 Security | Forms | The limit on sign ups and contact (5 per 10 minutes per address) lives in each server instance's memory, so it resets with every new instance. It is a best effort first layer. The honeypot and validation remain. | If spam appears, move the limit to a shared store (Vercel KV or Upstash). Otherwise keep it as is and watch. | M |
| S9 | 6 Performance | All | INP can only be judged from real visitors. The lab stand-in (Total Blocking Time) is at most 142 ms, but field data could not be read (Vercel was not reachable from the audit session). | Read Speed Insights in Vercel for INP and LCP at the 75th percentile, and confirm both against the targets. | S |

### Polish

| # | Area | Page | Finding and evidence | Proposed fix | Effort |
|---|---|---|---|---|---|
| P1 | 10 AI discovery, 9 SEO | Home, About, Projects, Journal, Contact, 45 month pages | These use the generic share image. Projects, entries, the Shop and Privacy have their own. | A page specific share image for the main pages (About: the portrait; Projects: the first plate; Journal: the latest entry). | S |
| P2 | 9 SEO | Home | The description is 165 characters, a little over the 160 that search results show. | Trim by a few words. | S |
| P3 | 5 Accessibility | Home (desktop) | "Skip to journal" appears in each of the three pinned rooms, so a keyboard user meets it three times. | One skip link, at the start of the exhibition. | S |
| P4 | 2 UI | Projects at 390 | One lone last word in the introduction ("…familiar angles and quiet points of view."). Everywhere else the lone word checker found none. | Run it through `keepLastWords`. | S |
| P5 | 10 AI discovery | Projects | Without JavaScript the Projects page shows about half of its text (161 against 309 characters). All four project links are present; the short descriptions are drawn in the browser. Every other page reads the same with and without JavaScript. | Render the descriptions on the server. | S |
| P6 | 7 Code quality | Repository | Leftovers:<br>• 29 unused exports and 2 unused components (`OutlineLink`, `developImgProps`);<br>• about 10 style classes that nothing uses (for example `ed-fold-mark`, `instagram-plate-img`, `contact-btn-arrow`);<br>• one unused import, the only lint warning (`OneByOne.tsx`).<br>Duplication is low (0.45 percent, 8 small clones). TypeScript is strict. | One tidy up PR. | S |
| P7 | 8 Security | Daily email route | The scheduled job's secret is compared with a plain comparison. The other secrets use a constant time comparison. | Use `timingSafeEqual` there too. | S |
| P8 | 8 Security | All | The security policy allows inline scripts (`'unsafe-inline'`), as Next.js needs without per request nonces. All other headers are present: HSTS with preload, no framing, nosniff, referrer and permissions policies. | Consider nonces later. It would make every page render per request, a speed tradeoff; not recommended now. | L |
| P9 | 1 Interaction | Menu to a page | Choosing a page in the menu fades the open menu and the old page out together. For 200 ms the closing panel and the page beneath are both visible (`phase-1/menu-to-about-frames.jpg`). | Let the menu disappear at once when the page change starts, so only the page fades. The menu is approved, so this needs your approval. | S |
| P10 | 5 Accessibility | Contact, Notify me, For artists | Text fields show focus by darkening their 1 px hairline. This meets WCAG 2.2 AA (2.4.7) but is quiet. | Thicken the hairline to 2 px on focus. | S |
| P11 | 2 UI | Browser tab | The 16 px favicon is faint at the lion's original line weight (flagged with PR #68). | A heavier line version for 16 and 32 only, if you want it. | S |

## Scores per page

Lighthouse 13.6, median of three runs from the audit machine. Mobile uses Lighthouse's slowed phone simulation; desktop uses its desktop preset. The 404 page cannot be scored (Lighthouse stops on a 404 status); it was checked separately.

| Page | Device | Perf | A11y | Best pr. | SEO | LCP | CLS | TBT | JS | Total |
|---|---|---|---|---|---|---|---|---|---|---|
| Home | mobile | 98 | 100 | 100 | 100 | 1.16 s | 0 | 142 ms | 176 KB | 568 KB |
| Home | desktop | 99 | 100 | 100 | 100 | 0.83 s | 0 | 0 ms | 176 KB | 816 KB |
| About | mobile | **92** | 100 | 100 | 100 | **3.34 s** | 0 | 71 ms | 181 KB | 472 KB |
| About | desktop | 99 | 100 | 100 | 100 | 0.81 s | 0.010 | 0 ms | 181 KB | 582 KB |
| Projects | mobile | **91** | 100 | 100 | 100 | **3.41 s** | 0 | 117 ms | 187 KB | 484 KB |
| Projects | desktop | 99 | 100 | 100 | 100 | 0.85 s | 0 | 0 ms | 186 KB | 584 KB |
| A project (Zamana) | mobile | **88** | 100 | 100 | 100 | **3.83 s** | 0 | 85 ms | 187 KB | 601 KB |
| A project (Zamana) | desktop | 99 | 100 | 100 | 100 | 0.89 s | 0 | 0 ms | 187 KB | 796 KB |
| Journal | mobile | **91** | 100 | 100 | 100 | **3.39 s** | 0 | 70 ms | 186 KB | 621 KB |
| Journal | desktop | 99 | 100 | 100 | 100 | 0.77 s | 0 | 0 ms | 186 KB | 634 KB |
| An entry | mobile | **92** | 100 | 100 | 100 | **3.37 s** | 0 | 75 ms | 186 KB | 621 KB |
| An entry | desktop | 99 | 100 | 100 | 100 | 0.80 s | 0 | 2 ms | 186 KB | 633 KB |
| A month | mobile | **93** | 100 | 100 | 100 | **3.23 s** | 0 | 79 ms | 186 KB | 541 KB |
| A month | desktop | 99 | 100 | 100 | 100 | 0.76 s | 0 | 0 ms | 185 KB | 588 KB |
| Contact | mobile | 100 | 100 | 100 | 100 | 1.13 s | 0 | 62 ms | 183 KB | 383 KB |
| Contact | desktop | 99 | 100 | 100 | 100 | 0.80 s | 0 | 0 ms | 183 KB | 504 KB |
| Shop | mobile | 99 | 100 | 100 | 100 | 0.94 s | 0 | 110 ms | 182 KB | 381 KB |
| Shop | desktop | 100 | 100 | 100 | 100 | 0.29 s | 0 | 0 ms | 182 KB | 507 KB |
| For artists | mobile | 99 | 100 | 100 | 58 (noindex) | 0.92 s | 0 | 107 ms | 179 KB | 376 KB |
| For artists | desktop | 100 | 100 | 100 | 58 (noindex) | 0.25 s | 0 | 0 ms | 179 KB | 501 KB |
| Privacy | mobile | 100 | 100 | 100 | 100 | 1.08 s | 0 | 87 ms | 177 KB | 363 KB |
| Privacy | desktop | 100 | 100 | 100 | 100 | 0.57 s | 0 | 0 ms | 177 KB | 488 KB |

Every page also had:
- zero axe violations;
- exactly one main heading, with no skipped heading levels;
- every image with an alt attribute (decorative ones are deliberately empty);
- header, main, navigation and footer landmarks;
- valid structured data (the sitewide Person, Organization and WebSite, plus the page's own type);
- a title, a description and a large share card.

## By area

### 1. Interaction design
- **Page changes:** recorded frame by frame on a phone, from the top and from far down:
  - Shop to For artists, Journal entry to About, project to project, and menu to About;
  - each is one clean fade, the old page out to the canvas and the new page in, never both at once (`phase-1/shop-to-artists-frames.jpg`);
  - the project plate grows into the next hero as approved.
- **Back and Forward:** return at once to where the page was left (tested on Production, desktop and phone).
- **Reduced motion:** page changes are instant, and the intro is skipped.
- **Menu:**
  - it opens from the keyboard, focus moves inside and stays there, Escape closes it, and focus returns to the menu button;
  - see P9 for the fade.
- **Intro:** see S5.
- **Hover and focus:** text links redraw their hairline, and buttons and links show visible focus. Text fields are quiet (P10).

### 2. UI
- **Palette:** the type scale, tokens and palette held across every page checked. The one colour off the palette is the intro's white (S5).
- **Widths:** no sideways scroll from 375 to 2560 on any page type. 320 fails on Home and the Shop (M2). 2560 weakens two layouts (S4).
- **Lone words:** one (P4).
- **Content:** no placeholder, sample or stock content found on any page.

### 3. UX journeys
- **Pages:** home, menu, about, projects, each project, journal, entries, months, contact, newsletter, Shop, Notify me, For artists, terms, privacy, unsubscribe, 404, closed Shop pages. All load and read well.
- **Not found:** addresses answer 404 with "This page has wandered off." and a way back.
- **Unsubscribe:** without a valid link it explains what to do.
- **Forms:** tested only with empty and invalid input, so nothing was sent to Kit, Resend or Sanity from the live site. Contact moves to its fields after an intention is chosen. Newsletter and Notify me refuse an invalid email (with the browser's bubble, S7).

### 4. Browsers
Chromium only, with iPhone 14 and desktop emulation (M3).

### 5. Accessibility
- **axe:** zero violations on 149 addresses, at both sizes.
- **Keyboard:** "Skip to content" is the first stop on every page tested. No focus stop lands on hidden content. The menu traps focus correctly.
- **Zoom:** at 200% (a 1280 window), no page scrolls sideways.
- **Headings, landmarks and alt text:** all as above.
- **Still to do:** a manual screen reader pass (VoiceOver on the iPhone) is the remaining check.

### 6. Performance
- **Scores:** see M1, S9 and the scores table.
- **JavaScript:** 176 to 187 KB per page (compressed).
- **Images:** served by Sanity's CDN in the best format for each browser, sized per screen.
- **Fonts:** three self hosted fonts, preloaded and cached for a year.
- **Caching:** HTML revalidates. The Shop page is rendered per request, because it reads the preview cookie; its server response time was 0.3 s.

### 7. Code quality
- **Strictness and duplication:** TypeScript strict; lint clean but for one unused import; duplication 0.45 percent.
- **Server and browser code:** 54 of 98 components run in the browser, each for interaction (menus, forms, the Journal room, the Projects views, the record). Nothing found that should be server only.
- **Error handling:** there are error pages for the site and the whole app. Sanity requests retry with a time budget, and the site keeps serving the last good page if Sanity fails.
- **Leftovers:** see P6.

### 8. Dependencies and security
- **Dependencies:** S1.
- **Headers:** all present (P8).
- **Protected routes:** the Stripe webhook verifies its signature. IndexNow and the scheduled job check their secrets. Order status checks the Studio sign in.
- **Secrets:** none committed (scanned for common key formats).
- **Rate limits:** S8.

### 9. SEO
- **Basics:** titles are unique and under 60 characters; there is one main heading per page; descriptions are present.
- **Structured data:** valid on every page.
- **Sitemap and robots:** the sitemap lists 143 pages; robots.txt allows everything except the Studio and the API.
- **Redirects:** `http` and `www` redirect permanently to `https://houseofsingh.com`.
- **Images:** an image sitemap is in place, and alt text is on every meaningful image.
- **Findings:** S2 and P2.

### 10. AI discovery
- **Crawlers and llms.txt:** robots.txt does not block AI crawlers. `/llms.txt` (6 KB) and `/llms-full.txt` (20 KB) are live and match the site.
- **Without JavaScript:** every page reads the same, except Projects (P5).
- **Share previews:** every page has a title, a description and a 1200 by 630 image (P1).

### 11. Content
- **Spelling:** no typos found. Every word a dictionary did not know is a name, a place or a Punjabi word (for example Tairn and Co., Nivora, kirtan, langar, Saragarhi).
- **Placeholders:** no placeholder or sample content is visible.
- **Dates:** dates are consistent (day month year in the Journal).
- **Alt text and voice:** alt texts are written, not file names. The voice is calm and first person throughout.

### 12. Reliability
- **Sanity:** retries, then the last good page.
- **Kit:** a sign up that cannot reach Kit is kept privately and retried by the daily job.
- **Resend:** order and letter emails queue and retry.
- **Contact:** the form is saved to Sanity.
- **Missing:** monitoring and backups (S6).

## Not covered, and why
- **WebKit and Firefox:** see M3.
- **Links to other sites:** Instagram, Cal.com, the three press articles and Spotify could not be reached from the audit machine. Run `node tests/crawl.mjs https://houseofsingh.com` on your Mac to check them; the site's own links are all good.
- **Real visitors:** Vercel's deploy logs and Speed Insights could not be read, because the Vercel connection failed in this session (S9).
- **Real form submissions:** not made against the live services, on purpose.
- **Real devices:** not tested (an iPhone with Safari and VoiceOver is the recommended last check).

## How it was measured
- **Tools:**
  - Playwright with Chromium 1243 (iPhone 14 emulation and desktop windows);
  - axe-core (WCAG 2.0, 2.1 and 2.2 A and AA, plus best practice);
  - Lighthouse 13.6 (three runs per page type, median);
  - `tests/crawl.mjs` and `tests/navigation-scroll.mjs`;
  - `npm audit`, knip (unused code), jscpd (duplication), codespell and a dictionary check on every page's text.
- **Recordings:** frames from Chrome's screencast.
- **Where the scripts live:** the audit scripts themselves are in the audit session, not in this repository; they can be added if you want the audit repeatable.
