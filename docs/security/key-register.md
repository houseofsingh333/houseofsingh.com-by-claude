# Key register

Every key, token and secret the site and its tooling use: what it is for, where it lives, what it can do, who can read it, how to change it, and when. **Never the values.** The repository is public; values live only in Vercel, GitHub's secrets, Sanity, the services' dashboards and Maninder's password manager.

Written 13 Nov 2026 from the code, the workflows and the setup docs. Where a setting can only be seen in a dashboard (Vercel, Stripe, Kit, Resend), it is marked **check**: confirm it there once.

## Who can read what

- **Vercel environment variables** (project houseofsingh-com-by-claude): anyone with access to the Vercel team can read a variable's value unless it is marked **Sensitive**, which hides it after it is saved (it still works at runtime). Today: Maninder.
- **GitHub repository secrets**: nobody can read them back, not even the owner; only workflows receive them. A workflow from a fork never receives them.
- **Sanity API tokens**: shown once when made, then never again; anyone who is an Administrator of project 31g7gu7n can delete or replace them.
- **Service dashboards** (Stripe, Kit, Resend): whoever holds the login. Turn on two step sign in on every one (check).
- **Maninder's computer**: tokens used once for a script (below) should be made for the job and deleted after.

## The register

### The website (Vercel, Production and Preview)

| Key | For | Permission | How to rotate |
|---|---|---|---|
| `SANITY_API_TOKEN` | The website's writes: contact messages, newsletter sign ups, the Shop's orders, collectors, holds, notify requests, proposals, the email queue, the small supplier tracker. | Sanity **Editor** (read and write). The narrowest Sanity role that can write; a write only role needs Sanity's enterprise plan. | sanity.io/manage, project 31g7gu7n, API, Tokens: add a new Editor token "Website", paste it into Vercel (Production and Preview), redeploy, check the contact form, then delete the old token. |
| `SANITY_WEBHOOK_SECRET` | Proves a call to /api/indexnow came from the Sanity webhook (`docs/indexnow.md`). | Only that check. | Make a new value (`openssl rand -hex 32`), set it in Vercel and in the Sanity webhook's `x-webhook-secret` header together, redeploy. |
| `INDEXNOW_KEY` | Tells search engines the site's pages changed. | None: public by design (served at /indexnow-key.txt). | Not needed. If changed, IndexNow checks the new file. |
| `STRIPE_SECRET_KEY` | Creates the checkout and reads it back on the thank you page; reads tax rates (fixed tax only). Test key on Preview, live key on Production at launch. | Today a full secret key (`sk_`), **broader than needed**: see the review below. | Stripe, Developers, API keys: create the new key, set it in Vercel, redeploy, test a checkout (test mode), then roll or delete the old key. |
| `STRIPE_WEBHOOK_SECRET` | Proves a Stripe event (paid, expired, refunded) came from Stripe. One per endpoint and mode. | Only that check. | Stripe, Developers, Webhooks, the endpoint, Roll secret (Stripe keeps the old one working for up to 24 hours), set it in Vercel, redeploy. |
| `KIT_API_KEY` | Newsletter and Notify me sign ups, tags, consent fields, unsubscribes. | Kit's v4 keys are account wide (no narrower kind exists). | Kit, Settings, Developer, API keys: create a new key, set it in Vercel, redeploy, test a footer sign up, then delete the old key. |
| `RESEND_API_KEY` | The website's own emails (welcome, Notify me, orders, certificates, made, shipped, small supplier alerts). Also signs unsubscribe links if `EMAIL_LINK_SECRET` is missing. | **check**: should be **Sending access, domain houseofsingh.com only** (see the review). | Resend, API Keys: create a Sending access key for houseofsingh.com, set it in Vercel, redeploy, send a test (Notify me on the preview), then delete the old key. |
| `CRON_SECRET` | Only Vercel's daily job may call /api/email/daily. | Only that check. | New value (`openssl rand -hex 32`) in Vercel (Production), redeploy. Vercel sends it to the job by itself. |
| `EMAIL_LINK_SECRET` | Signs each unsubscribe link for the person it was sent to. | Only that check. | Change only if exposed: links already sent stop working (the page then points to Contact). New value in Vercel (Production and Preview), redeploy. |
| `EDITIONS_PREVIEW_SECRET` | `/editions?preview=…` shows one browser the full Shop before launch. | Shows the Shop only (nothing can be bought in anticipation). | New value (at least 12 characters) in Vercel (Production), redeploy; old preview cookies stop working. |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Lets the CI checks past Vercel's login on previews. Also a GitHub secret (below). | Reads previews only. | Vercel, Settings, Deployment Protection, Protection Bypass for Automation: regenerate, then update the GitHub secret of the same name. |

Not secrets, and fine in Vercel as plain values: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `EDITIONS_MODE`, `TAX_MODE`, `EMAIL_FROM_LETTERS`, `EMAIL_FROM_EDITIONS`, `EMAIL_POSTAL_ADDRESS`, `RESEND_DAILY_LIMIT`, `RESEND_SIGNUP_RESERVE`, `STRIPE_API_VERSION`, `EDITIONS_CLOCK` (Preview only, for testing), `GST_NUMBER` (unused while no tax is charged).

### GitHub (repository secrets, used by workflows)

