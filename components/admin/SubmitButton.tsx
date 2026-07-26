"use client";

import { useFormStatus } from "react-dom";

function pendingLabel(label: string) {
  if (/update/i.test(label)) return "Updating…";
  if (/add|create/i.test(label)) return "Creating…";
  if (/import/i.test(label)) return "Importing…";
  if (/delete/i.test(label)) return "Deleting…";
  return "Saving…";
}

/** Instant click feedback for every admin Save / Update submit. */
export default function SubmitButton({
  label = "Save Changes",
  className = "bg-ink-900 hover:bg-ink-800 text-white font-bold rounded-xl px-6 py-3 text-sm transition disabled:opacity-60 disabled:cursor-wait",
}: {
  label?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={className}>
      {pending ? pendingLabel(label) : label}
    </button>
  );
}
