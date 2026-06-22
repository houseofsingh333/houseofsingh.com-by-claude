import type { MetadataRoute } from "next";
import { client } from "@/sanity/client";

const BASE_URL = "https://houseofsingh.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/journal`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/projects`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  let projectRoutes: MetadataRoute.Sitemap = [];
  let journalRoutes: MetadataRoute.Sitemap = [];

  if (client) {
    try {
      const [projects, journalEntries] = await Promise.all([
        // Prefer the editable updatedAt/publishedAt fields, then fall back to
        // the system _updatedAt timestamp.
        client.fetch<Array<{ slug: string; lastmod: string | null }>>(
          `*[_type == "project"]{ "slug": slug.current, "lastmod": coalesce(updatedAt, publishedAt, _updatedAt) }`
        ),
        client.fetch<Array<{ slug: string; lastmod: string | null }>>(
          `*[_type == "journalEntry"]{ "slug": slug.current, "lastmod": coalesce(_updatedAt, date) }`
        ),
      ]);

      projectRoutes = (projects ?? []).map((project) => ({
        url: `${BASE_URL}/projects/${project.slug}`,
        lastModified: project.lastmod ?? now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));

      journalRoutes = (journalEntries ?? []).map((entry) => ({
        url: `${BASE_URL}/journal/${entry.slug}`,
        lastModified: entry.lastmod ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    } catch {
      // Sanity unreachable — return static routes only
    }
  }

  return [...staticRoutes, ...projectRoutes, ...journalRoutes];
}
