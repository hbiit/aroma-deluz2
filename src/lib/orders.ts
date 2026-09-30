import { randomUUID } from "crypto";
import { DEMO_PRODUCTS, dataMode } from "@/lib/products";
import { paystackEnabled, verifyTransaction } from "@/lib/paystack";
import { sendOrderConfirmation } from "@/lib/email";

/**
 * Order lifecycle shared by POST /api/checkout, GET /api/orders/[reference]
 * and the success page. In supabase mode every write goes through the
 * service-role client; without Supabase env vars a documented in-memory
 * store keeps the demo fully working (per-process, reset on restart).
 */

export type OrderStatus = "pending" | "paid" | "cancelled" | "failed";

export interface OrderRecord {
  id: string;
  reference: string;
  user_id: string | null;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  note: string | null;
  status: OrderStatus;
  total_kobo: number;
  paystack_authorization_url: string | null;
  paystack_access_code: string | null;
  demo: boolean;
  email_sent_at: string | null;
  created_at: string;
}

export interface OrderItemRecord {
  order_id: string;
  product_id: string | null;
  name: string;
  unit_price_kobo: number;
  quantity: number;
}

export interface FullOrder extends OrderRecord {
  items: OrderItemRecord[];
}

export class CartError extends Error {}
export class PricingError extends Error {}

// ---------------------------------------------------------------------------
// Cart re-pricing (client prices are never trusted)
// ---------------------------------------------------------------------------

export interface CartLineInput {
  id: string;
  qty: number;
}

export interface PricedLine {
  product_id: string;
  name: string;
  unit_price_kobo: number;
  quantity: number;
}

