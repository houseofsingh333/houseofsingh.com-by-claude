# IndexNow: telling search engines about new pages within minutes

IndexNow lets the site tell Bing (which also feeds DuckDuckGo, Yahoo and
Copilot), Yandex, Seznam and Naver that a journal entry or a project is new
or changed, so it is crawled within minutes instead of days. Google does
not use IndexNow; Google reads the sitemap.

The code is already in place and does nothing until the steps below are
done:

- `src/app/indexnow-key.txt/route.ts` serves the key at
  `https://houseofsingh.com/indexnow-key.txt` (404 until a key is set).
- `src/app/api/indexnow/route.ts` receives the Sanity webhook and sends the
  changed page, the page that lists it (Projects, or the Journal and its
  month) and the home page to IndexNow.

## Step 1. Create the key

In a terminal, run:

```
openssl rand -hex 16
```

It prints 32 letters and numbers. That is the key. It is public by design
(anyone can read it at /indexnow-key.txt), so it is not a secret, but keep
it out of the repo anyway: it lives only in Vercel.

Also make a second, private value for the webhook secret, the same way:

```
openssl rand -hex 32
```

## Step 2. Add both environment variables in Vercel

Vercel, project houseofsingh-com-by-claude, Settings, Environment Variables.
Add two variables, for Production only:

| Name | Value |
|---|---|
| `INDEXNOW_KEY` | the key from step 1 |
| `SANITY_WEBHOOK_SECRET` | the private value from step 1 |

Then redeploy production (Deployments, the latest production deployment,
the three dots, Redeploy), because a variable only applies to deployments
made after it was added. Check that `https://houseofsingh.com/indexnow-key.txt`
now shows the key.

## Step 3. Create the Sanity webhook

sanity.io/manage, project 31g7gu7n, API, Webhooks, Create webhook:

| Setting | Value |
|---|---|
| Name | IndexNow |
| URL | `https://houseofsingh.com/api/indexnow` |
| Dataset | production |
| Trigger on | Create, Update (not Delete) |
| Filter | `_type in ["journalEntry", "project"]` |
| Projection | `{_type, "slug": slug.current, date}` |
| Status | Enable webhook |
| HTTP method | POST |
| HTTP Headers | name `x-webhook-secret`, value: the private value from step 1 |
| API version | v2021-03-25 (the default) |
| Drafts | off (only published changes) |
| Secret | leave empty (the header above does this job) |

Save. To check it works, publish a small edit to any journal entry, then
open the webhook's "Attempts log" in Sanity: the latest attempt should
show status 200.

What the answers mean: 200 sent and accepted; 503 the Vercel variables are
not set yet (nothing was sent); 401 the header value does not match
`SANITY_WEBHOOK_SECRET`; 502 IndexNow did not accept it (usually the key
file is not reachable yet).
