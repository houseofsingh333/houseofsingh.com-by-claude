# House of Singh Editions: setup

How to switch the Shop on, test it, take it live, and run it from one Collection to the next. The concept and the design decisions are in `docs/shop-house-of-singh-editions.md`.

## 1. Environment variables (Vercel, Project Settings, Environment Variables)

| Name | What it is | Where it comes from |
|---|---|---|
| `EDITIONS_ENABLED` | Switches the Shop on: `true`. Set on **Preview only** until launch. Anywhere else the footer has no Shop link, every `/editions` page is a 404 and the Shop's API routes answer 404. | Set by hand; at launch, add it to Production too |
| `STRIPE_SECRET_KEY` | Stripe's secret key. `sk_test_...` on Preview, `sk_live_...` on Production only at launch. | Stripe Dashboard, Developers, API keys |
| `STRIPE_WEBHOOK_SECRET` | Proves an event really came from Stripe (`whsec_...`). One per endpoint and per mode. | Stripe Dashboard, Developers, Webhooks, the endpoint, Signing secret |
| `GST_NUMBER` | The GST/HST number of House of Singh Studios Inc. Shown on the Stripe checkout page, the receipt line and the terms of sale. | Your CRA business number with the RT account (for example `123456789 RT0001`) |
| `SANITY_API_TOKEN` | Already set for the contact form. The Shop uses it to save orders, collectors, notify requests and proposals. Needs write access. | Sanity, manage, API, Tokens (Editor) |
| `RESEND_API_KEY` | Optional. Sends you an email for each collaboration proposal. Without it, proposals are still saved in the Studio. | resend.com, API Keys |
| `EDITIONS_NOTIFY_TO` | Optional. The address those emails go to. | Your email |
| `EDITIONS_NOTIFY_FROM` | Optional. The sender, on a domain verified in Resend (for example `Shop <shop@houseofsingh.com>`). | Resend, Domains |
| `EDITIONS_CLOCK` | Testing only. An ISO date (for example `2027-04-20T12:00:00Z`) that moves the Shop's clock, to see Open or Closed before the dates arrive. Ignored on the live site. | Set it on Preview only, then remove it |

Never put any of these in the code or in a message. After changing a variable, redeploy the preview for it to take effect.

## 2. Test mode, first

1. In Stripe, stay in **Test mode** (the toggle at the top of the Dashboard).
2. Copy the test secret key into `STRIPE_SECRET_KEY` for **Preview** only.
3. Create the GST/HST rates in test mode, once:
   `STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/editions-tax-rates.ts`
   It creates one rate per province and territory (GST 5% in AB, BC, MB, NT, NU, QC, SK and YT; HST 13% in ON, 14% in NS, 15% in NB, NL and PE), exclusive of the price. Check these against the CRA before launch: a changed rate is fixed in `src/lib/editions/tax.ts` and the script run again (it switches the old rate off).
4. Add the webhook: Stripe, Developers, Webhooks, Add endpoint.
   - URL: `https://<your preview address>/api/editions/webhook` (and later `https://houseofsingh.com/api/editions/webhook`).
   - Events: `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
   - Copy its signing secret into `STRIPE_WEBHOOK_SECRET` (Preview).
   - Vercel's preview protection blocks Stripe: in Vercel, Deployment Protection, add a bypass for automation, or test the webhook on a preview without protection.
5. Buy something on the preview with the test card `4242 4242 4242 4242`, any future date, any CVC, a Canadian address. You should land on the thank you page; within a few seconds the collector number appears, the piece's sold count goes up in the Studio (per size for clothing), and an order appears under House of Singh Editions, Orders.

## 3. Going live

Only when the test purchase has worked end to end.

1. In Stripe, switch to **Live mode** and complete the account (business details as House of Singh Studios Inc., bank account, statement descriptor such as `HOS EDITIONS`).
2. Run the tax rate script again with the live key: `STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/editions-tax-rates.ts`.
3. Add the live webhook endpoint (`https://houseofsingh.com/api/editions/webhook`, same two events) and copy its live signing secret.
4. In Vercel, for **Production** only: `STRIPE_SECRET_KEY` = the live key, `STRIPE_WEBHOOK_SECRET` = the live signing secret, `GST_NUMBER`.
5. Delete the sample content (section 6), remove `EDITIONS_CLOCK` everywhere, and redeploy.
6. Launch is a separate decision: set `EDITIONS_ENABLED` to `true` on Production and redeploy. The Shop stays noindex and linked only from the footer until the launch change removes that.

