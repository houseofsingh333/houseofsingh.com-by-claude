# Email: Kit and Resend

How email works on houseofsingh.com, what to set up, and how to check it.

## The model

| | Kit (kit.com) | Resend (resend.com) |
|---|---|---|
| What it holds | The list of people, with a tag for what they asked for | Nothing kept; it delivers |
| What it sends | Only the letters Maninder writes: newsletters, Collection releases, early access invitations, sent to a tag | Every automatic email the website triggers, one person at a time |
| Who presses send | Maninder, in Kit | The website |

**Who sends what.** The newsletter welcome comes from Maninder himself, `Maninder Singh <maninder@houseofsingh.com>` (`EMAIL_FROM_LETTERS`), and replies go to maninder@. Every Shop email (Notify me, proposals, orders, certificate, being made, shipped) comes from `"Maninder Singh, House of Singh" <editions@houseofsingh.com>` (`EMAIL_FROM_EDITIONS`; the name is in quotes because of its comma; the sender name approved 14 Nov), and replies go to editions@. Each email's replies go back to its own sender. Letters Maninder sends from Kit use Kit's own sender settings.

**Tags in Kit.** Footer newsletter sign ups carry the tag `Letters`. Shop Notify me sign ups carry the Collection's tag, its title from Sanity, for example `Collection 01`. One person can carry both. A letter goes to a tag: write the newsletter to `Letters`, the release of Collection 01 to `Collection 01`. The website creates a tag the first time it is used.

