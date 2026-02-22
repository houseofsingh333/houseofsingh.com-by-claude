import AspectImage from "./AspectImage";
import type { ImagePairBlock } from "@/lib/placeholder-data";

type Props = { section: ImagePairBlock };

export default function ImagePairRenderer({ section }: Props) {
  const isSideBySide = section.layout === "sideBySide";

  return (
    <div
      className={`project-section mx-auto max-w-5xl px-6 md:px-0 ${
        isSideBySide ? "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" : "flex flex-col gap-4 md:gap-6"
      }`}
    >
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
