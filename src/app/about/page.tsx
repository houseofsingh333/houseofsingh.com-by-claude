import type { Metadata } from "next";
import AboutSection from "@/components/about/AboutSection";
import { sanityFetch } from "@/sanity/fetch";
import { aboutPageQuery } from "@/sanity/queries";
import {
  fallbackAboutPage,
  type AboutPageData,
} from "@/lib/placeholder-data";

export async function generateMetadata(): Promise<Metadata> {
  const data = await sanityFetch<AboutPageData | null>({
    query: aboutPageQuery,
  });

  return {
    title: data?.seoTitle ?? "About",
    description:
      data?.seoDescription ??
      "Learn about the story, values, and vision behind House of Singh.",
  };
}

export default async function AboutPage() {
  const data = await sanityFetch<AboutPageData | null>({
    query: aboutPageQuery,
  });

  const about = data ?? fallbackAboutPage;

  return (
    <>
      <h1 className="sr-only">About Maninder Singh — House of Singh</h1>
      <AboutSection data={about} />
    </>
  );
}
