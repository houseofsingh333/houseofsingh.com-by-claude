import { indexNowKey } from "@/lib/indexnow";

/** Read at request time, so a key added in Vercel is served after the next deploy. */
export const dynamic = "force-dynamic";

/** The IndexNow key file: the key alone, or 404 when no key is set. */
export function GET() {
  const key = indexNowKey();
  if (!key) return new Response("Not found", { status: 404 });
  return new Response(key, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
