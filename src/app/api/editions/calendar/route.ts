import { loadCollections } from "@/lib/editions/load";
import { releaseIcs } from "@/lib/editions/release";
import { pad2 } from "@/lib/editions/format";
import { editionsAllowed, editionsOff } from "@/lib/editions/enabled";

/**
 * "Add to my calendar": the current Collection's release as a calendar
 * file (one hour from the moment it opens to everyone, with the Shop's
 * address), for any calendar app. Available wherever the sealed Shop is.
 */
export async function GET(request: Request) {
  if (!(await editionsAllowed("any"))) return editionsOff();
  const current = (await loadCollections())[0];
  if (!current?.opens) return editionsOff();
  const origin = new URL(request.url).origin;
  return new Response(releaseIcs(current, origin), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="house-of-singh-editions-collection-${pad2(current.number)}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
