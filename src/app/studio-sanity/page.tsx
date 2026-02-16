import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sanity Studio",
};

export default function SanityStudioPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Sanity Studio</h1>
      <p className="mt-4 text-neutral-600">
        The embedded Sanity Studio will be mounted here once the Sanity package
        is installed and configured.
      </p>
      <p className="mt-2 text-sm text-neutral-400">
        This route will use next-sanity to render the studio at /studio-sanity.
      </p>
    </section>
  );
}
