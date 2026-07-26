"use client";

import { useState, useTransition } from "react";

type Props = {
  action: (formData: FormData) => Promise<void>;
  currentUsername: string;
  error?: string;
  saved?: string;
};

const ERRORS: Record<string, string> = {
  current: "Current password is incorrect. Try again.",
  match: "New password and confirmation do not match.",
  short: "New password must be at least 8 characters.",
  username: "Login ID must be 3–64 characters (letters, numbers, . _ @ -).",
  user_match: "New login ID and confirmation do not match.",
  empty: "Enter a new login ID and/or a new password to change.",
  unchanged: "Nothing changed — new values match the current ones.",
  "1": "Could not update credentials. Check the fields and try again.",
};

export default function ChangeCredentialsForm({
  action,
  currentUsername,
  error,
  saved,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [localError, setLocalError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setLocalError(null);
        const form = e.currentTarget;
        const fd = new FormData(form);

        const newUser = String(fd.get("new_username") ?? "").trim();
        const confirmUser = String(fd.get("confirm_username") ?? "").trim();
        const newPass = String(fd.get("new_password") ?? "");
        const confirmPass = String(fd.get("confirm_password") ?? "");

        if (newUser && newUser !== confirmUser) {
          setLocalError("user_match");
          return;
        }
        if (newPass && newPass !== confirmPass) {
          setLocalError("match");
          return;
        }
        if (!newUser && !newPass) {
          setLocalError("empty");
          return;
        }

        const ok1 = window.confirm(
          "Change your admin login ID and/or password?\n\nYou will need the new credentials next time you sign in."
        );
        if (!ok1) return;
        const ok2 = window.confirm(
          "Please confirm again — update login credentials now?\n\nThis cannot be undone without the new password."
        );
        if (!ok2) return;

        startTransition(async () => {
          await action(fd);
        });
      }}
    >
      {saved && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Login credentials updated. Use your new login ID and password next time.
        </p>
      )}
      {(localError || error) && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {ERRORS[localError || error || "1"] || ERRORS["1"]}
        </p>
      )}

      <div className="rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-ink-700">
        Current login ID:{" "}
        <strong className="font-mono text-ink-950">{currentUsername}</strong>
      </div>

      <div>
        <label
          htmlFor="current_password"
          className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5"
        >
          Current password <span className="text-red-600">*</span>
        </label>
        <input
          id="current_password"
          name="current_password"
          type="password"
          required
          autoComplete="current-password"
          disabled={pending}
          className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 bg-white"
          placeholder="Required to authorize any change"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="new_username"
            className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5"
          >
            New login ID
          </label>
          <input
            id="new_username"
            name="new_username"
            type="text"
            autoComplete="username"
            disabled={pending}
            placeholder={currentUsername}
            className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 bg-white"
          />
          <p className="mt-1 text-[11px] text-ink-500">Leave blank to keep “{currentUsername}”.</p>
        </div>
        <div>
          <label
            htmlFor="confirm_username"
            className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5"
          >
            Confirm new login ID
          </label>
          <input
            id="confirm_username"
            name="confirm_username"
            type="text"
            autoComplete="off"
            disabled={pending}
            placeholder="Re-type new login ID if changing"
            className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 bg-white"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="new_password"
            className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5"
          >
            New password
          </label>
          <input
            id="new_password"
            name="new_password"
            type="password"
            autoComplete="new-password"
            disabled={pending}
            minLength={8}
            className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 bg-white"
            placeholder="Min. 8 characters"
          />
        </div>
        <div>
          <label
            htmlFor="confirm_password"
            className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5"
          >
            Confirm new password
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            disabled={pending}
            minLength={8}
            className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 bg-white"
            placeholder="Re-type new password"
          />
        </div>
      </div>

      <p className="text-xs text-ink-500">
        You must confirm twice before credentials are saved. This session stays signed in after the
        change.
      </p>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-xl bg-ink-950 hover:bg-ink-800 text-cream-50 font-bold px-5 py-2.5 text-sm transition disabled:opacity-50"
      >
        {pending ? "Updating…" : "Update login credentials"}
      </button>
    </form>
  );
}
