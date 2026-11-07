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

/** HTTP answers that mean "busy or briefly unavailable", worth one more try. */
const RETRY_STATUSES = new Set([429, 502, 503, 504]);

/**
 * The HTTP status Sanity answered with, and its Retry-After in ms when it
 * sent one, or null when the error carries no status (a network failure,
 * or no answer at all).
 */
function httpFailure(
  error: unknown,
): { status: number; retryAfterMs: number | null } | null {
  let e: unknown = error;
  for (let depth = 0; e && typeof e === "object" && depth < 5; depth++) {
    const err = e as {
      statusCode?: unknown;
      response?: { statusCode?: unknown; headers?: Record<string, unknown> };
      cause?: unknown;
    };
    const status =
      typeof err.statusCode === "number"
        ? err.statusCode
        : typeof err.response?.statusCode === "number"
          ? err.response.statusCode
          : null;
    if (status !== null) {
      return { status, retryAfterMs: parseRetryAfter(err.response?.headers) };
    }
    e = err.cause;
  }
  return null;
}

/** A Retry-After header (seconds, or an HTTP date) in ms, or null. */
function parseRetryAfter(headers: Record<string, unknown> | undefined): number | null {
  const raw = headers?.["retry-after"] ?? headers?.["Retry-After"];
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const value = String(raw).trim();
  if (/^\d+(\.\d+)?$/.test(value)) return Math.round(Number(value) * 1000);
  const date = Date.parse(value);
  return Number.isNaN(date) ? null : Math.max(0, date - Date.now());
}

/**
 * Whether to try again, and after how long, or null to give up now.
 * Network failures and HTTP 429, 502, 503 and 504 are retried, up to
 * twice, after 300 ms and then 900 ms; a 429 whose Retry-After fits in the
 * remaining budget waits that long instead. Every other answer (a bad
 * query, any other 4xx or 5xx) fails at once. A retry only starts when at
 * least MIN_ATTEMPT_MS of the budget would remain for it.
 */
function retryPlan(
  error: unknown,
  attempt: number,
  remainingMs: number,
): { reason: string; delay: number } | null {
  const backoff = BACKOFF_MS[attempt - 1];
  if (backoff === undefined) return null;
  const http = httpFailure(error);
  let reason: string;
  let delay = backoff;
  if (http) {
    if (!RETRY_STATUSES.has(http.status)) return null;
    reason = `HTTP ${http.status}`;
    if (http.status === 429 && http.retryAfterMs !== null && http.retryAfterMs < remainingMs) {
      delay = http.retryAfterMs;
      reason += `, Retry-After ${http.retryAfterMs} ms`;
    }
  } else {
    const code = networkFailure(error);
    if (!code) return null;
    reason = `network error, ${code}`;
  }
  return remainingMs - delay >= MIN_ATTEMPT_MS ? { reason, delay } : null;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Server side fetch helper with ISR caching (revalidates every 60 seconds by
 * default).
 *
 * Brief network failures (a reset connection, a closed socket, a timeout)
 * and "busy or briefly unavailable" answers (HTTP 429, 502, 503, 504) are
 * retried up to 2 times, after 300 ms and then 900 ms (a 429's Retry-After
 * instead, when it fits), all within one 8 second budget: each attempt only
 * gets the time that is left. Each retry is logged once on the server (it
 * shows in Vercel's logs). Every other answer, such as a bad query, any
 * other 4xx or a 500, fails at once.
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
      const plan = retryPlan(error, attempt, deadline - Date.now());
      if (plan) {
        console.warn(
          `[sanity] Request failed (${plan.reason}); retry ${attempt} of ${BACKOFF_MS.length} in ${plan.delay} ms.`,
          { query: query.slice(0, 120) },
        );
        await wait(plan.delay);
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
