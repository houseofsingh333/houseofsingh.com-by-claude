"use client";

import { PortableText, type PortableTextComponents } from "@portabletext/react";
import SanityImage from "@/components/SanityImage";
import { proseComponents } from "@/components/proseComponents";
import { MONTH_NAMES, dateParts, type JournalEntryFull } from "@/lib/journalRoom";
import type { SanityImageAsset } from "@/lib/sanityImage";

type Props = {
  entry: JournalEntryFull;
  /** The entry the page is about (/journal/[slug]): its title is the page's h1. */
  isPageHeading: boolean;
  /** The entry in view: its day numeral turns brass. */
  current: boolean;
  /** The page's largest paint: load the photograph at once. */
  priority: boolean;
};

/** An image's alt text: empty only when marked decorative in Sanity. */
function altOf(image: SanityImageAsset, title: string): string {
  return image.isDecorative ? "" : image.alt?.trim() || title;
}

/** Further photographs inside the text, through the shared prose renderer. */
function bodyComponents(title: string): PortableTextComponents {
  return {
    ...proseComponents,
    types: {
      image: ({ value }: { value: SanityImageAsset }) =>
        value?.url ? (
          <figure className="jr-text-figure">
            <SanityImage image={value} context="body" alt={altOf(value, title)} sizes="(min-width: 1024px) 420px, 100vw" />
            {value.caption && <figcaption>{value.caption}</figcaption>}
          </figure>
        ) : null,
    },
  };
}

/**
 * One journal entry in the reading room (frames J4 and Phone B): the large
 * day numeral (brass while the entry is in view) with month and year, the
 * title, then the photograph (4:5, about 340px wide on desktop) with the
 * note and the full text beside it, aligned to its lower edge. Photographs
 * from the body follow within the text. The photograph develops as it
 * arrives (SanityImage, styles/motion.css).
 */
export default function Entry({ entry, isPageHeading, current, priority }: Props) {
  const { year, month, day } = dateParts(entry.date);
  const Title = isPageHeading ? "h1" : "h2";
  const cover = entry.coverImage?.url ? entry.coverImage : null;
  const hasBody = !!entry.body?.length;
  return (
    <article
      id={`entry-${entry.slug}`}
      className="jr-entry"
      data-slug={entry.slug}
      data-current={current ? "" : undefined}
      aria-labelledby={`entry-title-${entry.slug}`}
      tabIndex={-1}
    >
      <p className="jr-entry-date">
        <time dateTime={entry.date}>
          <span className="jr-entry-day">{String(day).padStart(2, "0")}</span>
          <span className="jr-entry-my">
            {MONTH_NAMES[month - 1]} {year}
          </span>
        </time>
      </p>
      <Title id={`entry-title-${entry.slug}`} className="jr-entry-title">
        {entry.title}
      </Title>
      <div className="jr-entry-body" data-photo={cover ? "" : undefined}>
        {cover && (
          <figure className="jr-entry-photo">
            <SanityImage
              image={cover}
              context="body"
              alt={altOf(cover, entry.title)}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 340px, calc(100vw - 48px)"
              className="object-cover"
              objectPosition={cover.hotspot ? `${Math.round(cover.hotspot.x * 1000) / 10}% ${Math.round(cover.hotspot.y * 1000) / 10}%` : undefined}
            />
          </figure>
        )}
        <div className="jr-entry-text">
          {entry.excerpt && <p className="jr-note">{entry.excerpt}</p>}
          {hasBody && (
            <div className="jr-text">
              <PortableText value={entry.body!} components={bodyComponents(entry.title)} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
