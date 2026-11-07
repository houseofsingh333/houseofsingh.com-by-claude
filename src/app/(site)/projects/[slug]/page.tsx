import type { Metadata } from "next";
import { pageShareImages, routeShareImages } from "@/lib/share-metadata";
import { alt as projectShareAlt } from "@/app/projects/[slug]/opengraph-image";
import NotFoundResponse from "@/components/NotFoundResponse";
import { toIsoTimestamp } from "@/lib/dates";
import { sanityFetch } from "@/sanity/fetch";
import { devPlaceholder } from "@/lib/placeholders";
import {
  projectBySlugQuery,
  projectsListQuery,
  siteSettingsQuery,
} from "@/sanity/queries";
import { fallbackProjects as projects } from "@/lib/placeholder-data";
import type { ProjectDetail, SiteSettings } from "@/lib/types";
import SanityImage from "@/components/SanityImage";
import { hasImageAsset } from "@/lib/sanityImage";
import ScrollReveal from "@/components/ScrollReveal";
import ReadingProgress from "@/components/ReadingProgress";
import ContentSections from "@/components/projects/ContentSections";
import ProjectInterestForm from "@/components/projects/ProjectInterestForm";
import JsonLd from "@/components/JsonLd";
import { normalizeTitle, pageTitle } from "@/lib/page-title";
import {
  buildCreativeWorkJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/structured-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const sanityProjects = await sanityFetch<{ slug: string }[]>({
    query: projectsListQuery,
  });

  if (sanityProjects && sanityProjects.length > 0) {
    return sanityProjects.map((project) => ({ slug: project.slug }));
  }

  return devPlaceholder(projects, []).map((project) => ({ slug: project.slug }));
}

function ProjectHeader({ category, title, intro, isUpcoming, author }: { category: string; title: string; intro?: string; isUpcoming?: boolean; author?: string | null }) {
  const authorText = author?.trim();
  return (
    <ScrollReveal as="section" className="mx-auto max-w-3xl px-6 md:px-16 page-top-offset mb-16 md:mb-20">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
        {category}
      </p>
      <div className="w-full h-px bg-border mb-8 md:mb-10" />
      <h1 className="font-editorial text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-[1.15] mb-4">
        {title}
      </h1>
      {authorText && (
        <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-6">
          {authorText}
        </p>
      )}
      {isUpcoming && (
        <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-8">
          <span className="upcoming-dot" aria-hidden="true" />
          Upcoming
        </p>
      )}
      {!isUpcoming && !authorText && <div className="mb-4" />}
      {intro && (
        <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.9] max-w-xl">
          {intro}
        </p>
      )}
    </ScrollReveal>
  );
}

const DEFAULT_DESCRIPTION = "A project by Maninder Singh.";

// Share images: the cover photo from the Sanity CDN (1200x630 JPEG) when
// there is one, otherwise the generated branded card from the
// opengraph-image and twitter-image routes in src/app/projects/[slug]/. Those
// routes sit outside the (site) route group so their URLs carry no hash
// suffix, and pageShareImages links them explicitly.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await sanityFetch<ProjectDetail>({
    query: projectBySlugQuery,
    params: { slug },
  });

  if (project) {
    const title = normalizeTitle(project.seo?.metaTitle || project.title);
    const share = pageShareImages({
      path: `/projects/${slug}`,
      cover: project.coverImage,
      pageTitle: title,
      cardAlt: projectShareAlt,
    });
    const description =
      project.seo?.metaDescription || project.excerpt || DEFAULT_DESCRIPTION;
    const canonical = project.seo?.canonicalUrl || `/projects/${slug}`;
    const noIndex = project.seo?.noIndex === true;
    const author = project.author || "Maninder Singh";

    const publishedTime = project.publishedAt
      ? toIsoTimestamp(project.publishedAt)
      : undefined;
    const modifiedTime = project.updatedAt
      ? toIsoTimestamp(project.updatedAt)
      : undefined;

    return {
      title: pageTitle(title),
      description,
      alternates: { canonical },
      ...(noIndex ? { robots: { index: false, follow: true } } : {}),
      openGraph: {
        type: "article",
        title,
        description,
        url: `/projects/${slug}`,
        images: share.openGraph,
        ...(publishedTime ? { publishedTime } : {}),
        ...(modifiedTime ? { modifiedTime } : {}),
        authors: [author],
      },
      twitter: {
        card: "summary_large_image",
        images: share.twitter,
        title,
        description,
      },
    };
  }

  const fallback = devPlaceholder(projects, []).find((p) => p.slug === slug);
  if (!fallback) return { title: "Not Found" };
  // Placeholder projects have no cover on the Sanity CDN: generated card.
  const share = routeShareImages(`/projects/${slug}`, projectShareAlt);
  return {
    title: fallback.title,
    description: fallback.excerpt || DEFAULT_DESCRIPTION,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      type: "article",
      title: fallback.title,
      description: fallback.excerpt || DEFAULT_DESCRIPTION,
      url: `/projects/${slug}`,
        images: share.openGraph,
    },
    twitter: {
      card: "summary_large_image",
        images: share.twitter,
      title: fallback.title,
      description: fallback.excerpt || DEFAULT_DESCRIPTION,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;

  const project = await sanityFetch<ProjectDetail>({
    query: projectBySlugQuery,
    params: { slug },
  });

  const settings = await sanityFetch<SiteSettings | null>({
    query: siteSettingsQuery,
  });

  // Sanity data available — render full project
  if (project) {
    const creativeWorkJsonLd = buildCreativeWorkJsonLd(project, settings);
    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Projects", path: "/projects" },
      { name: project.title, path: `/projects/${project.slug}` },
    ]);

    return (
      <article className="section-pb-lg">
        <JsonLd data={creativeWorkJsonLd} />
        <JsonLd data={breadcrumbJsonLd} />
        <ReadingProgress />
        <ProjectHeader category={project.category} title={project.title} intro={project.shortIntro} isUpcoming={project.isUpcoming} author={project.author} />

        {/* Cover image — only when a real asset exists (a coverImage object
            can carry alt with no asset at all; that must render no hero). */}
        {hasImageAsset(project.coverImage) && (
          <ScrollReveal rise={false} threshold={0.05} className="mb-20 md:mb-32 lg:mb-40">
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

        {/* Interest form — shown for upcoming projects with the flag enabled */}
        {project.showInterestForm && (
          <ProjectInterestForm projectTitle={project.title} />
        )}
      </article>
    );
  }

  // Placeholder data is local development only. A Sanity failure has already
  // thrown above (ISR keeps the last good page), so reaching this point means
  // Sanity answered and the slug does not exist.
  const fallback = devPlaceholder(projects, []).find((p) => p.slug === slug);
  if (!fallback) return <NotFoundResponse />;

  const fallbackCreativeWorkJsonLd = buildCreativeWorkJsonLd(fallback, settings);
  const fallbackBreadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: fallback.title, path: `/projects/${fallback.slug}` },
  ]);

  return (
    <article className="section-pb-lg">
      <JsonLd data={fallbackCreativeWorkJsonLd} />
      <JsonLd data={fallbackBreadcrumbJsonLd} />
      <ProjectHeader category={fallback.category} title={fallback.title} intro={fallback.excerpt} />
      <section className="mx-auto max-w-3xl px-6 md:px-16">
        <p className="text-xs text-muted-foreground">
          Full project detail with content sections will render here once Sanity
          is connected.
        </p>
      </section>
    </article>
  );
}
