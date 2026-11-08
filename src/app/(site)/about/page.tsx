import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import AboutSection from "@/components/about/AboutSection";
import { devPlaceholder } from "@/lib/placeholders";
import { sanityFetch } from "@/sanity/fetch";
import { aboutPageQuery } from "@/sanity/queries";
import { fallbackAboutPage } from "@/lib/placeholder-data";
import type { AboutPageData } from "@/lib/types";
import JsonLd from "@/components/JsonLd";
import ReadingProgress from "@/components/ReadingProgress";
import { preload } from "react-dom";
import { buildFaqJsonLd } from "@/lib/structured-data";
import { fullTitle, pageTitle } from "@/lib/page-title";
import { shareCard } from "@/lib/share-metadata";

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const data = await sanityFetch<AboutPageData | null>({
    query: aboutPageQuery,
  });

  const noIndex = data?.seo?.noIndex === true;
  const rawTitle =
    data?.seo?.metaTitle ?? data?.seoTitle ?? "About Maninder Singh";
  const description =
    data?.seo?.metaDescription ??
    data?.seoDescription ??
    "Learn about the story, values, and vision behind House of Singh.";

  return {
    title: pageTitle(rawTitle),
    description,
    alternates: {
      canonical: data?.seo?.canonicalUrl || "/about",
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    ...(await shareCard(parent, fullTitle(rawTitle), description)),
  };
}

export default async function AboutPage() {
  // The italic face for Maninder's quote (styles/about.css): this page only.
  preload("/fonts/playfair-display-latin-wght-italic.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  const data = await sanityFetch<AboutPageData | null>({
    query: aboutPageQuery,
  });

  // Sanity answered with no About document: honest 404 rather than demo text.
  const about = data ?? devPlaceholder<AboutPageData | null>(fallbackAboutPage, null);
  if (!about) notFound();
  const faqJsonLd = buildFaqJsonLd(about.rapidFire);

  return (
    <>
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <ReadingProgress />
      <h1 className="sr-only">About Maninder Singh</h1>
      <AboutSection data={about} />
    </>
  );
}
