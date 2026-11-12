"use client";

import { useRef, useState } from "react";
import { EMAIL_HINT, looksLikeEmail } from "@/lib/emailCheck";
import HoneypotField from "@/components/HoneypotField";
import { HONEYPOT_FIELD } from "@/lib/spam-protection";
import { roman } from "@/lib/roman";

type Props = {
  /** "Newsletter" (Site Settings, Coda); none for the Shop's Notify me. */
  label?: string;
  /** The faint text inside the empty field. */
  placeholder: string;
  /** Beside the postmark once signed up. */
  thanks: string;
  /** Where the email goes (the Shop's Notify me posts elsewhere). */
  endpoint?: string;
  /** Sent with the email (the Shop: which Collection). */
  extra?: Record<string, string>;
  /** The field's accessible name. */
  fieldLabel?: string;
  /** The button's accessible name. */
  buttonLabel?: string;
  /** A visible word beside the arrow (the Shop: "Notify me"). */
  buttonText?: string;
  /** A quiet note beneath the line (the Shop: what the email is for). */
  note?: string;
  /** Distinguishes the honeypot when two forms share a page. */
  idSuffix?: string;
  /** The browser's autofill hint (the Shop's Notify me: "email"). */
  autoComplete?: string;
};

/** Today in Toronto, as the postmark reads it: "8 NOV" and "MMXXVI". */
function postmarkDate(): { day: string; year: string } {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", day: "numeric", month: "short", year: "numeric" }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { day: `${get("day")} ${get("month").replace(".", "").toUpperCase()}`, year: roman(Number(get("year"))) };
}

/**
 * The footer's newsletter (frames FINAL desktop and FINAL phone): the label,
 * then the email field as a quiet line with an arrow. Focus draws a brass
 * line under the field and eases the arrow forward in brass. Signed up, the
 * field fades and a brass postmark draws itself (TORONTO, the day and month,
 * the year in Roman numerals) beside the thank you line, which is announced
 * to screen readers. Errors are written below the line and announced.
 * Same endpoint, validation and spam protection as before. Reduced motion:
 * the postmark appears at once (styles/layout.css).
 */
export default function FooterNewsletter({
  label,
  placeholder,
  thanks,
  endpoint = "/api/newsletter",
  extra,
  fieldLabel = "Email for newsletter",
  buttonLabel = "Subscribe",
  buttonText,
  note,
  idSuffix = "footer",
  autoComplete,
}: Props) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [stamp, setStamp] = useState<{ day: string; year: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!looksLikeEmail(email)) {
      setErrorMsg(EMAIL_HINT);
      setStatus("error");
      inputRef.current?.focus();
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...extra, email: email.trim(), [HONEYPOT_FIELD]: company }),
      });
      if (!res.ok) {
        // Show the server's own wording (for example the rate limit message).
        const data = await res.json().catch(() => ({}));
        setErrorMsg(typeof data.error === "string" ? data.error : "");
        setStatus("error");
        return;
      }
      setStamp(postmarkDate());
      setStatus("success");
      setEmail("");
      setCompany("");
    } catch {
      setErrorMsg("");
      setStatus("error");
    }
  };

  const done = status === "success";

  return (
    <div className={`footer-newsletter${buttonText ? " footer-newsletter-worded" : ""}`}>
      {label && <span className="footer-label">{label}</span>}
      <div className="footer-nl-stage">
        <form onSubmit={handleSubscribe} noValidate className="footer-nl-form" data-done={done ? "" : undefined} inert={done}>
          <HoneypotField value={company} onChange={setCompany} idSuffix={idSuffix} />
          <input
            ref={inputRef}
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder={placeholder}
            autoComplete={autoComplete}
            aria-label={fieldLabel}
            aria-invalid={status === "error" ? true : undefined}
            aria-describedby={status === "error" ? `${idSuffix}-nl-error` : undefined}
            className="footer-nl-input"
          />
          <button type="submit" disabled={status === "loading"} aria-label={buttonText ? undefined : buttonLabel} className="footer-nl-btn">
            {buttonText && <span className="footer-nl-word">{buttonText}</span>}
            <span aria-hidden="true" className="footer-nl-arrow">
              {status === "loading" ? "..." : "→"}
            </span>
          </button>
          <span aria-hidden="true" className="footer-nl-line" />
        </form>
        {done && stamp && (
          <div className="footer-nl-done">
            <svg className="footer-postmark" width="104" height="104" viewBox="0 0 104 104" aria-hidden="true">
              <circle cx="52" cy="52" r="48" />
              <g className="footer-postmark-text">
                <text x="52" y="42" className="pm-place">TORONTO</text>
                <text x="52" y="60" className="pm-day">{stamp.day}</text>
                <text x="52" y="74" className="pm-year">{stamp.year}</text>
              </g>
            </svg>
            <p className="footer-nl-thanks">{thanks}</p>
          </div>
        )}
      </div>
      {/* Announced as it changes: the thank you line, or nothing. */}
      <p className="sr-only" role="status">
        {done ? thanks : ""}
      </p>
      {note && !done && <p className="footer-nl-note">{note}</p>}
      {status === "error" && (
        <p id={`${idSuffix}-nl-error`} className="footer-nl-error" role="alert">
          {errorMsg || "Something went wrong. Try again."}
        </p>
      )}
    </div>
  );
}
