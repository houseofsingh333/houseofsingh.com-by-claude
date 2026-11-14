# House of Singh Editions: the Shop

The approved concept, states, design decisions, schema and checkout of the Shop, from the canvas "Homepage Journal: three options" (page "Shop, the flow", frames 1 to 6: SF-ShopFinal, Y4b-PieceLuxe, FL3-Closed, FL4-Second, FL5-Shelf, FL6-Artists; and page "Shop, decisions", the chosen R1-A, R2-A, R3-A and R4-B). This is on CLAUDE.md's protected list: change it only with Maninder's explicit approval. Setup and operations are in `docs/editions-setup.md`.

## The concept

House of Singh Editions is a small shop inside the portfolio, not a store beside it. Work is released in **Collections**, twice a year, each named for its season ("Collection 01, Vaisakhi 2027"): a handful of pieces (prints, clothing, objects, originals), some made by hand, some with makers and artists House of Singh trusts. Each Collection is released once and never restocked. Between Collections the Shop rests.

The tone is the site's: calm, honest, unhurried. The Shop says plainly what it is and is not before anyone buys ("This is not fast. This is not cheap. This will not return."), shows prices before tax, charges shipping at cost, and names the seller.

The seller is **Maninder Singh, operating as House of Singh** (decided with his CPA, 12 Nov 2026; the wording approved 14 Nov): a small supplier, so no GST/HST is charged, and the terms no longer say so. The Shop's foot line, the terms of sale, checkout, the thank you page and Privacy say "Sold by Maninder Singh, operating as House of Singh." The brand shown is House of Singh Editions. House of Singh Studios Inc. is not the seller.

## Visibility: three modes

`EDITIONS_MODE` (`src/lib/editions/enabled.ts`):

| Mode | Where | What shows |
|---|---|---|
| `off` | Production until anticipation | No footer link; every `/editions` page and Shop API route is a 404 |
| `anticipation` | The live site before launch | Linked from the footer's Pages list (Home, About, Projects, Journal, Shop, Contact), never the site menu. `/editions` only: the sealed Shop as designed in round 2 (the card, the line before the release, title, sentence, the release time in five cities, Add to my calendar, Notify me working, How the release works, In the making, Before you buy, Questions, For artists); nothing about pieces or prices, and no early access field. Linked from the footer and indexable. For artists and the terms of sale stay reachable; pieces, prices, the archive, collaborators, checkout, thank you and certificates are 404 |
| `full` | Vercel Preview; Production at launch | Everything |

On a Vercel preview in anticipation, `/editions?preview=EDITIONS_PREVIEW_SECRET` sets a cookie (a fingerprint of the secret) that shows that browser the full Shop; `?preview=off` removes it. On Production the cookie is never read (approved 13 Nov), and in anticipation the early access cookie is not read either (early access is closed to everyone), so /editions, For artists and the terms of sale are prepared ahead and refreshed every minute, and open without waiting for the server (on a slow phone, the tap to the change starting went from about 985 ms to 167 ms). Unset, `EDITIONS_ENABLED=true` still means `full`. It is linked only from the footer ("Shop"), not the menu or the homepage. Every `/editions` page except the anticipation view is noindex and nofollow, and none is in the sitemap, llms.txt or the structured data.

## The pages

| Address | What it is | Frame |
|---|---|---|
| `/editions` | The Shop: the current Collection's opening view, the Collection, Before you buy, For artists, the archive line | SF-ShopFinal, FL3, FL4 |
| `/editions/[piece]` | A piece | Y4b-PieceLuxe |
| `/editions/archive` | Closed Collections as spines on a shelf, and what each held. A 404, and unlinked, until a Collection has closed | FL5-Shelf |
| `/editions/artists` | For artists, with the proposal form | FL6-Artists |
| `/editions/collaborators/[slug]` | An artist's own page | |
| `/editions/thank-you` | After paying | |
| `/editions/verify/[code]` | A certificate | |
| `/editions/terms` | Terms of sale | |

The Shop has its own quiet header beneath the site's (Shop, House of Singh Editions; The Collection, Before you buy, For artists, and Archive once a Collection has closed) and its own footer line: "A question about a piece? Write to editions@houseofsingh.com" (the address a mailto link), then Sold by House of Singh Studios Inc., operating House of Singh Editions, and Terms of sale. On Shop pages that line takes the place of the sitewide closing section ("Let's talk about a project", Book a call); the site header, menu and footer are otherwise unchanged.

