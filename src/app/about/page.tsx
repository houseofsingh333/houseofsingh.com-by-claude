import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight">About</h1>
      <p className="mt-6 text-lg leading-relaxed text-neutral-600">
        Content coming soon. This page will share the story behind House of
        Singh, our values, and the team.
      </p>
    </section>
  );
}
