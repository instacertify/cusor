"use client";

import { useState } from "react";
import Link from "next/link";
import type { CertProduct } from "@/lib/db";
import { saveCertProduct, deleteCertProduct } from "@/app/admin/actions";
import { Field, TextArea, SubmitButton, ImageUpload } from "@/components/admin/Field";

export default function CertProductExpandableList({
  products,
  certificationId,
  certSlug,
  hideLabs = false,
  initialOpenId = null,
}: {
  products: CertProduct[];
  certificationId: number;
  certSlug: string;
  hideLabs?: boolean;
  initialOpenId?: number | null;
}) {
  const [openId, setOpenId] = useState<number | null>(initialOpenId);

  if (products.length === 0) {
    return (
      <p className="px-5 py-5 text-sm text-ink-600">
        No products in this list yet. Use <strong>Add covered product</strong> below, then edit any
        row to enlarge and update its fields.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-cream-100">
      {products.map((p) => {
        const open = openId === p.id;
        return (
          <li key={p.id} id={`product-${p.id}`} className="scroll-mt-24">
            <div
              className={`flex flex-wrap items-center gap-3 px-5 py-3 ${
                open ? "bg-butter-300/20" : "hover:bg-cream-50"
              }`}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink-950 truncate">{p.name}</span>
                <span className="block text-xs text-ink-500 truncate">
                  {p.standards || "No standard set"}
                  {p.regime ? ` · ${p.regime}` : ""}
                  {p.family ? ` · ${p.family}` : ""}
                </span>
              </span>
              <Link
                href={`/certifications/${certSlug}/products/${p.slug}`}
                target="_blank"
                className="text-xs font-bold text-ink-600"
              >
                View ↗
              </Link>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : p.id)}
                className={`text-xs font-bold rounded-lg px-3 py-1.5 border transition ${
                  open
                    ? "bg-ink-900 text-white border-ink-900"
                    : "bg-white text-butter-700 border-cream-300 hover:border-butter-400"
                }`}
              >
                {open ? "Close" : "Edit"}
              </button>
            </div>

            {open && (
              <div className="px-5 pb-5 pt-2 bg-cream-50 border-t border-cream-200">
                <p className="text-xs text-ink-600 mb-3">
                  Editing <strong>{p.name}</strong> — enlarge this option, update fields, then save.
                </p>
                <form action={saveCertProduct} className="space-y-3 bg-white rounded-xl border border-cream-300 p-4">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="certification_id" value={certificationId} />
                  <input type="hidden" name="return_to" value="cert" />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Product name" name="name" defaultValue={p.name} required />
                    <Field label="Slug" name="slug" defaultValue={p.slug} />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Field label="Family / group" name="family" defaultValue={p.family} />
                    <Field label="Regime" name="regime" defaultValue={p.regime} />
                    <Field label="Sort" name="sort" type="number" defaultValue={String(p.sort)} />
                  </div>
                  <Field label="Standards" name="standards" defaultValue={p.standards} />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field
                      label="Min testing price (INR)"
                      name="min_price"
                      type="number"
                      defaultValue={p.min_price != null ? String(p.min_price) : ""}
                    />
                    <Field
                      label="Max testing price (INR)"
                      name="max_price"
                      type="number"
                      defaultValue={p.max_price != null ? String(p.max_price) : ""}
                    />
                  </div>
                  <TextArea label="Summary" name="summary" defaultValue={p.summary} rows={2} />
                  {!hideLabs && (
                    <TextArea label="Labs (indicative)" name="labs" defaultValue={p.labs} rows={2} />
                  )}
                  {hideLabs && <input type="hidden" name="labs" value="" />}
                  <TextArea label="Fee note" name="fee_note" defaultValue={p.fee_note} rows={2} />
                  <TextArea label="Content (Markdown)" name="content" defaultValue={p.content} rows={6} />
                  <TextArea
                    label="Extras JSON"
                    name="extras"
                    defaultValue={p.extras || "{}"}
                    rows={2}
                    hint='Optional structured fields, e.g. {"star_table":"…","emc":"Yes"}'
                  />
                  <ImageUpload current={p.image} label="Product image" />
                  <div className="flex flex-wrap items-center gap-3">
                    <SubmitButton label="Save changes" />
                    <button
                      type="button"
                      onClick={() => setOpenId(null)}
                      className="text-sm font-bold text-ink-600 hover:text-ink-900"
                    >
                      Collapse
                    </button>
                  </div>
                </form>
                <form action={deleteCertProduct} className="mt-3">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="certification_id" value={certificationId} />
                  <button className="text-xs font-semibold text-red-600 hover:text-red-700">
                    Delete this product
                  </button>
                </form>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
