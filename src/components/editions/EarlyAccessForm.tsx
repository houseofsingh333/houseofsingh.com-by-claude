/**
 * "Have an early access code?" (the fallback for an early access link that
 * did not arrive or was copied without its code): a quiet text link that
 * opens the field in place (Shop design round 1), so Notify me stays the
 * only visible form. A native disclosure, so it opens without JavaScript;
 * the form is a plain GET to /api/editions/access. A code that opens
 * nothing comes back with ?code=wrong, and the field is shown open with
 * the reason.
 */
export default function EarlyAccessForm({ wrong }: { wrong: boolean }) {
  return (
    <details className="ed-code-reveal ed-anchor" id="early-access" open={wrong || undefined}>
      <summary className="text-link ed-code-summary">
        <span className="text-link-text">Have an early access code?</span>
        <span aria-hidden="true" className="text-link-arrow">
          {"→"}
        </span>
      </summary>
      <form action="/api/editions/access" method="get" className="ed-code" aria-describedby={wrong ? "ed-code-error" : undefined}>
        <label htmlFor="ed-code-field" className="sr-only">
          Your early access code
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
    </details>
  );
}
