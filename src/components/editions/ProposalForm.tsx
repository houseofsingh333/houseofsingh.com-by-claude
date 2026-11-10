"use client";

import { useState } from "react";
import HoneypotField from "@/components/HoneypotField";
import { OutlineButton } from "@/components/OutlineCta";
import { HONEYPOT_FIELD } from "@/lib/spam-protection";

const FIELDS = [
  { name: "name", label: "Your name", type: "text", autoComplete: "name", required: true },
  { name: "email", label: "Your email", type: "email", autoComplete: "email", required: true },
  { name: "practice", label: "What you make", type: "text", autoComplete: "off", required: true },
  { name: "link", label: "A link to your work", type: "text", autoComplete: "url", required: false },
] as const;

/**
 * A collaboration proposal (canvas FL6-Artists): each field a label above
 * a quiet line, the idea in a few lines, and Send the proposal. Saved
 * privately (api/editions/proposal); the thank you replaces the form.
 */
export default function ProposalForm({ footnote }: { footnote: string }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/editions/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, [HONEYPOT_FIELD]: company }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Something went wrong. Try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="ed-proposal" role="status">
        <p className="text-statement text-foreground">Thank you. Your proposal is in, and every proposal is read.</p>
      </div>
    );
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [k]: e.target.value }));

  return (
    <form className="ed-proposal" onSubmit={send} aria-describedby={status === "error" ? "ed-proposal-error" : undefined}>
      <HoneypotField value={company} onChange={setCompany} idSuffix="proposal" />
      {FIELDS.map((f) => (
        <label key={f.name} className="ed-field">
          <span className="type-label text-muted-foreground">{f.label}</span>
          <input
            name={f.name}
            type={f.type}
            required={f.required}
            autoComplete={f.autoComplete}
            value={values[f.name] ?? ""}
            onChange={set(f.name)}
            maxLength={f.name === "link" ? 400 : 200}
          />
        </label>
      ))}
      <label className="ed-field">
        <span className="type-label text-muted-foreground">Your idea, in a few lines</span>
        <textarea name="idea" required rows={4} value={values.idea ?? ""} onChange={set("idea")} maxLength={3000} />
      </label>
      <OutlineButton type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending" : "Send the proposal"}
      </OutlineButton>
      {status === "error" && (
        <p id="ed-proposal-error" role="alert" className="ed-buy-message">
          {error}
        </p>
      )}
      <p className="text-small text-muted-foreground">{footnote}</p>
    </form>
  );
}
