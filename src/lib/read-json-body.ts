import { NextResponse } from "next/server";

/** Largest form submission accepted. Real submissions are a few KB. */
export const MAX_BODY_BYTES = 64 * 1024;

type Result =
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; response: NextResponse };

const tooLarge = () =>
  NextResponse.json(
    { error: "That submission is too large. Please shorten it and try again." },
    { status: 413 },
  );

const malformed = () =>
  NextResponse.json(
    { error: "The submission could not be read. Please try again." },
    { status: 400 },
  );

/**
 * Reads a JSON object body safely for the form routes.
 *
 * - Over MAX_BODY_BYTES: 413, checked from Content-Length first and then
 *   while streaming, so a body is never buffered or parsed past the limit.
 * - Not valid JSON, or JSON that is not a plain object: 400 (previously
 *   these fell through to a 500).
 */
export async function readJsonBody(request: Request): Promise<Result> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return { ok: false, response: tooLarge() };
  }

  if (!request.body) return { ok: false, response: malformed() };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > MAX_BODY_BYTES) {
      await reader.cancel();
      return { ok: false, response: tooLarge() };
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return { ok: false, response: malformed() };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, response: malformed() };
  }
  return { ok: true, body: parsed as Record<string, unknown> };
}
