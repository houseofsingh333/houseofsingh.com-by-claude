import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import { sanityFetch } from "@/sanity/fetch";
import { contactPageQuery } from "@/sanity/queries";
import type { InstagramPhoto } from "@/components/contact/InstagramPhotoPlate";
import { fallbackInstagramPhotos } from "@/lib/placeholder-data";
import type { Seo } from "@/lib/types";

type ContactPageData = {
  instagramPhotos?: InstagramPhoto[] | null;
  seo?: Seo | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

const DEFAULT_CONTACT_DESCRIPTION =
  "Get in touch with House of Singh for projects, collaborations, and inquiries.";

export async function generateMetadata(): Promise<Metadata> {
  const data = await sanityFetch<ContactPageData>({ query: contactPageQuery });

  return {
    title: data?.seo?.metaTitle ?? data?.seoTitle ?? "Contact",
    description:
      data?.seo?.metaDescription ??
      data?.seoDescription ??
      DEFAULT_CONTACT_DESCRIPTION,
  };
}

export default async function ContactPage() {
  const data = await sanityFetch<ContactPageData>({ query: contactPageQuery });

  const photos = data?.instagramPhotos?.length
    ? data.instagramPhotos
    : fallbackInstagramPhotos;

  return (
    <ContactForm instagramPhotos={photos} />
  );
}
