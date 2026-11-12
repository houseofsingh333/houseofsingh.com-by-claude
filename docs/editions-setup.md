# House of Singh Editions: setup

How to switch the Shop on, test it, take it live, and run it from one Collection to the next. The concept and the design decisions are in `docs/shop-house-of-singh-editions.md`.

## 1. Environment variables (Vercel, Project Settings, Environment Variables)

| Name | What it is | Where it comes from |
|---|---|---|
| `EDITIONS_MODE` | How much of the Shop a site shows: `off` (nothing: no footer link, every Shop page and API route is a 404), `anticipation` (the live site before launch: /editions shows only the sealed Collection with Notify me, linked from the footer and indexable; pieces, prices, the archive, collaborators, checkout and certificates are 404), `full` (everything). Preview: `full`. Production: `off`, then `anticipation`, then `full` at launch. Unset, the older `EDITIONS_ENABLED=true` still means `full`. | Set by hand |
| `EDITIONS_PREVIEW_SECRET` | A long random string (at least 12 characters). Opening `/editions?preview=THE_SECRET` on the live site shows that browser the full Shop while the site is in anticipation (a cookie, for 30 days); `/editions?preview=off` removes it. Keep it to yourself. | Set by hand, Production |
| `STRIPE_SECRET_KEY` | Stripe's secret key. `sk_test_...` on Preview, `sk_live_...` on Production only at launch. | Stripe Dashboard, Developers, API keys |
| `STRIPE_API_VERSION` | Optional: pins the Stripe API version to the account's, by its exact name in the Stripe Dashboard (Developers, API version). Unset, Stripe uses the account's default. | Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | Proves an event really came from Stripe (`whsec_...`). One per endpoint and per mode. | Stripe Dashboard, Developers, Webhooks, the endpoint, Signing secret |
| `TAX_MODE` | How tax is worked out at checkout. Unset, or `none` (the default, everywhere): no tax. The Shop is sold by Maninder Singh, a sole proprietor and small supplier, so no GST/HST is charged: no postal code, no tax at checkout, in emails or on receipts. Kept for a future registration: `stripe` (Stripe Tax) or `fixed` (the postal code and fixed provincial rates), section 11. | Set by hand |
| `GST_NUMBER` | Not used while no tax is charged: leave it unset. Only after a GST/HST registration, with `TAX_MODE` `stripe` or `fixed`: the number, shown on the checkout page, the order email and the terms of sale. | Your CRA business number with the RT account (for example `123456789 RT0001`) |
| `SANITY_API_TOKEN` | Already set for the contact form. The Shop uses it to save orders, collectors, notify requests and proposals. Needs write access. | Sanity, manage, API, Tokens (Editor) |
| Email | `KIT_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM_LETTERS`, `EMAIL_FROM_EDITIONS`, `EMAIL_POSTAL_ADDRESS`, `CRON_SECRET` and the rest: see `docs/email.md`. | |
| `EDITIONS_CLOCK` | Testing only. An ISO date (for example `2027-04-20T12:00:00Z`) that moves the Shop's clock, to see Open or Closed before the dates arrive. Ignored on the live site. | Set it on Preview only, then remove it |

Never put any of these in the code or in a message. After changing a variable (`EDITIONS_MODE` included), redeploy for it to take effect: pages built ahead of time, the footer among them, read it when they are built.

## 2. Test mode, first

1. In Stripe, stay in **Test mode** (the toggle at the top of the Dashboard).
2. Copy the test secret key into `STRIPE_SECRET_KEY` for **Preview** only.
3. Skip while no tax is charged (`TAX_MODE` unset). Only for `fixed`, after a registration: create the GST/HST rates in test mode, once:
   `STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/editions-tax-rates.ts`
   It creates one rate per province and territory (GST 5% in AB, BC, MB, NT, NU, QC, SK and YT; HST 13% in ON, 14% in NS, 15% in NB, NL and PE), exclusive of the price; checkout applies the buyer's province's rate as a fixed tax rate. Check these against the CRA before launch: a changed rate is fixed in `src/lib/editions/tax.ts` and the script run again (it switches the old rate off).
