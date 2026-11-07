import { Suspense } from "react";
import { notFound } from "next/navigation";
import NotFound from "@/app/(site)/not-found";

function CallNotFound(): never {
  notFound();
}

/**
 * Return this from a page instead of calling notFound() directly.
 *
 * Calling notFound() outside a loading boundary makes Next.js answer with an
 * empty error shell that is built in the browser: blank without JavaScript,
 * and the heading font arrives late. Here notFound() runs inside a boundary
 * whose fallback is the branded 404 page, so the server HTML is the full
 * styled page and the status is still 404. When the browser renders the real
 * not-found page it is identical, so nothing moves.
 */
export default function NotFoundResponse() {
  return (
    <Suspense fallback={<NotFound />}>
      <CallNotFound />
    </Suspense>
  );
}
