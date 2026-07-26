import Link from "next/link";
import type { Product } from "@/lib/db";
import { formatPriceRange } from "@/lib/format";
import IconChip from "./IconChip";
import RequestQuoteButton from "./RequestQuoteButton";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition p-5 flex flex-col gap-3">
      <Link href={`/product/${product.slug}`} className="flex flex-col gap-3 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <IconChip name={product.category_icon ?? "box"} size={22} chip="md" tone="neutral" />
          <span
            className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2.5 py-1 ${
              product.scheme === "CRS"
                ? "bg-ink-300/30 text-ink-700"
                : "bg-butter-300/50 text-butter-700"
            }`}
          >
            {product.scheme}
          </span>
        </div>
        <h3 className="font-display font-semibold text-ink-950 leading-snug line-clamp-2 group-hover:text-butter-700 transition">
          {product.name}
        </h3>
        <p className="text-xs text-ink-500">{product.standard}</p>
        <div className="flex items-center justify-between text-xs font-medium text-ink-700 pt-2 border-t border-cream-200">
          <span>{formatPriceRange(product.min_price, product.max_price)}</span>
          <span>
            {product.lab_count} lab{product.lab_count === 1 ? "" : "s"}
          </span>
        </div>
      </Link>
      <RequestQuoteButton subject={product.name} kind="product" variant="compact" short />
    </div>
  );
}
