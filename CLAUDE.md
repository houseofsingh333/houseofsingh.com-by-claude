# CLAUDE.md — House of Singh

## Project Overview

**House of Singh** is a personal/studio portfolio website for a multidisciplinary design studio. It showcases projects, journal entries, an about page, and a multi-step contact form. Content is managed through **Sanity CMS** with graceful fallbacks to placeholder data when Sanity is unavailable.

**Live site:** houseofsingh.com
**Deployed on:** Vercel

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, Server Components)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + CSS custom properties (design tokens in `globals.css`)
- **CMS:** Sanity v5 (embedded studio at `/studio-sanity`, content fetched via GROQ)
- **Animations:** Motion (Framer Motion) + CSS animations + `useScrollReveal` hook
- **Icons:** Lucide React
- **Fonts:** Playfair Display (editorial/serif) + system-ui stack (body)
- **Analytics:** Vercel Speed Insights
- **Node:** >=20

## Quick Commands

```bash
npm run dev      # Start dev server (Next.js)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint (flat config, core-web-vitals + typescript)
```

There is **no test suite** configured. No `npm test` command exists.

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (Header, Footer, ThemeProvider)
│   ├── page.tsx                  # Home page (hero, intro, projects preview, spotlight, journal, spotify)
│   ├── globals.css               # Design tokens, Tailwind import, custom animations
│   ├── error.tsx                 # Global error boundary
│   ├── not-found.tsx             # 404 page
│   ├── about/page.tsx            # About page
│   ├── projects/page.tsx         # Projects listing
│   ├── projects/[slug]/page.tsx  # Project detail
│   ├── journal/page.tsx          # Journal listing
│   ├── journal/[slug]/page.tsx   # Journal detail
│   ├── contact/page.tsx          # Contact form page
│   ├── studio/page.tsx           # Redirects to external studios.houseofsingh.com
│   ├── studio-sanity/            # Embedded Sanity Studio (full-screen layout)
│   └── api/
│       ├── contact/route.ts      # POST: create contactSubmission in Sanity
│       └── newsletter/route.ts   # POST: create newsletterSubscriber in Sanity
│
├── components/
│   ├── SanityImage.tsx           # Wrapper around next/image for Sanity CDN images
│   ├── IntroLogo.tsx             # Intro logo animation
│   ├── NewsletterModal.tsx       # Newsletter signup modal
│   ├── ScrollReveal.tsx          # Scroll-triggered reveal wrapper
│   ├── ThemeProvider.tsx         # Light/dark theme context (cookie-persisted)
│   ├── about/                    # About page components
│   ├── contact/                  # Multi-step contact form components
│   ├── home/                     # Home page section components
│   ├── journal/                  # Journal components (list, reading progress)
│   └── layout/                   # Header, Footer, NavOverlay
│
├── hooks/
│   └── useScrollReveal.ts        # IntersectionObserver-based reveal hook
│
├── lib/
│   ├── contact-form-data.ts      # Contact form types, step definitions, branching logic
│   ├── placeholder-data.ts       # Fallback data + shared TypeScript types
│   └── sanityImage.ts            # Image URL builder, responsive srcSet profiles, loader
│
└── sanity/
    ├── client.ts                 # Read-only Sanity client (returns null if unconfigured)
    ├── writeClient.ts            # Write client for API routes (requires SANITY_API_WRITE_TOKEN)
    ├── env.ts                    # Sanity project config (projectId, dataset, apiVersion)
    ├── fetch.ts                  # sanityFetch() helper with ISR caching (60s revalidation)
    ├── image.ts                  # Legacy image URL builder (uses @sanity/image-url)
    ├── queries.ts                # All GROQ queries with shared _imageAsset projection
    ├── studio.ts                 # Sanity Studio config (defineConfig)
    └── schemas/                  # Sanity document schemas
        ├── index.ts              # Schema registry
        ├── aboutPage.ts
        ├── contactPage.ts
        ├── contactSubmission.ts
        ├── heroSlide.ts
        ├── journalEntry.ts
        ├── navigation.ts
        ├── newsletterSubscriber.ts
        ├── project.ts
        ├── projectCategory.ts
        └── siteSettings.ts
```

## Architecture & Key Patterns

### Server Components by Default

Pages are async server components that fetch data via `sanityFetch()`. Client components are explicitly marked with `"use client"` and limited to interactive elements (forms, theme toggle, scroll listeners, animations).

### Graceful CMS Fallback

Every page follows this pattern:

```tsx
const data = await sanityFetch<T>({ query });
const resolved = data ?? fallbackData;
```

When Sanity is unconfigured or unreachable, `sanityFetch()` returns `null` and components render with placeholder data from `src/lib/placeholder-data.ts`. This means the site builds and runs without any Sanity credentials.

### Image Handling

Images use a centralized system in `src/lib/sanityImage.ts`:

- **Three profiles:** `thumbnail`, `body`, `hero` — each with specific widths, quality, fit, and sizes
- The `SanityImage` component (`src/components/SanityImage.tsx`) wraps `next/image` with Sanity CDN transforms
- `getImageProps()` handles three input shapes: `SanityImageAsset` objects, plain CDN URLs, or local paths
- All Sanity image queries use a shared `_imageAsset` projection in `queries.ts` that returns URL, LQIP blur hash, dimensions, alt, and caption

### Design System

The visual design uses CSS custom properties defined in `globals.css`:

- **Light theme (`:root`):** warm off-whites (`hsl(40 20% 97%)`), soft blacks
- **Dark theme (`.dark`):** inverted warm tones
- Tokens: `--background`, `--foreground`, `--secondary`, `--muted-foreground`, `--border`
- Mapped to Tailwind via `@theme inline` block: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-secondary`, `border-border`
- Editorial font: `font-editorial` (Playfair Display)
- Body font: system-ui stack

