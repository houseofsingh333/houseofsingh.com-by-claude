/**
 * "Have an early access code?" (the fallback for an early access link that
 * did not arrive or was copied without its code): a quiet line like Notify
 * me. A plain GET form to /api/editions/access, so it works without
 * JavaScript; a code that opens nothing comes back with ?code=wrong.
 */
export default function EarlyAccessForm({ wrong }: { wrong: boolean }) {
  return (
    <form id="early-access" action="/api/editions/access" method="get" className="ed-code ed-anchor" aria-describedby={wrong ? "ed-code-error" : undefined}>
      <label htmlFor="ed-code-field" className="type-label text-muted-foreground">
        Have an early access code?
      </label>
      <div className="ed-code-line">
        <input
          id="ed-code-field"
          name="code"
          required
          minLength={8}
          maxLength={64}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={wrong || undefined}
          placeholder="Your code"
        />
        <button type="submit" className="ed-code-btn">
          <span>Open</span>
          <span aria-hidden="true" className="ed-code-arrow">
            {"→"}
          </span>
        </button>
      </div>
      {wrong && (
        <p id="ed-code-error" role="alert" className="ed-buy-message">
          That code does not open this Collection. Check it against your invitation.
        </p>
      )}
    </form>
  );
}
