import Link from "next/link";
import { processVerification } from "@/lib/orders";
import { formatNaira } from "@/lib/format";

export const metadata = { title: "Order confirmed" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ reference?: string }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const { reference } = await searchParams;
  const outcome = reference ? await processVerification(reference) : null;
  const order = outcome?.order ?? null;
  const result = outcome?.result ?? "not-found";

  const paid = result === "verified" && order?.status === "paid";
  const failed = result === "failed" || result === "not-found";
  const confirming = !paid && !failed;
  const demoBadge = order?.demo === true;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8">
      <p className="eyebrow">{paid ? "Thank you" : "Payment status"}</p>
      <h1 className="mt-3 font-serif text-4xl font-medium text-purple-ink md:text-5xl">
        {paid
          ? "Order confirmed"
          : confirming
            ? "Confirming your payment…"
            : "We couldn't confirm this order"}
      </h1>

      {demoBadge && paid && (
        <p className="mx-auto mt-6 inline-block border border-gold bg-cream px-4 py-2 text-xs tracking-[0.15em] text-purple-deep uppercase">
          Demo mode — no payment was taken
        </p>
      )}

      {failed && (
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-purple-ink/70">
          {result === "not-found"
            ? "We couldn't find this order reference. If you complete a new order we'll take good care of it."
            : "The payment was not completed or the amount could not be verified. No charge has been captured for this order."}
        </p>
      )}

      {confirming && (
        <div className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-purple-ink/70">
          <p>
            Paystack is still processing this payment — this page verifies
            server-side and usually completes within moments.
          </p>
          <p className="mt-2 text-xs text-purple-ink/50">Reference: {reference}</p>
          <a href={`/checkout/success?reference=${encodeURIComponent(reference ?? "")}`} className="btn-purple mt-6">
            Check again
          </a>
        </div>
      )}

      {paid && order && (
        <div className="mt-10 border border-purple-deep/10 bg-cream p-8 text-left">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="text-[0.7rem] font-semibold tracking-[0.25em] text-purple-deep uppercase">
              Order {order.reference.slice(0, 8).toUpperCase()}
            </h2>
            <p className="text-xs text-purple-ink/60">
              A confirmation email is on its way to {order.email}
            </p>
          </div>

          <ul className="mt-6 divide-y divide-purple-deep/10">
            {order.items.map((i) => (
              <li key={`${i.product_id}-${i.name}`} className="flex items-center justify-between py-3 text-sm">
                <span className="text-purple-ink">
                  {i.name} <span className="text-purple-ink/50">× {i.quantity}</span>
                </span>
                <span className="text-purple-deep">{formatNaira(i.unit_price_kobo * i.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-between border-t border-purple-deep/10 pt-4">
            <span className="text-sm font-semibold tracking-[0.15em] text-purple-deep uppercase">Total paid</span>
            <span className="font-serif text-2xl text-gold">{formatNaira(order.total_kobo)}</span>
          </div>

          {(order.address || order.city || order.state) && (
            <div className="mt-6 text-sm text-purple-ink/75">
              <h3 className="text-[0.65rem] font-semibold tracking-[0.25em] text-purple-deep uppercase">
                Delivering to
              </h3>
              <p className="mt-1">
                {[order.full_name, order.address, order.city, order.state].filter(Boolean).join(", ")}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link href="/products" className="btn-purple">
          Continue shopping
        </Link>
        {failed && (
          <Link href="/cart" className="text-[0.7rem] font-semibold tracking-[0.2em] text-purple-deep uppercase transition hover:text-gold">
            Return to cart
          </Link>
        )}
      </div>
    </div>
  );
}
