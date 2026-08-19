"use client";

export default function LoginError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0b1220] px-4 py-16 text-center text-cream-50">
      <p className="text-lg font-semibold">Sign-in page failed to load</p>
      <p className="mt-2 text-sm text-cream-200/70">Refresh and try again.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-butter-400 px-4 py-2 text-sm font-semibold text-ink-950"
      >
        Try again
      </button>
    </div>
  );
}
