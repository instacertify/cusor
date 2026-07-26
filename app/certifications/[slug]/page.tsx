import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { marked } from "marked";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import FaqAccordion from "@/components/FaqAccordion";
import Icon from "@/components/Icon";
import { getCertificationBySlug, getCertifications, getFaqs } from "@/lib/queries";
import { buildMetadata, buildJsonLd, enabledSchemaTypes, BASE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cert = getCertificationBySlug(slug);
  if (!cert) return {};
  return buildMetadata(`cert:${cert.id}`, {
    title: cert.meta_title || `${cert.name} Certification`,
    description: cert.meta_description || cert.summary,
    path: `/certifications/${cert.slug}`,
    image: cert.image,
  });
}

export default async function CertificationPage({ params }: Props) {
  const { slug } = await params;
  const cert = getCertificationBySlug(slug);
  if (!cert) notFound();
  const faqs = getFaqs(`cert:${cert.slug}`);
  const others = getCertifications().filter((c) => c.slug !== cert.slug);

  const jsonLd = buildJsonLd(enabledSchemaTypes(`cert:${cert.id}`, "cert"), {
    name: `${cert.name} Certification Support`,
    description: cert.summary,
    url: `${BASE_URL}/certifications/${cert.slug}`,
    image: cert.image,
    faqs,
    areaServed: cert.region,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Certifications", url: "/certifications" },
      { name: cert.name },
    ],
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Breadcrumbs
        crumbs={[{ label: "Certifications", href: "/certifications" }, { label: cert.name }]}
      />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-wide bg-butter-300/50 text-butter-700 rounded-full px-3 py-1">
              {cert.region}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-16 h-16 rounded-2xl bg-butter-300/40 text-butter-700 flex items-center justify-center shrink-0">
              <Icon name={cert.icon} size={34} />
            </span>
            <div>
              <h1 className="font-display text-4xl font-extrabold text-ink-950 tracking-tight leading-tight">
                {cert.name}
              </h1>
              <p className="text-sm font-semibold text-ink-500 mt-1">{cert.full_name}</p>
            </div>
          </div>
          <p className="mt-5 text-lg text-ink-600 leading-relaxed">{cert.summary}</p>
          <Link
            href={`/contact?product=${encodeURIComponent(cert.name + " certification")}`}
            className="mt-6 inline-flex items-center gap-2 bg-butter-500 hover:bg-butter-400 text-ink-950 font-bold rounded-xl px-6 py-3 text-sm transition shadow-butter"
          >
            Get a Free {cert.name} Quote <Icon name="arrow-right" size={16} />
          </Link>
        </div>
        {cert.image ? (
          <Image
            src={cert.image}
            alt={`${cert.full_name}`}
            width={520}
            height={340}
            className="rounded-3xl border border-cream-300 shadow-card object-cover w-full"
          />
        ) : null}
      </div>

      <article
        className="prose-certko mt-10 max-w-3xl"
        dangerouslySetInnerHTML={{ __html: marked.parse(cert.content) as string }}
      />

      {faqs.length > 0 && (
        <div className="mt-14 max-w-3xl">
          <FaqAccordion faqs={faqs} heading={`${cert.name} FAQs`} />
        </div>
      )}

      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold text-ink-950 mb-6">Other Certifications</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {others.map((c) => (
            <Link
              key={c.id}
              href={`/certifications/${c.slug}`}
              className="group bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover transition p-4 flex items-center gap-3"
            >
              <span className="w-9 h-9 rounded-lg bg-cream-100 text-ink-700 flex items-center justify-center shrink-0 group-hover:bg-butter-300/40 group-hover:text-butter-700 transition">
                <Icon name={c.icon} size={19} />
              </span>
              <span>
                <span className="block text-sm font-bold text-ink-950 group-hover:text-butter-700 transition">{c.name}</span>
                <span className="block text-[11px] text-ink-500">{c.region}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-16">
        <CtaBanner />
      </div>
    </div>
  );
}
