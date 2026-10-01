import Link from "next/link";
import { COLLECTIONS, KIND_PLURAL, PRODUCT_KINDS, getProducts, isCategory } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export const metadata = { title: "Shop" };

interface SearchParams {
  category?: string;
  collection?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, collection } = await searchParams;
  const validCategory = category && isCategory(category) ? category : undefined;
  const products = await getProducts({ category: validCategory, collection });

  const collectionTitle = COLLECTIONS.find((c) => c.slug === collection)?.title;

  const buildHref = (patch: { category?: string; collection?: string }) => {
    const params = new URLSearchParams();
    const merged = { category: validCategory, collection, ...patch };
    if (merged.category) params.set("category", merged.category);
    if (merged.collection) params.set("collection", merged.collection);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <p className="eyebrow text-center">The collection</p>
      <h1 className="section-title mt-2 text-center">
        {collectionTitle ?? (validCategory ? KIND_PLURAL[validCategory] : "Candles & Fragrances")}
      </h1>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <FilterPill href={buildHref({ category: undefined })} active={!validCategory}>
          Everything
        </FilterPill>
        {PRODUCT_KINDS.map((kind) => (
          <FilterPill key={kind} href={buildHref({ category: kind })} active={validCategory === kind}>
            {KIND_PLURAL[kind]}
          </FilterPill>
        ))}
        <span className="mx-2 hidden h-4 w-px bg-purple-deep/20 md:block" />
        {COLLECTIONS.map((c) => (
          <FilterPill
            key={c.slug}
            href={buildHref({ collection: collection === c.slug ? undefined : c.slug })}
            active={collection === c.slug}
          >
            {c.title}
          </FilterPill>
        ))}
      </div>

      <p className="mt-6 text-center text-xs tracking-[0.2em] text-purple-ink/60 uppercase">
        {products.length} {products.length === 1 ? "creation" : "creations"}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`border px-4 py-2 text-[0.65rem] font-medium tracking-[0.2em] uppercase transition ${
        active
          ? "border-purple-deep bg-purple-deep text-gold"
          : "border-purple-deep/25 bg-white text-purple-ink hover:border-gold hover:text-gold"
      }`}
    >
      {children}
    </Link>
  );
}
