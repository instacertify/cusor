"use client";

import AutoReloadOnce from "@/components/AutoReloadOnce";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-IN">
      <body>
        <AutoReloadOnce>
          <p style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
            Loading…{error.digest ? ` (${error.digest})` : ""}
          </p>
        </AutoReloadOnce>
      </body>
    </html>
  );
}
