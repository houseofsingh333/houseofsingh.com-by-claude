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
  const captionCls = "mt-3 text-xs text-muted-foreground/50 tracking-wide";

  if (preset === "allSingles") {
    return (
      <div className="flex flex-col gap-8">
        {images.map((img, i) => (
          <figure key={img.url || i}>
            <AspectImage image={img} priority={i === 0} className="overflow-hidden" />
            {img.caption && <figcaption className={captionCls}>{img.caption}</figcaption>}
          </figure>
        ))}
      </div>
    );
  }

  if (preset === "heroThenGrid") {
    const [hero, ...rest] = images;
    return (
      <div className="flex flex-col gap-8">
        <figure>
          <AspectImage image={hero} priority className="overflow-hidden" />
          {hero.caption && <figcaption className={captionCls}>{hero.caption}</figcaption>}
        </figure>
        {rest.length > 0 && (
          <div className="grid grid-cols-2 gap-5">
            {rest.map((img, i) => (
              <figure key={img.url || i}>
                <AspectImage image={img} className="overflow-hidden" />
                {img.caption && <figcaption className={captionCls}>{img.caption}</figcaption>}
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
    <div className="flex flex-col gap-8">
      {gridImages.length > 0 && (
        <div className="grid grid-cols-2 gap-5">
          {gridImages.map((img, i) => (
            <figure key={img.url || i}>
              <AspectImage image={img} priority={i === 0} className="overflow-hidden" />
              {img.caption && <figcaption className={captionCls}>{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
      <figure>
        <AspectImage image={hero} className="overflow-hidden" />
        {hero.caption && <figcaption className={captionCls}>{hero.caption}</figcaption>}
      </figure>
    </div>
  );
}

export default function StickyChapterRenderer({ section }: Props) {
  return (
    <div className="project-section sticky-chapter mx-auto max-w-7xl px-6 md:px-16">
      {/* Mobile: single column sequence — text then images */}
      <div className="md:hidden flex flex-col gap-10">
        <div className="text-sm text-muted-foreground leading-[1.9] [&>p]:mb-6 last:[&>p]:mb-0">
          <PortableText value={section.stickyText} />
        </div>
        <ChapterImages images={section.images} preset={section.layoutPreset} />
      </div>

      {/* Desktop: two-column sticky layout — text stays while images scroll */}
      <div className="hidden md:grid md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] md:gap-16 lg:gap-24 items-start">
        <div className="self-start">
          <div className="sticky top-32 text-sm md:text-[15px] text-muted-foreground leading-[1.9] [&>p]:mb-6 last:[&>p]:mb-0 pr-4">
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