4. Add the webhook: Stripe, Developers, Webhooks, Add endpoint.
   - URL: `https://<your preview address>/api/editions/webhook` (and later `https://houseofsingh.com/api/editions/webhook`).
   - Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`, `checkout.session.async_payment_failed` and `charge.refunded`. The first two record the order; the next two let go of the stock held for an unpaid checkout; the last restocks a piece refunded in full.
   - Copy its signing secret into `STRIPE_WEBHOOK_SECRET` (Preview).
   - Vercel's preview protection blocks Stripe: in Vercel, Deployment Protection, add a bypass for automation, or test the webhook on a preview without protection.
5. Buy something on the preview with the test card `4242 4242 4242 4242`, any future date, any CVC, a Canadian address. You should land on the thank you page; within a few seconds the collector number appears, the piece's sold count goes up in the Studio (per size for clothing), and an order appears under House of Singh Editions, Orders.

### Payment methods (Stripe Dashboard)

Stripe no longer lets the website choose payment methods on each checkout; they are set in the Dashboard, and must be set the same way **in sandbox and in live** (each has its own settings): Settings, Payments, Payment methods.

- **On:** Cards (Apple Pay and Google Pay come with cards) and Link.
- **Off:** Affirm, Klarna, Afterpay and every other buy now pay later method, and any other method you do not want.

Check both after any change in the Dashboard: a method switched on there appears at checkout at once.

## 3. Going live

Only when the test purchase has worked end to end.

1. In Stripe, switch to **Live mode** and complete the account (business type **Individual / sole proprietor**, Maninder Singh, public business name House of Singh Editions, your bank account, statement descriptor such as `HOS EDITIONS`).
2. No tax rates are needed while no tax is charged (`TAX_MODE` unset). Only after a registration, with `fixed`: run the tax rate script with the live key, `STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/editions-tax-rates.ts`.
3. Add the live webhook endpoint (`https://houseofsingh.com/api/editions/webhook`) with the same five events as in test mode (section 2, step 4) and copy its live signing secret.
4. In Vercel, for **Production** only: `STRIPE_SECRET_KEY` = the live key, `STRIPE_WEBHOOK_SECRET` = the live signing secret. No `TAX_MODE` and no `GST_NUMBER`.
5. Delete the sample content (section 6), remove `EDITIONS_CLOCK` everywhere, and redeploy.
6. Before launch, the live site can sit in anticipation: set `EDITIONS_MODE` to `anticipation` on Production and redeploy. /editions then shows the sealed Collection with Notify me, linked from the footer, and you can see the whole Shop yourself with `/editions?preview=EDITIONS_PREVIEW_SECRET`.
7. Launch: set `EDITIONS_MODE` to `full` on Production and redeploy.

## 4. The shipping table (Canada Post)

In the Studio: House of Singh Editions, Shipping rates. One route for each origin (Canada, India) and zone (Canada, United States, India, Rest of the world); each route has weight bands, "up to" a weight in kilograms, with a price in CAD.

1. Weigh each piece packed, as it will ship, and enter it on the piece (Packed weight).
2. For Canada: use Canada Post's price finder (canadapost-postescanada.ca, Find a rate) from your postal code. For each zone, enter a typical far destination (for example Vancouver, Los Angeles, London) and each band's weight, with the service you will use (Expedited or Tracked Packet for the United States and abroad). Enter the price as the band's price, rounded up to the dollar.
3. For India: use the courier you ship with from India, the same way.
4. India is its own zone: Stripe accepts only an Indian address for it, and "Rest of the world" no longer includes India. Where an origin has no India route yet, an order to India is charged that origin's Rest of the world price.
5. A piece heavier than every band of a route cannot be bought for that zone; the page shows "Not yet" for it, rather than guessing.

Shipping is charged at cost as its own line on the checkout, so that after a GST/HST registration the tax would apply to it for Canadian addresses, as Canadian rules require. No tax is charged today.

## 5. A Collection, from sealed to closed