## 4. The shipping table (Canada Post)

In the Studio: House of Singh Editions, Shipping rates. One route for each origin (Canada, India) and zone (Canada, United States, Rest of the world); each route has weight bands, "up to" a weight in kilograms, with a price in CAD.

1. Weigh each piece packed, as it will ship, and enter it on the piece (Packed weight).
2. For Canada: use Canada Post's price finder (canadapost-postescanada.ca, Find a rate) from your postal code. For each zone, enter a typical far destination (for example Vancouver, Los Angeles, London) and each band's weight, with the service you will use (Expedited or Tracked Packet for the United States and abroad). Enter the price as the band's price, rounded up to the dollar.
3. For India: use the courier you ship with from India, the same way.
4. A piece heavier than every band of a route cannot be bought for that zone; the page shows "Not yet" for it, rather than guessing.

Shipping is charged at cost as its own line on the checkout, so GST/HST applies to it for Canadian addresses, as Canadian rules require.

## 5. A Collection, from sealed to closed

1. Create the Collection: number, season, colour, intro, closed line, the three dates (Early access opens, Opens to everyone, Closes). The state is computed from these dates and the stock; nothing is switched by hand.
2. **Early access link.** In the Collection, Early access code, press Generate. The Studio shows the code and the link once (`https://houseofsingh.com/editions?access=CODE`) and stores only its fingerprint. Copy the link then and send it to collectors (for example by email to the newsletter list). Anyone with the link sees the Collection from the early access date; everyone else sees it sealed. To revoke it, generate a new code.
3. Add the pieces, each with photographs (the first is the grid image), alt text, statement, price, edition type and quantity, sizes and their stock for clothing, packed weight and where it ships from.
4. Release times show for Toronto and India automatically.
5. When it closes (its closing date, or every piece sold), the Shop shows it as closed with Notify me for the next one, and it moves to the archive.

The notify requests are under House of Singh Editions, Notify requests (email, Collection, date). They are private.

## 6. The sample content

A test Collection 01 (Vaisakhi 2027) with eight sample pieces, a sample collaborator, four categories and a sample shipping table, all clearly marked as test data, so the preview shows every state. Its early access opened on 1 November 2026, it opens to everyone at 9 pm in Toronto on 12 April 2027, and closes at the end of May 2027. One piece is sold out (Eclipse) and one size is sold out (Mending Tee, size S).

- To create or restore it: `SANITY_WRITE_TOKEN=... node scripts/editions-seed.mjs` (add `EDITIONS_TEST_CODE_HASH=<fingerprint>` to give it an early access code).
- To delete all of it before launch: `SANITY_WRITE_TOKEN=... node scripts/editions-seed.mjs --delete`. This removes every Shop document marked as test data, the four sample categories and the sample shipping table.

## 7. Private records

Orders, collectors, notify requests and proposals are saved with ids beginning `private.`, which Sanity never serves from the public dataset; only the site's token and the Studio can read them. The contact form submissions and newsletter subscribers now use the same pattern. Older ones written before this change were readable; move them once with:

`SANITY_WRITE_TOKEN=... node scripts/private-records-migrate.mjs` (looks only), then again with `--apply`.

## 8. Checks

- `npx tsx scripts/editions-test.ts`: the Shop's rules (states, stock, refusals, shipping, checkout parameters, signatures, orders, collector numbers, certificates).
- After any schema change: `npx sanity@latest schema deploy`.
