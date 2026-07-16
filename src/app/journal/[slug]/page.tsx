import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import ReadingProgress from "@/components/ReadingProgress";
import SanityImage from "@/components/SanityImage";
import { hasImageAsset } from "@/lib/sanityImage";
import { sanityFetch } from "@/sanity/fetch";
import {
  journalBySlugQuery,
  journalFeedQuery,
  siteSettingsQuery,
} from "@/sanity/queries";
import {
  fallbackJournalEntries,
  type JournalEntry,
} from "@/lib/placeholder-data";
import type { SiteSettings } from "@/lib/types";
import { parseSanityDate } from "@/lib/dates";
import JsonLd from "@/components/JsonLd";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/structured-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  const entries = await sanityFetch<{ slug: string }[]>({
    query: journalFeedQuery,
  });

  if (entries && entries.length > 0) {
    return entries.map((entry) => ({ slug: entry.slug }));
  }

  return fallbackJournalEntries.map((entry) => ({ slug: entry.slug }));
}

// Open Graph / Twitter images are supplied per-route by the colocated
// opengraph-image.tsx / twitter-image.tsx generators (Next.js convention),
// so no `images` are set here.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const entry = await sanityFetch<JournalEntry | null>({
    query: journalBySlugQuery,
    params: { slug },
  });

  const fallback = fallbackJournalEntries.find((e) => e.slug === slug);
  const baseTitle = entry?.title ?? fallback?.title;

  if (!baseTitle) return { title: "Not Found" };

  const title = entry?.seo?.metaTitle ?? entry?.seoTitle ?? baseTitle;

  const description =
    entry?.seo?.metaDescription ??
    entry?.seoDescription ??
    entry?.excerpt ??
    fallback?.excerpt ??
    "Reflections and observations from Maninder Singh — House of Singh";

  const canonical =
    entry?.seo?.canonicalUrl || `/journal/${slug}`;
  const noIndex = entry?.seo?.noIndex === true;
  const author = entry?.author || "Maninder Singh";

  const publishedTime = entry?.date
    ? parseSanityDate(entry.date).toISOString()
    : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "article",
      title,
      description,
      url: `/journal/${slug}`,
      ...(publishedTime ? { publishedTime } : {}),
      authors: [author],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function formatDate(dateStr: string | undefined | null) {
  if (!dateStr) return "";
  const d = parseSanityDate(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function JournalDetailPage({ params }: Props) {
  const { slug } = await params;

  const entry = await sanityFetch<JournalEntry | null>({
    query: journalBySlugQuery,
    params: { slug },
  });

  const fallback = fallbackJournalEntries.find((e) => e.slug === slug);
  const resolved = entry ?? fallback;

  if (!resolved) notFound();

  const settings = await sanityFetch<SiteSettings | null>({
    query: siteSettingsQuery,
  });

  const articleJsonLd = buildArticleJsonLd(resolved, settings);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Journal", path: "/journal" },
    { name: resolved.title, path: `/journal/${resolved.slug}` },
  ]);

  /* Build back-link with year/month so the journal page returns to the same position */
  const entryDate = parseSanityDate(resolved.date);
  const backHref = `/journal?year=${entryDate.getFullYear()}&month=${entryDate.getMonth() + 1}`;

  /* Fetch all entries for prev/next navigation */
  const allData = await sanityFetch<JournalEntry[] | null>({
    query: journalFeedQuery,
  });
  const all = allData?.length ? allData : fallbackJournalEntries;
  const sorted = [...all].sort(
    (a, b) => parseSanityDate(b.date).getTime() - parseSanityDate(a.date).getTime(),
  );
  const currentIdx = sorted.findIndex((e) => e.slug === resolved.slug);
  const prevEntry = currentIdx > 0 ? sorted[currentIdx - 1] : null;
  const nextEntry =
    currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

  /* Cover caption (only when the cover is an asset object carrying one) */
  const coverCaption =
    resolved.coverImage && typeof resolved.coverImage === "object"
      ? resolved.coverImage.caption
      : undefined;

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Reading progress bar */}
      <ReadingProgress />

      <div className="px-6 md:px-16 page-top-offset section-pb-sm max-w-6xl mx-auto">
        {/* Back to journal — full width, above the split */}
        <Link
          href={backHref}
          className="inline-block text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          &larr; Back to journal
        </Link>

        {/* Two-column editorial split on desktop; stacked below 1024px.
            Columns top-align so the text always begins at the same position,
            independent of image height. */}
        <div className="lg:grid lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:items-start">
          {/* Left column — cover image in a fixed 4:5 portrait box for a
              consistent look across every entry. The crop respects the image's
              hotspot (focal point) so it won't cut through faces/subjects. */}
          {hasImageAsset(resolved.coverImage) && (
            <figure className="mb-10 lg:mb-0">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
                <SanityImage
                  image={resolved.coverImage}
                  context="hero"
                  alt={resolved.title}
                  priority
                  fill
                  className="object-cover"
                />
              </div>
              {coverCaption && (
                <figcaption className="text-xs text-muted-foreground/60 mt-3">
                  {coverCaption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Right column — title, date, body, and navigation */}
          <div className="min-w-0">
            {/* Title */}
            <h1 className="font-editorial text-3xl md:text-4xl font-light tracking-wide text-foreground mb-3">
              {resolved.title}
            </h1>

            {/* Date */}
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-10">
              {formatDate(resolved.date)}
            </p>

            {/* Body */}
            <div className="text-muted-foreground leading-relaxed space-y-6 mb-16">
              {Array.isArray(resolved.body) && resolved.body.length > 0 ? (
                <div className="text-sm md:text-[15px] text-muted-foreground leading-[1.9] [&>p]:mb-6 last:[&>p]:mb-0">
                  <PortableText
                    value={resolved.body}
                    components={{
                      types: {
                        image: ({ value }: { value: Record<string, unknown> }) => (
                          <figure className="my-8">
                            <SanityImage
                              image={value as unknown as import("@/lib/sanityImage").SanityImageAsset}
                              context="body"
                              alt={(value.alt as string) ?? ""}
                              className="w-full"
                            />
                            {typeof value.caption === "string" && (
                              <figcaption className="text-xs text-muted-foreground/60 mt-2">
                                {value.caption}
                              </figcaption>
                            )}
                          </figure>
                        ),
                      },
                    }}
                  />
                </div>
              ) : resolved.excerpt ? (
                <p>{resolved.excerpt}</p>
              ) : null}
            </div>

            {/* Prev / Next navigation — inside the text column, after a
                hairline rule; constrained to the column width. */}
            <div className="border-t border-border pt-10">
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                {/* Previous (newer) */}
                <div>
                  {prevEntry ? (
                    <Link
                      href={`/journal/${prevEntry.slug}`}
                      className="group block"
                    >
                      <span
                        aria-hidden="true"
                        className="block text-sm text-muted-foreground/50 mb-2 transition-[transform,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-muted-foreground/80 motion-safe:group-hover:-translate-x-0.5"
                      >
                        &larr;
                      </span>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 mb-2">
                        Previous
                      </p>
                      <p className="text-xs md:text-sm uppercase tracking-[0.1em] text-foreground group-hover:text-muted-foreground transition-colors leading-relaxed">
                        {prevEntry.title}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mt-1">
                        {formatDate(prevEntry.date)}
                      </p>
                    </Link>
                  ) : (
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
                      No previous entry
                    </p>
                  )}
                </div>

                {/* Next (older) */}
                <div className="text-right">
                  {nextEntry ? (
                    <Link
                      href={`/journal/${nextEntry.slug}`}
                      className="group block"
                    >
                      <span
                        aria-hidden="true"
                        className="block text-sm text-muted-foreground/50 mb-2 transition-[transform,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-muted-foreground/80 motion-safe:group-hover:translate-x-0.5"
                      >
                        &rarr;
                      </span>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 mb-2">
                        Next
                      </p>
                      <p className="text-xs md:text-sm uppercase tracking-[0.1em] text-foreground group-hover:text-muted-foreground transition-colors leading-relaxed">
                        {nextEntry.title}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mt-1">
                        {formatDate(nextEntry.date)}
                      </p>
                    </Link>
                  ) : (
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
                      No next entry
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
