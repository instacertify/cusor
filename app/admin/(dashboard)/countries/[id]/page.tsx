import { notFound } from "next/navigation";
import Link from "next/link";
import {
  countryHubPath,
  getCountryHubRecordById,
  getCountrySchemesByCountryId,
  linesFromTextarea,
} from "@/lib/country-certifications";
import { GMA_REGIONS } from "@/lib/gma-regions";
import { getCertifications, getFaqs } from "@/lib/queries";
import {
  saveCountryHub,
  deleteCountryHub,
  saveCountryScheme,
  deleteCountryScheme,
  saveFaq,
  deleteFaq,
} from "../../../actions";
import { Field, TextArea, SavedBanner, SubmitButton } from "@/components/admin/Field";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

function parseJsonLines(raw: string): string {
  try {
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return "";
    return parsed.map((v) => String(v)).join("\n");
  } catch {
    return linesFromTextarea(raw).join("\n");
  }
}

function parsePillars(raw: string) {
  try {
    const parsed = JSON.parse(raw || "{}") as Record<string, string>;
    return {
      safety: parsed.safety || "",
      emcWireless: parsed.emcWireless || "",
      telecom: parsed.telecom || "",
      energyEnv: parsed.energyEnv || "",
      localRep: parsed.localRep || "",
    };
  } catch {
    return {
      safety: "",
      emcWireless: "",
      telecom: "",
      energyEnv: "",
      localRep: "",
    };
  }
}

