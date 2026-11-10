import { useState, type CSSProperties } from "react";
import { useClient, type DocumentActionComponent, type DocumentActionProps } from "sanity";

/**
 * The order actions in the Studio (House of Singh Editions, Orders): "Made"
 * when the piece is being made, "Shipped" with its tracking number. Each
 * asks the website (api/editions/orders/status) to move the order on and
 * email the buyer through Resend; the website checks the Studio login
 * before changing anything. Plain React: the Studio's UI kit is not a
 * direct dependency of this site.
 */

type Order = { status?: string; trackingNumber?: string; email?: string; pieceName?: string };

function useSend(id: string) {
  const client = useClient({ apiVersion: "2024-01-01" });
  return async (payload: Record<string, string>) => {
    const token = client.config().token;
    if (!token) throw new Error("Sign in to the Studio again, then try once more.");
    const res = await fetch("/api/editions/orders/status", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, ...payload }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; email?: string };
    if (!res.ok) throw new Error(data.error ?? `The website answered ${res.status}.`);
    return data;
  };
}

const order = (props: DocumentActionProps) => (props.published ?? props.draft ?? {}) as Order;

export const MarkMadeAction: DocumentActionComponent = (props) => {
  const send = useSend(props.id);
  const [busy, setBusy] = useState(false);
  const o = order(props);
  const done = o.status === "made" || o.status === "shipped" || o.status === "refunded";
  return {
    label: busy ? "Sending" : o.status === "made" ? "Being made (emailed)" : "Made",
    title: done ? "Already past this step." : `Marks the order as being made and emails ${o.email ?? "the buyer"}.`,
    disabled: busy || done,
    onHandle: async () => {
      setBusy(true);
      try {
        const r = await send({ action: "made" });
        if (r.email && r.email !== "sent") window.alert(`Marked as being made. The email was ${r.email === "queued" ? "queued for tomorrow (daily limit reached)" : r.email}.`);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "Something went wrong.");
      }
      setBusy(false);
      props.onComplete();
    },
  };
};
MarkMadeAction.displayName = "MarkMadeAction";

const field: CSSProperties = { display: "block", width: "100%", boxSizing: "border-box", padding: "8px 10px", margin: "6px 0 16px", font: "inherit", border: "1px solid #ccc", borderRadius: 3 };
const button: CSSProperties = { padding: "8px 14px", font: "inherit", cursor: "pointer", border: "1px solid #1A1A1A", background: "#1A1A1A", color: "#F9F7F5", borderRadius: 3 };

export const MarkShippedAction: DocumentActionComponent = (props) => {
  const send = useSend(props.id);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState("");
  const [url, setUrl] = useState("");
  const o = order(props);
  const done = o.status === "shipped" || o.status === "refunded";

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await send({ action: "shipped", trackingNumber: tracking, trackingUrl: url });
      setOpen(false);
      props.onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
    setBusy(false);
  };

  return {
    label: o.status === "shipped" ? `Shipped (${o.trackingNumber ?? ""})` : "Shipped",
    title: done ? "Already shipped." : `Adds the tracking number and emails ${o.email ?? "the buyer"}.`,
    disabled: done,
    onHandle: () => setOpen(true),
    dialog: open && {
      type: "dialog",
      header: `Shipped: ${o.pieceName ?? "this order"}`,
      onClose: () => setOpen(false),
      content: (
        <form
          style={{ padding: 4 }}
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <label>
            Tracking number
            <input style={field} value={tracking} onChange={(e) => setTracking(e.target.value)} required autoFocus />
          </label>
          <label>
            Tracking address (optional; Canada Post is used when empty)
            <input style={field} value={url} onChange={(e) => setUrl(e.target.value)} type="url" placeholder="https://" />
          </label>
          {error && <p style={{ color: "#9B4B3B", margin: "0 0 12px" }}>{error}</p>}
          <button type="submit" style={button} disabled={busy || !tracking.trim()}>
            {busy ? "Sending" : "Mark as shipped and email the buyer"}
          </button>
        </form>
      ),
    },
  };
};
MarkShippedAction.displayName = "MarkShippedAction";