1. Create the Collection: number, season, colour, intro, closed line, the three dates (Early access opens, Opens to everyone, Closes). The state is computed from these dates and the stock; nothing is switched by hand.
2. **Early access link.** In the Collection, Early access code, press Generate. The Studio shows the code and the link once (`https://houseofsingh.com/editions?access=CODE`) and stores only its fingerprint. Copy the link then and send it to collectors (for example by email to the newsletter list). Anyone with the link sees the Collection from the early access date; everyone else sees it sealed. To revoke it, generate a new code.
3. Add the pieces, each with photographs (the first is the grid image), alt text, statement, price, edition type and quantity, sizes and their stock for clothing, packed weight and where it ships from.
4. Release times show for Toronto and India automatically.
5. When it closes (its closing date, or every piece sold), the Shop shows it as closed with Notify me for the next one, and it moves to the archive.

The notify requests are under House of Singh Editions, Notify requests (email, Collection, date). They are private.

### Shop settings and the Collection (Shop design round 2)

- **Collection:** "Before the release, the line above the title" (for example "Released on the eve of Vaisakhi"; the days left are added), and "In the making: Journal entries" (up to three; the section is hidden when none are chosen).
- **Shop settings, The Shop:** Before you buy (five notes, a title and one line each), Questions (question and answer; an empty answer is a placeholder, shown marked on previews and left out of the live site, so write the returns answer before launch), Release time, cities (a city and its time zone name, for example Europe/London; a mistyped zone is left out).
- **Shop settings, For artists:** the line beneath the heading on the Shop page, and the rolling words after "House of Singh ×" (the last is held longest).
- Every empty field uses the approved wording in `src/lib/editions/defaults.ts`.

## 6. The sample content

A test Collection 01 (Vaisakhi 2027) with eight sample pieces, a sample collaborator, four categories and a sample shipping table, all clearly marked as test data, so the preview shows every state. Its early access opened on 1 November 2026, it opens to everyone at 7 pm in Toronto on 13 April 2027 (4:30 am on 14 April in India), and closes at the end of May 2027. One piece is sold out (Eclipse) and one size is sold out (Mending Tee, size S).

- To create or restore it: `SANITY_WRITE_TOKEN=... node scripts/editions-seed.mjs` (add `EDITIONS_TEST_CODE_HASH=<fingerprint>` to give it an early access code).
- To bring sample content seeded earlier up to date (release at 7 pm in Toronto on 13 April 2027, the new line and sentence, In the making from the three latest Journal entries, India in the shipping table) without replacing it: `SANITY_WRITE_TOKEN=... node scripts/editions-sample-update.mjs` (looks only), then again with `--apply`. It changes only those fields, so an early access code and sold counts stay.
- To delete all of it before launch: `SANITY_WRITE_TOKEN=... node scripts/editions-seed.mjs --delete`. This removes every Shop document marked as test data, the four sample categories and the sample shipping table.

## 7. Private records

Orders, collectors, notify requests and proposals are saved with ids beginning `private.`, which Sanity never serves from the public dataset; only the site's token and the Studio can read them. The contact form submissions and newsletter subscribers now use the same pattern. Older ones written before this change were readable; move them once with:

`SANITY_WRITE_TOKEN=... node scripts/private-records-migrate.mjs` (looks only), then again with `--apply`.

## 8. Checks

- `npx tsx scripts/editions-test.ts`: the Shop's rules (states, stock, refusals, shipping, checkout parameters, signatures, orders, collector numbers, certificates).
- After any schema change: `npx sanity@latest schema deploy`.

## 9. Orders, from paid to shipped

In the Studio: House of Singh Editions, Orders (To make, Being made, Shipped, Refunded, All orders). Open an order:

- **Made**, at the foot of the order, marks it as being made and emails the buyer.
- **Shipped** asks for the tracking number (and, for a carrier other than Canada Post, the tracking address), marks it shipped and emails the buyer with the tracking.

Each click goes through the website, which checks your Studio login first; a second click sends no second email. The Studio keeps its login in the browser for this, so after this change you may be asked to sign in to the Studio once more.

A refund in Stripe (in full) marks the order Refunded, puts the piece (and its size) back in stock and withdraws its certificate. A partial refund changes nothing in the Shop.

## 10. Stock held during checkout

