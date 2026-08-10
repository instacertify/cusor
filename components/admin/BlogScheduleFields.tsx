"use client";

import { useState } from "react";

type Status = "draft" | "scheduled" | "published";

export default function BlogScheduleFields({
  initialStatus,
  initialPublishAt,
}: {
  initialStatus: string;
  initialPublishAt: string;
}) {
  const normalized: Status =
    initialStatus === "scheduled" || initialStatus === "published"
      ? initialStatus
      : "draft";
  const [status, setStatus] = useState<Status>(normalized);

  const showSchedule =
    status === "scheduled" || status === "published" || status === "draft";

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <label
          htmlFor="status"
          className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5"
        >
          Status
        </label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
          className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
        >
          <option value="draft">Draft (hidden)</option>
          <option value="scheduled">Scheduled (auto-publish)</option>
          <option value="published">Published (live now)</option>
        </select>
        <p className="mt-1 text-[11px] text-ink-500">
          Scheduled posts stay hidden until the publish time, then go live automatically.
        </p>
      </div>
      <div>
        <label
          htmlFor="publish_at"
          className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5"
        >
          {status === "scheduled" ? "Publish at (required)" : "Publish at (optional)"}
        </label>
        <input
          id="publish_at"
          name="publish_at"
          type="datetime-local"
          defaultValue={initialPublishAt}
          required={status === "scheduled"}
          className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
        />
        <p className="mt-1 text-[11px] text-ink-500">
          {showSchedule
            ? "Uses your local timezone. Past/near times publish immediately."
            : null}
        </p>
      </div>
    </div>
  );
}