### Theme System

- `ThemeProvider` (client component) reads/writes a `theme` cookie
- Root layout reads the cookie server-side to set initial `<html class="dark">` and avoid FOUC
- Toggle exposed via `useTheme()` hook

### Header States

The header has three visual states:

1. **State 0:** Full-screen video intro overlay (plays once per session, stored in `sessionStorage`)
2. **State 1:** Large crest logo centered, dot menu left, theme toggle right (default when at top)
3. **State 2:** Compact scrolled header strip with text wordmark (appears after scrolling 60px, hides below 20px)

### Contact Form

Multi-step branching contact form in `src/components/contact/`:

- Intent selection determines which detail steps appear (Commercial, Collaboration, Media, Something Else)
- Step definitions and branching logic in `src/lib/contact-form-data.ts`
- Form state persisted to `sessionStorage` under key `hos-contact-draft`
- Submissions create `contactSubmission` documents in Sanity via `POST /api/contact`

### API Routes

Two POST-only API routes:

- `/api/contact` — validates name/email, formats detail fields, creates `contactSubmission` in Sanity
- `/api/newsletter` — validates email, creates `newsletterSubscriber` in Sanity

Both gracefully handle missing Sanity credentials (accept silently so UX isn't broken).

## Environment Variables

Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id    # Required for CMS
NEXT_PUBLIC_SANITY_DATASET=production             # Usually "production"
SANITY_API_WRITE_TOKEN=your-token-here            # Required for contact/newsletter API routes
```

The site runs without any env vars — all CMS features degrade to placeholder data.

## Routing

| Route | Description |
|---|---|
| `/` | Home page (hero slider, intro, projects preview, spotlight, journal, spotify embed) |
| `/about` | About page (founder bio, timeline, testimonials) |
| `/projects` | Projects grid listing |
| `/projects/[slug]` | Project detail (placeholder until Sanity Portable Text is connected) |
| `/journal` | Journal entries listing |
| `/journal/[slug]` | Journal entry detail with reading progress bar |
| `/contact` | Multi-step branching contact form |
| `/studio` | Redirects to external `studios.houseofsingh.com` |
| `/studio-sanity` | Embedded Sanity Studio (full-screen, no site chrome) |

## Sanity Schemas

10 document types: `aboutPage`, `contactPage`, `contactSubmission`, `heroSlide`, `journalEntry`, `navigation`, `newsletterSubscriber`, `project`, `projectCategory`, `siteSettings`

## Code Conventions

- **Path alias:** `@/*` maps to `./src/*`
- **Naming:** PascalCase for components, camelCase for utilities/hooks, kebab-case for files in `lib/`
- **Component files:** PascalCase `.tsx` files, one component per file, default export
- **Types:** Defined in `placeholder-data.ts` and `sanityImage.ts`, imported where needed (no separate `types/` directory)
- **Imports:** Prefer `@/` path alias over relative paths
- **ESLint:** Flat config (`eslint.config.mjs`) with `eslint-config-next` core-web-vitals + typescript rules
- **No Prettier** configured — formatting follows ESLint rules
- **Styling approach:** Tailwind utility classes inline, CSS custom properties for theme tokens, `globals.css` for animations and timeline interactions
- **Styled Components:** Enabled in `next.config.ts` compiler but primarily used with Tailwind
- **Server vs Client:** Default to server components. Only use `"use client"` when interactivity requires it
- **Error handling:** `catch` blocks without binding the error variable (e.g., `catch {` not `catch (e) {`)
- **ISR:** All Sanity queries revalidate every 60 seconds by default
- **Remote images:** Only `cdn.sanity.io` is allowed in `next.config.ts` `remotePatterns`

## Configuration Files

| File | Purpose |
|---|---|
| `next.config.ts` | Styled Components compiler, Sanity CDN image patterns, responsive image sizes |
| `tsconfig.json` | Strict mode, `@/*` path alias, bundler module resolution |
| `eslint.config.mjs` | Flat ESLint config with Next.js core-web-vitals + TypeScript |
| `postcss.config.mjs` | Tailwind CSS v4 PostCSS plugin |
| `.env.example` | Template for required environment variables |

## Deployment

- Hosted on **Vercel**
- Vercel Speed Insights enabled in root layout
- No CI/CD configuration files in the repo — relies on Vercel's GitHub integration
- Build command: `next build`
