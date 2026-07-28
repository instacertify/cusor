import { getDb } from "@/lib/db";
import type { Category, Certification, PageRecord, Product } from "@/lib/db";
import { imageKindForEntity } from "@/lib/image-upload-guide";
import { saveEntityImage } from "../../actions";
import { ImageUpload, SavedBanner, SubmitButton } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminMediaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const db = getDb();
  const pages = db.prepare("SELECT * FROM pages ORDER BY slug").all() as PageRecord[];
  const certs = db
    .prepare("SELECT * FROM certifications ORDER BY sort, id")
    .all() as Certification[];
  const categories = db
    .prepare("SELECT * FROM categories ORDER BY name LIMIT 40")
    .all() as Category[];
  const featured = db
    .prepare("SELECT id, name, slug, image FROM products WHERE featured = 1 ORDER BY name LIMIT 24")
    .all() as Pick<Product, "id" | "name" | "slug" | "image">[];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">Front Images</h1>
      <p className="text-ink-600 text-sm mb-6">
        Upload or replace images used on the public site — homepage hero, content pages, certifications,
        categories and featured products. Each field shows recommended size; PNG/JPG/WebP/GIF/SVG/AVIF/BMP/TIFF/HEIC
        accepted (max 12 MB).
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <Section title="Pages (homepage hero, about, guide…)">
        {pages.map((p) => (
          <ImageCard
            key={p.slug}
            title={p.title || p.slug}
            detail={`/${p.slug === "home" ? "" : p.slug}`}
            current={p.image}
            entity="page"
            id={p.slug}
          />
        ))}
      </Section>

      <Section title="Certifications">
        {certs.map((c) => (
          <ImageCard
            key={c.id}
            title={c.name}
            detail={`/certifications/${c.slug}`}
            current={c.image}
            entity="cert"
            id={String(c.id)}
          />
        ))}
      </Section>

      <Section title="BIS categories (top 40)">
        {categories.map((c) => (
          <ImageCard
            key={c.id}
            title={c.name}
            detail={`/category/${c.slug}`}
            current={c.image}
            entity="category"
            id={String(c.id)}
          />
        ))}
      </Section>

      <Section title="Featured BIS products">
        {featured.map((p) => (
          <ImageCard
            key={p.id}
            title={p.name}
            detail={`/product/${p.slug}`}
            current={p.image}
            entity="product"
            id={String(p.id)}
          />
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-xl font-semibold text-ink-950 mb-4">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function ImageCard({
  title,
  detail,
  current,
  entity,
  id,
}: {
  title: string;
  detail: string;
  current: string;
  entity: string;
  id: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-4">
      <div className="mb-3">
        <div className="font-semibold text-ink-950 text-sm">{title}</div>
        <div className="text-[11px] text-ink-500">{detail}</div>
      </div>
      <form action={saveEntityImage} className="space-y-3">
        <input type="hidden" name="entity" value={entity} />
        <input type="hidden" name="id" value={id} />
        <ImageUpload current={current} label="Image" size={imageKindForEntity(entity)} />
        <SubmitButton label="Save image" />
      </form>
    </div>
  );
}
