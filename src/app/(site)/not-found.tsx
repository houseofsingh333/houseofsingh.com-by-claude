import Link from "next/link";
import SanityImage from "@/components/SanityImage";
import { hasImageAsset } from "@/lib/sanityImage";
import { sanityFetch } from "@/sanity/fetch";
import { notFoundQuery } from "@/sanity/queries";
import type { SanityImage as SanityImageData } from "@/lib/types";

type NotFoundData = {
  image?: SanityImageData | null;
  latest?: { title?: string | null; slug?: string | null } | null;
  projects?: number | null;
};

const NUMBERS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

/** "Four projects", "One project", or "12 projects". */
function projectCount(n: number): string {
  const word = NUMBERS[n] ?? String(n);
  return `${word} project${n === 1 ? "" : "s"}`;
}

/**
 * The page not found (404): a photograph on the left (Site Settings, else
 * the Range day journal photograph), then "This page has wandered off.",
 * one line, and three ways back: the latest journal entry, the work, home.
 * The status stays 404 (NotFoundResponse and the catch all route). If
 * Sanity cannot be reached, the page still renders, with plain links.
 */
export default async function NotFound() {
  let data: NotFoundData | null = null;
  try {
    data = await sanityFetch<NotFoundData>({ query: notFoundQuery });
  } catch {
    data = null;
  }
  const latest = data?.latest?.slug ? data.latest : null;
  const ways = [
    latest
      ? { href: `/journal/${latest.slug}`, label: "The latest entry", note: latest.title ?? "" }
      : { href: "/journal", label: "The journal", note: "" },
    { href: "/projects", label: "The work", note: data?.projects ? projectCount(data.projects) : "" },
    { href: "/", label: "Home", note: "Start again" },
  ];

  return (
    <section className="lost px-6 md:px-16 page-top-offset section-pb">
      <div className="lost-text">
        <p className="text-[13px] tracking-[0.14em] uppercase text-muted-foreground">404</p>
        <h1 className="font-editorial font-normal text-[40px] md:text-[60px] leading-[1.05] text-foreground">
          This page has wandered off.
        </h1>
        <p className="max-w-[420px] text-[16px] md:text-[17px] leading-[1.7] text-muted-foreground">
          The page you were looking for has moved or no longer exists.
        </p>
        <nav aria-label="Ways back" className="lost-ways">
          {ways.map((w) => (
            <Link key={w.href} href={w.href} className="lost-way">
              <span className="font-editorial text-[22px] md:text-[24px] leading-[1.2]">{w.label}</span>
              {w.note && <span className="text-[13px] text-muted-foreground text-right">{w.note}</span>}
            </Link>
          ))}
        </nav>
      </div>
      {hasImageAsset(data?.image) && (
        <div className="lost-photo">
          <SanityImage
            image={data.image}
            context="body"
            fill
            sizes="(min-width: 1024px) 480px, 100vw"
            className="object-cover"
          />
        </div>
      )}
    </section>
  );
}
