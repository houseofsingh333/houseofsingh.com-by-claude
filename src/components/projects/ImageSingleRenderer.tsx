import AspectImage from "./AspectImage";
import type { ImageSingleBlock } from "@/lib/placeholder-data";

type Props = { section: ImageSingleBlock };

const sizeClasses: Record<string, string> = {
  full: "w-full",
  large: "mx-auto max-w-6xl px-6 md:px-16",
  medium: "mx-auto max-w-4xl px-6 md:px-16",
};

export default function ImageSingleRenderer({ section }: Props) {
  return (
    <figure className={`project-section ${sizeClasses[section.size] || sizeClasses.large}`}>
      <AspectImage image={section.image} className="overflow-hidden" />
      {section.caption?.trim() && (
        <figcaption className="mt-4 text-xs text-muted-foreground/50 text-center tracking-wide">
          {section.caption}
        </figcaption>
      )}
    </figure>
  );
}
