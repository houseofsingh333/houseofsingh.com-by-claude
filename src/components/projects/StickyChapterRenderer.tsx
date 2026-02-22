"use client";

import { PortableText } from "@portabletext/react";
import AspectImage from "./AspectImage";
import type { StickyChapterBlock } from "@/lib/placeholder-data";
import type { SanityImageAsset } from "@/lib/sanityImage";

type Props = { section: StickyChapterBlock };

/**
 * Renders the right-column images based on the layoutPreset:
 * - heroThenGrid: first image full width, rest in a 2-col grid
 * - gridThenHero: all-but-last in a 2-col grid, last image full width
 * - allSingles: every image full width, stacked
 */
function ChapterImages({
  images,
  preset,
}: {
  images: SanityImageAsset[];
  preset: StickyChapterBlock["layoutPreset"];
}) {
  if (preset === "allSingles") {
    return (
      <div className="flex flex-col gap-6">
        {images.map((img, i) => (
          <figure key={i}>
            <AspectImage image={img} priority={i === 0} className="overflow-hidden rounded-sm" />
            {img.caption && (
              <figcaption className="mt-2 text-xs text-muted-foreground/60">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    );
  }

  if (preset === "heroThenGrid") {
    const [hero, ...rest] = images;
    return (
      <div className="flex flex-col gap-6">
        <figure>
          <AspectImage image={hero} priority className="overflow-hidden rounded-sm" />
          {hero.caption && (
            <figcaption className="mt-2 text-xs text-muted-foreground/60">
              {hero.caption}
            </figcaption>
          )}
        </figure>
        {rest.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {rest.map((img, i) => (
              <figure key={i}>
                <AspectImage image={img} className="overflow-hidden rounded-sm" />
                {img.caption && (
                  <figcaption className="mt-2 text-xs text-muted-foreground/60">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>
    );
  }

  // gridThenHero
  const gridImages = images.slice(0, -1);
  const hero = images[images.length - 1];
  return (
    <div className="flex flex-col gap-6">
      {gridImages.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {gridImages.map((img, i) => (
            <figure key={i}>
              <AspectImage image={img} priority={i === 0} className="overflow-hidden rounded-sm" />
              {img.caption && (
                <figcaption className="mt-2 text-xs text-muted-foreground/60">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
      <figure>
        <AspectImage image={hero} className="overflow-hidden rounded-sm" />
        {hero.caption && (
          <figcaption className="mt-2 text-xs text-muted-foreground/60">
            {hero.caption}
          </figcaption>
        )}
      </figure>
    </div>
  );
}

export default function StickyChapterRenderer({ section }: Props) {
  return (
    <div className="project-section sticky-chapter mx-auto max-w-6xl px-6 md:px-0">
      {/* Mobile: single column sequence — text then images */}
      <div className="md:hidden flex flex-col gap-8">
        <div className="text-sm md:text-[15px] text-muted-foreground leading-[1.8] [&>p]:mb-6 last:[&>p]:mb-0">
          <PortableText value={section.stickyText} />
        </div>
        <ChapterImages images={section.images} preset={section.layoutPreset} />
      </div>

      {/* Desktop: two-column sticky layout */}
      <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-12 lg:gap-16 sticky-chapter-grid">
        <div className="sticky-chapter-text">
          <div className="sticky top-32 text-sm md:text-[15px] text-muted-foreground leading-[1.8] [&>p]:mb-6 last:[&>p]:mb-0">
            <PortableText value={section.stickyText} />
          </div>
        </div>
        <div>
          <ChapterImages images={section.images} preset={section.layoutPreset} />
        </div>
      </div>
    </div>
  );
}
