"use client";

import { useEffect } from "react";

/**
 * Hostinger often fails the first RSC payload after a slow redirect
 * ("failed to get redirect response"). One automatic reload almost always
 * lands on the already-bootstrapped page.
 */
export default function AutoReloadOnce({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const key = `certko-auto-reload:${window.location.pathname}${window.location.search}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      return;
    }
    window.location.reload();
  }, []);

  return <>{children}</>;
}
