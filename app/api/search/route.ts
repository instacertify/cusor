import { NextRequest, NextResponse } from "next/server";
import { searchProducts, getLabs, getCategories, getCertifications } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const products = searchProducts(q, 5).map((p) => ({
    type: "product" as const,
    name: p.name,
    detail: `${p.standard} · ${p.scheme}${p.qco_status ? ` · ${p.qco_status}` : ""} · ${p.lab_count} labs`,
    href: `/product/${p.slug}`,
  }));

  const lq = q.toLowerCase();
  const certifications = getCertifications()
    .filter(
      (c) =>
        c.name.toLowerCase().includes(lq) ||
        c.full_name.toLowerCase().includes(lq) ||
        c.slug.includes(lq)
    )
    .slice(0, 2)
    .map((c) => ({
      type: "certification" as const,
      name: `${c.name} Certification`,
      detail: `${c.region} · ${c.full_name}`,
      href: `/certifications/${c.slug}`,
    }));

  const categories = getCategories()
    .filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 2)
    .map((c) => ({
      type: "category" as const,
      name: c.name,
      detail: `${c.product_count} products`,
      href: `/category/${c.slug}`,
    }));

  const { labs } = getLabs({ q, limit: 3 });
  const labResults = labs.map((l) => ({
    type: "lab" as const,
    name: l.name,
    detail: [l.city, l.state].filter(Boolean).join(", "),
    href: `/labs/${l.slug}`,
  }));

  return NextResponse.json({
    results: [...certifications, ...products, ...categories, ...labResults].slice(0, 9),
  });
}
