/**
 * Shared Open Graph image renderer for the `opengraph-image` and
 * `twitter-image` routes.
 *
 * Journal entries and projects with a cover photo share that photo straight
 * from the Sanity CDN (see pageShareImages in share-metadata.ts), so this
 * card is only for pages without one: the home page, listings, utility pages
 * and entries without a cover. It is a 1200x630 branded, text only PNG on
 * the warm canvas, with flat colour so the file stays small.
 */

import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const BG = "#F9F7F5";
const FG = "#221F1C"; // mirrors --foreground, hsl(30 10% 12%)
const MUTED = "#76706B"; // mirrors --muted-foreground, hsl(30 5% 44%)
const BRAND = "House of Singh";

function BrandLabel() {
  return (
    <div
      style={{
        fontSize: 26,
        letterSpacing: 6,
        textTransform: "uppercase",
        color: MUTED,
      }}
    >
      {BRAND}
    </div>
  );
}

function TextOnly({ title }: { title: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BG,
        padding: 80,
      }}
    >
      <BrandLabel />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ width: 80, height: 2, background: FG, marginBottom: 36 }} />
        <div
          style={{
            fontSize: 72,
            fontWeight: 600,
            color: FG,
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}

export async function renderOgImage({
  title,
}: {
  title: string;
}): Promise<ImageResponse> {
  const safeTitle = title?.trim() || BRAND;
  return new ImageResponse(<TextOnly title={safeTitle} />, { ...OG_SIZE });
}
