import SanityImage from "@/components/SanityImage";
import type { SanityImageAsset } from "@/lib/sanityImage";

type Props = {
  image: SanityImageAsset;
  priority?: boolean;
  className?: string;
};

/**
 * Image wrapped in an aspect-ratio container to reserve space and prevent CLS.
 * Falls back to 3:2 when dimensions are unknown.
 */
export default function AspectImage({ image, priority, className }: Props) {
  const w = image.width || 1600;
  const h = image.height || 1067;

  return (
    <div
      className={className}
      style={{ position: "relative", aspectRatio: `${w} / ${h}` }}
    >
      <SanityImage image={image} context="body" fill priority={priority} className="object-cover" />
    </div>
  );
}
