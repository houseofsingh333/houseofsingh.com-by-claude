import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import { sanityFetch } from "@/sanity/fetch";
import { contactPageQuery } from "@/sanity/queries";
import type { InstagramPhoto } from "@/components/contact/InstagramPhotoPlate";
import { fallbackInstagramPhotos } from "@/lib/placeholder-data";

type ContactPageData = {
  instagramPhotos?: InstagramPhoto[] | null;
};

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with House of Singh for projects, collaborations, and inquiries.",
};

export default async function ContactPage() {
  const data = await sanityFetch<ContactPageData>({ query: contactPageQuery });

  const photos = data?.instagramPhotos?.length
    ? data.instagramPhotos
    : fallbackInstagramPhotos;

  return (
    <ContactForm instagramPhotos={photos} />
  );
}
