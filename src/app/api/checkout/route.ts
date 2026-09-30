import { NextResponse } from "next/server";
import { CartError, PricingError, createPendingOrder, priceCart, savePaystackSession } from "@/lib/orders";
import { initializeTransaction, paystackEnabled } from "@/lib/paystack";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CheckoutBody {
  email?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  note?: string;
  items?: { id?: string; qty?: number }[];
}

/**
 * POST /api/checkout — re-prices the cart from the database (client prices
 * are never trusted), stores a pending order, initializes a Paystack NGN
 * transaction and returns the hosted-page URL. Demo mode returns
 * authorization_url null and the success page confirms it.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CheckoutBody | null;
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!body.address?.trim() || !body.city?.trim() || !body.state?.trim()) {
    return NextResponse.json(
      { error: "Delivery address, city and state are required." },
      { status: 400 },
    );
  }

  try {
    const lines = (body.items ?? []).map((i) => ({
      id: String(i?.id ?? ""),
      qty: Number(i?.qty ?? 0),
    }));
    const { items, total_kobo } = await priceCart(lines);

    // Link the order to the signed-in Google user, when there is one.
    let userId: string | null = null;
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    }

    const order = await createPendingOrder({
      email,
      full_name: body.fullName?.trim() || null,
      phone: body.phone?.trim() || null,
      address: body.address.trim(),
      city: body.city.trim(),
      state: body.state.trim(),
      note: body.note?.trim() || null,
      userId,
      items,
      total_kobo,
    });

    let authorizationUrl: string | null = null;
    if (paystackEnabled()) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
      const result = await initializeTransaction({
        email,
        amountKobo: total_kobo,
        reference: order.reference,
        callbackUrl: `${siteUrl}/checkout/success`,
      });
      authorizationUrl = result.authorization_url;
      if (result.authorization_url && result.access_code) {
        await savePaystackSession(
          order.reference,
          result.authorization_url,
          result.access_code,
        );
      }
    }

    return NextResponse.json({
      reference: order.reference,
      authorizationUrl,
      demo: !paystackEnabled(),
    });
  } catch (e) {
    if (e instanceof CartError || e instanceof PricingError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("[checkout] failed:", e);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 },
    );
  }
}
