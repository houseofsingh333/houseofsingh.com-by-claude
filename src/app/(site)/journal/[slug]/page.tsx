import type { Metadata } from "next";
import { journalMonthHref } from "@/lib/journalArchive";
import { pageShareImages } from "@/lib/share-metadata";
import { alt as journalShareAlt } from "@/app/journal/[slug]/opengraph-image";
import Link from "next/link";
import NotFoundResponse from "@/components/NotFoundResponse";
import { PortableText } from "@portabletext/react";
import ReadingProgress from "@/components/ReadingProgress";
import SanityImage from "@/components/SanityImage";
import { sanityFetch } from "@/sanity/fetch";
import { devPlaceholder } from "@/lib/placeholders";
import {
  journalBySlugQuery,
  journalFeedQuery,
  siteSettingsQuery,
} from "@/sanity/queries";
import { fallbackJournalEntries } from "@/lib/placeholder-data";
import type { JournalEntry, SiteSettings } from "@/lib/types";
import { formatEntryDate, parseSanityDate, toIsoTimestamp } from "@/lib/dates";
import JsonLd from "@/components/JsonLd";
import { normalizeTitle, pageTitle } from "@/lib/page-title";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/structured-data";
import EntryNavigation from "@/components/journal/EntryNavigation";
import EntryCover from "@/components/journal/EntryCover";

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

  return devPlaceholder(fallbackJournalEntries, []).map((entry) => ({
    slug: entry.slug,
  }));
}

// Share images: the cover photo from the Sanity CDN (1200x630 JPEG) when
// there is one, otherwise the generated branded card from the
// opengraph-image and twitter-image routes in src/app/journal/[slug]/. Those
// routes sit outside the (site) route group so their URLs carry no hash
// suffix, and pageShareImages links them explicitly.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const entry = await sanityFetch<JournalEntry | null>({
    query: journalBySlugQuery,
    params: { slug },
  });

  const fallback = devPlaceholder(fallbackJournalEntries, []).find(
    (e) => e.slug === slug,
  );
  const baseTitle = entry?.title ?? fallback?.title;

  if (!baseTitle) return { title: "Not Found" };

  const title = normalizeTitle(
    entry?.seo?.metaTitle ?? entry?.seoTitle ?? baseTitle,
  );

  const share = pageShareImages({
    path: `/journal/${slug}`,
    cover: entry?.coverImage ?? fallback?.coverImage,
    pageTitle: title,
    cardAlt: journalShareAlt,
  });

  const description =
    entry?.seo?.metaDescription ??
    entry?.seoDescription ??
    entry?.excerpt ??
    fallback?.excerpt ??
    "Reflections and observations by Maninder Singh.";

  const canonical =
    entry?.seo?.canonicalUrl || `/journal/${slug}`;
  const noIndex = entry?.seo?.noIndex === true;
  const author = entry?.author || "Maninder Singh";

  const publishedTime = entry?.date
    ? toIsoTimestamp(entry.date)
    : undefined;

  return {
    title: pageTitle(title),
    description,
    alternates: { canonical },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "article",
      title,
      description,
      url: `/journal/${slug}`,
        images: share.openGraph,
      ...(publishedTime ? { publishedTime } : {}),
      authors: [author],
    },
    twitter: {
      card: "summary_large_image",
        images: share.twitter,
      title,
      description,
    },
  };
}

export default async function JournalDetailPage({ params }: Props) {
  const { slug } = await params;

  const entry = await sanityFetch<JournalEntry | null>({
    query: journalBySlugQuery,
    params: { slug },
  });

  const fallback = devPlaceholder(fallbackJournalEntries, []).find(
    (e) => e.slug === slug,
  );
  const resolved = entry ?? fallback;

  // A Sanity failure has already thrown above (ISR keeps the last good page),
  // so reaching this point means Sanity answered and the slug does not exist.
  if (!resolved) return <NotFoundResponse />;

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
  const backHref = journalMonthHref(entryDate.getFullYear(), entryDate.getMonth() + 1);

  /* Fetch all entries for prev/next navigation */
  const allData = await sanityFetch<JournalEntry[] | null>({
    query: journalFeedQuery,
  });
  const all = allData?.length
    ? allData
    : devPlaceholder(fallbackJournalEntries, []);
  const sorted = [...all].sort(
    (a, b) => parseSanityDate(b.date).getTime() - parseSanityDate(a.date).getTime(),
  );
  const currentIdx = sorted.findIndex((e) => e.slug === resolved.slug);
  const prevEntry = currentIdx > 0 ? sorted[currentIdx - 1] : null;
  const nextEntry =
    currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

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
          <EntryCover entry={resolved} />

          {/* Right column — title, date, body, and navigation */}
          <div className="min-w-0">
            {/* Title */}
            <h1 className="font-editorial text-3xl md:text-4xl font-light tracking-wide text-foreground mb-3">
              {resolved.title}
            </h1>

            {/* Date */}
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-10">
              {formatEntryDate(resolved.date)}
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
                              <figcaption className="text-xs text-muted-foreground mt-2">
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

            {/* Prev / Next navigation */}
            <EntryNavigation prev={prevEntry} next={nextEntry} />
          </div>
        </div>
      </div>
    </>
  );
}
