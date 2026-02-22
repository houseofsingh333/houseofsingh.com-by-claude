import AspectImage from "./AspectImage";
import type { ImageGridBlock } from "@/lib/placeholder-data";

type Props = { section: ImageGridBlock };

export default function ImageGridRenderer({ section }: Props) {
  const cols = section.layout === "3col" ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <div className={`project-section mx-auto max-w-5xl px-6 md:px-0 grid grid-cols-1 ${cols} gap-4 md:gap-6`}>
      {section.images.map((img, i) => (
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
  );
}
