import type { MetadataRoute } from "next";
import { client } from "@/sanity/client";
import { placeholdersEnabled } from "@/lib/placeholders";
import { parseSanityDate } from "@/lib/dates";
import { journalMonthHref } from "@/lib/journalLinks";
import { PRIVACY_UPDATED, TERMS_UPDATED } from "@/lib/legalDates";

const BASE_URL = "https://houseofsingh.com";

/** Rebuilt at most hourly, so new entries and edit dates appear without a deploy. */
export const revalidate = 3600;

/** The newest edit time of the content each fixed page shows. */
const DATES_QUERY = `{
  "home": *[_type in ["siteSettings", "heroSlide", "spotlight", "aboutPage", "project", "journalEntry", "navigation"]] | order(_updatedAt desc)[0]._updatedAt,
  "journal": *[_type == "journalEntry"] | order(_updatedAt desc)[0]._updatedAt,
  "projects": *[_type == "project"] | order(_updatedAt desc)[0]._updatedAt,
  "about": *[_type == "aboutPage"][0]._updatedAt,
  "contact": *[_type == "contactPage"][0]._updatedAt
}`;

type Dates = Partial<Record<"home" | "journal" | "projects" | "about" | "contact", string | null>>;

/**
 * Every page, each with the date its content last changed: fixed pages from
 * the newest edit of what they show (the legal pages from their stated
 * "Last updated" date), projects and entries from their own edits, and each
 * month of the journal archive from its newest entry. A date that cannot be
 * known is left out rather than guessed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // No silent fallback: if Sanity fails, throw so the build fails (or the
  // last good sitemap keeps being served) instead of publishing a sitemap
  // that is missing every project and article. Static routes only when local
  // placeholders are explicitly enabled.
  if (!client && !placeholdersEnabled) {
    throw new Error(
      "[sanity] Sanity is not configured: NEXT_PUBLIC_SANITY_PROJECT_ID is missing.",
    );
  }

  let dates: Dates = {};
  let projectRoutes: MetadataRoute.Sitemap = [];
  let journalRoutes: MetadataRoute.Sitemap = [];
  let monthRoutes: MetadataRoute.Sitemap = [];

  if (client) {
    try {
      const [fetchedDates, projects, journalEntries] = await Promise.all([
        client.fetch<Dates>(DATES_QUERY),
        // Prefer the editable updatedAt/publishedAt fields, then fall back to
        // the system _updatedAt timestamp.
        client.fetch<Array<{ slug: string; lastmod: string | null }>>(
          `*[_type == "project"]{ "slug": slug.current, "lastmod": coalesce(updatedAt, publishedAt, _updatedAt) }`
        ),
        client.fetch<Array<{ slug: string; date: string; lastmod: string | null }>>(
          `*[_type == "journalEntry"]{ "slug": slug.current, date, "lastmod": coalesce(_updatedAt, date) }`
        ),
      ]);
      dates = fetchedDates ?? {};

      projectRoutes = (projects ?? []).map((project) => ({
        url: `${BASE_URL}/projects/${project.slug}`,
        ...(project.lastmod ? { lastModified: project.lastmod } : {}),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));

      journalRoutes = (journalEntries ?? []).map((entry) => ({
        url: `${BASE_URL}/journal/${entry.slug}`,
        ...(entry.lastmod ? { lastModified: entry.lastmod } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

      // Each month of the archive, dated by its most recently edited entry.
      const months = new Map<string, string | null>();
      for (const entry of journalEntries ?? []) {
        if (!entry.date) continue;
        const d = parseSanityDate(entry.date);
        const href = journalMonthHref(d.getFullYear(), d.getMonth() + 1);
        const newest = months.get(href);
        if (!newest || (entry.lastmod && entry.lastmod > newest)) months.set(href, entry.lastmod);
      }
      monthRoutes = [...months].map(([href, lastmod]) => ({
        url: `${BASE_URL}${href}`,
        ...(lastmod ? { lastModified: lastmod } : {}),
        changeFrequency: "monthly" as const,
        priority: 0.4,
      }));
    } catch (error) {
      if (!placeholdersEnabled) {
        console.error("[sanity] Sitemap request failed.", error);
        throw new Error("[sanity] Sitemap request failed.", { cause: error });
      }
      // Local placeholders: static routes only.
    }
  }

  const at = (date: string | null | undefined) => (date ? { lastModified: date } : {});
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, ...at(dates.home), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/journal`, ...at(dates.journal), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/projects`, ...at(dates.projects), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`, ...at(dates.about), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, ...at(dates.contact), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: PRIVACY_UPDATED.iso, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/terms`, lastModified: TERMS_UPDATED.iso, changeFrequency: "monthly", priority: 0.5 },
  ];

  return [...staticRoutes, ...projectRoutes, ...journalRoutes, ...monthRoutes];
}