When someone goes to Stripe's checkout, the piece (and size) is held for them for about thirty minutes, shown read only on the piece in the Studio ("Held during checkout"). If they pay, the hold becomes the sale; if they leave, it is released when Stripe reports the checkout expired, and a hold past its time never counts anyway. If the last one is held, the next buyer is told it is in someone's checkout and may come back. Sold counts and holds are written to the published piece: if you are editing a piece while it sells, publish your edit promptly, or it can overwrite the newer counts.

## 11. Tax (`TAX_MODE`)

**Today: no tax (`none`, the default).** Decided with Maninder's CPA: House of Singh Editions is sold by Maninder Singh, a sole proprietor and small supplier, so no GST/HST is charged. The piece page asks for no postal code; the checkout, receipts and emails carry no tax line and no GST/HST number; the terms say "No GST or HST is charged." The small supplier tracker (section 13) watches the limit.

Kept in the code for a future registration, two ways to charge GST/HST (Shop design round 3); everything below applies only then:

- **`fixed`**: the piece page asks for the postal code; its province's fixed rate (created by `scripts/editions-tax-rates.ts`) goes on the piece and on shipping; the webhook marks an order "Check tax" if the shipping address is in another province. No extra fee.
- **`stripe`**: no postal code on the piece page. The Checkout Session has automatic tax turned on, prices exclusive of tax, the piece with Stripe's physical goods tax code (`txcd_99999999`) and shipping with the shipping tax code (`txcd_92010001`). Stripe works the tax out from the shipping address the buyer types at checkout, so there is no province to compare afterwards and no "Check tax". Stripe Tax charges only where you have a registration: with Canada's GST/HST registered, a Canadian address pays GST or HST, an address abroad pays none.

**What to do in Stripe, test mode (sandbox) first.** Every step is per mode: the sandbox and live mode each have their own tax settings.

1. **Turn Stripe Tax on.** Dashboard, Settings, Tax (or More, Tax), and follow "Get started" / activate.
2. **Origin address.** In Tax settings, the business address in Toronto. Stripe uses it as where you sell from.
3. **Defaults.** In Tax settings: default tax behaviour **Exclusive** (prices before tax, as the site shows them), and default product tax code **General, Tangible goods** (`txcd_99999999`). The site sends its own codes on each line, so these are a safety net.
4. **Registrations.** Tax, Registrations, Add registration, **Canada**, the federal **GST/HST** registration, with its start date. This collects GST in the GST provinces and HST in the HST provinces, as today. Do **not** add Quebec (QST) or the provincial PSTs (British Columbia, Saskatchewan, Manitoba) unless the seller is registered there; without them Stripe charges what the fixed rates charge today, GST/HST only. Stripe's monitoring page will show if sales elsewhere approach a threshold where registering becomes due.
5. **Preview.** In Vercel, Preview: set `TAX_MODE` to `stripe`, with the test key. Redeploy.
6. **Test purchase.** Card `4242 4242 4242 4242`. An Ontario address should show HST 13% on the piece and on shipping; an Alberta address GST 5%; a United States address no tax. The order appears in the Studio as usual, without "Check tax".
7. **Live.** Repeat steps 1 to 4 in live mode (origin, defaults, the same GST/HST registration). Then, and only then, set `TAX_MODE` to `stripe` on Production and redeploy.

**The fee.** Stripe Tax is charged per transaction on which it calculates tax: for Checkout, on Stripe's pay as you go pricing, about 0.5% of the transaction. Check the current rate for Canada on Stripe's Tax pricing page before switching live; test mode is free. The fixed rates cost nothing beyond Stripe's card fees.

To change at any time: set `TAX_MODE` (`none`, `fixed` or `stripe`) and redeploy.

## 12. Launching the sealed Shop (anticipation) on the live site

No payments: Production keeps `TAX_MODE` and its Stripe keys as they are, and in anticipation nothing can be bought. In this order:

