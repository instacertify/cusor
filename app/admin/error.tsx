"use client";

import AutoReloadOnce from "@/components/AutoReloadOnce";

export default function AdminError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AutoReloadOnce>
      <div className="p-8 text-center">
        <p className="text-sm text-ink-600">Loading the admin page…</p>
        <p className="mt-2 text-xs text-ink-400">{error.digest ? `Ref ${error.digest}` : null}</p>
      </div>
    </AutoReloadOnce>
  );
}
