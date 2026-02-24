import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/fetch";
import { projectBySlugQuery } from "@/sanity/queries";
import { fallbackProjects as projects } from "@/lib/placeholder-data";
import type { ProjectDetail } from "@/lib/placeholder-data";
import SanityImage from "@/components/SanityImage";
import ScrollReveal from "@/components/ScrollReveal";
import ReadingProgress from "@/components/ReadingProgress";
import ContentSections from "@/components/projects/ContentSections";

type Props = {
  params: Promise<{ slug: string }>;
};

function ProjectHeader({ category, title, intro }: { category: string; title: string; intro?: string }) {
  return (
    <ScrollReveal as="section" className="mx-auto max-w-3xl px-6 md:px-16 page-top-offset mb-16 md:mb-20" offset={14} duration={0.8}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 mb-4">
        {category}
      </p>
      <div className="w-full h-px bg-border mb-8 md:mb-10" />
      <h1 className="font-editorial text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-[1.15] mb-8">
        {title}
      </h1>
      {intro && (
        <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.9] max-w-xl">
          {intro}
        </p>
      )}
    </ScrollReveal>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await sanityFetch<ProjectDetail>({
    query: projectBySlugQuery,
    params: { slug },
  });
  if (project) return { title: project.title };

  const fallback = projects.find((p) => p.slug === slug);
  if (!fallback) return { title: "Not Found" };
  return { title: fallback.title };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;

  const project = await sanityFetch<ProjectDetail>({
    query: projectBySlugQuery,
    params: { slug },
  });

  // Sanity data available — render full project
  if (project) {
    return (
      <article className="section-pb-lg">
        <ReadingProgress />
        <ProjectHeader category={project.category} title={project.title} intro={project.shortIntro} />

        {/* Cover image — full bleed, generous bottom margin */}
        {project.coverImage && (
          <ScrollReveal offset={0} duration={1} threshold={0.05} className="mb-20 md:mb-32 lg:mb-40">
            <div
              className="w-full"
              style={{ position: "relative", aspectRatio: `${project.coverImage.width || 1920} / ${project.coverImage.height || 1080}` }}
            >
              <SanityImage
                image={project.coverImage}
                context="hero"
                priority
                fill
                className="object-cover"
              />
            </div>
          </ScrollReveal>
        )}

        {/* Content sections */}
        {project.contentSections && project.contentSections.length > 0 && (
          <ContentSections sections={project.contentSections} />
        )}
      </article>
    );
  }

  // Fallback to placeholder data
  const fallback = projects.find((p) => p.slug === slug);
  if (!fallback) notFound();

  return (
    <article className="section-pb-lg">
      <ProjectHeader category={fallback.category} title={fallback.title} intro={fallback.excerpt} />
      <section className="mx-auto max-w-3xl px-6 md:px-16">
        <p className="text-xs text-muted-foreground/40">
          Full project detail with content sections will render here once Sanity
          is connected.
        </p>
      </section>
    </article>
  );
}
