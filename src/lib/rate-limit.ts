/**
 * Lightweight in-memory IP rate limiter.
 *
 * State lives in the Node.js process memory of a single serverless instance.
 * It resets on cold start / redeploy and is NOT shared across instances or
 * regions. This is a best-effort first layer to blunt casual abuse with zero
 * external dependencies. For durable, cross-instance limits, swap the store
 * for a persistent backend (e.g. Upstash Redis or Vercel KV).
 */

type Hit = { count: number; resetAt: number };

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5; // per window, per IP

/** Module-level store survives between requests on a warm instance. */
const store = new Map<string, Hit>();

/** Drop expired entries so the map doesn't grow unbounded on busy instances. */
function sweep(now: number) {
  for (const [key, hit] of store) {
    if (hit.resetAt <= now) store.delete(key);
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Seconds the caller should wait before retrying (0 when allowed). */
  retryAfterSeconds: number;
}

/**
 * Records a hit for `identifier` and reports whether it is within the limit.
 *
 * @param identifier  Usually the client IP.
 * @param options     Optional overrides for max requests and window length.
 */
export function rateLimit(
  identifier: string,
  {
    max = MAX_REQUESTS,
    windowMs = WINDOW_MS,
  }: { max?: number; windowMs?: number } = {},
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(identifier);

  // New window (first hit, or the previous window has expired).
  if (!existing || existing.resetAt <= now) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    if (store.size > 5000) sweep(now);
    return { success: true, limit: max, remaining: max - 1, retryAfterSeconds: 0 };
  }

  // Within an active window but over the limit.
  if (existing.count >= max) {
    return {
      success: false,
      limit: max,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  // Within an active window and under the limit.
  existing.count += 1;
  return {
    success: true,
    limit: max,
    remaining: max - existing.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Best-guess client IP from proxy headers. On Vercel the originating client
 * is the first entry of `x-forwarded-for`.
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
