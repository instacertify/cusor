"use client";

/**
 * Instant browser redirect — no next/navigation redirect(), no waiting on
 * hydration. Hostinger RSC redirect() fetch()es the destination and 500s.
 */
export default function HardRedirect({ href }: { href: string }) {
  const safe = href.startsWith("/") && !href.startsWith("//") ? href : "/";
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${safe}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `location.replace(${JSON.stringify(safe)})`,
        }}
      />
      <p className="p-6 text-sm text-ink-600">Redirecting…</p>
    </>
  );
}
