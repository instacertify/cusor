"use client";

import AutoReloadOnce from "@/components/AutoReloadOnce";

export default function AppError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AutoReloadOnce>
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-ink-600">Loading this page…</p>
        <p className="mt-2 text-xs text-ink-400">{error.digest ? `Ref ${error.digest}` : null}</p>
      </div>
    </AutoReloadOnce>
  );
}
