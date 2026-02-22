import AspectImage from "./AspectImage";
import type { ImageSingleBlock } from "@/lib/placeholder-data";

type Props = { section: ImageSingleBlock };

const sizeClasses: Record<string, string> = {
  full: "w-full",
  large: "mx-auto max-w-5xl px-6 md:px-0",
  medium: "mx-auto max-w-3xl px-6 md:px-0",
};

export default function ImageSingleRenderer({ section }: Props) {
  return (
    <figure className={`project-section ${sizeClasses[section.size] || sizeClasses.large}`}>
      <AspectImage image={section.image} className="overflow-hidden rounded-sm" />
      {section.caption && (
        <figcaption className="mt-3 text-xs text-muted-foreground/60 text-center">
          {section.caption}
        </figcaption>
      )}
    </figure>
  );
}
