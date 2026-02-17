import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with House of Singh for projects, collaborations, and inquiries.",
};

export default function ContactPage() {
  return <ContactForm />;
}
