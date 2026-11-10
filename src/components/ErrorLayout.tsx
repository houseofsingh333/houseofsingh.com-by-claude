import type { ReactNode } from "react";

/**
 * Shared editorial layout for the 404 and error pages, matching the site's
 * page headers: small uppercase label, hairline, Playfair heading, muted
 * body. Left aligned, generous spacing, palette colours only.
 */
export default function ErrorLayout({
  label,
  title,
  text,
  children,
}: {
  label: string;
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 md:px-16 page-top-offset section-pb-lg">
      <p className="type-label text-muted-foreground mb-4">
        {label}
      </p>
      <div className="w-full h-px bg-border mb-8 md:mb-10" />
      <h1 className="font-editorial font-normal text-display-xl text-foreground leading-none">
        {title}
      </h1>
      <p className="mt-8 max-w-md text-body text-muted-foreground leading-[1.7]">
        {text}
      </p>
      <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4">
        {children}
      </div>
    </section>
  );
}

/** Quiet typographic link style: uppercase label over a hairline. */
export const errorLinkClass =
  "hairline inline-block pb-1 type-label text-foreground bg-transparent cursor-pointer";
