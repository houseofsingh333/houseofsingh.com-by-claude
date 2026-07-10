import AspectImage from "./AspectImage";
import Caption from "./Caption";
import { hasImageAsset } from "@/lib/sanityImage";
import type { FullWidthImageBlock } from "@/lib/placeholder-data";

type Props = { section: FullWidthImageBlock };

export default function FullWidthImageRenderer({ section }: Props) {
  if (!hasImageAsset(section.image)) return null;
  return (
    <figure className="project-section mx-auto max-w-5xl px-6 md:px-16">
      <AspectImage image={section.image} className="overflow-hidden" />
      <Caption text={section.image.caption} />
    </figure>
  );
}
