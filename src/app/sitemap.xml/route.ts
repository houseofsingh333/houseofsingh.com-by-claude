import { sitemapEntries } from "@/lib/sitemapEntries";

/** Rebuilt at most hourly, so new entries and edit dates appear without a deploy. */
export const revalidate = 3600;

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/**
 * The sitemap, written out here rather than by Next's sitemap.ts so each
 * page's images come last in its entry, after loc, lastmod, changefreq and
 * priority, the order the sitemaps.org schema requires (Next puts them
 * straight after loc, which the schema rejects).
 */
export async function GET() {
  const entries = await sitemapEntries();
  const urls = entries.map((e) => {
    const lastmod = e.lastModified instanceof Date ? e.lastModified.toISOString() : e.lastModified;
    return [
      "<url>",
      `<loc>${escape(e.url)}</loc>`,
      lastmod ? `<lastmod>${escape(lastmod)}</lastmod>` : "",
      e.changeFrequency ? `<changefreq>${e.changeFrequency}</changefreq>` : "",
      e.priority !== undefined ? `<priority>${e.priority}</priority>` : "",
      ...(e.images ?? []).map((src) => `<image:image>\n<image:loc>${escape(src)}</image:loc>\n</image:image>`),
      "</url>",
    ]
      .filter(Boolean)
      .join("\n");
  });
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
