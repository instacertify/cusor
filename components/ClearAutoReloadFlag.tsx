"use client";

import { useEffect } from "react";

/** After a successful render, allow a future one-shot auto-reload again. */
export default function ClearAutoReloadFlag() {
  useEffect(() => {
    try {
      const prefix = "certko-auto-reload:";
      for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(prefix)) sessionStorage.removeItem(key);
      }
    } catch {
      /* private mode */
    }
  }, []);
  return null;
}
