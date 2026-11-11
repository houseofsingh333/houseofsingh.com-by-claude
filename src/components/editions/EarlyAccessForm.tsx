/**
 * "Have an early access code?" (the fallback for an early access link that
 * did not arrive or was copied without its code): a quiet grey link that
 * opens the field in place (Shop design rounds 1 and 2), so Notify me
 * stays the only visible form. A native disclosure, so it opens without JavaScript;
 * the form is a plain GET to /api/editions/access. A code that opens
 * nothing comes back with ?code=wrong, and the field is shown open with
 * the reason.
 */
export default function EarlyAccessForm({ wrong }: { wrong: boolean }) {
  return (
    <details className="ed-code-reveal ed-anchor" id="early-access" open={wrong || undefined}>
      {/* A quiet grey link: "Have an early access code?" on desktop, "Already have a code? Enter it here" on phones. */}
      <summary className="ed-code-summary">
        <span className="ed-code-wide">Have an early access code?</span>
        <span className="ed-code-narrow">
          Already have a code? <span className="ed-code-here">Enter it here</span>
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
