import { notFound } from "next/navigation";

/*
 * Catches every URL no other route matches and serves the public site's
 * not-found page, (site)/not-found.tsx, inside the site layout (header and
 * footer), with a real 404 status. Without it, unmatched URLs would use the
 * root not-found page, which sits outside the site layout.
 *
 * generateStaticParams returns no paths but makes this a prerendered (ISR)
 * route, like the journal and project pages. Next.js then renders each
 * unknown URL fully before responding, so notFound() sets a true 404. As a
 * plain on demand route it would start streaming, and (site)/loading.tsx
 * would lock the status at 200.
 */
export function generateStaticParams(): { notFound: string[] }[] {
  return [];
}

export default function CatchAllNotFound() {
  notFound();
}
