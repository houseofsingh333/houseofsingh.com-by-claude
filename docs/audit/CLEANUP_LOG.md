# Codebase Cleanup Log

Date: 2026-02-28

## Files Deleted

- `public/images/logo-behance.svg`: not referenced in any component, page, query, or fallback data

## Unused Exports Removed

- `src/sanity/queries.ts`: removed `projectCategoriesQuery` (exported but never imported by any page or component)
- `src/sanity/queries.ts`: removed `projectsByCategoryQuery` (exported but never imported by any page or component)
- `src/lib/placeholder-data.ts`: removed `fallbackProjectCategories` constant (exported but never imported)
- `src/lib/placeholder-data.ts`: removed `ProjectCategory` from type re-exports and internal import (no longer needed)
- `src/lib/types.ts`: removed `ProjectCategory` type definition (only consumer was the deleted fallback constant)

## CSS Removed

- `src/app/globals.css`: removed `.section-py-sm` utility (never applied to any element)
- `src/app/globals.css`: removed `.contact-error` class (never referenced in any component)
- `src/app/globals.css`: removed `.preview-media-img` and its reduced-motion override (never referenced; leftover from a previous crossfade implementation)
- `src/app/globals.css`: removed `.projects-mobile-link`, `.projects-mobile-title`, `.projects-mobile-title::after`, `.projects-mobile-arrow` and their reduced-motion overrides (never referenced; leftover from a previous mobile projects index design)
- `src/app/globals.css`: removed entire `.projects-col` block — `.projects-col`, `.projects-col-title`, `.projects-col-title-text`, `.projects-col-title-text::after`, `.projects-col-cta`, `.projects-col-divider`, `.projects-col-media`, plus all hover/active/focus-visible/reduced-motion states (never referenced; leftover from a previous editorial grid design that was replaced by EditorialProjects)

## Schemas Removed

None. All registered Sanity schemas are actively queried.

## Dependencies Removed

None. All npm packages are actively used:
- `@vercel/speed-insights`: layout.tsx
- `lucide-react`: 8 components
- `motion`: 3 components (CinematicHero, PageTransition, ScrollReveal)
- `next-sanity`, `sanity`: CMS integration throughout

## Static Assets Removed

- `public/images/logo-behance.svg`: see Files Deleted above

## Console Statements Removed

None found. Codebase was already clean.

## Commented Code Removed

None found. All comments are legitimate documentation.

## TypeScript Suppressions

One `@ts-nocheck`-style suppression exists (`// eslint-disable-next-line @typescript-eslint/no-explicit-any` for the `PortableTextBlock = any` type alias in `src/lib/types.ts`). This is intentional — Portable Text blocks from Sanity are untyped by nature.

## Audit Summary

- **Components**: 38 total, 0 dead — all actively imported
- **Lib files**: 5 total, 0 dead — all actively imported
- **Hooks**: 1 total, 0 dead — used by 4 components
- **Sanity schemas**: 16 total, 0 orphaned — all queried
- **Public assets**: 24 total, 1 dead (deleted)
- **No** legacy/backup/v1/v2/prototype/temp files found
- **No** "Words Shared"/quotes/testimonials remnants found

## Total Files Deleted: 1

## Estimated Size Reduction

- ~160 lines of dead CSS removed from globals.css
- ~20 lines of dead TypeScript removed across queries.ts, types.ts, placeholder-data.ts
- 1 SVG asset removed
