import type { Metadata } from "next";

// Keep the Studio out of search results. robots.txt also disallows the path;
// this tag covers links to it found elsewhere (the same as next-sanity's own
// studio metadata, which sets robots noindex).
export const metadata: Metadata = {
  title: "Sanity Studio",
  robots: { index: false, follow: false },
};

/**
 * Studio layout — full-screen, no site Header/Footer.
 * The root layout still wraps this, so we override with a clean shell.
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