export async function priceCart(lines: CartLineInput[]): Promise<{
  items: PricedLine[];
  total_kobo: number;
}> {
  // Merge duplicate product ids and drop invalid quantities.
  const qtyById = new Map<string, number>();
  for (const line of lines) {
    const qty = Math.floor(Number(line?.qty));
    if (!Number.isFinite(qty) || qty <= 0 || !line?.id) continue;
    qtyById.set(line.id, Math.min((qtyById.get(line.id) ?? 0) + qty, 99));
  }
  if (qtyById.size === 0) throw new CartError("Your cart is empty.");

  const ids = [...qtyById.keys()];
  let products: { id: string; name: string; price_kobo: number }[] = [];

  if (dataMode() === "supabase") {
    const { getAdminClient } = await import("@/lib/supabase/admin");
    const { data, error } = await getAdminClient()
      .from("products")
      .select("id, name, price_kobo")
      .in("id", ids);
    if (error) throw new PricingError("Could not price your cart. Please try again.");
    products = data ?? [];
    if (products.length === 0) {
      throw new PricingError("Products unavailable — has the catalog been seeded?");
    }
  } else {
    products = DEMO_PRODUCTS.filter((p) => ids.includes(p.id));
  }

  const items: PricedLine[] = [];
  for (const p of products) {
    const qty = qtyById.get(p.id);
    if (!qty) continue; // id that doesn't exist in the catalog — ignore
    items.push({
      product_id: p.id,
      name: p.name,
      unit_price_kobo: p.price_kobo,
      quantity: qty,
    });
  }
  if (items.length === 0) throw new CartError("None of these products are available.");

  const total_kobo = items.reduce((sum, i) => sum + i.unit_price_kobo * i.quantity, 0);
  return { items, total_kobo };
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

export interface CreateOrderInput {
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  note: string | null;
  userId: string | null;
  items: PricedLine[];
  total_kobo: number;
}

export async function createPendingOrder(input: CreateOrderInput): Promise<FullOrder> {
  const id = randomUUID();
  const base: FullOrder = {
    id,
    reference: id,
    user_id: input.userId,
    email: input.email,
    full_name: input.full_name,
    phone: input.phone,
    address: input.address,
    city: input.city,
    state: input.state,
    note: input.note,
    status: "pending",
    total_kobo: input.total_kobo,
    paystack_authorization_url: null,
    paystack_access_code: null,
    demo: !paystackEnabled(),
    email_sent_at: null,
    created_at: new Date().toISOString(),
    items: input.items.map((i) => ({ ...i, order_id: id })),
  };

  if (dataMode() === "supabase") {
    const { getAdminClient } = await import("@/lib/supabase/admin");
    const { items, ...order } = base;
    const { error } = await getAdminClient().from("orders").insert(order);
    if (error) throw new Error(`Could not create order: ${error.message}`);
    const { error: itemsError } = await getAdminClient()
      .from("order_items")
      .insert(items);
    if (itemsError) throw new Error(`Could not record order items: ${itemsError.message}`);
    return base;
  }

  demoOrders.set(base.reference, base);
  return base;
}

export async function getOrderByReference(reference: string): Promise<FullOrder | null> {
  if (dataMode() === "supabase") {
    const { getAdminClient } = await import("@/lib/supabase/admin");
    const { data, error } = await getAdminClient()
      .from("orders")
      .select("*, order_items(*)")
      .eq("reference", reference)
      .maybeSingle();
    if (error) {
      console.error("[orders] lookup failed:", error.message);
      return null;
    }
    if (!data) return null;
    const { order_items, ...order } = data as OrderRecord & {
      order_items: OrderItemRecord[];
    };
    return { ...order, items: order_items ?? [] };
  }
  return demoOrders.get(reference) ?? null;
}

async function markOrderStatus(reference: string, status: OrderStatus): Promise<void> {
  if (dataMode() === "supabase") {
    const { getAdminClient } = await import("@/lib/supabase/admin");
    const { error } = await getAdminClient()
      .from("orders")
      .update({ status })
      .eq("reference", reference);
    if (error) console.error(`[orders] failed to mark ${status}:`, error.message);
    return;
  }
  const order = demoOrders.get(reference);
  if (order) order.status = status;
}

async function setEmailSentAt(reference: string): Promise<void> {
  if (dataMode() === "supabase") {
    const { getAdminClient } = await import("@/lib/supabase/admin");
    await getAdminClient()
      .from("orders")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("reference", reference);
    return;
  }
  const order = demoOrders.get(reference);
  if (order) order.email_sent_at = new Date().toISOString();
}

export async function savePaystackSession(
  reference: string,
  authorizationUrl: string,
  accessCode: string,
): Promise<void> {
  if (dataMode() === "supabase") {
    const { getAdminClient } = await import("@/lib/supabase/admin");
    const { error } = await getAdminClient()
      .from("orders")
      .update({ paystack_authorization_url: authorizationUrl, paystack_access_code: accessCode })
      .eq("reference", reference);
    if (error) console.error("[orders] failed to save paystack session:", error.message);
    return;
  }
  const order = demoOrders.get(reference);
  if (order) {
    order.paystack_authorization_url = authorizationUrl;
    order.paystack_access_code = accessCode;
  }
}

// ---------------------------------------------------------------------------
// Verification orchestration
// ---------------------------------------------------------------------------

export interface VerificationOutcome {
  order: FullOrder;
  /** "verified" = payment confirmed server-side this call or before. */
  result: "verified" | "pending" | "failed" | "not-found";
}

export async function processVerification(reference: string): Promise<VerificationOutcome> {
  const order = await getOrderByReference(reference);
  if (!order) return { order: null as unknown as FullOrder, result: "not-found" };

  if (order.status === "paid") {
    await ensureConfirmationEmail(order);
    return { order, result: "verified" };
  }

  if (order.status === "cancelled" || order.status === "failed") {
    return { order, result: "failed" };
  }

  if (paystackEnabled()) {
    const verify = await verifyTransaction(reference);
    if (verify.status === "success") {
      if (verify.amountKobo !== null && verify.amountKobo !== order.total_kobo) {
        console.error(
          `[orders] amount mismatch on ${reference}: expected ${order.total_kobo}, paystack says ${verify.amountKobo}`,
        );
        await markOrderStatus(reference, "failed");
        const updated = await getOrderByReference(reference);
        return { order: updated ?? order, result: "failed" };
      }
      await markOrderStatus(reference, "paid");
      const updated = await getOrderByReference(reference);
      const paid = updated ?? { ...order, status: "paid" as const };
      await ensureConfirmationEmail(paid);
      return { order: paid, result: "verified" };
    }
    if (verify.status === "failed") {
      await markOrderStatus(reference, "failed");
      const updated = await getOrderByReference(reference);
      return { order: updated ?? order, result: "failed" };
    }
    return { order, result: "pending" };
  }

  // Demo mode: no gateway configured — confirm demo orders without a charge.
  if (order.demo) {
    await markOrderStatus(reference, "paid");
    const paid = { ...order, status: "paid" as const };
    await ensureConfirmationEmail(paid);
    return { order: paid, result: "verified" };
  }

  return { order, result: "pending" };
}

/**
 * Sends the Mailgun confirmation exactly once per order. The email is sent
 * BEFORE email_sent_at is recorded: a transient Mailgun outage can at worst
 * produce a duplicate, never a lost confirmation. Unconfigured Mailgun is a
 * logged skip (setup step), not an error.
 */
export async function ensureConfirmationEmail(order: FullOrder): Promise<void> {
  if (order.email_sent_at) return;
  const sent = await sendOrderConfirmation(
    {
      reference: order.reference,
      email: order.email,
      full_name: order.full_name,
      phone: order.phone,
      address: order.address,
      city: order.city,
      state: order.state,
      total_kobo: order.total_kobo,
      demo: order.demo,
    },
    order.items,
  );
  if (sent) await setEmailSentAt(order.reference);
}

/**
 * In-memory demo store — only used when Supabase env vars are absent.
 * Route bundles get separate module instances, so the Map hangs off
 * globalThis to be shared across routes within one server process.
 */
const globalStore = globalThis as unknown as {
  __aromaDemoOrders?: Map<string, FullOrder>;
};
const demoOrders = (globalStore.__aromaDemoOrders ??= new Map<string, FullOrder>());
