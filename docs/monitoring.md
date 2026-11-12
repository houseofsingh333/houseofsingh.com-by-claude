# Alerts: when houseofsingh.com is down or showing errors

The site is watched by GitHub itself (`.github/workflows/site-watch.yml`). There is no outside service, nothing to pay for and no new code in the site. Alerts reach you by email, as GitHub issues assigned to you.

## What is watched

**Every 15 minutes:**
- Home, About, Projects, Journal, Contact, the Shop and the sitemap must each answer, and show their own title.
- An error page has a different title, so a page that loads but breaks is caught too.
- If any of them fails twice, a minute apart, an issue **"houseofsingh.com is down"** opens and is assigned to you. It lists which pages failed and how.
- When every page answers again, the issue closes itself with the time.

**Every morning (about 7:40, Toronto time):**
- The crawl from the automated checks runs on the live site: every page, every link, the browser's console.
- If it finds a broken link, a script error or a failed request, an issue **"Errors on houseofsingh.com"** opens (or gains a comment) with the list.
- It closes after the first clean morning.

## Making sure the emails reach you

GitHub emails you about issues assigned to you. To check:
1. On github.com, open your picture, then **Settings**, then **Notifications**.
2. Under **Participating, @mentions and custom**, **Email** should be ticked.
3. Under **System**, **Actions**, choose **Only notify for failed workflows**, with email. The weekly backup then emails you if it ever fails.

## Trying it

- **Actions**, then **site watch**, then **Run workflow**, choose `pages` or `crawl`, then **Run workflow**.
- A healthy site gives a green run and no issue.

## When an alert arrives

**"houseofsingh.com is down":**
1. Open the site yourself. GitHub's check is outside your network, so it sees what visitors see.
2. Open Vercel, then the project, then **Deployments**. A failed latest deployment can be undone: the previous production deployment, the three dots, **Promote to Production** (or **Instant Rollback**).
3. Check vercel-status.com and sanity-status.com. An outage at either shows here as the site being down.
4. Send me the issue. I can read the runtime logs.

**"Errors on houseofsingh.com":** the issue lists each page and its problem. A broken link usually means a link in Sanity points at a page that was renamed or unpublished. Send me the issue to fix the rest.

## Limits, honestly

- **Checks are delayed at busy times.** GitHub can run a scheduled check 5 to 15 minutes late, so an outage is noticed within about half an hour at worst. For alerts within one minute, a free UptimeRobot account watching the same pages is the next step (5 minute checks, email, no code). Ask me and I will list exactly what to enter.
- **Errors in the site's server code** (for example, a form that fails to send) appear in Vercel's logs, not on the pages. The daily crawl does not submit forms. Alerts for those need Vercel's paid plan, or a small error service. That is a separate decision.
- **GitHub pauses scheduled workflows** in a repository with no activity for 60 days. Any commit restarts them.
