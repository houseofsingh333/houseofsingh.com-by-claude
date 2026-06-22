import { sanityFetch } from "@/sanity/fetch";
import { projectBySlugQuery } from "@/sanity/queries";
import { fallbackProjects } from "@/lib/placeholder-data";
import type { ProjectDetail } from "@/lib/placeholder-data";
import {
  renderOgImage,
  coverUrlFromImage,
  OG_SIZE,
  OG_CONTENT_TYPE,
} from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "House of Singh — project";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;

  const project = await sanityFetch<ProjectDetail | null>({
    query: projectBySlugQuery,
    params: { slug },
  });

  // fallbackProjects are ProjectSummary (thumbnailSrc, no cover) — handle
  // each shape on its own so types stay precise.
  const fallback = fallbackProjects.find((p) => p.slug === slug);

  const title =
    project?.seo?.metaTitle ||
    project?.title ||
    fallback?.title ||
    "House of Singh";
  const coverUrl = project
    ? coverUrlFromImage(project.coverImage)
    : fallback?.thumbnailSrc ?? null;

  return renderOgImage({ title, coverUrl });
}
