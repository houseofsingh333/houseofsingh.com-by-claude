import NotFound from "../not-found";

/*
 * The loading state of the catch all 404 route is the 404 page itself.
 *
 * This route only ever calls notFound(). Without a loading boundary,
 * Next.js answers with an empty error shell (no stylesheet, no fonts in the
 * HTML) and builds the page in the browser: blank with JavaScript off, and
 * the footer reflowed when the heading font arrived late. With this
 * boundary the server HTML carries the full styled page, and when the
 * browser renders the real not-found page it is identical, so nothing moves.
 */
export default function Loading() {
  return <NotFound />;
}
