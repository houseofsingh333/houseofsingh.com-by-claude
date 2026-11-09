import { buildLlmsFullTxt, loadLlmsData } from "@/lib/llms";

/** Built with the site and refreshed at most hourly, like the sitemap. */
export const revalidate = 3600;

export async function GET() {
  const body = buildLlmsFullTxt(await loadLlmsData());
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
