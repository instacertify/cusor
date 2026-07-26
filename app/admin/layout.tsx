import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

/** Admin shell — public Header/Footer are suppressed in the root layout. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-cream-50 text-ink-950">{children}</div>;
}
