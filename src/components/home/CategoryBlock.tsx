"use client";

import Link from "next/link";
import PreviewMedia from "./PreviewMedia";

type ImageItem = {
  url: string;
  alt?: string;
  lqip?: string;
};

type Props = {
  title: string;
  href: string;
  gifUrl?: string | null;
  images?: ImageItem[] | null;
};

/**
 * A single category block for the mobile homepage Projects section.
 *
 * Renders:
 *   A. Header row — title (left) + "View →" (right), fully clickable Link.
 *   B. Image preview — GIF (priority) or crossfading image array.
 *
 * The header row retains the existing `projects-mobile-link` sticky + underline
 * interaction. The image area scrolls naturally and never blocks tap targets.
 */
export default function CategoryBlock({
  title,
  href,
  gifUrl,
  images,
}: Props) {
  return (
    <>
      {/* ── A. Header row — fully clickable ── */}
      <Link href={href} className="projects-mobile-link">
        <span className="projects-mobile-title text-[15px] font-normal tracking-wide">
          {title}
        </span>
        <span className="projects-mobile-arrow inline-flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-muted-foreground/50">
          <span>View</span>
          <span>→</span>
        </span>
      </Link>

      {/* ── B. Image preview area ── */}
      <PreviewMedia
        title={title}
        gifUrl={gifUrl}
        images={images}
        interval={6000}
        fadeDuration="1.5s"
        className="relative aspect-[3/2] overflow-hidden"
      />
    </>
  );
}
