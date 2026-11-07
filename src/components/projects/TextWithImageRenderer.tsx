import { PortableText } from "@portabletext/react";
import { proseComponents } from "@/components/proseComponents";
import AspectImage from "./AspectImage";
import Caption from "./Caption";
import { hasImageAsset } from "@/lib/sanityImage";
import type { TextWithImageBlock } from "@/lib/types";
import { PAGE_COLUMN, READING_COLUMN, STORY_TEXT } from "./story";

type Props = { section: TextWithImageBlock };

export default function TextWithImageRenderer({ section }: Props) {
  const imageLeft = section.side === "imageLeft";

  // No usable image — fall back to text set on its own, full column.
  if (!hasImageAsset(section.image)) {
    return (
      <div className={`project-section ${PAGE_COLUMN}`}>
        <div className={`${READING_COLUMN} ${STORY_TEXT}`}>
          <PortableText value={section.body} components={proseComponents} />
        </div>
      </div>
    );
  }

  return (
    <div className="project-section mx-auto max-w-5xl px-6 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <figure className={imageLeft ? "md:order-1" : "md:order-2"}>
          <AspectImage image={section.image} className="overflow-hidden" />
          <Caption text={section.image.caption} />
        </figure>
        <div
          className={`${STORY_TEXT} ${
            imageLeft ? "md:order-2" : "md:order-1"
          }`}
        >
          <PortableText value={section.body} components={proseComponents} />
        </div>
      </div>
    </div>
  );
}