**Consent (Canada's anti spam law, CASL).** Beneath each field the visitor sees what they are agreeing to, who sends it and that they can leave (`src/lib/email/consent.ts`):

- Footer: "Occasional letters from House of Singh. Unsubscribe anytime."
- Notify me: "Release news and early access only, from House of Singh Editions. Unsubscribe anytime."

The wording was shortened in Shop design round 2 and still names the sender, the purpose and the way out; the Contact and Privacy pages, linked in every footer, are how to reach the sender, and the Privacy page names the mailing address (`EMAIL_POSTAL_ADDRESS`, beside the newsletter and Notify me; set it on Production and Preview, since the page reads it when it is built). Those exact words, the sender in full (Maninder Singh at House of Singh, Toronto; Maninder Singh, House of Singh Editions, Toronto), the form and the moment are kept on the person in Kit, in a custom field (`Consent, letters` or `Consent, Shop`). That is the record of consent. Every email also carries the sender ("Maninder Singh, House of Singh" or "Maninder Singh, House of Singh Editions"), the mailing address (`EMAIL_POSTAL_ADDRESS`) and why it arrived; Kit adds its own unsubscribe link and address to every letter (set the address in Kit's account settings).

**Unsubscribing.** The welcome and the Notify me confirmation carry an "Unsubscribe" link in their footer, and the List-Unsubscribe headers that mail apps show as their own unsubscribe button. The link is signed for the person it was sent to (`EMAIL_LINK_SECRET`, else the Resend key), so it cannot be changed to unsubscribe anyone else. It opens `/unsubscribe`, which asks once (mail scanners open every link, so nothing happens on opening) and, on the button, unsubscribes the person in Kit from every letter and Collection email; any sign up of theirs still waiting for Kit is dropped. A mail app's one click button unsubscribes at once. If Kit cannot be reached, the request waits in the Studio ("Sign ups waiting for Kit", action unsubscribe) and the daily job completes it. Order emails are not newsletters and carry no unsubscribe link. Letters sent from Kit carry Kit's own unsubscribe link.

**Links and images on a preview.** Links in an email sent from a preview (unsubscribe, certificate) point to that preview, so they can be tried before merging. Images and fonts (the crest, the typefaces) always load from houseofsingh.com, previews included, since previews are protected and Gmail cannot fetch from them.

**No copies.** Once Kit has a sign up, the website keeps no copy of the email address. If Kit cannot be reached at that moment (or is not set up yet), the sign up is kept privately in Sanity (Studio: System, "Sign ups waiting for Kit") and the daily job tries Kit again, then deletes it. Nobody is lost.

**Backup.** Kit's own export (Subscribers, Export) is the ongoing backup. There is no export in the Studio.

## The emails the website sends (Resend)

In `src/lib/email/templates.ts`, where every word is kept:

| Email | From | When | Priority |
|---|---|---|---|
| Welcome ("Welcome. The next letter will find you.") | Maninder | Footer sign up | Sign up |
| Notify me ("You are on the list for Collection 01.") | Editions | Shop Notify me | Sign up |
| A message for Maninder (the whole message; replying writes to the sender) | Maninder | Contact form, project interest, For artists proposal | Message, the highest |
| Message received ("Thank you, [name]. Your message is in. I will reply within two working days.") | Maninder | Contact form, project interest | Sign up |
| Proposal received ("Thank you, [name]. Your proposal is in.") | Editions | For artists proposal | Sign up |
| Messages waiting for a reply (the daily list) | Maninder | Every morning, when any message of the last 7 days is not yet Replied (or Reviewed) or Archived | Message |
| Order confirmation | Editions | Payment confirmed (Stripe webhook) | Order |
| Certificate link | Editions | Same, only for a piece set to "Issue a certificate" | Order |
| Being made | Editions | Studio: order, Made | Order |
| Shipped, with tracking | Editions | Studio: order, Shipped | Order |

Only fitting proposals receive a reply. The For artists page, the thank you after sending and the proposal email say so in the same sentence, kept once (`proposalPromise` in `src/lib/editions/defaults.ts`): "Every proposal is read. If your idea fits a coming Collection, I will be in touch to talk it through."

**The daily limit.** Resend's free plan sends 100 emails a day (`RESEND_DAILY_LIMIT`). The website counts each day's emails (UTC, when Resend's allowance resets) privately in Sanity. Over the limit, an email waits privately (Studio: System, "Emails waiting to send") and goes out the next day, just after midnight UTC, messages for Maninder first, then order and shipping emails, then oldest first; none is dropped. Sign up confirmations stop 10 short of the limit (`RESEND_SIGNUP_RESERVE`), so a busy day of sign ups never holds back an order email. An email that fails to send waits the same way.

**The daily job.** Vercel Cron calls `/api/email/daily` at 00:05 UTC (`vercel.json`): it sends what waited, retries sign ups kept for Kit, and sends the daily list of messages waiting for a reply. Vercel sends `CRON_SECRET` with the call; set it (any long random string) in Vercel, Production. Vercel's free plan runs cron jobs once a day, which is what this needs.

## Messages through the forms (never missed)

Every message sent through the contact form, a project's "Interested in this project" form or the For artists form (approved 13 Nov; `src/lib/inbox`):

1. **Saved first,** privately in Sanity (ids under `private.`, never readable from the public dataset). It appears at once in the Studio's **Inbox**, at the top.
2. **Then emailed to Maninder** (`EMAIL_NOTIFY_TO`, by default maninder@houseofsingh.com): the type, name, email, every answer and the message itself, with Reply To set to the sender, so replying in your mail writes straight to them. The subject names the type and the person, for example "Commercial project: Jane Doe".
3. **Then a short confirmation to the sender.** It uses their first name only when it is a plain name, and never repeats their message or any link they typed, so the form cannot be used to send someone else spam. Proposals keep "Thank you, [name]. Your proposal is in." and promise no reply.

**If an email to Maninder fails,** it is tried three times on the spot (at once, then after a pause). If Resend is still refusing, it waits in the queue (Studio: System, "Emails waiting to send") at the highest priority, above the daily limit's reserve, and the site watch tries it again every fifteen minutes (`/api/email/retry`, at most once every ten minutes, whoever calls it). After four failed tries, or two hours waiting, the site watch opens an issue, **"A message from the website has not reached your inbox"**, assigned to you (`docs/monitoring.md`). It names no one; the message itself is in the Studio's Inbox. The issue closes itself once the email goes.

**If Sanity is down,** the email still carries the whole message, and the sender is told it arrived. Only when both Sanity and Resend fail does the sender see "Unable to send that right now", so they can send it again; they never see a success that was not kept. The existing rate limits (5 sends in 10 minutes from one address) and the hidden spam field are unchanged.

**The daily list.** Every morning (with the daily job, 00:05 UTC, which is the evening before in Toronto) you receive one email listing every message from the last 7 days not yet ticked Replied (Reviewed, for proposals) or Archived: name, type and date. No list is sent when nothing is waiting.

**The Studio Inbox.** At the top of the Studio: New, Replied and reviewed, Archived, then each type (Commercial project, Collaboration, Press, Shop artists, Something else), then each form, newest first. Each row shows the name, type, date and state. On a message, **Mark replied** (Mark reviewed on a proposal) and **Archive** save at once, with no Publish; a second click undoes either. **Notes** is yours alone. "Emailed to you" shows whether the notice was sent, queued or failed. The type is set from the form's answers and can be corrected by hand.

## Setting up

### 1. Kit

1. Create the account at kit.com. In Settings, General, set the sender name (House of Singh) and the reply to address, and the mailing address Kit prints on every letter.
2. Settings, Developer: create a **v4 API key**. Add it to Vercel as `KIT_API_KEY` (Production and Preview).
3. Optional, for better delivery: Settings, Email, authenticate a sending domain in Kit (Kit shows its own DNS records, added at GoDaddy the same way as below).
4. Nothing else: the website creates the `Letters` and `Collection 01` tags and the two consent fields on the first sign up.

### 2. Resend and the DNS records at GoDaddy

1. Create the account at resend.com. Domains, Add domain: `houseofsingh.com`. One verified domain covers both senders, maninder@ and editions@; both addresses need a real inbox, since replies go to them.
2. Resend shows the exact records to add. They are of these kinds (the values are your own; copy them from Resend, not from here):

| Type | Name (at GoDaddy) | Value | What it is for |
|---|---|---|---|
| TXT | `resend._domainkey` | `p=MIGf...` (a long key from Resend) | DKIM: proves the email is from you |
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com`, priority 10 | Bounces come back to Resend |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | SPF: allows Resend to send for the domain |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | DMARC (only if you have none yet) |

3. At GoDaddy: My Products, houseofsingh.com, DNS, Add New Record, one per row, with the Name exactly as Resend shows it (GoDaddy adds `.houseofsingh.com` itself). Do not change the existing records for the website or for your inbox.
4. Back in Resend, Verify. It can take from minutes to a few hours.
5. API Keys, Create (sending access, this domain only). Add it to Vercel as `RESEND_API_KEY`.

### 3. Vercel environment variables

| Name | Value | Where |
|---|---|---|
| `KIT_API_KEY` | Kit v4 API key | Production, Preview |
| `RESEND_API_KEY` | Resend API key | Production, Preview |
| `EMAIL_FROM_LETTERS` | `Maninder Singh <maninder@houseofsingh.com>` (the default) | Optional |
| `EMAIL_FROM_EDITIONS` | `"Maninder Singh, House of Singh" <editions@houseofsingh.com>` (the default; keep the quotes if you set it) | Optional |
| `EMAIL_POSTAL_ADDRESS` | The mailing address for the anti spam law, one line | Production, Preview |
| `CRON_SECRET` | A long random string | Production |
| `EMAIL_NOTIFY_TO` | Where messages through the forms and the daily list go; `maninder@houseofsingh.com` is the default | Optional |
| `EMAIL_LINK_SECRET` | A long random string that signs the unsubscribe links; without it the Resend key signs them. Changing it makes older links invalid (the page then points to the contact page) | Optional, Production and Preview |
| `RESEND_DAILY_LIMIT` | `100` (the default); raise it on a paid plan | Optional |
| `RESEND_SIGNUP_RESERVE` | `10` (the default) | Optional |

`EDITIONS_NOTIFY_TO`, `EDITIONS_NOTIFY_FROM`, `EMAIL_FROM` and `EMAIL_REPLY_TO` are no longer read: replies go back to each email's sender, and every message through the forms, proposals included, goes to `EMAIL_NOTIFY_TO`.

## Moving to Kit (once)

The newsletter subscribers and Notify me requests kept privately in Sanity until now move to Kit with `scripts/kit-import.ts`.

1. Dry run (changes nothing): `SANITY_WRITE_TOKEN=... npx tsx scripts/kit-import.ts`
   It writes a CSV backup of every record (email, source, tag, date, consent) to `~/house-of-singh-backups/` on your computer, outside the repository, and prints where. Check it.
2. Import: `SANITY_WRITE_TOKEN=... KIT_API_KEY=... npx tsx scripts/kit-import.ts --apply`
   Each person is added to Kit with their tag, checked in Kit, and only then deleted from Sanity. Anything not confirmed stays; run it again to retry.
3. In Kit, check the counts per tag, then export Kit's list as the new backup. Delete the CSV once you are satisfied (it holds personal data).

## Checking Kit

Kit's documentation could not be read while this was built, so the calls follow Kit's v4 API as known (`src/lib/email/kit.ts`, the only file that speaks to Kit): `X-Kit-Api-Key` header; `POST /v4/subscribers` (create or update, with custom field values), `GET/POST /v4/tags`, `POST /v4/tags/{id}/subscribers` (tag by email address), `GET/POST /v4/custom_fields`, `GET /v4/subscribers?email_address=`. Before relying on it:

1. With `KIT_API_KEY` set on the preview, sign up in the footer with your own address.
2. In Kit, the person should appear with the tag `Letters` and the field `Consent, letters` filled.
3. If not, the sign up waits in the Studio ("Sign ups waiting for Kit") with Kit's error, and nothing is lost: send the error, and only `kit.ts` needs changing.

## Local testing

`KIT_API_BASE`, `RESEND_API_BASE` and `EMAIL_SITE_URL` point the website at local stand ins; they are ignored on the live site.
