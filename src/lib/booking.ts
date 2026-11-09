/**
 * Where "Book a call" goes (the closing section above the footer) unless
 * Site Settings, Coda, Booking address says otherwise. A plain link, opened
 * in a new tab: no booking script or embed, so the security policy is
 * unchanged.
 */
export const BOOKING_URL = "https://cal.com/houseofsingh/30min";

/** The address to use: Site Settings when it is a full https:// address, else the default. */
export function bookingUrl(value?: string | null): string {
  const v = value?.trim();
  return v && /^https:\/\/[^\s]+$/.test(v) ? v : BOOKING_URL;
}
