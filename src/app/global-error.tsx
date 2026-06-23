"use client";

import { useEffect } from "react";

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
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F9F7F5",
          color: "#1A1A1A",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "0 24px", maxWidth: 480 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#6B6B6B",
              marginBottom: 24,
            }}
          >
            House of Singh
          </p>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 500,
              lineHeight: 1.4,
              margin: "0 0 12px",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#6B6B6B",
              lineHeight: 1.6,
              margin: "0 0 32px",
            }}
          >
            We ran into an unexpected issue. Please try again, or head back to
            the homepage.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                padding: "10px 20px",
                fontSize: 13,
                border: "1px solid hsl(40 10% 88%)",
                borderRadius: 0,
                background: "transparent",
                color: "#1A1A1A",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: "10px 20px",
                fontSize: 13,
                border: "1px solid hsl(40 10% 88%)",
                textDecoration: "none",
                color: "#1A1A1A",
              }}
            >
              Homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
