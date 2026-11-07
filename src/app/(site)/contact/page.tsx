import type { Metadata, ResolvingMetadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import { sanityFetch } from "@/sanity/fetch";
import { contactPageQuery } from "@/sanity/queries";
import type { SanityImage, Seo } from "@/lib/types";
import { fullTitle, pageTitle } from "@/lib/page-title";
import { shareCard } from "@/lib/share-metadata";

type ContactPageData = {
  /** The contact portrait, else the About portrait (contactPageQuery). */
  portrait?: SanityImage | null;
  seo?: Seo | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

const DEFAULT_CONTACT_DESCRIPTION =
  "Get in touch with House of Singh for projects, collaborations, and inquiries.";

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const data = await sanityFetch<ContactPageData>({ query: contactPageQuery });

  const noIndex = data?.seo?.noIndex === true;
  const rawTitle = data?.seo?.metaTitle ?? data?.seoTitle ?? "Contact";
  const description =
    data?.seo?.metaDescription ??
    data?.seoDescription ??
    DEFAULT_CONTACT_DESCRIPTION;

  return {
    title: pageTitle(rawTitle),
    description,
    alternates: {
      canonical: data?.seo?.canonicalUrl || "/contact",
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    ...(await shareCard(parent, fullTitle(rawTitle), description)),
  };
}

export default async function ContactPage() {
  const data = await sanityFetch<ContactPageData>({ query: contactPageQuery });

  return (
    <ContactForm portrait={data?.portrait ?? null} />
  );
}
