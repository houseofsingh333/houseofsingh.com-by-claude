import { client } from "./client";
import { placeholdersEnabled } from "@/lib/placeholders";

/** Total time a single sanityFetch may take, retries included. */
const BUDGET_MS = 8000;
/** Waits before the second and third attempts. */
const BACKOFF_MS = [300, 900];
/** A retry is only worth starting with at least this much budget left. */
const MIN_ATTEMPT_MS = 1000;

/** Error codes of brief network failures, worth one more try. */
const NETWORK_CODES = new Set([
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "ECONNABORTED",
  "EPIPE",
  "EAI_AGAIN",
  "ENETUNREACH",
  "EHOSTUNREACH",
  "UND_ERR_SOCKET",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_BODY_TIMEOUT",
  "UND_ERR_CLOSED",
]);

/**
 * The network code behind an error, or null when it is not a network
 * failure. Inside Next.js, Sanity requests go through fetch, which reports
 * a dropped connection as a bare "fetch failed" TypeError with the real
 * code (ECONNRESET, a closed socket, a timeout) on its cause, so the whole
 * cause chain is checked. Anything Sanity actually answered (an HTTP
 * status, such as 400 for a bad query or 404) is never a network failure.
 */
function networkFailure(error: unknown): string | null {
  let e: unknown = error;
  for (let depth = 0; e && typeof e === "object" && depth < 5; depth++) {
    const err = e as {
      code?: unknown;
      statusCode?: unknown;
      response?: unknown;
      message?: unknown;
      cause?: unknown;
    };
    if (err.statusCode !== undefined || err.response !== undefined) return null;
    if (typeof err.code === "string" && NETWORK_CODES.has(err.code)) return err.code;
    if (typeof err.message === "string") {
      if (/socket hang up|other side closed|socket closed/i.test(err.message)) {
        return "socket closed";
      }
      if (/request timed out|timeout/i.test(err.message)) return "timeout";
    }
    e = err.cause;
  }
  // "fetch failed" with no recognisable cause is still a network failure.
  return error instanceof TypeError && /fetch failed/i.test(error.message)
    ? "fetch failed"
    : null;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Server side fetch helper with ISR caching (revalidates every 60 seconds by
 * default).
 *
 * Brief network failures (a reset connection, a closed socket, a timeout)
 * are retried up to 2 times, after 300 ms and then 900 ms, all within one
 * 8 second budget: each attempt only gets the time that is left. Each retry
 * is logged once on the server (it shows in Vercel's logs). Errors Sanity
 * answered, such as a bad query or a 4xx, are never retried.
 *
 * If every attempt fails this THROWS. That is deliberate: when a background
 * revalidation throws, Next.js keeps serving the last successfully rendered
 * page, so visitors keep seeing real content and never a cached placeholder.
 * At build time a failure fails the build, which is safer than deploying
 * placeholder content.
 *
 * It returns null only when Sanity answered successfully with no document,
 * or when local placeholders are explicitly enabled (see placeholders.ts).
 *
 * Usage in a server component:
 *   const data = await sanityFetch<MyType>({ query, params });
 */
export async function sanityFetch<T>({
  query,
  params = {},
  revalidate = 60,
}: {
  query: string;
  params?: Record<string, unknown>;
  revalidate?: number | false;
}): Promise<T | null> {
  if (!client) {
    if (placeholdersEnabled) return null;
    throw new Error(
      "[sanity] Sanity is not configured: NEXT_PUBLIC_SANITY_PROJECT_ID is missing.",
    );
  }

  const deadline = Date.now() + BUDGET_MS;
  for (let attempt = 1; ; attempt++) {
    try {
      return await client.fetch<T>(query, params, {
        next: { revalidate },
        timeout: Math.max(1, deadline - Date.now()),
        // A retry needs its own address: within one render Next.js
        // memoises identical fetches, so an unchanged retry would get the
        // failed attempt back without a new request. The tag also marks
        // retries in Sanity's request logs.
        ...(attempt > 1 ? { tag: `retry-${attempt}` } : {}),
      });
    } catch (error) {
      const code = networkFailure(error);
      const backoff = BACKOFF_MS[attempt - 1];
      if (
        code &&
        backoff !== undefined &&
        deadline - Date.now() - backoff >= MIN_ATTEMPT_MS
      ) {
        console.warn(
          `[sanity] Network error (${code}); retry ${attempt} of ${BACKOFF_MS.length} in ${backoff} ms.`,
          { query: query.slice(0, 120) },
        );
        await wait(backoff);
        continue;
      }
      if (placeholdersEnabled) {
        console.warn("[sanity] Request failed; using local placeholders.", error);
        return null;
      }
      console.error("[sanity] Request failed.", {
        query: query.slice(0, 120),
        params,
        attempts: attempt,
        error,
      });
      throw new Error("[sanity] Request failed.", { cause: error });
    }
  }
}
