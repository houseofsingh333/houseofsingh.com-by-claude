"use client";

import { useEffect } from "react";

/*
 * Shown only when the root layout itself has crashed, so neither globals.css
 * nor next/font is available here. Everything is inline: palette values from
 * globals.css, Playfair from the font file the site already serves, and the
 * site's body font stack.
 */
const CANVAS = "#F9F7F5";
const CHARCOAL = "hsl(30 10% 12%)";
const MUTED = "hsl(30 5% 44%)"; // --muted-foreground, #76706B
const HAIRLINE = "hsl(40 10% 88%)"; // --border
const BODY_FONT = '"Instrument Sans", Arial, sans-serif';

const linkStyle = {
  display: "inline-block",
  padding: "0 0 4px",
  fontSize: 12,
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  color: CHARCOAL,
  background: "transparent",
  border: "none",
  borderBottom: `1px solid ${HAIRLINE}`,
  borderRadius: 0,
  textDecoration: "none",
  fontFamily: BODY_FONT,
  cursor: "pointer",
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <style>{`
          @font-face {
            font-family: "Instrument Sans";
            src: url("/fonts/instrument-sans-latin-400-normal.woff2") format("woff2");
            font-weight: 400;
            font-display: swap;
          }
          @font-face {
            font-family: "Instrument Sans";
            src: url("/fonts/instrument-sans-latin-500-normal.woff2") format("woff2");
            font-weight: 500;
            font-display: swap;
          }
          @font-face {
            font-family: "Playfair Display";
            src: url("/fonts/playfair-display-latin-wght-normal.woff2") format("woff2");
            font-weight: 300 900;
            font-display: swap;
          }
          .ge-link:hover, .ge-link:focus-visible { border-bottom-color: ${CHARCOAL} !important; }
        `}</style>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: CANVAS,
          color: CHARCOAL,
          fontFamily: BODY_FONT,
        }}
      >
        <main
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "160px 24px 144px",
            boxSizing: "border-box",
          }}
        >
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: MUTED,
              margin: "0 0 16px",
            }}
          >
            House of Singh
          </p>
          <div style={{ height: 1, background: HAIRLINE, margin: "0 0 40px" }} />
          <h1
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: "clamp(30px, 5vw, 60px)",
              fontWeight: 300,
              lineHeight: 1,
              margin: 0,
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.8,
              color: MUTED,
              maxWidth: 448,
              margin: "32px 0 0",
            }}
          >
            Please try again in a moment.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 40px", marginTop: 48 }}>
            <button type="button" onClick={reset} className="ge-link" style={linkStyle}>
              Try again
            </button>
            {/* A plain link on purpose. This screen appears only when the root
                layout itself has crashed, so a full page reload is the
                recovery; next/link would try a client side navigation inside
                the broken app instead. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="ge-link" style={linkStyle}>
              Return home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
