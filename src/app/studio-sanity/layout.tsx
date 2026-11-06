import type { Metadata } from "next";

// Keep the Studio out of search results. robots.txt also disallows the path;
// this tag covers links to it found elsewhere (the same as next-sanity's own
// studio metadata, which sets robots noindex).
export const metadata: Metadata = {
  title: "Sanity Studio",
  robots: { index: false, follow: false },
};

/**
 * Studio layout: a bare, full screen shell for the Sanity Studio.
 *
 * The Studio sits outside the (site) route group, so it gets only the root
 * document shell (html, body, fonts and global CSS). The site header, footer,
 * page transition, intro video, newsletter popup, structured data and Speed
 * Insights all live in src/app/(site)/layout.tsx and never render here.
 */
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100]">
      {children}
    </div>
  );
}