export default async function AdminCountryEditPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const hub = getCountryHubRecordById(Number(id));
  if (!hub) notFound();

  const schemes = getCountrySchemesByCountryId(hub.id);
  const faqs = getFaqs(`country:${hub.slug}`);
  const certs = getCertifications();
  const pillars = parsePillars(hub.pillars);
  const back = `/admin/countries/${hub.id}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <Link
            href="/admin/countries"
            className="text-xs font-bold text-ink-500 hover:text-butter-700"
          >
            ← All countries
          </Link>
          <h1 className="font-display text-3xl font-semibold text-ink-950 mt-1">
            {hub.name}
          </h1>
          <p className="text-sm text-ink-600 mt-1">
            {schemes.length} scheme{schemes.length === 1 ? "" : "s"} · {faqs.length} FAQ
            {faqs.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href={countryHubPath(hub.slug)}
          target="_blank"
          className="text-sm font-bold text-butter-700"
        >
          Public page ↗
        </Link>
      </div>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <section className="mb-10 bg-white rounded-2xl border border-cream-300 shadow-card p-5 sm:p-6">
        <h2 className="font-display text-xl font-bold text-ink-950 mb-4">
          Country content
        </h2>
        <form action={saveCountryHub} className="space-y-3">
          <input type="hidden" name="id" value={hub.id} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name" name="name" defaultValue={hub.name} required />
            <Field label="Short name" name="short_name" defaultValue={hub.short_name} />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="URL slug" name="slug" defaultValue={hub.slug} required />
            <Field
              label="Market id (optional)"
              name="market_id"
              defaultValue={hub.market_id}
              placeholder="india, european-union, …"
            />
            <label className="block text-sm">
              <span className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                Region
              </span>
              <select
                name="region"
                defaultValue={hub.region || "asia-pacific"}
                className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-butter-500"
              >
                {GMA_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <Field label="Sort" name="sort" type="number" defaultValue={hub.sort} />
          </div>
          <Field label="Meta title" name="meta_title" defaultValue={hub.meta_title} />
          <TextArea
            label="Meta description"
            name="meta_description"
            rows={2}
            defaultValue={hub.meta_description}
          />
          <TextArea label="Intro" name="intro" rows={2} defaultValue={hub.intro} />
          <TextArea
            label="Regulatory landscape / overview"
            name="overview"
            rows={5}
            defaultValue={hub.overview}
          />
          <TextArea
            label="Authority / platform note"
            name="authority"
            rows={3}
            defaultValue={hub.authority}
          />
          <TextArea
            label="Filing tip"
            name="filing_tip"
            rows={3}
            defaultValue={hub.filing_tip}
          />
          <TextArea
            label="First checks (one per line)"
            name="first_checks"
            rows={5}
            defaultValue={parseJsonLines(hub.first_checks)}
            hint="Shown as a numbered checklist on the public country page."
          />
          <div className="pt-2">
            <h3 className="font-display font-bold text-ink-950 mb-3">GMA pillars</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <TextArea
                label="Safety"
                name="pillar_safety"
                rows={2}
                defaultValue={pillars.safety}
              />
              <TextArea
                label="EMC & wireless"
                name="pillar_emc"
                rows={2}
                defaultValue={pillars.emcWireless}
              />
              <TextArea
                label="Telecom / network"
                name="pillar_telecom"
                rows={2}
                defaultValue={pillars.telecom}
              />
              <TextArea
                label="Energy / environment"
                name="pillar_energy"
                rows={2}
                defaultValue={pillars.energyEnv}
              />
              <TextArea
                label="Local representation"
                name="pillar_local_rep"
                rows={2}
                defaultValue={pillars.localRep}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-800">
            <input type="hidden" name="active" value="0" />
            <input
              type="checkbox"
              name="active"
              value="1"
              defaultChecked={Boolean(hub.active)}
              className="rounded border-cream-300"
            />
            <span>
              <strong>Active</strong> — show on public country browse
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-800">
            <input type="hidden" name="featured" value="0" />
            <input
              type="checkbox"
              name="featured"
              value="1"
              defaultChecked={Boolean(hub.featured)}
              className="rounded border-cream-300"
            />
            <span>
              <strong>Featured</strong> — show on homepage “Where are you selling?”
            </span>
          </label>
          <SubmitButton label="Save country content" />
        </form>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-xl font-bold text-ink-950 mb-1">
          Certification schemes ({schemes.length})
        </h2>
        <p className="text-sm text-ink-600 mb-5 max-w-2xl">
          Unique country-specific writeups for each scheme. Link a Certko certification page via
          the dropdown when one exists.
        </p>

        <div className="space-y-5 mb-8">
          {schemes.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-cream-300 shadow-card p-5"
            >
              <form action={saveCountryScheme} className="space-y-3">
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="country_id" value={hub.id} />
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Scheme name" name="name" defaultValue={s.name} required />
                  <label className="block text-sm">
                    <span className="font-semibold text-ink-800">Linked certification</span>
                    <select
                      name="cert_slug"
                      defaultValue={s.cert_slug}
                      className="mt-1.5 w-full rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-butter-500"
                    >
                      <option value="">— None / custom —</option>
                      {certs.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name} ({c.slug})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <Field label="Role (one line)" name="role" defaultValue={s.role} />
                <TextArea label="Summary" name="summary" rows={4} defaultValue={s.summary} />
                <TextArea
                  label="Who typically needs it"
                  name="who_needs_it"
                  rows={3}
                  defaultValue={s.who_needs_it}
                />
                <TextArea
                  label="Example products (one per line)"
                  name="examples"
                  rows={3}
                  defaultValue={parseJsonLines(s.examples)}
                />
                <Field label="Sort" name="sort" type="number" defaultValue={s.sort} />
                <SubmitButton label="Save scheme" />
              </form>
              <ConfirmDeleteForm
                action={deleteCountryScheme}
                className="mt-2"
                itemLabel={`scheme “${s.name}”`}
              >
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="country_id" value={hub.id} />
                <button className="text-xs font-semibold text-red-600 hover:text-red-700">
                  Delete scheme
                </button>
              </ConfirmDeleteForm>
            </div>
          ))}
        </div>

        <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5">
          <h3 className="font-display font-bold text-ink-950 mb-3">Add scheme</h3>
          <form action={saveCountryScheme} className="space-y-3">
            <input type="hidden" name="country_id" value={hub.id} />
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Scheme name" name="name" required placeholder="e.g. INMETRO" />
              <label className="block text-sm">
                <span className="font-semibold text-ink-800">Linked certification</span>
                <select
                  name="cert_slug"
                  defaultValue=""
                  className="mt-1.5 w-full rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-butter-500"
                >
                  <option value="">— None / custom —</option>
                  {certs.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name} ({c.slug})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <Field label="Role (one line)" name="role" placeholder="Mandatory mark for…" />
            <TextArea label="Summary" name="summary" rows={3} />
            <TextArea label="Who typically needs it" name="who_needs_it" rows={2} />
            <TextArea
              label="Example products (one per line)"
              name="examples"
              rows={3}
              hint="One product type per line"
            />
            <Field label="Sort" name="sort" type="number" defaultValue={schemes.length * 10 + 10} />
            <SubmitButton label="Add scheme" />
          </form>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-xl font-bold text-ink-950 mb-4">
          Country FAQs
        </h2>
        <div className="space-y-4 mb-6">
          {faqs.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-2xl border border-cream-300 shadow-card p-5"
            >
              <form action={saveFaq} className="space-y-3">
                <input type="hidden" name="id" value={f.id} />
                <input type="hidden" name="scope" value={f.scope} />
                <input type="hidden" name="back" value={back} />
                <Field label="Question" name="question" defaultValue={f.question} required />
                <TextArea label="Answer" name="answer" rows={3} defaultValue={f.answer} />
                <Field label="Sort" name="sort" type="number" defaultValue={f.sort} />
                <SubmitButton label="Save FAQ" />
              </form>
              <ConfirmDeleteForm
                action={deleteFaq}
                className="mt-2"
                itemLabel="this FAQ"
              >
                <input type="hidden" name="id" value={f.id} />
                <input type="hidden" name="back" value={back} />
                <button className="text-xs font-semibold text-red-600 hover:text-red-700">
                  Delete FAQ
                </button>
              </ConfirmDeleteForm>
            </div>
          ))}
        </div>
        <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5">
          <h3 className="font-display font-bold text-ink-950 mb-3">Add FAQ</h3>
          <form action={saveFaq} className="space-y-3">
            <input type="hidden" name="scope" value={`country:${hub.slug}`} />
            <input type="hidden" name="back" value={back} />
            <Field label="Question" name="question" required />
            <TextArea label="Answer" name="answer" rows={3} />
            <Field label="Sort" name="sort" type="number" defaultValue={faqs.length * 10 + 10} />
            <SubmitButton label="Add FAQ" />
          </form>
        </div>
      </section>

      <div className="border-t border-cream-300 pt-6">
        <ConfirmDeleteForm
          action={deleteCountryHub}
          itemLabel={`country “${hub.name}” and its schemes/FAQs`}
        >
          <input type="hidden" name="id" value={hub.id} />
          <button className="text-sm font-semibold text-red-600 hover:text-red-700">
            Delete this country hub
          </button>
        </ConfirmDeleteForm>
      </div>
    </div>
  );
}
