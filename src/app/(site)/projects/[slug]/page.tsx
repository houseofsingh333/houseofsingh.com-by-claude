import type { Metadata } from "next";
import { pageShareImages, routeShareImages } from "@/lib/share-metadata";
import { alt as projectShareAlt } from "@/app/projects/[slug]/opengraph-image";
import NotFoundResponse from "@/components/NotFoundResponse";
import { toIsoTimestamp } from "@/lib/dates";
import { sanityFetch } from "@/sanity/fetch";
import { devPlaceholder } from "@/lib/placeholders";
import {
  projectBySlugQuery,
  projectLinksQuery,
  projectsListQuery,
  siteSettingsQuery,
  spotlightQuery,
} from "@/sanity/queries";
import { fallbackProjects as projects } from "@/lib/placeholder-data";
import type {
  ProjectDetail,
  ProjectLink,
  SiteSettings,
  SpotlightLink,
} from "@/lib/types";
import ScrollReveal from "@/components/ScrollReveal";
import { projectHeroImage } from "@/lib/projectHero";
import ProjectHero from "@/components/projects/ProjectHero";
import ProjectTitle from "@/components/projects/ProjectTitle";
import NextProject from "@/components/projects/NextProject";
import {
  PAGE_COLUMN,
  READING_COLUMN,
  STORY_TEXT,
} from "@/components/projects/story";
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

const DEFAULT_DESCRIPTION = "A project by Maninder Singh.";

/** The homepage spotlight, which an upcoming project may use as its hero. */
function getSpotlight() {
  return sanityFetch<SpotlightLink | null>({ query: spotlightQuery });
}

// Share images: the page's hero photo from the Sanity CDN (1200x630 JPEG)
// when there is one, otherwise the generated branded card from the
// opengraph-image and twitter-image routes in src/app/projects/[slug]/. Those
// routes sit outside the (site) route group so their URLs carry no hash
// suffix, and pageShareImages links them explicitly.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [project, spotlight] = await Promise.all([
    sanityFetch<ProjectDetail>({
      query: projectBySlugQuery,
      params: { slug },
    }),
    getSpotlight(),
  ]);

  if (project) {
    const title = normalizeTitle(project.seo?.metaTitle || project.title);
    const share = pageShareImages({
      path: `/projects/${slug}`,
      cover: projectHeroImage(project, spotlight).image,
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

/** The project after this one in the projects page's order, wrapping round. */
function nextProject(links: ProjectLink[] | null, slug: string): ProjectLink | null {
  if (!links || links.length < 2) return null;
  const i = links.findIndex((p) => p.slug === slug);
  return i === -1 ? null : links[(i + 1) % links.length];
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;

  const [project, settings, spotlight, links] = await Promise.all([
    sanityFetch<ProjectDetail>({
      query: projectBySlugQuery,
      params: { slug },
    }),
    sanityFetch<SiteSettings | null>({ query: siteSettingsQuery }),
    getSpotlight(),
    sanityFetch<ProjectLink[] | null>({ query: projectLinksQuery }),
  ]);

  // Sanity data available — render full project
  if (project) {
    const creativeWorkJsonLd = buildCreativeWorkJsonLd(project, settings);
    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Projects", path: "/projects" },
      { name: project.title, path: `/projects/${project.slug}` },
    ]);
    const hero = projectHeroImage(project, spotlight);
    const next = nextProject(links, project.slug);
    const intro = project.shortIntro?.trim();

    return (
      <article className="section-pb-lg">
        <JsonLd data={creativeWorkJsonLd} />
        <JsonLd data={breadcrumbJsonLd} />
        <ReadingProgress />

        {/* 1. Hero: cover, else thumbnail; upcoming: the spotlight image. */}
        <ProjectHero image={hero.image} />

        {/* 2. Title block */}
        <ProjectTitle
          title={project.title}
          category={project.category}
          year={project.year}
          isUpcoming={project.isUpcoming}
        />

        {/* 3. Story: the intro, then the editor's blocks in their order. */}
        {intro && (
          <ScrollReveal className={`${PAGE_COLUMN} pt-12 md:pt-16`}>
            <p className={`${READING_COLUMN} ${STORY_TEXT}`}>{intro}</p>
          </ScrollReveal>
        )}
        {project.contentSections && project.contentSections.length > 0 && (
          <div className="pt-(--section-space-md)">
            <ContentSections sections={project.contentSections} />
          </div>
        )}

        {/* 4. Upcoming projects: the interest form, after the story. */}
        {project.showInterestForm && (
          <ProjectInterestForm projectTitle={project.title} />
        )}

        {/* 5. Next project, wrapping from the last to the first. */}
        {next && <NextProject project={next} />}
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
      <ProjectHero image={null} />
      <ProjectTitle title={fallback.title} category={fallback.category} />
      <div className={`${PAGE_COLUMN} pt-12`}>
        <p className="text-xs text-muted-foreground">
          Full project detail with content sections will render here once Sanity
          is connected.
        </p>
      </div>
    </article>
  );
}
