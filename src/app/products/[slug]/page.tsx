import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { KIND_EYEBROW, getProductBySlug, getProducts } from "@/lib/products";
import { AddToCartPanel } from "@/components/add-to-cart-panel";
import { ProductCard } from "@/components/product-card";
import { formatNaira } from "@/lib/format";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await getProducts({ category: product.category }))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <nav className="text-[0.65rem] tracking-[0.2em] text-purple-ink/60 uppercase">
        <Link href="/products" className="transition hover:text-gold">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-purple-ink">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden bg-cream">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          )}
        </div>

        <div className="flex flex-col">
          <p className="eyebrow">{KIND_EYEBROW[product.category]}</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-purple-ink md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-2 font-serif text-3xl text-gold">{formatNaira(product.price_kobo)}</p>

          {product.description && (
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-purple-ink/80">
              {product.description}
            </p>
          )}

          {product.scent_notes && product.scent_notes.length > 0 && (
            <div className="mt-6">
              <h2 className="text-[0.7rem] font-semibold tracking-[0.25em] text-purple-deep uppercase">
                Scent notes
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.scent_notes.map((n) => (
                  <span
                    key={n}
                    className="border border-gold/50 px-3 py-1 text-[0.65rem] tracking-[0.15em] text-purple-deep uppercase"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          <AddToCartPanel product={product} />

          <dl className="mt-10 space-y-3 border-t border-purple-deep/10 pt-6 text-sm text-purple-ink/75">
            <div className="flex gap-2">
              <dt className="font-medium text-purple-deep">Collection</dt>
              <dd>{product.collection ?? "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-purple-deep">Availability</dt>
              <dd>{product.stock > 0 ? `In stock — ${product.stock} available` : "Sold out"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-purple-deep">Delivery</dt>
              <dd>Nationwide, 2–5 working days · Complimentary over ₦150,000</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="section-title text-center">You may also love</h2>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
