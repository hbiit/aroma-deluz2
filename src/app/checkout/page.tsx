"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart, type CartItem } from "@/components/cart-provider";
import { useAuth } from "@/components/auth-provider";
import { formatNaira } from "@/lib/format";

interface CheckoutResponse {
  reference?: string;
  authorizationUrl?: string | null;
  demo?: boolean;
  error?: string;
}

export default function CheckoutPage() {
  const { items, subtotalKobo, clear, hydrated } = useCart();
  const { user, available, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          fullName: form.get("fullName"),
          phone: form.get("phone"),
          address: form.get("address"),
          city: form.get("city"),
          state: form.get("state"),
          note: form.get("note"),
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
        }),
      });
      const data = (await res.json()) as CheckoutResponse;
      if (!res.ok || !data.reference) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      if (data.authorizationUrl) {
        clear(); // order is placed — empty the cart before the gateway redirect
        window.location.assign(data.authorizationUrl); // Paystack hosted page
        return;
      }
      // Demo mode: go straight to the success page with the order reference.
      clear();
      router.replace(`/checkout/success?reference=${encodeURIComponent(data.reference)}&demo=1`);
    } catch {
      setError("Network error — please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <p className="eyebrow text-center">Secure checkout</p>
      <h1 className="section-title mt-2 text-center">Checkout</h1>

      {hydrated && items.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-sm text-purple-ink/70">Your cart is empty.</p>
          <Link href="/products" className="btn-purple mt-6">
            Discover the collection
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {available && !user && (
              <div className="border border-gold/40 bg-cream px-5 py-4 text-sm text-purple-ink/80">
                <button
                  type="button"
                  onClick={() => void signInWithGoogle("/checkout")}
                  className="font-semibold text-purple-deep underline underline-offset-4 transition hover:text-gold"
                >
                  Sign in with Google
                </button>{" "}
                for a faster checkout — or continue as a guest below.
              </div>
            )}

            <fieldset className="space-y-4" disabled={submitting}>
              <legend className="text-[0.7rem] font-semibold tracking-[0.25em] text-purple-deep uppercase">
                Contact
              </legend>
              <input className="input-lux" type="email" name="email" required placeholder="Email address *" autoComplete="email" />
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="input-lux" name="fullName" placeholder="Full name" autoComplete="name" />
                <input className="input-lux" name="phone" placeholder="Phone number" autoComplete="tel" />
              </div>
            </fieldset>

            <fieldset className="space-y-4" disabled={submitting}>
              <legend className="text-[0.7rem] font-semibold tracking-[0.25em] text-purple-deep uppercase">
                Delivery address
              </legend>
              <input className="input-lux" name="address" required placeholder="Street address *" autoComplete="street-address" />
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="input-lux" name="city" required placeholder="City *" autoComplete="address-level2" />
                <input className="input-lux" name="state" required placeholder="State *" autoComplete="address-level1" />
              </div>
              <textarea
                className="input-lux min-h-20"
                name="note"
                placeholder="Delivery note (optional) — e.g. landmark, gift message"
              />
            </fieldset>

            {error && (
              <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {error}
              </p>
            )}

            <SubmitButton submitting={submitting} />
            <p className="text-xs leading-relaxed text-purple-ink/60">
              You will be redirected to Paystack&apos;s secure hosted page to
              complete payment in Naira (₦). By placing this order you agree to
              our terms of service and 14-day return policy.
            </p>
          </form>

          <OrderSummary items={items} subtotalKobo={subtotalKobo} />
        </div>
      )}
    </div>
  );
}

function SubmitButton({ submitting }: { submitting: boolean }) {
  return (
    <button type="submit" disabled={submitting} className="btn-gold w-full disabled:cursor-wait disabled:opacity-60">
      {submitting ? "Starting secure checkout…" : "Pay with Paystack"}
    </button>
  );
}

function OrderSummary({ items, subtotalKobo }: { items: CartItem[]; subtotalKobo: number }) {
  return (
    <aside className="h-fit border border-purple-deep/10 bg-cream p-6">
      <h2 className="text-[0.7rem] font-semibold tracking-[0.25em] text-purple-deep uppercase">
        Your order
      </h2>
      <ul className="mt-4 space-y-4">
        {items.map((i) => (
          <li key={i.id} className="flex items-center gap-3">
            <span className="relative h-16 w-14 shrink-0 overflow-hidden bg-cream">
              {i.image_url && (
                <Image src={i.image_url} alt={i.name} fill sizes="56px" className="object-cover" />
              )}
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-deep text-[0.6rem] font-semibold text-gold">
                {i.qty}
              </span>
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-ink">{i.name}</p>
              <p className="text-xs text-purple-ink/60">Qty {i.qty}</p>
            </div>
            <p className="text-sm text-purple-deep">{formatNaira(i.price_kobo * i.qty)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex justify-between border-t border-purple-deep/10 pt-4">
        <span className="text-sm font-semibold tracking-[0.15em] text-purple-deep uppercase">Total</span>
        <span className="font-serif text-2xl text-gold">{formatNaira(subtotalKobo)}</span>
      </div>
      <p className="mt-3 text-xs text-purple-ink/60">
        Paid securely in NGN via Paystack. Prices are re-verified on the
        server before payment.
      </p>
    </aside>
  );
}
