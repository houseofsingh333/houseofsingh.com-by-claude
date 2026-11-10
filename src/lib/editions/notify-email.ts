/**
 * An email to Maninder when something needs him (a collaboration
 * proposal). Sent through Resend's API with plain fetch (no package),
 * only when RESEND_API_KEY and EDITIONS_NOTIFY_TO are set; otherwise the
 * proposal is still saved and simply waits in the Studio.
 */
export async function notifyManinder(subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.EDITIONS_NOTIFY_TO;
  const from = process.env.EDITIONS_NOTIFY_FROM || "House of Singh Editions <editions@houseofsingh.com>";
  if (!key || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
