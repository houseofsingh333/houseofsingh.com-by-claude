import AspectImage from "./AspectImage";
import type { ImagePairBlock } from "@/lib/placeholder-data";

type Props = { section: ImagePairBlock };

export default function ImagePairRenderer({ section }: Props) {
  const isSideBySide = section.layout === "sideBySide";

  return (
    <div
      className={`project-section mx-auto max-w-6xl px-6 md:px-16 ${
        isSideBySide ? "grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8" : "flex flex-col gap-5 md:gap-8"
      }`}
    >
      {section.images.map((img, i) => (
        <figure key={img.url || i}>
          <AspectImage image={img} className="overflow-hidden" />
          {img.caption?.trim() && (
            <figcaption className="mt-3 text-xs text-muted-foreground/50 tracking-wide">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
