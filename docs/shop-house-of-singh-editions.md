# House of Singh Editions: the Shop

The approved concept, states, design decisions, schema and checkout of the Shop, from the canvas "Homepage Journal: three options" (page "Shop, the flow", frames 1 to 6: SF-ShopFinal, Y4b-PieceLuxe, FL3-Closed, FL4-Second, FL5-Shelf, FL6-Artists; and page "Shop, decisions", the chosen R1-A, R2-A, R3-A and R4-B). This is on CLAUDE.md's protected list: change it only with Maninder's explicit approval. Setup and operations are in `docs/editions-setup.md`.

## The concept

House of Singh Editions is a small shop inside the portfolio, not a store beside it. Work is released in **Collections**, twice a year, each named for its season ("Collection 01, Vaisakhi 2027"): a handful of pieces (prints, clothing, objects, originals), some made by hand, some with makers and artists House of Singh trusts. Each Collection is released once and never restocked. Between Collections the Shop rests.

The tone is the site's: calm, honest, unhurried. The Shop says plainly what it is and is not before anyone buys ("This is not fast. This is not cheap. This will not return."), shows prices before tax, charges shipping at cost, and names the seller.

The seller is **House of Singh Studios Inc., operating House of Singh Editions**, registered for GST/HST. The brand shown is House of Singh Editions.

## Visibility: three modes

`EDITIONS_MODE` (`src/lib/editions/enabled.ts`):

| Mode | Where | What shows |
|---|---|---|
| `off` | Production until anticipation | No footer link; every `/editions` page and Shop API route is a 404 |
| `anticipation` | The live site before launch | `/editions` only: the sealed Collection (square, label, title, sentence and release times), Notify me working, the honest line; no menu, nothing about pieces. Linked from the footer and indexable. For artists and the terms of sale stay reachable; pieces, prices, the archive, collaborators, checkout, thank you and certificates are 404 |
| `full` | Vercel Preview; Production at launch | Everything |

`/editions?preview=EDITIONS_PREVIEW_SECRET` sets a cookie (a fingerprint of the secret) that shows that browser the full Shop while the live site is in anticipation; `?preview=off` removes it. Unset, `EDITIONS_ENABLED=true` still means `full`. It is linked only from the footer ("Shop"), not the menu or the homepage. Every `/editions` page except the anticipation view is noindex and nofollow, and none is in the sitemap, llms.txt or the structured data.

## The pages

| Address | What it is | Frame |
|---|---|---|
| `/editions` | The Shop: the current Collection's opening view, the Collection, Before you buy, For artists, the archive line | SF-ShopFinal, FL3, FL4 |
| `/editions/[piece]` | A piece | Y4b-PieceLuxe |
| `/editions/archive` | Closed Collections as spines on a shelf, and what each held | FL5-Shelf |
| `/editions/artists` | For artists, with the proposal form | FL6-Artists |
| `/editions/collaborators/[slug]` | An artist's own page | |
| `/editions/thank-you` | After paying | |
| `/editions/verify/[code]` | A certificate | |
| `/editions/terms` | Terms of sale | |

The Shop has its own quiet header beneath the site's (Shop, House of Singh Editions; The Collection, Before you buy, For artists, Archive) and its own footer line (Sold by House of Singh Studios Inc., operating House of Singh Editions; Terms of sale). The site header, menu and footer are unchanged.

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

