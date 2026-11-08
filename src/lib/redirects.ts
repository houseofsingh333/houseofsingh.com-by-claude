import { permanentRedirect, redirect } from "next/navigation";
import { sanityFetch } from "@/sanity/fetch";
import { redirectQuery } from "@/sanity/queries";

/**
 * Before showing "page not found": if the address has a Redirect in the
 * Studio (an old address leading somewhere else), go there instead. Matches
 * the address with and without a trailing slash; a Sanity failure leaves
 * the 404 as it is.
 */
export async function followRedirect(path: string): Promise<void> {
  const clean = path.replace(/[?#].*$/, "").replace(/\/+$/, "") || "/";
  let hit: { to?: string | null; permanent?: boolean | null } | null = null;
  try {
    hit = await sanityFetch<{ to?: string | null; permanent?: boolean | null } | null>({ query: redirectQuery, params: { paths: [clean, `${clean}/`] } });
  } catch {
    return;
  }
  const to = hit?.to?.trim();
  if (!to || to === clean) return;
  if (hit?.permanent === false) redirect(to);
  permanentRedirect(to);
}
