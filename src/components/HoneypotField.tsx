import { HONEYPOT_FIELD } from "@/lib/spam-protection";

type Props = {
  value: string;
  onChange: (value: string) => void;
  /**
   * Distinguishes this instance's element id when more than one form renders
   * on a page (e.g. the footer newsletter alongside the contact form).
   * The `name` stays HONEYPOT_FIELD — the API checks the name, not the id.
   */
  idSuffix?: string;
};

/**
 * Hidden honeypot input for spam protection.
 *
 * Positioned off-screen (not `display:none`, which some bots skip) and removed
 * from the accessibility tree and tab order, so real users never see, focus,
 * or fill it. Bots that auto-complete every field populate it and get rejected
 * server-side.
 */
export default function HoneypotField({ value, onChange, idSuffix }: Props) {
  const fieldId = idSuffix ? `${HONEYPOT_FIELD}-${idSuffix}` : HONEYPOT_FIELD;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        width: 1,
        height: 1,
        overflow: "hidden",
      }}
    >
      <label htmlFor={fieldId}>Company (leave this empty)</label>
      <input
        id={fieldId}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