- **The opening view.** The Collection's coloured square (its season large in Playfair, "No. 01" with the Gurmukhi numeral, the number of pieces, "Released once", the seal), tilting gently toward a fine pointer; the seal breathes like the brass dot (2.8s). Beside it one label, "Collection 01" at display-xl, one sentence, and at the foot one honest line with Before you buy. "The Collection" over a thin vertical brass line at the bottom centre. Reduced motion: no tilt, no breathing.
- **Two across.** The Collection is two across, full bleed 4:5 photographs, wide margins, about 120px between columns and 180px between rows (R1-A). Caption: name and price on one line, the category's descriptor beneath. Filters are the Collection's categories, on the right; the heading counts what is shown ("Eight pieces", "Prints, three pieces"). Phones: one column, the filters a sideways row.
- **Buy.** On pointing, the photograph settles with a slow zoom and "Buy" (or "Choose a size") fades in beneath (R4-B); on touch it is always there. On the piece page, Buy is the outlined button across the panel, "Choose a size" until a size is chosen, then "Buy, size M".
- **Availability inside the piece only.** The grid never shows counts. The piece page has one quiet line: "Limited run of 40, 27 available, Secure checkout by Stripe", with "Plus applicable tax for Canadian orders." beneath.
- **Prices say CAD.** Every price reads "$180 CAD". With Ships to Canada, a postal code field gives the estimated GST/HST and total before Buy (the province from the code's first letter); Stripe charges the exact amount from the address.
- **Choose a size** in the grid opens the piece page; Buy goes straight to the Buy form.
- **Early access fallback.** Once early access has opened, a sealed Shop shows "Have an early access code?": the code typed in does what the link does, and a wrong code says so.
- **Closed, truthfully.** "Every piece has found its home" (the Collection's closed line) only when every piece sold, and the seal reads "Sold out"; a Collection that closes by date with pieces left uses its "pieces left" line (else "Collection 01 has closed.") and its seal reads "Closed".
- **Sold out.** The price reads "Sold out", the photograph softens, and the action becomes "Notify me of Collection 02". A sold out size is struck through and cannot be chosen.
- **No dots.** No dots anywhere in the Shop: no status dots, no radio dots, no bullet markers. Choices are quiet outlined boxes.
- **Serif for names and numbers.** Playfair for the Collection title, the season, piece names on their page, numerals and the collector number; Instrument Sans for every sentence. (The grid's captions follow the chosen frame: name and price in sans, one line.)
- **Brass is never small text.** The frames' small brass labels are muted grey; brass stays for the seal, hairlines and the cue line. The seal's words are charcoal on brass (5.0:1).
- **The Shop palette.** Each Collection has one of six colours for its square and spine (BRAND_BOOK.md, "The Shop palette"), used nowhere else.
- **A piece.** The photographs stacked on the left (the first large); on the right, sticky: category and Collection, name, price, statement, the maker line with collaborators linked, sizes, Ships to (Canada, United States, Elsewhere, each with its shipping price), Buy, the quiet line, and folding sections (The story, Details, Size and fit, Shipping and returns, Care), then "A question about this piece? Write to Maninder". Phones: photographs first, then the details, with a bar fixed at the foot showing the price and Buy, which steps aside when the Buy form is on screen.
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
- **Shop settings** (`editionsSettings`, one document): the honest line, the seven Before you buy notes, the returns line, the artists heading, invitation and steps, which Collection proposals are for and until when, the terms of sale. Empty fields use the approved wording in `src/lib/editions/defaults.ts`.
- **Private records**, read only in the Studio, ids beginning `private.` (never publicly readable): orders (`editionsOrder`, with their status: paid, being made, shipped with tracking, refunded), collectors (`editionsCollector`: an email to a lifelong collector number, assigned in order), collaboration proposals (`editionsProposal`), notify requests (`editionsNotify`, only the older ones until they move to Kit), sign ups waiting for Kit (`signupPending`), emails waiting to send (`emailQueued`) and each day's email count (`emailDay`).

## Checkout

Stripe Checkout, server side only: no Stripe script on the site and no change to the security policy.

1. Buy posts to `/api/editions/checkout` (slug, size, zone); the route is rate limited. The page sends it in the background and, when the Checkout is ready, moves to Stripe itself. It cannot simply be redirected: the site's security policy lets a form post only to the site (`form-action 'self'`), and browsers apply that to a redirect after the post, so a redirect to Stripe is refused (found and fixed in testing). Without JavaScript the form still posts, and the answer is a short page that moves on to Stripe by itself. The security policy is unchanged.
2. It reads the piece and its Collection fresh from Sanity and checks: the Collection is open, or in early access with a valid cookie; the piece is in stock; a size is chosen and in stock; the piece can ship to that zone. A refusal is written beside Buy ("This size is sold out."), without leaving the page.
3. **Stock is held.** It holds the unit (and size) on the piece for about thirty minutes, with the piece's revision, so two buyers cannot take the last one (`src/lib/editions/holds.ts`). If the last ones are only held, the buyer is told so: they may come back.
4. It prices shipping from the rate table (origin, zone, packed weight) and creates a Checkout Session in CAD: the piece (quantity 1) and shipping as a second line, so GST/HST applies to both; the shipping address limited to the zone's countries; the size, piece, hold and prices in metadata; the seller and GST/HST number on the checkout page; payment by card (with Apple Pay and Google Pay) or Link only, set on each session so no buy now pay later method appears in sandbox or live; a 30 minute expiry. Then the page moves to Stripe.
5. **Tax.** GST/HST for Canadian orders at the rate of the province or territory, as fixed Stripe tax rates (Stripe retired dynamic tax rates): with Ships to Canada, the piece page asks for the postal code, its first letter gives the province, and that province's rate (created by `scripts/editions-tax-rates.ts`) is applied to the piece and to shipping. The page shows the same amount before Buy, each line rounded to the cent as Stripe rounds it. The webhook compares the province with the shipping address given at Stripe; if they differ the order is marked "Check tax" in the Studio and editions@ gets an email. Orders shipped outside Canada carry no Canadian tax. Prices on the site are before tax.
6. **The webhook** (`/api/editions/webhook`, signature verified) on a paid session records the order privately, adds one to the sold count (and the size's) as its hold is released in the same transaction, assigns or reuses the buyer's collector number, gives numbered editions and one of one pieces their edition number, gives a certificate code only to a piece set to "Issue a certificate" (off by default), and sends the order confirmation and certificate emails. An expired or failed checkout releases its hold; a refund in full marks the order refunded, restocks the piece and size once and withdraws the certificate. A repeated event changes nothing.
7. **Thank you** (`/editions/thank-you`): "Thank you. [Piece] is yours.", the summary (piece, size, ships to, price, shipping, tax, total), what happens next, the collector number and, for a piece that issues one, the certificate. Cancelling at Stripe returns to the piece.
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
