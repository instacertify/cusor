"use client";

import { useEffect } from "react";

/**
 * Browser redirect that does not use next/navigation redirect().
 * On Hostinger Node hosting, RSC redirect() internally fetch()es the
 * destination and fails with "failed to get redirect response".
 */
export default function HardRedirect({ href }: { href: string }) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${href}`} />
      <p className="p-6 text-sm text-ink-600">Redirecting…</p>
    </>
  );
}
