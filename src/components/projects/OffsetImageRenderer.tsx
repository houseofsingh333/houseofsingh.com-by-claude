import AspectImage from "./AspectImage";
import Caption from "./Caption";
import { hasImageAsset } from "@/lib/sanityImage";
import type { OffsetImageBlock } from "@/lib/placeholder-data";

type Props = { section: OffsetImageBlock };

/**
 * An asymmetric beat: the image occupies two-thirds, offset to one side, with
 * optional short text set beside it in the remaining third. Degrades to
 * text-only (or nothing) when the image has no usable asset.
 */
export default function OffsetImageRenderer({ section }: Props) {
  const imageLeft = section.side === "left";
  const hasText = !!section.text?.trim();
  const hasImage = hasImageAsset(section.image);

  if (!hasImage) {
    if (!hasText) return null;
    return (
      <div className="project-section mx-auto max-w-3xl px-6 md:px-16">
        <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.9] whitespace-pre-line">
          {section.text}
        </p>
      </div>
    );
  }

  return (
    <div className="project-section mx-auto max-w-6xl px-6 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
        <figure
          className={`md:col-span-8 ${imageLeft ? "md:order-1" : "md:order-2"}`}
        >
          <AspectImage image={section.image} className="overflow-hidden" />
          <Caption text={section.image.caption} />
        </figure>
        {hasText && (
          <div
            className={`md:col-span-4 ${imageLeft ? "md:order-2" : "md:order-1"}`}
          >
            <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.9] whitespace-pre-line">
              {section.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
