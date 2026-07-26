import { NextRequest, NextResponse } from "next/server";
import { searchProducts, getLabs, getCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const products = searchProducts(q, 5).map((p) => ({
    type: "product" as const,
    name: p.name,
    detail: `${p.standard} · ${p.category_name}`,
    href: `/product/${p.slug}`,
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
    results: [...products, ...categories, ...labResults].slice(0, 8),
  });
}
