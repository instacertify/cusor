import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import FaqAccordion from "@/components/FaqAccordion";
import { getUpcomingQcos, getFaqs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upcoming QCOs — Products Becoming BIS Mandatory | Enforcement Dates",
  description:
    "Track upcoming Quality Control Orders (QCOs): products that will soon require mandatory BIS certification in India, with IS standards, HSN codes and enforcement dates.",
};

function parseDate(d: string): Date | null {
  const m = d.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : null;
}

function urgency(d: string): { label: string; cls: string } {
  const date = parseDate(d);
  if (!date) return { label: "TBD", cls: "bg-cream-200 text-ink-600" };
  const days = Math.ceil((date.getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: "In force", cls: "bg-red-100 text-red-700" };
  if (days <= 90) return { label: `${days} days left`, cls: "bg-butter-300/60 text-butter-700" };
  return { label: `${Math.round(days / 30)} months away`, cls: "bg-green-100 text-green-700" };
}

export default function QcoPage() {
  const qcos = getUpcomingQcos();
  const faqs = getFaqs("page:qco");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Breadcrumbs crumbs={[{ label: "QCO Alerts" }]} />
      <span className="text-xs font-bold uppercase tracking-wide bg-butter-300/50 text-butter-700 rounded-full px-3 py-1">
        {qcos.length} notified orders
      </span>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink-950 tracking-tight">
        Upcoming QCOs — Products Becoming Mandatory
      </h1>
      <p className="mt-3 text-ink-600 max-w-2xl">
        Quality Control Orders already notified and due for implementation. Once the
        enforcement date passes, these products cannot be manufactured, imported or sold
        in India without BIS certification. Start the process 3–6 months before the deadline.
      </p>

      <div className="mt-10 space-y-4">
        {qcos.map((q) => {
          const u = urgency(q.enforcement_date);
          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover transition p-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={`text-[11px] font-bold rounded-full px-2.5 py-0.5 ${u.cls}`}>
                    {u.label}
                  </span>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wide rounded-full px-2.5 py-0.5 ${
                      q.scheme === "CRS" ? "bg-ink-300/30 text-ink-700" : "bg-cream-200 text-ink-600"
                    }`}
                  >
                    {q.scheme}
                  </span>
                </div>
                <h2 className="font-display font-bold text-ink-950 leading-snug">{q.product}</h2>
                <p className="text-xs text-ink-500 mt-1">
                  {q.standard}
                  {q.hsn8 ? ` · HSN ${q.hsn8}` : q.hsn4 ? ` · HSN ${q.hsn4}` : ""} · {q.ministry}
                </p>
              </div>
              <div className="sm:text-right">
                <div className="text-[11px] font-bold uppercase tracking-wide text-ink-500">Mandatory from</div>
                <div className="font-display text-lg font-semibold text-ink-950">{q.enforcement_date}</div>
                <Link
                  href={`/contact?product=${encodeURIComponent(q.product.slice(0, 120))}`}
                  className="inline-flex mt-1 text-xs font-bold text-butter-700 hover:text-butter-600"
                >
                  Get ahead of the deadline →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-xs text-ink-500 max-w-3xl">
        Compiled from the official BIS “Upcoming QCOs — notified and due for implementation” list.
        Enforcement dates are extended from time to time — always verify against the latest gazette
        notification before making compliance decisions.
      </p>

      <div className="mt-14 max-w-3xl">
        <FaqAccordion faqs={faqs} heading="QCO FAQs" />
      </div>

      <div className="mt-14">
        <TestimonialStrip />
        <CtaBanner />
      </div>
    </div>
  );
}
