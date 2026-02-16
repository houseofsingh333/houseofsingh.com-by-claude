import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">Contact</h1>
      <p className="mt-4 text-neutral-600">
        Multi-step contact form coming soon. It will submit to a Next.js API
        route that writes to Sanity.
      </p>
      <div className="mt-12 rounded-lg border border-neutral-200 p-8 text-center text-sm text-neutral-400">
        Contact form placeholder — will be implemented as a multi-step form
        component.
      </div>
    </section>
  );
}
