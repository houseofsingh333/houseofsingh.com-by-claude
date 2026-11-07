"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import BlurUp, { blurUpImgProps } from "@/components/BlurUp";
import { sanityLoader } from "@/lib/sanityImage";
import type { InstagramPhoto } from "./InstagramPhotoPlate";

type Props = {
  photos: InstagramPhoto[];
  activeIndex: number;
  /** The rendered width of the plate, for the browser to pick a file size. */
  sizes: string;
  /** Load the first photo straight away (above the fold) instead of lazily. */
  eagerFirst?: boolean;
  /** Inline style per photo layer (the crossfade's opacity). */
  styleFor: (index: number, active: boolean) => CSSProperties;
};

/**
 * The stacked photos of an Instagram crossfade, requested through the Sanity
 * image pipeline (AVIF or WebP, about twice the displayed width).
 *
 * Only the current and the next photo are loaded at first. Each later photo
 * is added when the crossfade reaches the one before it, so it is ready when
 * it fades in. Photos stay once loaded, so the outgoing one can fade out.
 */
export default function InstagramPhotoStack({
  photos,
  activeIndex,
  sizes,
  eagerFirst = false,
  styleFor,
}: Props) {
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(
    () => new Set([0, 1].filter((i) => i < photos.length)),
  );
  const next = (activeIndex + 1) % photos.length;
  // Adding the next photo during render (not in an effect) means it is in
  // the very render that shows the current one: no extra pass, no flash.
  if (photos.length > 0 && (!loaded.has(activeIndex) || !loaded.has(next))) {
    setLoaded(new Set([...loaded, activeIndex, next]));
  }

  // Each photo sits in its own layer with its blur up preview; the
  // crossfade fades the layer, so an inactive photo's preview never shows.
  return photos.map((photo, i) =>
    loaded.has(i) ? (
      <span
        key={photo.id}
        className="instagram-plate-layer"
        style={styleFor(i, i === activeIndex)}
      >
        <BlurUp lqip={photo.lqip} />
        <Image
          loader={sanityLoader}
          src={photo.url}
          // Alt text comes from Sanity, where it is required unless the editor
          // marked the photo decorative. Photos missing it are reported at
          // build time (reportInstagramAltGaps), never given a generic stand in.
          alt={photo.isDecorative ? "" : (photo.alt ?? "")}
          fill
          sizes={sizes}
          loading={eagerFirst && i === 0 ? "eager" : "lazy"}
          className="instagram-plate-img"
          {...blurUpImgProps(photo.lqip)}
        />
      </span>
    ) : null,
  );
}
