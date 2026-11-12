# The checks: how the site is tested

Every pull request into `main` runs these checks automatically. The check called **ci** turns green only when all of them pass, and only then is a pull request ready to merge. You can also run them yourself on your Mac.

## What is checked

| Check | What it proves | File |
|---|---|---|
| Journeys | Each page opens with its heading and no errors. The menu opens, holds focus, closes with Escape. Every form state, from the contact form to Notify me and unsubscribe. The sealed Shop shows no prices and no Buy. | `e2e/journeys.spec.ts` |
| Page changes | A new page opens at its top, from any depth. Back and Forward return to where you were. A page change never shows two pages at once. | `e2e/navigation.spec.ts` |
| Screenshots | Every page type, on a phone (390) and a desktop (1440), looks as approved. | `e2e/visual.spec.ts` |
| Accessibility | axe (WCAG 2.2, A and AA) on every page type and every state, with zero violations. | `e2e/a11y.spec.ts` |
| Sideways scroll | No page scrolls sideways, at 12 widths from 320 to 2560. | `e2e/overflow.spec.ts` |
| Crawl | Every page of the site: no broken links, no console errors. | `e2e/crawl.spec.ts` |
| Script budget | Each page type stays within its JavaScript size. | `e2e/budget.spec.ts`, `budgets.json` |
| Lighthouse | The main pages, mobile and desktop: the median of three runs stays within the agreed limits. | `lighthouse.mjs`, `budgets.json` |

The forms are tested without sending anything. Each request a form makes is answered inside the test browser, as a success or a failure, so nothing reaches Kit, Resend or your inbox.

## Where they run

- **The CI build.** Each pull request is built as the live site is (the Shop sealed) and every check runs on it.
- **The Vercel preview.** The same browser checks then run on the pull request's own preview, which is the real deployment, with its headers, its security policy and the full Shop. Previews sit behind Vercel's login, so this needs a key. See "Previews" below. Without the key, this step says so on the run's page and the rest still runs.
- **Lighthouse.** It runs on the CI build, where its numbers were measured and its limits set. That keeps the comparison like for like.

## Running them on your Mac

Once, to set up (in the project folder, in Terminal):

```
npm ci
npx playwright install chromium webkit firefox
```

Then, each time:

```
npm run test:build
npm test
```

`npm run test:build` builds the site as the live site is. `npm test` starts it and runs every check on a phone size and a desktop size, in Chromium. The screenshots are skipped on a Mac (see below).

**Safari's engine and Firefox as well:**

```
BROWSERS=all npm test
```

This adds an iPhone in WebKit (Safari's engine) and a desktop in Firefox.

**One check only**, by its file name:

```
npm test -- journeys
npm test -- crawl
```

**The report**, with a screenshot of each failure:

```
npm run test:report
```

**Lighthouse.** Start the build in one Terminal window, then run Lighthouse in a second:

```
EDITIONS_MODE=anticipation npx next start -p 3100
npm run test:lighthouse
```

**Against the live site** (the crawl, for example):

```
BASE_URL=https://houseofsingh.com npm test -- crawl --project desktop
```

## Approving an intended change to how a page looks

When a change is meant to alter a page's look, the screenshot check fails and shows what moved.

1. On the pull request, open the failed **ci** run. Then open **Artifacts**, then **playwright-report**, and open `index.html`. Each changed page shows the approved screenshot, the new one and the difference between them.
2. If the change is the one you wanted, add the label **approve-visuals** to the pull request (the gear beside Labels).
3. A few minutes later, new approved screenshots are committed to the pull request, the label comes off, and the checks run again, this time green.
4. The new screenshots were committed by GitHub's own bot, so the repository's merge rule asks for one person's approval of that commit. Open **Files changed**, then **Review changes**, choose **Approve** and submit. Then merge as usual.

Screenshots are made and compared on Linux only, in CI, because a Mac draws type very slightly differently. That is why they are skipped when you run the checks on your Mac.

Photographs, video and the Spotify player are covered by a plain block in the screenshots. They load at their own pace, and changing them is a content decision, not a design one. The clock is fixed and motion is at rest, so only real changes to layout, type, spacing and colour show. Words are not covered: when you publish a new Journal entry or edit a page's text in Sanity, the next pull request shows that page as changed. Look at it, and approve it with the label in the same way.

## The limits (`budgets.json`)

- **JavaScript:** measured on 12 Nov 2026 at 154 to 164 KB (compressed) per page type. The limits sit about 7 percent above that.
- **Lighthouse, mobile:** performance at least 80, largest paint at most 4.5 s, blocking time at most 350 ms, layout shift at most 0.05. Measured at 87 to 99, up to 3.9 s, up to 163 ms and 0.
- **Lighthouse, desktop:** performance at least 90, largest paint at most 1.5 s, blocking time at most 150 ms, layout shift at most 0.05. Measured at 99 to 100, up to 0.93 s, up to 3 ms and up to 0.01.

Lighthouse varies from run to run, so each page is measured three times and the median is compared. The margins mean ordinary noise never fails a pull request. Raise a limit only on purpose, and say why in the pull request.

## Previews

GitHub needs a key to get past Vercel's login on previews. To set it up once:

1. In Vercel, open the project houseofsingh-com-by-claude, then **Settings**, **Deployment Protection**, **Protection Bypass for Automation**. Create a secret and copy it.
2. In GitHub, open the repository, then **Settings**, **Secrets and variables**, **Actions**, **New repository secret**. Name it `VERCEL_AUTOMATION_BYPASS_SECRET` and paste the value.

The checks send the key only to the preview itself, never to Sanity, Spotify or any other site.

## Known exceptions

Two accessibility findings sit inside protected designs and wait for Maninder's approval. They are listed, with the proposed fix for each, at the top of `e2e/a11y.spec.ts` (`KNOWN`). Nothing else is excused. When one is fixed, its entry must be removed, otherwise the check fails.