**Shop design round 1 (11 Nov 2026), approved by Maninder.** First person singular throughout the Shop ("I", "me"; never "we" or "House of Singh" as the maker). "What this is, and what it is not" and "Make something with House of Singh" are sentences, so Instrument Sans at the statement size, wherever they appear. Piece names in the grid are Playfair, as on the piece page. Buy is the Shop's one solid button (charcoal, canvas text, the label style, the outlined button's size); every other action in the Shop is the text link with its arrow and hairline, including Propose a collaboration, Send the proposal and Notify me. No word is left alone on the last line of a heading or line at any width.

**Shop design round 3, approved by Maninder on the canvas: the open Collection, the piece page, the phone card and bars, and Stripe Tax.**

- **Open and early access opening.** The same card as sealed (340px on desktop). The line above the title: "Early access · opens to everyone in N days" or "Open · until 30 May 2027". Title and sentence; no release times. Two facts under a hairline, "Still available" (7 of 8 pieces) and "Open until" (the date, or until gone), then "See the Collection ↓". Phones: the card full width with 48px beneath and a softer shadow, and the facts as one line beneath the sentence.
- **The grid.** "Collection 01" over "The pieces". Filters only for categories present. Each card whole on one screen; name in Playfair, price; the kind, then " · 2 left" in dark brass (#8A6D47, 4.51:1) when at or under Shop settings' Few left (default 3; never for a one of one, whose type line reads " · One of one" and whose page says "One of one" beside the price, with no count), and " · × Sample Artist" with the drawn × for a collaboration or a maker. Sold out: the photograph grey (60%) and soft (55%), name and price grey, "Sold out", and "Notify me of {the next Collection} →" (Shop settings, "The next Collection, by name"; fallback "the next Collection") leading to the field. Phones: one card per row, the notify link shown.
- **The piece page.** "← Collection 01"; photographs stacked on the left (phones: a rail to swipe, "1 of 3" beside the way back); on the right, held in place: the kind, the name (Playfair display-l), the price and "2 left" when few; Made by between two hairlines ("House of Singh × Sample Artist" with "About Sample", "House of Singh × a bindery in Toronto", or "House of Singh"); the statement; sizes; Ships to (four zones, two by two on phones); Buy; then Details, Size and fit (only with sizes), Shipping and returns, Care, folding like Questions. No line beneath Buy, no Before you buy link, no story section. At the end on one hairline: "← Back to the Collection" (phones: "← Collection") on the left, and on the right "Next", the next piece's name and its photograph (160px, 120px on phones). Then the help line (14px, grey, the address in charcoal) and the seller and Terms of sale.
- **Touch.** On a phone, pressing and holding the card tilts it toward the finger (up to 10 degrees), at 98.5% with a tighter shadow, following the finger and easing back on release. Scrolling across it is never blocked. On first view it settles once, from slightly lifted to flat (1.1s). Desktop keeps the pointer tilt. Reduced motion: none.
- **Phone bars.** Warm stone (#F1ECE4), a #E4DED5 hairline, a soft shadow, charcoal words; the Collection's colour stays on its card. The sealed page keeps its bar. The piece page's bar shows the name and price with the charcoal Buy once the page's Buy has scrolled away; its Buy goes to the sizes ("Choose a size") when one is needed, else to checkout; never for a sold out piece. No bar on the open Collection page.
- **Tax.** `TAX_MODE`: `none`, the default everywhere (no tax, no postal code, no tax lines). `stripe` (Stripe Tax) and `fixed` (the postal code and fixed rates) are kept for a future registration: `docs/editions-setup.md`, section 11.
- **Small supplier tracker** (private, in the Studio): paid orders by calendar quarter and four quarters rolling, plus other revenue; an email past CA$20,000 and CA$25,000 rolling and CA$20,000 in one quarter: `docs/editions-setup.md`, section 13.

**Shop design round 2 (11 Nov 2026), approved by Maninder on the canvas: the sealed Shop and the Collection grid.**

- **Header.** "House of Singh Editions" alone, Playfair at display-m; the browser title of /editions is "Shop, House of Singh Editions". Desktop menu, right aligned: The Collection (while it can be bought), How it works (while sealed), Before you buy, Questions (when a question shows), For artists, and Archive once a Collection has closed. The menu and the page share one rule (`shopSections` in `src/lib/editions/view.ts`), so the menu never offers a section the page does not show. Phones: no Shop menu.
- **The card (sealed and early access).** The Collection's colour; "House of Singh Editions"; the number in Gurmukhi numerals (Noto Serif Gurmukhi, about 168px, 124px on phones) over "Collection 01"; the release date in Toronto ("13 · 04 · 2027") and "Released once"; the seal at the bottom right: the crest in a ring of "HOUSE OF SINGH EDITIONS" over and under, dark brown, turning once a minute. With a fine pointer the card presses toward it (up to 6 degrees each way, lifted 6px, deeper shadow, 700ms); never on touch or with reduced motion. Since the round 2 review the same card is used in every state, open and closed included, and on the archive; the round 1 square is gone. Open, the opening shows its line, title and sentence (no release times); closed, the closing line, Notify me for the next Collection and the way to what it held.
- **The opening.** "Released on the eve of Vaisakhi · in 153 days" (the Collection's own line, then today, tomorrow or in N days, counted in Toronto); in early access "Early access · opens to everyone in N days". The title, the sentence from Sanity, then the release time in the cities of Shop settings (default Vancouver, Toronto, London, Amritsar, Melbourne): one row on desktop; on phones a tinted box with the moment in the visitor's own time zone (Toronto until the browser says) and "The same moment:" rolling through the other cities every 2.5 seconds (the first only, with reduced motion); screen readers hear every city once. "Add to my calendar" downloads a calendar file for the moment (one hour, the Shop's address, `/api/editions/calendar`). Notify me sits under one charcoal line with its helper; on phones it is its own section, "Be the first to know". The early access link is quiet and grey ("Already have a code? Enter it here" on phones). The honest line is gone from the opening.
- **Sections.** How the release works (three steps, before it opens), In the making (up to three Journal entries chosen on the Collection; hidden when none; a swipe rail on phones), Before you buy (five short titles), Questions ("Good to know", folding, editable; an unanswered question is marked on previews and left out of the live site), For artists ("House of Singh × a weaver … you": it starts on the first craft, each craft holds 1.5 seconds and slides in 0.5, "you" slides in over 0.8 and holds 4, then round again; still on "you" with reduced motion; the words editable; leading to the proposal form). Then the line to editions@, clear space, the hairline, the seller and Terms of sale (the only Terms of sale link on the page).
- **Phones: the floating bar.** Inset, in the card's colour: ੦੧, Collection 01 and how long until it opens, and "Notify me →". It rises once Notify me has scrolled past and steps away while it is on screen; open, it reads "Open now" and "Shop the Collection →".
- **The grid.** Desktop and tablet: every card (photograph, name, price, kind) fits on one screen below the wordmark bar; each 4:5 column is as wide as the screen's height allows, never wider than half the row, the pair on the page's left and right edges.
- **Type sizes.** The canvas sizes are set on the site's type scale (the scale is fixed): the sentence and the step titles at body-l (19/17), the city times at body, dates and helpers at small, "Be the first to know" at statement, the section headings at display-l, the bar's numeral at the numeral token.

## The states

A Collection's state is computed, never set by hand, from its three dates and its stock (`src/lib/editions/state.ts`):

| State | When | The seal | What the Shop shows |
|---|---|---|---|
| **Sealed** | Before early access (or before opening, for anyone without the code) | The crest on brass | The square, "Releasing for [season], [date]", the intro and the release times for Toronto and India, Notify me |
| **Early access** | From "Early access opens", only for a visitor who arrived through the Collection's link (the code is kept in a cookie as a fingerprint) | "Early access" | "Early access, Opens to everyone in 23 hours", and the Collection to buy |
| **Open** | From "Opens to everyone" | "Open" | The Collection to buy |
| **Closed** | After "Closes", or once every piece is sold | "Sold out", in outline | "Closed, [month]", the closed line, Notify me for the next Collection, "See what Collection 01 held" |

Notify me reuses the footer's newsletter line and its brass postmark confirmation, posting to the Shop's own private list.

## The design decisions

- **The opening view.** The Collection's coloured square (its season large in Playfair, "No. 01" with the Gurmukhi numeral, the number of pieces, "Released once", the seal), tilting gently toward a fine pointer; the seal breathes like the brass dot (2.8s). Beside it one label, "Collection 01" at display-xl, one sentence, and at the foot one honest line with Before you buy. "The Collection" over a thin vertical brass line, the two on one left edge with the rest of the page. Reduced motion: no tilt, no breathing.
- **Two across.** The Collection is two across, full bleed 4:5 photographs, wide margins, about 120px between columns and 180px between rows (R1-A). Caption: name and price on one line, the category's descriptor beneath. Filters are the Collection's categories that hold at least one piece, on the right, and there are none when it holds only one; the heading counts what is shown ("Eight pieces", "Prints, three pieces"). The grid, its title and filters share the page's left edge. Phones: one column, the filters wrapping onto a second line (never wider than the screen). When a name and its price do not fit side by side, the price moves beneath.
- **Buy.** On pointing, the photograph settles with a slow zoom and "Buy" (or "Choose a size") fades in beneath (R4-B); on touch it is always there. On the piece page, Buy is the solid button across the panel. It names the next step until the piece can be bought: "Choose a size", then, with Ships to Canada, "Enter your postal code" (the field reads "Your postal code"), then "Buy, size M". Pressed early, it takes the visitor to that step.
- **Availability inside the piece only.** The grid never shows counts. The piece page has one quiet line: "Limited run of 40, 27 available, Secure checkout by Stripe", with "Plus applicable tax for Canadian orders." beneath.
- **Prices say CAD.** Every price reads "$180 CAD". No tax is charged (`TAX_MODE` `none`), so there is no postal code field. With `fixed`, after a registration, Ships to Canada shows a postal code field with the estimated GST/HST and total before Buy.
- **Choose a size** in the grid opens the piece page; Buy goes straight to the Buy form.
- **Early access fallback.** Once early access has opened, a sealed Shop shows a quiet text link, "Have an early access code?", which opens the field in place (Notify me stays the only visible form): the code typed in does what the link does, and a wrong code says so.
- **Closed, truthfully.** "Every piece has found its home" (the Collection's closed line) only when every piece sold, and the seal reads "Sold out"; a Collection that closes by date with pieces left uses its "pieces left" line (else "Collection 01 has closed.") and its seal reads "Closed".
- **Sold out.** The price reads "Sold out", the photograph softens, and the action becomes "Notify me of Collection 02". A sold out size is struck through and cannot be chosen.
- **No dots.** No dots anywhere in the Shop: no status dots, no radio dots, no bullet markers. Choices are quiet outlined boxes.
- **Serif for names and numbers.** Playfair for the Collection title, the season, piece names on their page, numerals and the collector number; Instrument Sans for every sentence. (The grid's captions follow the chosen frame: name and price in sans, one line.)
- **Brass is never small text.** The frames' small brass labels are muted grey; brass stays for the seal, hairlines and the cue line. The seal's words are charcoal on brass (5.0:1).
- **The Shop palette.** Each Collection has one of six colours for its square and spine (BRAND_BOOK.md, "The Shop palette"), used nowhere else.
- **A piece.** The photographs stacked on the left (the first large); on the right, sticky: category and Collection, name, price, statement, the maker line with collaborators linked, sizes, Ships to (Canada, United States, India, Elsewhere, each with its shipping price), Buy, the quiet line, and folding sections (The story, Details, Size and fit, Shipping and returns, Care). At the end of every piece, "Next piece" (the next in Collection order, after the last the first) and "Back to the Collection", as text links. Phones: the first photograph, then category, name, price, statement, maker, size, Ships to, postal code and Buy, then the other photographs and the folding sections, with a bar fixed at the foot showing the price and Buy, which steps aside when the Buy form is on screen.
- **The archive.** Closed Collections as spines in their colour, oldest first, rising on pointing; the next one outlined while sealed. Each opens to what it held, every piece marked sold or not.
- **For artists.** The invitation and the four steps (Propose, A conversation, Made together, Released) beside the proposal form, saved privately; the artist gets an email that it arrived and Maninder a copy.
- **Email.** Notify me tags the person in Kit with the Collection; the website's own emails (confirmations, orders, made, shipped, certificates) go through Resend (`docs/email.md`).

## The schema (Sanity)

All under House of Singh Editions in the Studio. Every image has a hotspot and required alt text.

- **Collection** (`editionsCollection`): number, season, colour (the Shop palette), intro, closed line (every piece sold), closed line (pieces left), essay (optional), Early access opens, Opens to everyone, Closes, early access code (only its fingerprint is stored, generated in the Studio), filters (optional rename and order of its categories), test data flag. The Gurmukhi numeral comes from the number.
- **Category** (`editionsCategory`): singular, plural, caption descriptor, order.
- **Piece** (`editionsPiece`): name, address (not one of the Shop's own page names), Collection, category, order, photographs, statement, story, maker line, collaborators, details, size and fit, care, Journal entry, edition type (numbered edition, limited run, one of one), quantity, price (CAD, before tax), sizes (label, stock, sold), sold count, issue a certificate (off by default), held during checkout (read only), packed weight (kg), ships from (Canada or India), test data flag.
- **Collaborator** (`editionsCollaborator`): name, address, discipline, city, portrait, short text, links.
- **Shipping rates** (`editionsShipping`, one document): routes from each origin to each zone, with weight bands and prices.
- **Shop settings** (`editionsSettings`, one document): the honest line, the five Before you buy notes (Not fast, Not cheap, Never restocked, Not always open, Made with others; shipping, tax and duties are on each piece and in the terms), the returns line, the artists heading, invitation and steps, which Collection proposals are for and until when, the terms of sale. Empty fields use the approved wording in `src/lib/editions/defaults.ts`.
- **Private records**, read only in the Studio, ids beginning `private.` (never publicly readable): orders (`editionsOrder`, with their status: paid, being made, shipped with tracking, refunded), collectors (`editionsCollector`: an email to a lifelong collector number, assigned in order), collaboration proposals (`editionsProposal`), notify requests (`editionsNotify`, only the older ones until they move to Kit), sign ups waiting for Kit (`signupPending`), emails waiting to send (`emailQueued`) and each day's email count (`emailDay`).

## Checkout

Stripe Checkout, server side only: no Stripe script on the site and no change to the security policy.

1. Buy posts to `/api/editions/checkout` (slug, size, zone); the route is rate limited. The page sends it in the background and, when the Checkout is ready, moves to Stripe itself. It cannot simply be redirected: the site's security policy lets a form post only to the site (`form-action 'self'`), and browsers apply that to a redirect after the post, so a redirect to Stripe is refused (found and fixed in testing). Without JavaScript the form still posts, and the answer is a short page that moves on to Stripe by itself. The security policy is unchanged.
2. It reads the piece and its Collection fresh from Sanity and checks: the Collection is open, or in early access with a valid cookie; the piece is in stock; a size is chosen and in stock; the piece can ship to that zone. A refusal is written beside Buy ("This size is sold out."), without leaving the page.
3. **Stock is held.** It holds the unit (and size) on the piece for about thirty minutes, with the piece's revision, so two buyers cannot take the last one (`src/lib/editions/holds.ts`). If the last ones are only held, the buyer is told so: they may come back.
4. It prices shipping from the rate table (origin, zone, packed weight) and creates a Checkout Session in CAD: the piece (quantity 1) and shipping as a second line (so GST/HST would apply to both, after a registration); the shipping address limited to the zone's countries; the size, piece, hold and prices in metadata; the seller on the checkout page (and the GST/HST number only while tax is charged); payment methods as set in the Stripe Dashboard (cards, which bring Apple Pay and Google Pay, and Link on; Affirm, Klarna and other buy now pay later methods off), since Stripe no longer accepts them on the session; a 30 minute expiry. Then the page moves to Stripe.
5. **Tax.** None today (`TAX_MODE` `none`). With `fixed`, after a registration: GST/HST for Canadian orders at the rate of the province or territory, as fixed Stripe tax rates (Stripe retired dynamic tax rates): with Ships to Canada, the piece page asks for the postal code, its first letter gives the province, and that province's rate (created by `scripts/editions-tax-rates.ts`) is applied to the piece and to shipping. The page shows the same amount before Buy, each line rounded to the cent as Stripe rounds it. The webhook compares the province with the shipping address given at Stripe; if they differ the order is marked "Check tax" in the Studio and editions@ gets an email. Orders shipped outside Canada carry no Canadian tax. Prices on the site are before tax.
6. **The webhook** (`/api/editions/webhook`, signature verified) on a paid session records the order privately, adds one to the sold count (and the size's) as its hold is released in the same transaction, assigns or reuses the buyer's collector number, gives numbered editions and one of one pieces their edition number, gives a certificate code only to a piece set to "Issue a certificate" (off by default), and sends the order confirmation and certificate emails. An expired or failed checkout releases its hold; a refund in full marks the order refunded, restocks the piece and size once and withdraws the certificate. A repeated event changes nothing.
7. **Thank you** (`/editions/thank-you`): "Thank you. [Piece] is yours.", the summary (piece, size, ships to, price, shipping, tax only if charged, total), what happens next, the collector number and, for a piece that issues one, the certificate. Cancelling at Stripe returns to the piece.
9. **Made and shipped.** In the Studio, an order's Made and Shipped actions move it on and email the buyer (`docs/editions-setup.md`, section 9).
8. **The certificate** (`/editions/verify/[code]`): the piece, its number in the edition, the Collection, the collector number and the day. Never a name, email or address.

## Files

- Pages: `src/app/(site)/editions/`
- Components: `src/components/editions/`
- Rules and data: `src/lib/editions/` (state, format, shipping, checkout, orders, records, stripe, tax, access, defaults, palette, view)
- API: `src/app/api/editions/` (checkout, webhook, notify, proposal, access)
- Schema: `src/sanity/schemas/editions/`; Studio structure: `src/sanity/studio.ts`
- Styles: `src/app/styles/editions.css`
- Scripts: `scripts/editions-test.ts`, `scripts/editions-tax-rates.ts`, `scripts/editions-seed.mjs`
