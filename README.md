# House of Singh

The website for House of Singh, the personal brand and creative platform of Maninder Singh, a Toronto based creative director, photographer and multidisciplinary designer. It is an editorial, photography led portfolio and journal, with projects, journal entries, an About page and a contact form. All content is managed in Sanity. This site is separate from House of Singh Studios, which lives at studios.houseofsingh.com.

## Stack

* **Framework:** Next.js with the App Router, written in TypeScript. Pages are server components by default.
* **Content:** Sanity. The Studio is built into the site at `/studio-sanity`. Content is read through ISR with a 60 second revalidation window.
* **Styling:** Tailwind CSS v4. All theme tokens live in the `@theme` block in `src/app/globals.css`; there is no `tailwind.config` file.
* **Hosting:** Vercel. `main` is production, and every push to a branch gets a preview deployment.
* **Performance monitoring:** Vercel Speed Insights.

## Requirements

* Node 24. The exact version is pinned in `.nvmrc` (`nvm use` picks it up), and `package.json` declares `"engines": { "node": "24.x" }`.
* Install dependencies with `npm ci`, never `npm install`, so the lockfile is used exactly as committed.

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values. Never commit `.env.local` or any token.

```bash
# Sanity project and dataset (public; the browser sees these too)
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production

# Server only. Needed for the contact, project interest and newsletter forms
# to save submissions. Create an Editor token in sanity.io/manage.
SANITY_API_TOKEN=your-sanity-write-token

# Optional, local development only. Shows demo content instead of Sanity.
NEXT_PUBLIC_USE_PLACEHOLDERS=1
```

The same Sanity variables must be set in the Vercel project settings. Without `SANITY_API_TOKEN` the site still renders, but form submissions return an error instead of being saved.

## Local development

```bash
nvm use
npm ci
npm run dev
```

Then open http://localhost:3000.

Local development needs one of two things:

* **Access to Sanity,** with the variables above set. This shows real content.
* **Placeholder content,** if you cannot reach Sanity:

  ```bash
  NEXT_PUBLIC_USE_PLACEHOLDERS=1 npm run dev
  ```

  This fills the pages with demo projects, journal entries and images. Placeholders are forced off on Vercel and in CI even if the variable is set there, so demo content can never reach the live site. Everywhere else, a Sanity failure throws an error and the last good page keeps being served.

Other scripts:

| Command | What it does |
|---|---|
| `npm run build` | Production build |
| `npm run start` | Serves the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check |

## Workflow

* `main` deploys to production. Nobody pushes to it directly.
* All work happens on `feature/next-work`. Each push there creates a Vercel preview.
* Changes reach production only through a pull request from `feature/next-work` into `main`. Maninder merges it after checking the preview.
* Before reporting a change as done, run `npm run build` and `npx tsc --noEmit` and confirm both are clean.

### The Protect main rule

A GitHub ruleset called **Protect main** guards the default branch:

* Every change must arrive through a pull request.
* The `ci` status check must pass before merging.
* Force pushes and deleting the branch are blocked.

## Continuous integration

The `ci` workflow (`.github/workflows/ci.yml`) runs on every pull request into `main` and on every push to `main`. It uses the Node version from `.nvmrc` and runs:

1. `npm ci`
2. `npx tsc --noEmit` (type check)
3. `npm run lint` (ESLint)
4. `npm run build` (production build)

It needs only the public Sanity project ID and dataset, with no tokens or secrets. Dependabot (`.github/dependabot.yml`) opens update pull requests, which go through the same checks.

## Sanity schema changes

Schema changes in code do not appear in the Studio on their own. After changing anything in `src/sanity/schemas`, deploy the schema from a terminal:

```bash
npx sanity@latest schema deploy
```

## Brand and working rules

* **`BRAND_BOOK.md`** is the source of truth for the visual system and voice: palette, type, spacing, motion, photography and copy.
* **`CLAUDE.md`** is the operating brief: stack rules, hard guardrails, accessibility requirements, structured data entities and the working loop.

Read both before changing anything visual or user facing.
