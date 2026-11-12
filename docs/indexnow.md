# IndexNow: telling search engines about new pages within minutes

IndexNow lets the site tell Bing that a page is new or changed. Bing also feeds DuckDuckGo, Yahoo and Copilot, and Yandex, Seznam and Naver take part directly. The page is then crawled within minutes instead of days. Google does not use IndexNow; Google reads the sitemap.

## How it works

**The key file.** `src/app/indexnow-key.txt/route.ts` serves the key at `https://houseofsingh.com/indexnow-key.txt`. Until a key is set it answers 404.

**The route.** `src/app/api/indexnow/route.ts` has three doors:
- **POST, from the Sanity webhook.** When a document is published, it sends the changed page, and the pages that show it, to IndexNow.
- **POST with `{"all": true}`**, using the same secret header. It sends every address in the sitemap. Use it once after setting up, and after any long gap.
- **GET.** It shows whether IndexNow is set up, with no secrets. Open `https://houseofsingh.com/api/indexnow` in a browser.

**What each publish announces:**

| Published in the Studio | Addresses sent |
|---|---|
| a project | the project, Projects, Home |
| a Journal entry | the entry, the Journal, its month, Home |
| a hero slide | Home |
| the About page | About, Home |
| the Contact page | Contact |
| a Collection, or the Shop's settings | the Shop page (`/editions`), unless the Shop is off |

**Record keeping.** Every answer says what IndexNow replied, and the result is written to Vercel's logs, line `[indexnow]`. That way a submission can be followed end to end.

## Step 1. Create the key and the secret

In a terminal, run:

```
openssl rand -hex 16
```

It prints 32 letters and numbers: the key. It is public by design, since anyone can read it at /indexnow-key.txt. Even so, it lives only in Vercel, not in the repository.

Then make a second, private value for the webhook secret:

```
openssl rand -hex 32
```

## Step 2. Add both to Vercel

1. In Vercel, open the project houseofsingh-com-by-claude, then Settings, Environment Variables.
2. Add these two, for **Production**:

| Name | Value |
|---|---|
| `INDEXNOW_KEY` | the key from step 1 |
| `SANITY_WEBHOOK_SECRET` | the private value from step 1 |

3. **Redeploy production:** Deployments, the latest production deployment, the three dots, Redeploy. A variable only applies to deployments made after it was added.

**Check:**
- `https://houseofsingh.com/indexnow-key.txt` shows the key;
- `https://houseofsingh.com/api/indexnow` shows `"configured": true`.

## Step 3. Create (or correct) the Sanity webhook

In sanity.io/manage, open project 31g7gu7n, then API, Webhooks. Create the webhook, or edit an existing one so it matches:

| Setting | Value |
|---|---|
| Name | IndexNow |
| URL | `https://houseofsingh.com/api/indexnow` |
| Dataset | production |
| Trigger on | Create, Update (not Delete) |
| Filter | `_type in ["journalEntry", "project", "heroSlide", "aboutPage", "contactPage", "editionsCollection", "editionsSettings"]` |
| Projection | `{_type, "slug": slug.current, date}` |
| Status | Enable webhook |
| HTTP method | POST |
| HTTP Headers | name `x-webhook-secret`, value: the private value from step 1 |
| API version | v2021-03-25 (the default) |
| Drafts | off (only published changes) |
| Secret | leave empty (the header above does this job) |

## Step 4. Send the whole site once

Nothing has been sent before, so send every address in the sitemap once. In a terminal, replace `THE-SECRET` with the private value:

```
curl -X POST https://houseofsingh.com/api/indexnow \
  -H "x-webhook-secret: THE-SECRET" \
  -H "Content-Type: application/json" \
  -d '{"all": true}'
```

**What the answer means:**
- `"ok": true, "status": 200`: IndexNow accepted the addresses.
- `202`: IndexNow received them and is checking the key file. This is also fine.
- `"count"`: how many addresses were sent.

## Step 5. Check that it reached Bing

1. In Bing Webmaster Tools, open the site, then **IndexNow**.
2. The submitted addresses appear there. This can take from a few minutes to a few hours after the first submission.
3. After that, publish a small edit to any Journal entry and look again. In Sanity, the webhook's Attempts log should show status 200 for that publish.

**What the route's answers mean:**

| Status | Meaning | Fix |
|---|---|---|
| 200 | sent, and IndexNow accepted it | none needed |
| 503 | not set up | see GET /api/indexnow for which variable is missing |
| 401 | the header value does not match `SANITY_WEBHOOK_SECRET` | correct the header |
| 400 | the published document is not on a public page | none needed: nothing is sent, as intended |
| 502 | IndexNow refused or did not answer | the answer says why; 403 means the key file does not match the key |

## Checking the code

`npx tsx scripts/indexnow-test.ts` checks, without the network:
- which addresses each document announces;
- the key rule;
- what is sent to IndexNow, and how each of its answers is read.
