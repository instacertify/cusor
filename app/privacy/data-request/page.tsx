import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import DataRequestForm from "@/components/DataRequestForm";
import { getGdprPublicSettings } from "@/lib/gdpr";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("page:privacy-data-request", {
    title: "Privacy Data Request",
    description:
      "Exercise your GDPR or DPDP rights — access, correction, deletion, portability, objection or withdraw consent.",
    path: "/privacy/data-request",
  });
}

export default function DataRequestPage() {
  const gdpr = getGdprPublicSettings();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Breadcrumbs
        crumbs={[
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Data request" },
        ]}
      />
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight">
          Privacy data request
        </h1>
        <p className="mt-3 text-ink-600 leading-relaxed">
          Use this form to exercise rights under the EU GDPR / UK GDPR or India’s DPDP Act —
          access, correction, deletion, portability, objection or withdraw consent. Learn more
          in our{" "}
          <Link href="/privacy/gdpr-and-dpdp" className="font-semibold text-butter-700 hover:underline">
            GDPR &amp; DPDP guide
          </Link>
          .
        </p>
        <div className="mt-8">
          <DataRequestForm privacyOfficerEmail={gdpr.privacyOfficerEmail} />
        </div>
      </div>
    </div>
  );
}
