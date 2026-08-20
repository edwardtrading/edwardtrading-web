"use client";

/**
 * Last resort boundary. Replaces Next's bare "Application error" screen, which
 * leaks nothing useful to a visitor and looks broken.
 */
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#F7F7F7",
          color: "#111111",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        }}
      >
        <main
          style={{
            maxWidth: "480px",
            width: "100%",
            background: "#ffffff",
            border: "1px solid rgba(17,17,17,0.1)",
            borderRadius: "8px",
            padding: "32px",
            textAlign: "center"
          }}
        >
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800 }}>
            This page could not be loaded
          </h1>
          <p style={{ margin: "16px 0 0", lineHeight: 1.7, color: "#5F6978" }}>
            Something went wrong at our end. Please try again in a moment.
          </p>
          <div
            style={{
              marginTop: "28px",
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap"
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: "44px",
                padding: "0 18px",
                borderRadius: "6px",
                border: "none",
                background: "#D97A24",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                minHeight: "44px",
                display: "inline-flex",
                alignItems: "center",
                padding: "0 18px",
                borderRadius: "6px",
                border: "1px solid rgba(17,17,17,0.12)",
                color: "#111111",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none"
              }}
            >
              Go to the homepage
            </a>
          </div>
          {error.digest ? (
            <p style={{ margin: "24px 0 0", fontSize: "12px", color: "#5F6978" }}>
              Reference: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
