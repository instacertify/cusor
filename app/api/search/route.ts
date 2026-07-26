import { NextRequest, NextResponse } from "next/server";
import {
  searchProducts,
  searchCertProducts,
  getLabs,
  getCategories,
  getCertifications,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const lq = q.toLowerCase();

  const certifications = getCertifications()
    .filter(
      (c) =>
        c.name.toLowerCase().includes(lq) ||
        c.full_name.toLowerCase().includes(lq) ||
        c.slug.includes(lq) ||
        c.summary.toLowerCase().includes(lq)
    )
    .slice(0, 3)
    .map((c) => ({
      type: "certification" as const,
      name: `${c.name} Certification`,
      detail: `${c.region} · ${c.full_name}`,
      href: `/certifications/${c.slug}`,
    }));

  const certProducts = searchCertProducts(q, 4).map((p) => ({
    type: "cert-product" as const,
    name: p.name,
    detail: `${p.cert_name} · ${p.regime || p.family}${p.standards ? ` · ${p.standards}` : ""}`,
    href: `/certifications/${p.cert_slug}/products/${p.slug}`,
  }));

  const products = searchProducts(q, 4).map((p) => ({
    type: "product" as const,
    name: p.name,
    detail: `BIS · ${p.standard} · ${p.scheme}${p.qco_status ? ` · ${p.qco_status}` : ""}`,
    href: `/product/${p.slug}`,
  }));

  const categories = getCategories()
    .filter((c) => c.name.toLowerCase().includes(lq))
    .slice(0, 2)
    .map((c) => ({
      type: "category" as const,
      name: c.name,
      detail: `BIS category · ${c.product_count} products`,
      href: `/category/${c.slug}`,
    }));

  const { labs } = getLabs({ q, limit: 2 });
  const labResults = labs.map((l) => ({
    type: "lab" as const,
    name: l.name,
    detail: [l.city, l.state].filter(Boolean).join(", ") || "Testing lab",
    href: `/labs/${l.slug}`,
  }));

  return NextResponse.json({
    results: [
      ...certifications,
      ...certProducts,
      ...products,
      ...categories,
      ...labResults,
    ].slice(0, 12),
  });
}
