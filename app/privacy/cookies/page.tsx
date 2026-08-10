import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import CookieOptionsClient from "@/components/CookieOptionsClient";
import { getGdprPublicSettings } from "@/lib/gdpr";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cookie options | Certko",
  description:
    "Manage Certko cookie preferences — necessary, analytics and marketing cookies under GDPR and India’s DPDP Act.",
  alternates: { canonical: "https://certko.com/privacy/cookies" },
};

export default function CookieOptionsPage() {
  const settings = getGdprPublicSettings();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Breadcrumbs
        crumbs={[
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Cookie options" },
        ]}
      />

      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight">
          Cookie options
        </h1>
        <p className="mt-3 text-ink-600 leading-relaxed">
          Choose which cookies Certko may use. Necessary cookies always stay on. Analytics and
          marketing load only if you allow them — consistent with GDPR consent rules and DPDP
          notice/consent expectations.
        </p>

        <div className="mt-8 rounded-2xl border border-cream-300 bg-white p-5 sm:p-6 shadow-card">
          <CookieOptionsClient settings={settings} />
        </div>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-ink-950">
            Cookie categories we use
          </h2>
          <ul className="mt-6 space-y-4">
            {settings.categories.map((c) => (
              <li
                key={c.key}
                className="rounded-2xl border border-cream-300 bg-cream-50 px-5 py-4"
              >
                <p className="font-semibold text-ink-950">
                  {c.label}
                  {c.key !== "necessary" && !c.offered ? (
                    <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      (not offered)
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-ink-600 leading-relaxed">{c.description}</p>
                {c.examples ? (
                  <p className="mt-2 text-xs text-ink-500">Examples: {c.examples}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-8 text-sm text-ink-500 leading-relaxed">
          More detail in our{" "}
          <Link href="/privacy" className="font-semibold text-butter-700 hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy/gdpr-and-dpdp"
            className="font-semibold text-butter-700 hover:underline"
          >
            GDPR &amp; DPDP guide
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
