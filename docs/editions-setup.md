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
| `GST_NUMBER` | The GST/HST number of House of Singh Studios Inc. Shown on the Stripe checkout page, the receipt line and the terms of sale. | Your CRA business number with the RT account (for example `123456789 RT0001`) |
| `SANITY_API_TOKEN` | Already set for the contact form. The Shop uses it to save orders, collectors, notify requests and proposals. Needs write access. | Sanity, manage, API, Tokens (Editor) |
| Email | `KIT_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM_LETTERS`, `EMAIL_FROM_EDITIONS`, `EMAIL_POSTAL_ADDRESS`, `CRON_SECRET` and the rest: see `docs/email.md`. | |
| `EDITIONS_CLOCK` | Testing only. An ISO date (for example `2027-04-20T12:00:00Z`) that moves the Shop's clock, to see Open or Closed before the dates arrive. Ignored on the live site. | Set it on Preview only, then remove it |

Never put any of these in the code or in a message. After changing a variable (`EDITIONS_MODE` included), redeploy for it to take effect: pages built ahead of time, the footer among them, read it when they are built.

## 2. Test mode, first

1. In Stripe, stay in **Test mode** (the toggle at the top of the Dashboard).
2. Copy the test secret key into `STRIPE_SECRET_KEY` for **Preview** only.
3. Create the GST/HST rates in test mode, once:
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

1. In Stripe, switch to **Live mode** and complete the account (business details as House of Singh Studios Inc., bank account, statement descriptor such as `HOS EDITIONS`).
2. Run the tax rate script again with the live key: `STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/editions-tax-rates.ts`.
3. Add the live webhook endpoint (`https://houseofsingh.com/api/editions/webhook`) with the same five events as in test mode (section 2, step 4) and copy its live signing secret.
4. In Vercel, for **Production** only: `STRIPE_SECRET_KEY` = the live key, `STRIPE_WEBHOOK_SECRET` = the live signing secret, `GST_NUMBER`.
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

Shipping is charged at cost as its own line on the checkout, so GST/HST applies to it for Canadian addresses, as Canadian rules require.

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
