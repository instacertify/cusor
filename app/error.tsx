"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-lg font-semibold text-ink-950">This page failed to load</p>
      <p className="mt-2 text-sm text-ink-600">
        {error.digest ? `Ref ${error.digest}` : "Please try again."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-ink-950 px-4 py-2 text-sm font-semibold text-cream-50"
      >
        Try again
      </button>
    </div>
  );
}
