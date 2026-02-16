import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fallbackProjects as projects } from "@/lib/placeholder-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Not Found" };
  return { title: project.title };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) notFound();

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm font-medium text-neutral-500">
        {project.category}
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">
        {project.title}
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-neutral-600">
        {project.excerpt}
      </p>
      <p className="mt-8 text-sm text-neutral-400">
        Full project detail with Portable Text and image gallery will render
        here once Sanity is connected.
      </p>
    </section>
  );
}
