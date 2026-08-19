"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-lg font-semibold text-ink-950">Admin page failed to load</p>
      <p className="mt-2 text-sm text-ink-600">
        {error.digest ? `Ref ${error.digest}` : "Please try again."}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-ink-950 px-4 py-2 text-sm font-semibold text-cream-50"
        >
          Try again
        </button>
        <a
          href="/admin/login"
          className="rounded-xl border border-cream-300 px-4 py-2 text-sm font-semibold text-ink-800"
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
