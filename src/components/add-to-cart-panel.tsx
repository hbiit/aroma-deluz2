"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import type { Product } from "@/lib/products";

export function AddToCartPanel({ product }: { product: Product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const soldOut = product.stock <= 0;

  function handleAdd() {
    add(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price_kobo: product.price_kobo,
        image_url: product.image_url,
      },
      qty,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center border border-purple-deep/25">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-3 text-purple-deep transition hover:text-gold"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center font-medium" aria-live="polite">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="px-4 py-3 text-purple-deep transition hover:text-gold"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button onClick={handleAdd} disabled={soldOut} className="btn-purple flex-1 disabled:cursor-not-allowed disabled:opacity-40">
          {soldOut ? "Sold out" : "Add to cart"}
        </button>
      </div>

      {added && (
        <p className="mt-4 flex items-center gap-2 text-sm text-purple-deep" role="status">
          <span className="text-gold">✦</span>
          Added to your cart —{" "}
          <Link href="/cart" className="font-semibold underline underline-offset-4 hover:text-gold">
            view cart
          </Link>
        </p>
      )}
    </div>
  );
}
