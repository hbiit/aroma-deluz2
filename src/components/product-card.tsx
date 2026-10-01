"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart-provider";
import { formatNaira } from "@/lib/format";
import { KIND_BADGE, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <div className="group flex w-full flex-col border border-purple-deep/10 bg-white transition hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-cream">
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        <span className="absolute top-3 right-3 bg-purple-deep/85 px-2 py-1 text-[0.6rem] tracking-[0.15em] text-gold uppercase">
          {KIND_BADGE[product.category]}
        </span>
      </Link>

      <div className="flex flex-1 flex-col items-center gap-1 px-4 py-5 text-center">
        <Link
          href={`/products/${product.slug}`}
          className="font-serif text-lg font-semibold tracking-wide text-purple-ink transition hover:text-purple-deep"
        >
          {product.name}
        </Link>
        {product.collection && (
          <span className="text-[0.65rem] tracking-[0.25em] text-gold uppercase">{product.collection}</span>
        )}
        <span className="mt-1 font-serif text-xl text-purple-deep">{formatNaira(product.price_kobo)}</span>
        <button
          onClick={() =>
            add({
              id: product.id,
              slug: product.slug,
              name: product.name,
              price_kobo: product.price_kobo,
              image_url: product.image_url,
            })
          }
          className="btn-purple mt-4 w-full py-2.5"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
