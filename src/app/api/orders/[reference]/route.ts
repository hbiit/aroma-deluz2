import { NextResponse } from "next/server";
import { processVerification } from "@/lib/orders";

/**
 * GET /api/orders/:reference — runs server-side Paystack verification for
 * the order, persists the new status, sends the Mailgun confirmation exactly
 * once, and returns a customer-safe summary.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const { order, result } = await processVerification(reference);

  if (result === "not-found" || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: result === "verified" ? "paid" : result,
    order: {
      reference: order.reference,
      email: order.email,
      full_name: order.full_name,
      status: order.status,
      total_kobo: order.total_kobo,
      demo: order.demo,
      items: order.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit_price_kobo: i.unit_price_kobo,
      })),
    },
  });
}
