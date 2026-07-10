import { PortableText } from "@portabletext/react";
import { proseComponents } from "@/components/proseComponents";
import AspectImage from "./AspectImage";
import Caption from "./Caption";
import { hasImageAsset } from "@/lib/sanityImage";
import type { TextWithImageBlock } from "@/lib/placeholder-data";

type Props = { section: TextWithImageBlock };

export default function TextWithImageRenderer({ section }: Props) {
  const imageLeft = section.side === "imageLeft";

  // No usable image — fall back to text set on its own, full column.
  if (!hasImageAsset(section.image)) {
    return (
      <div className="project-section mx-auto max-w-3xl px-6 md:px-16">
        <div className="text-sm md:text-[15px] text-muted-foreground leading-[1.9]">
          <PortableText value={section.body} components={proseComponents} />
        </div>
      </div>
    );
  }

  return (
    <div className="project-section mx-auto max-w-6xl px-6 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <figure className={imageLeft ? "md:order-1" : "md:order-2"}>
          <AspectImage image={section.image} className="overflow-hidden" />
          <Caption text={section.image.caption} />
        </figure>
        <div
          className={`text-sm md:text-[15px] text-muted-foreground leading-[1.9] ${
            imageLeft ? "md:order-2" : "md:order-1"
          }`}
        >
          <PortableText value={section.body} components={proseComponents} />
        </div>
      </div>
    </div>
  );
}
