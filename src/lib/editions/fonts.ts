import localFont from "next/font/local";

/**
 * Noto Serif Gurmukhi (Shop design round 2), for the Collection's number
 * in Gurmukhi numerals on its card and on the phone bar. Self hosted, the
 * Gurmukhi characters only (12 KB), loaded on Shop pages alone (applied in
 * the Shop's layout). Licence: public/fonts/noto-serif-gurmukhi-OFL.txt.
 */
export const gurmukhiFont = localFont({
  src: [{ path: "../../../public/fonts/noto-serif-gurmukhi-400-normal.woff2", weight: "400", style: "normal" }],
  display: "swap",
  variable: "--font-gurmukhi",
  fallback: ["serif"],
  preload: true,
});
