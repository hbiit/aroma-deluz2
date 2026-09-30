"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart-provider";
import { formatNaira } from "@/lib/format";

export default function CartPage() {
  const { items, count, subtotalKobo, setQty, remove, hydrated } = useCart();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <p className="eyebrow text-center">Your selection</p>
      <h1 className="section-title mt-2 text-center">Your Cart</h1>

      {!hydrated ? (
        <p className="mt-12 text-center text-sm text-purple-ink/60">Loading your cart…</p>
      ) : items.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-sm text-purple-ink/70">Your cart is empty.</p>
          <Link href="/products" className="btn-purple mt-6">
            Discover the collection
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-purple-deep/10 border-y border-purple-deep/10">
            {items.map((item) => (
              <li key={item.id} className="flex gap-5 py-6">
                <Link
                  href={`/products/${item.slug}`}
                  className="relative h-28 w-24 shrink-0 overflow-hidden bg-cream"
                >
                  {item.image_url && (
                    <Image src={item.image_url} alt={item.name} fill sizes="96px" className="object-cover" />
                  )}
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-serif text-lg font-semibold text-purple-ink transition hover:text-gold"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-purple-ink/70">{formatNaira(item.price_kobo)} each</p>
                    </div>
                    <button
                      onClick={() => remove(item.id)}
                      className="text-xs tracking-[0.15em] text-purple-ink/50 uppercase transition hover:text-gold"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center border border-purple-deep/25">
                      <button
                        onClick={() => setQty(item.id, item.qty - 1)}
                        className="px-3 py-2 text-purple-deep transition hover:text-gold"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm" aria-live="polite">{item.qty}</span>
                      <button
                        onClick={() => setQty(item.id, item.qty + 1)}
                        className="px-3 py-2 text-purple-deep transition hover:text-gold"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                    <p className="font-serif text-lg text-purple-deep">
                      {formatNaira(item.price_kobo * item.qty)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-purple-deep/10 bg-cream p-6">
            <h2 className="text-[0.7rem] font-semibold tracking-[0.25em] text-purple-deep uppercase">
              Order summary
            </h2>
            <div className="mt-4 flex justify-between text-sm text-purple-ink/80">
              <span>Items</span>
              <span>{count}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-purple-deep/10 pt-4">
              <span className="text-sm font-semibold tracking-[0.15em] text-purple-deep uppercase">Subtotal</span>
              <span className="font-serif text-2xl text-gold">{formatNaira(subtotalKobo)}</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-purple-ink/60">
              Complimentary delivery on orders over ₦150,000. Delivery is
              calculated at Paystack&apos;s secure checkout.
            </p>
            <Link href="/checkout" className="btn-gold mt-6 w-full text-center">
              Proceed to checkout
            </Link>
            <Link
              href="/products"
              className="mt-4 block text-center text-[0.65rem] tracking-[0.2em] text-purple-ink/60 uppercase transition hover:text-gold"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
