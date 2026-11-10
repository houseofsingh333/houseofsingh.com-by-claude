import { useState } from "react";
import { set, unset, type StringInputProps } from "sanity";

/** A random code of letters and digits, easy to read aloud (no 0, O, 1, I, L). */
function newCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

const button: React.CSSProperties = {
  font: "inherit",
  fontSize: 13,
  padding: "8px 12px",
  borderRadius: 3,
  border: "1px solid var(--card-border-color, #ccc)",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};

/**
 * The early access code (Collection). The dataset is readable by anyone,
 * so the code itself is never stored: a new code is shown here once, to
 * copy into the early access emails, and only its fingerprint (SHA-256) is
 * saved. The server compares a visitor's code with the fingerprint. Plain
 * React and Studio colour variables (with fallbacks): no extra package.
 */
export function AccessCodeInput(props: StringInputProps) {
  const { value, onChange } = props;
  const [shown, setShown] = useState<string | null>(null);

  async function generate() {
    const code = newCode();
    onChange(set(await sha256(code)));
    setShown(code);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, lineHeight: 1.5 }}>
      {shown ? (
        <div style={{ padding: 12, borderRadius: 3, border: "1px solid var(--card-badge-caution-fg-color, #a86b00)" }}>
          <div style={{ fontWeight: 600 }}>Copy this code now. Only its fingerprint is kept; it cannot be shown again.</div>
          <div style={{ fontFamily: "monospace", fontSize: 15, margin: "6px 0" }}>{shown}</div>
          <div>Early access link: https://houseofsingh.com/editions?access={shown}</div>
        </div>
      ) : (
        <div style={{ color: "var(--card-muted-fg-color, #6e7683)" }}>
          {value ? "A code is set. Generate a new one to replace it (the old link then stops working)." : "No code yet."}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" style={button} onClick={generate}>
          {value ? "Generate a new code" : "Generate a code"}
        </button>
        {value && (
          <button type="button" style={button} onClick={() => { onChange(unset()); setShown(null); }}>
            Remove the code
          </button>
        )}
      </div>
    </div>
  );
}
