import type { Metadata } from "next";
import { pageShareImages } from "@/lib/share-metadata";
import { alt as journalShareAlt } from "@/app/journal/[slug]/opengraph-image";
import NotFoundResponse from "@/components/NotFoundResponse";
import { sanityFetch } from "@/sanity/fetch";
import { devPlaceholder } from "@/lib/placeholders";
import {
  journalBySlugQuery,
  journalFeedQuery,
  siteSettingsQuery,
} from "@/sanity/queries";
import { fallbackJournalEntries } from "@/lib/placeholder-data";
import type { JournalEntry, SiteSettings } from "@/lib/types";
import { toIsoTimestamp } from "@/lib/dates";
import JsonLd from "@/components/JsonLd";
import JournalPage from "@/components/journal/room/JournalPage";
import { normalizeTitle, pageTitle } from "@/lib/page-title";
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

/**
 * One journal entry at its own address, with its own title, description,
 * share image, canonical and structured data: the Journal page opened at
 * this entry. Shared links and search results keep working.
 */
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

  // The Journal page itself, opened at this entry (its title is the h1).
  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JournalPage at={{ kind: "entry", slug: resolved.slug }} />
    </>
  );
}
