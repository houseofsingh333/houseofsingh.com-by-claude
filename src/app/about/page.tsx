import type { Metadata } from "next";
import AboutSection from "@/components/about/AboutSection";
import { sanityFetch } from "@/sanity/fetch";
import { aboutPageQuery } from "@/sanity/queries";
import {
  fallbackAboutPage,
  type AboutPageData,
} from "@/lib/placeholder-data";
import JsonLd from "@/components/JsonLd";
import ReadingProgress from "@/components/ReadingProgress";
import { buildFaqJsonLd } from "@/lib/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const data = await sanityFetch<AboutPageData | null>({
    query: aboutPageQuery,
  });

  const noIndex = data?.seo?.noIndex === true;

  return {
    title: data?.seo?.metaTitle ?? data?.seoTitle ?? "About",
    description:
      data?.seo?.metaDescription ??
      data?.seoDescription ??
      "Learn about the story, values, and vision behind House of Singh.",
    alternates: {
      canonical: data?.seo?.canonicalUrl || "/about",
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function AboutPage() {
  const data = await sanityFetch<AboutPageData | null>({
    query: aboutPageQuery,
  });

  const about = data ?? fallbackAboutPage;
  const faqJsonLd = buildFaqJsonLd(about.rapidFire);

  return (
    <>
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <ReadingProgress />
      <h1 className="sr-only">About Maninder Singh — House of Singh</h1>
      <AboutSection data={about} />
    </>
  );
}
