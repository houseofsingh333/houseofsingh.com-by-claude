import SanityImage from "@/components/SanityImage";
import { hasImageAsset } from "@/lib/sanityImage";
import type { JournalEntry } from "@/lib/types";

/**
 * A journal article's cover: a fixed 4:5 portrait box for a consistent look
 * across every entry, with its caption when the cover carries one. Nothing
 * when the entry has no cover image.
 */
export default function EntryCover({ entry }: { entry: JournalEntry }) {
  if (!hasImageAsset(entry.coverImage)) return null;
  const caption =
    entry.coverImage && typeof entry.coverImage === "object"
      ? entry.coverImage.caption
      : undefined;
  return (
    <figure className="mb-10 lg:mb-0">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
        <SanityImage
          image={entry.coverImage}
          context="hero"
          alt={entry.title}
          priority
          fill
          className="object-cover"
        />
      </div>
      {caption && (
        <figcaption className="text-xs text-muted-foreground mt-3">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
