import type { MetadataRoute } from "next";
import { client } from "@/sanity/client";
import { placeholdersEnabled } from "@/lib/placeholders";
import { parseSanityDate } from "@/lib/dates";
import { journalMonthHref } from "@/lib/journalLinks";
import { PRIVACY_UPDATED, TERMS_UPDATED } from "@/lib/legalDates";
import { siteMode } from "@/lib/editions/enabled";

const BASE_URL = "https://houseofsingh.com";

/** The newest edit time of the content each fixed page shows. */
const DATES_QUERY = `{
  "home": *[_type in ["siteSettings", "heroSlide", "spotlight", "aboutPage", "project", "journalEntry", "navigation"]] | order(_updatedAt desc)[0]._updatedAt,
  "journal": *[_type == "journalEntry"] | order(_updatedAt desc)[0]._updatedAt,
  "projects": *[_type == "project"] | order(_updatedAt desc)[0]._updatedAt,
  "about": *[_type == "aboutPage"][0]._updatedAt,
  "contact": *[_type == "contactPage"][0]._updatedAt
}`;

type Dates = Partial<Record<"home" | "journal" | "projects" | "about" | "contact", string | null>>;

/** An image as the queries return it; decorative ones are left out of the sitemap. */
type Img = { url?: string | null; isDecorative?: boolean | null } | null;
const IMG = `{ "url": asset->url, isDecorative }`;

/**
 * The photographs each fixed page shows, for the image sitemap: Home (the
 * hero and the portrait), About (the portrait and the milestones) and the
 * Projects page (each project's cover, else its thumbnail).
 */
const PAGE_IMAGES_QUERY = `{
  "home": [...*[_type == "heroSlide"].image, *[_type == "aboutPage"][0].homePortrait, *[_type == "aboutPage"][0].portrait]${IMG},
  "about": [*[_type == "aboutPage"][0].portrait, ...*[_type == "aboutPage"][0].milestones[].image]${IMG},
  "projects": *[_type == "project"]{ "image": select(defined(coverImage.asset) => coverImage, thumbnail)${IMG} }.image
}`;

/** Meaningful image addresses, each once, in order. */
function imageUrls(images: Img[] | null | undefined): string[] {
  const out: string[] = [];
  for (const image of images ?? []) {
    if (!image?.url || image.isDecorative || out.includes(image.url)) continue;
    out.push(image.url);
  }
  return out;
}

/** The images key only when there are some. */
const withImages = (images: Img[] | null | undefined) => {
  const urls = imageUrls(images);
  return urls.length ? { images: urls } : {};
};

/**
 * Every page, each with the date its content last changed: fixed pages from
 * the newest edit of what they show (the legal pages from their stated
 * "Last updated" date), projects and entries from their own edits, and each
 * month of the journal archive from its newest entry. A date that cannot be
 * known is left out rather than guessed.
 */
export async function sitemapEntries(): Promise<MetadataRoute.Sitemap> {
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
  let pageImages: Partial<Record<"home" | "about" | "projects", Img[]>> = {};
  let projectRoutes: MetadataRoute.Sitemap = [];
  let journalRoutes: MetadataRoute.Sitemap = [];
  let monthRoutes: MetadataRoute.Sitemap = [];

  if (client) {
    try {
      const [fetchedDates, fetchedImages, projects, journalEntries] = await Promise.all([
        client.fetch<Dates>(DATES_QUERY),
        client.fetch<typeof pageImages>(PAGE_IMAGES_QUERY),
        // Prefer the editable updatedAt/publishedAt fields, then fall back to
        // the system _updatedAt timestamp.
        // Each project page's photographs: the hero (cover, else the
        // thumbnail), the Photographs, then the content sections' images.
        client.fetch<Array<{ slug: string; lastmod: string | null; images: Img[] }>>(
          `*[_type == "project"]{ "slug": slug.current, "lastmod": coalesce(updatedAt, publishedAt, _updatedAt),
            "images": [select(defined(coverImage.asset) => coverImage, thumbnail), ...photographs[], ...contentSections[].image, ...contentSections[].images[]]${IMG} }`
        ),
        // Each entry's cover and the photographs in its text.
        client.fetch<Array<{ slug: string; date: string; lastmod: string | null; images: Img[] }>>(
          `*[_type == "journalEntry"]{ "slug": slug.current, date, "lastmod": coalesce(_updatedAt, date),
            "images": [coverImage, ...body[_type == "image"]]${IMG} }`
        ),
      ]);
      dates = fetchedDates ?? {};
      pageImages = fetchedImages ?? {};

      projectRoutes = (projects ?? []).map((project) => ({
        url: `${BASE_URL}/projects/${project.slug}`,
        ...(project.lastmod ? { lastModified: project.lastmod } : {}),
        changeFrequency: "monthly" as const,
        priority: 0.7,
        ...withImages(project.images),
      }));

      journalRoutes = (journalEntries ?? []).map((entry) => ({
        url: `${BASE_URL}/journal/${entry.slug}`,
        ...(entry.lastmod ? { lastModified: entry.lastmod } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.8,
        ...withImages(entry.images),
      }));

      // Each month of the archive, dated by its most recently edited entry.
      // Each month shows its entries in full, so it lists their images too.
      const months = new Map<string, { lastmod: string | null; images: Img[] }>();
      for (const entry of journalEntries ?? []) {
        if (!entry.date) continue;
        const d = parseSanityDate(entry.date);
        const href = journalMonthHref(d.getFullYear(), d.getMonth() + 1);
        const month = months.get(href) ?? { lastmod: null, images: [] };
        if (!month.lastmod || (entry.lastmod && entry.lastmod > month.lastmod)) month.lastmod = entry.lastmod;
        month.images.push(...(entry.images ?? []));
        months.set(href, month);
      }
      monthRoutes = [...months].map(([href, { lastmod, images }]) => ({
        url: `${BASE_URL}${href}`,
        ...(lastmod ? { lastModified: lastmod } : {}),
        changeFrequency: "monthly" as const,
        priority: 0.4,
        ...withImages(images),
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
    { url: BASE_URL, ...at(dates.home), changeFrequency: "weekly", priority: 1, ...withImages(pageImages.home) },
    { url: `${BASE_URL}/journal`, ...at(dates.journal), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/projects`, ...at(dates.projects), changeFrequency: "monthly", priority: 0.7, ...withImages(pageImages.projects) },
    { url: `${BASE_URL}/about`, ...at(dates.about), changeFrequency: "monthly", priority: 0.5, ...withImages(pageImages.about) },
    { url: `${BASE_URL}/contact`, ...at(dates.contact), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: PRIVACY_UPDATED.iso, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/terms`, lastModified: TERMS_UPDATED.iso, changeFrequency: "monthly", priority: 0.5 },
    // The sealed Shop, while the live site is in anticipation: /editions
    // alone (every other Shop page stays out of the sitemap).
    ...(siteMode() === "anticipation" ? [{ url: `${BASE_URL}/editions`, changeFrequency: "weekly" as const, priority: 0.6 }] : []),
  ];

  return [...staticRoutes, ...projectRoutes, ...journalRoutes, ...monthRoutes];
}
