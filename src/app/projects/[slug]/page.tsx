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
    <section className="mx-auto max-w-3xl px-6 md:px-16 page-top-offset pb-20">
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-4">
        {project.category}
      </p>
      <div className="w-full h-px bg-border mb-8 md:mb-10" />
      <h1 className="font-editorial text-3xl md:text-4xl font-light text-foreground leading-[1.2] mb-6">
        {project.title}
      </h1>
      <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.8] mb-8">
        {project.excerpt}
      </p>
      <p className="text-xs text-muted-foreground/40">
        Full project detail with Portable Text and image gallery will render
        here once Sanity is connected.
      </p>
    </section>
  );
}
