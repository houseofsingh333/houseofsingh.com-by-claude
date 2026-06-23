/**
 * Shared Open Graph image renderer for detail-page `opengraph-image` /
 * `twitter-image` route conventions.
 *
 * Produces a 1200x630 PNG that composites the page's cover image as the base
 * with the title and "House of Singh" branding. When no cover is available —
 * or the cover fails to load — it degrades to a branded, text-only image on
 * the warm brand background rather than erroring.
 */

import { ImageResponse } from "next/og";
import type { SanityImage } from "@/lib/types";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const BG = "#F9F7F5";
const FG = "#221F1C"; // mirrors --foreground, hsl(30 10% 12%)
const MUTED = "#868079"; // mirrors --muted-foreground, hsl(30 5% 50%)
const BRAND = "House of Singh";

/** Pull a usable URL out of a Sanity image field (asset object or string). */
export function coverUrlFromImage(image?: SanityImage | null): string | null {
  if (!image) return null;
  const raw = typeof image === "string" ? image : image.url;
  return raw || null;
}

/** Request a 1200x630 crop from the Sanity CDN; leave other URLs untouched. */
function sizedCoverUrl(url: string): string {
  if (!url.startsWith("https://cdn.sanity.io/")) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("w", String(OG_SIZE.width));
    u.searchParams.set("h", String(OG_SIZE.height));
    u.searchParams.set("fit", "crop");
    u.searchParams.set("auto", "format");
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Fetch an image and inline it as a data URI so Satori never does its own
 * (uncatchable) network request. Returns null on any failure → caller falls
 * back to the text-only image.
 */
async function fetchImageDataUri(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) return null;
    const base64 = Buffer.from(buf).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

function BrandLabel({ onDark = false }: { onDark?: boolean }) {
  return (
    <div
      style={{
        fontSize: 26,
        letterSpacing: 6,
        textTransform: "uppercase",
        color: onDark ? "rgba(255,255,255,0.85)" : MUTED,
      }}
    >
      {BRAND}
    </div>
  );
}

function WithCover({ img, title }: { img: string; title: string }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img}
        alt=""
        width={OG_SIZE.width}
        height={OG_SIZE.height}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.82) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          bottom: 64,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: "#ffffff",
            lineHeight: 1.1,
            marginBottom: 28,
          }}
        >
          {title}
        </div>
        <BrandLabel onDark />
      </div>
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
  coverUrl,
}: {
  title: string;
  coverUrl?: string | null;
}): Promise<ImageResponse> {
  const safeTitle = title?.trim() || BRAND;

  // Only attempt to fetch http(s) covers; local/relative paths aren't
  // reliably reachable from the image route, so they fall back to text-only.
  const imageData =
    coverUrl && coverUrl.startsWith("http")
      ? await fetchImageDataUri(sizedCoverUrl(coverUrl))
      : null;

  return new ImageResponse(
    imageData ? (
      <WithCover img={imageData} title={safeTitle} />
    ) : (
      <TextOnly title={safeTitle} />
    ),
    { ...OG_SIZE },
  );
}