1. **Schema.** `npx sanity@latest schema deploy` (if not done since the last Shop change).
2. **Remove the sample data.** `SANITY_WRITE_TOKEN=... node scripts/editions-remove-samples.mjs` lists everything it would remove and writes a JSON backup to `~/house-of-singh-backups/` (outside the repository): the test Collection, sample pieces (and their holds), the sample artist, test orders with the collectors and collector counter they made (so the first real collector is No. 0001), notify requests and proposals from testing, and the Shop's email records (emails waiting, sign ups waiting for Kit). Check the list, then run it again with `--apply`: it writes a fresh backup and deletes exactly what that backup holds, and refuses if anything changed in between. It keeps Shop settings, shipping rates, the categories, the daily email counts and every newsletter record. The backup holds email addresses from testing: keep it private and delete it once satisfied.
3. **Create the real Collection 01.** `SANITY_WRITE_TOKEN=... node scripts/editions-collection-01.mjs` shows it, then `--apply` creates `editions-collection-01`: release at 7 pm in Toronto on 13 April 2027, "Released on the eve of Vaisakhi", "Prints, clothing and objects. Released once, never restocked.", open until 30 May 2027, early access from 7 pm on 12 April (with a code generated in the Studio), no pieces, no In the making entries. Run it after step 2, so only one Collection 01 exists.
4. **Vercel, Production:** set `EDITIONS_MODE` to `anticipation`. Make sure `KIT_API_KEY`, `RESEND_API_KEY`, `EMAIL_POSTAL_ADDRESS` and `EMAIL_LINK_SECRET` are set on Production (Notify me, the proposal emails and the unsubscribe links use them).
5. **Redeploy Production** (Deployments, the latest, Redeploy), since pages built ahead of time read `EDITIONS_MODE` when they are built.
6. **Check on the live site:** the footer's Pages list reads Home, About, Projects, Journal, Shop, Contact; /editions shows the sealed Collection; Notify me with your own address (Kit: the tag "Collection 01" and the Shop consent; the confirmation email with its unsubscribe link); /sitemap.xml lists /editions; the share preview (paste https://houseofsingh.com/editions into opengraph.xyz, or LinkedIn's Post Inspector) shows the card, "Collection 01 · House of Singh Editions" and the sentence.

In anticipation: the footer links the Shop (in its Pages list; never the site menu); /editions is indexed and in the sitemap; For artists, the terms of sale and Questions are reachable; pieces, prices, the archive, collaborators, checkout, the thank you page, certificates and early access answer 404 or stay closed; a question with no answer (returns) is left out of the live site.

**The share image** is `public/images/og-editions-collection-01.png` (1200 by 630, the card on the canvas), made from the page itself; a later Collection needs its own image, added to `SHARE_IMAGES` in `src/app/(site)/editions/page.tsx` (without one, the site's own share image is used).

## 13. The small supplier tracker (private)

No GST/HST is charged while Maninder, as a sole proprietor, stays a small supplier: taxable revenue of CA$30,000 or less over four consecutive calendar quarters, and in any single quarter. The tracker watches that, with an early warning.

**Where.** Studio, House of Singh Editions, Small supplier tracker (a private record, `private.editions-small-supplier`, saved as typed with no Publish step).

- **Quarters** (the first tab): the last eight calendar quarters, newest first. For each: the Shop's orders (piece plus shipping, every country, by the day paid in Toronto; refunded orders and test orders left out), the other revenue you entered, the quarter's total, and the four quarters ending with it. Amber past 80 percent of a threshold, red past it.
- **Other revenue** (the second tab): add any other personal taxable revenue by quarter (for example photography or design work invoiced in your own name), written as `2026-Q4`, in Canadian dollars, with a note. Do not add the Shop's orders: they are counted automatically.

**The emails.** The daily job (`/api/email/daily`, just after midnight UTC) adds the same sums and emails the Shop's own address (the address in `EMAIL_FROM_EDITIONS`) when:

- the four quarters ending with the current one pass CA$20,000, and again when they pass CA$25,000 (each once; if the total falls back under, it can email again later);
- any single quarter of the last eight passes CA$20,000 (once per quarter).

The thresholds already emailed are kept on the record ("Thresholds already emailed"). The sums are in `src/lib/editions/smallSupplier.ts`, checked by `scripts/editions-test.ts`. This is a tracker, not tax advice: the thresholds are early warnings set with Maninder's CPA, below the CA$30,000 limit, and the CPA decides when to register.

**After a schema change:** run `npx sanity@latest schema deploy` so the Studio shows the tracker.
