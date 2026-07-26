"use client";

import type { ReactNode } from "react";

type DeleteAction = (formData: FormData) => void | Promise<void>;

/**
 * Wrap any admin delete form. Asks for confirmation twice before submit.
 */
export default function ConfirmDeleteForm({
  action,
  children,
  className,
  itemLabel = "this item",
}: {
  action: DeleteAction;
  children: ReactNode;
  className?: string;
  /** Shown in the confirm dialogs, e.g. "this FAQ" or "this certification" */
  itemLabel?: string;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        const first = window.confirm(`Are you sure you want to delete ${itemLabel}?`);
        if (!first) {
          e.preventDefault();
          return;
        }
        const second = window.confirm(
          `Please confirm again — delete ${itemLabel} permanently? This cannot be undone.`
        );
        if (!second) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}
