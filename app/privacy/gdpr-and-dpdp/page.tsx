import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getGdprPublicSettings } from "@/lib/gdpr";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("page:privacy-gdpr-dpdp", {
    title: "What is GDPR and DPDP?",
    description:
      "Plain-language guide to the EU GDPR and India’s Digital Personal Data Protection (DPDP) Act — and how Certko handles personal data under both.",
    path: "/privacy/gdpr-and-dpdp",
  });
}

export default function GdprAndDpdpPage() {
  const gdpr = getGdprPublicSettings();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Breadcrumbs
        crumbs={[
          { label: "Privacy Policy", href: "/privacy" },
          { label: "GDPR & DPDP" },
        ]}
      />

      <article className="max-w-3xl">
        <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight">
          What is GDPR and DPDP?
        </h1>
        <p className="mt-4 text-lg text-ink-600 leading-relaxed">
          Two major privacy laws shape how Certko and Instacertify Labs Private Limited handle
          personal data — the EU’s GDPR and India’s DPDP Act. This page explains both in plain
          language and how they apply on this website.
        </p>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-ink-950">GDPR</h2>
          <p className="mt-3 text-ink-700 leading-relaxed">
            The <strong>General Data Protection Regulation</strong> is the European Union’s
            primary privacy law (with a closely aligned UK GDPR). It protects personal data of
            people in the EU / EEA (and UK under UK GDPR) and applies to organisations that
            offer goods or services to those people or monitor their behaviour — even if the
            organisation is based outside Europe.
          </p>
          <ul className="mt-4 space-y-2 text-ink-700 list-disc pl-5 leading-relaxed">
            <li>Requires a lawful basis to process personal data (consent, contract, legitimate interests, legal obligation, etc.)</li>
            <li>Gives people rights: access, correction, erasure, restriction, portability, objection</li>
            <li>Expects transparency, security, and accountability (records, DPIAs where needed)</li>
            <li>Cookie / tracking technologies generally need consent before non-essential use</li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-ink-950">
            DPDP Act (India)
          </h2>
          <p className="mt-3 text-ink-700 leading-relaxed">
            India’s <strong>Digital Personal Data Protection Act, 2023</strong> (DPDP) is the
            national law for digital personal data. Organisations that decide why and how
            personal data is processed are <strong>Data Fiduciaries</strong>; people whose data
            is processed are <strong>Data Principals</strong>.
          </p>
          <ul className="mt-4 space-y-2 text-ink-700 list-disc pl-5 leading-relaxed">
            <li>Consent must be free, specific, informed, unconditional and clear (with notice)</li>
            <li>Data Principals can seek access, correction, erasure and withdrawal of consent</li>
            <li>Grievance redressal with the fiduciary, and escalation to the Data Protection Board of India</li>
            <li>Cross-border transfers allowed unless the government restricts specific countries</li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-ink-950">
            How they compare
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-cream-300">
            <table className="w-full text-sm text-left">
              <thead className="bg-cream-100 text-ink-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Topic</th>
                  <th className="px-4 py-3 font-semibold">GDPR</th>
                  <th className="px-4 py-3 font-semibold">DPDP</th>
                </tr>
              </thead>
              <tbody className="bg-white text-ink-700">
                <tr className="border-t border-cream-200">
                  <td className="px-4 py-3 font-medium text-ink-950">Geography</td>
                  <td className="px-4 py-3">EU / EEA (+ UK GDPR)</td>
                  <td className="px-4 py-3">India (digital personal data)</td>
                </tr>
                <tr className="border-t border-cream-200">
                  <td className="px-4 py-3 font-medium text-ink-950">Who you are</td>
                  <td className="px-4 py-3">Data subject</td>
                  <td className="px-4 py-3">Data Principal</td>
                </tr>
                <tr className="border-t border-cream-200">
                  <td className="px-4 py-3 font-medium text-ink-950">Who we are</td>
                  <td className="px-4 py-3">Controller / processor</td>
                  <td className="px-4 py-3">Data Fiduciary / Data Processor</td>
                </tr>
                <tr className="border-t border-cream-200">
                  <td className="px-4 py-3 font-medium text-ink-950">Consent for cookies</td>
                  <td className="px-4 py-3">Required for non-essential tracking</td>
                  <td className="px-4 py-3">Consent / notice for personal data use</td>
                </tr>
                <tr className="border-t border-cream-200">
                  <td className="px-4 py-3 font-medium text-ink-950">Rights portal</td>
                  <td className="px-4 py-3" colSpan={2}>
                    Use Certko’s data request form for either regime
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-ink-950">
            How Certko complies
          </h2>
          <ul className="mt-4 space-y-2 text-ink-700 list-disc pl-5 leading-relaxed">
            <li>Cookie banner with necessary / analytics / marketing choices</li>
            <li>Analytics scripts load only after analytics consent (when enabled in admin)</li>
            <li>Privacy Policy + this guide explain purposes and rights</li>
            <li>Data subject / Data Principal requests logged in our GDPR management console</li>
            <li>Inquiry retention and anonymisation controls for contact leads</li>
          </ul>
          <p className="mt-4 text-sm text-ink-500 leading-relaxed">
            This page is guidance, not legal advice. Scheme and regulatory details change —
            consult counsel for your organisation’s obligations.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/privacy/data-request"
            className="inline-flex min-h-11 items-center rounded-xl bg-ink-950 px-6 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition"
          >
            Submit a data request
          </Link>
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center rounded-xl border border-cream-300 px-6 text-sm font-semibold text-ink-800 hover:border-butter-500 transition"
          >
            Privacy Policy
          </Link>
          <a
            href={`mailto:${gdpr.privacyOfficerEmail}`}
            className="inline-flex min-h-11 items-center rounded-xl px-6 text-sm font-semibold text-butter-700 hover:underline"
          >
            Email Privacy Officer
          </a>
        </div>
      </article>
    </div>
  );
}