| Key | For | Permission | How to rotate |
|---|---|---|---|
| `SANITY_BACKUP_TOKEN` | The weekly backup reads the whole dataset (`docs/backup-and-restore.md`). | Sanity **Viewer** (read only): already the lowest. | Sanity: add a new Viewer token "GitHub backup", replace the GitHub secret, run the backup workflow once by hand, delete the old token. |
| `BACKUP_PASSPHRASE` | Encrypts each backup before it is stored. | Opens every backup made with it. | Change only if exposed: backups made before still need the old passphrase, so keep the old one in the password manager, labelled with its dates. New value (`openssl rand -base64 32`) in the password manager first, then the GitHub secret. |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | As above, for the preview checks. | Reads previews only. | With the Vercel one, together. |
| `GITHUB_TOKEN` (automatic) | Each workflow's own access to this repository. | Set per workflow (`permissions:`), the least each needs; expires when the run ends. | Automatic. |

### Maninder's computer (only while a script runs)

| Key | For | Permission | How to handle it |
|---|---|---|---|
| `SANITY_WRITE_TOKEN` | The content import, the Shop's setup and clean up scripts (`docs/content-import.md`, `docs/editions-setup.md`). | Sanity **Editor**. | Make it for the job, use it in the terminal command only (never saved in a file), delete it in Sanity when done. |
| `STRIPE_SECRET_KEY` (local) | `scripts/editions-tax-rates.ts`, only with fixed tax after a registration. | Full secret key. | Use, then roll. Not needed while no tax is charged. |
| `EDITIONS_TEST_CODE_HASH` | The sample Collection's early access test code (`scripts/editions-seed.mjs`). | A hash, not the code; test data only. | No rotation. |

Sign in accounts (not keys, but the same care): Vercel, GitHub, Sanity, Stripe, Kit, Resend and the domain registrar, each with two step sign in (check).

## Least privilege review

1. **Stripe (broader than needed).** The website uses only Checkout Sessions (create, read) and Tax Rates (read, fixed tax only). Replace `STRIPE_SECRET_KEY` in Vercel with a **restricted key** (`rk_…`): Stripe, Developers, API keys, Create restricted key, name "Website", **Checkout Sessions: Write**, **Tax Rates: Read**, everything else None. Do it in test mode for Preview now, and in live mode at launch. A test checkout on the preview confirms it.
2. **Resend (check).** Use a **Sending access** key limited to the domain houseofsingh.com, not Full access. Full access could also read sent emails and change domains.
3. **Sanity website token (as narrow as it can be).** Editor is the lowest role that can write. The site never deletes public content, but an Editor token could; keep it only in Vercel, Sensitive.
4. **Sanity backup token (already right).** Viewer.
5. **Kit (no narrower option).** Kit's API keys cannot be scoped; keep it Sensitive and rotate yearly.
6. **GitHub workflows (already right).** Each sets its own `permissions:`; only three write: the screenshot approval (its own commit), the site watch and the rotation reminders (issues).
7. **Scripts' tokens (habit).** Make, use and delete; never in a file in the repository (the .gitignore also stops env files, backups and exports).

### Vercel variables to mark Sensitive

Mark each of these **Sensitive** in Vercel (Settings, Environment Variables, the variable, Edit, Sensitive; for an existing one, re-add it as Sensitive with the same value, then redeploy): `SANITY_API_TOKEN`, `SANITY_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `KIT_API_KEY`, `RESEND_API_KEY`, `CRON_SECRET`, `EMAIL_LINK_SECRET`, `EDITIONS_PREVIEW_SECRET`, `VERCEL_AUTOMATION_BYPASS_SECRET` (if it is also a variable). Sensitive values cannot be read back, so have each in the password manager first.

## Leak checks (13 Nov 2026)

- **The repository's full history** (all 451 commits, every branch) was scanned for Stripe keys and webhook secrets, Sanity tokens, Resend and Kit keys, GitHub tokens, cloud keys, private keys, signed tokens, and any value assigned to a name like TOKEN, SECRET, PASSWORD or KEY. **Nothing found.** The only env file ever committed is `.env.example`, with placeholder values. Test values (`whsec_test_local`, `local-test-only-link-secret`) are made up for local tests and open nothing.
- **.gitignore** covers every env file (`.env*`, except the example), Vercel's folder, and now also backup archives and encrypted files (`*.tar.gz`, `*.tar.gz.enc`, `*.enc`), dataset exports (`*.ndjson`, `*-export/`, `*-export.json`, `*-backup*.json`), the backup folders (`/backups/`, `/house-of-singh-backups/`) and personal Claude Code settings.
- History was not rewritten (nothing needed it).

## Rotation schedule

The rotation reminder workflow (`.github/workflows/key-rotation.yml`) reads this table every Monday and opens an issue, assigned to Maninder, for each key whose date has come, once. After rotating a key, change its date here (the next one) in a small pull request, and close the issue.

Keys marked "if exposed" have no date: changing them has a cost (old links or old backups stop working), so they change only if they may have leaked.

| Key | Rotate by |
|---|---|
| `STRIPE_SECRET_KEY` (and switch to the restricted key) | 2026-12-15 |
| `SANITY_API_TOKEN` | 2027-05-13 |
| `STRIPE_WEBHOOK_SECRET` | 2027-05-13 |
| `RESEND_API_KEY` | 2027-05-13 |
| `KIT_API_KEY` | 2027-11-13 |
| `SANITY_WEBHOOK_SECRET` | 2027-11-13 |
| `CRON_SECRET` | 2027-11-13 |
| `EDITIONS_PREVIEW_SECRET` | 2027-11-13 |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | 2027-11-13 |
| `SANITY_BACKUP_TOKEN` | 2027-11-13 |
| `EMAIL_LINK_SECRET` | if exposed |
| `BACKUP_PASSPHRASE` | if exposed |
