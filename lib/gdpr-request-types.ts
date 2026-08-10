/** Shared request-type labels (safe for client + server). */

export type GdprRequestType =
  | "access"
  | "correction"
  | "deletion"
  | "portability"
  | "objection"
  | "withdraw_consent"
  | "other";

export const GDPR_REQUEST_TYPES: { value: GdprRequestType; label: string }[] = [
  { value: "access", label: "Access my data" },
  { value: "correction", label: "Correct my data" },
  { value: "deletion", label: "Delete my data" },
  { value: "portability", label: "Export / portability" },
  { value: "objection", label: "Object to processing" },
  { value: "withdraw_consent", label: "Withdraw consent" },
  { value: "other", label: "Other privacy request" },
];
