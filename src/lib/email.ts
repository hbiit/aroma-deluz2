import formData from "form-data";
import Mailgun from "mailgun.js";
import { formatNaira } from "@/lib/format";

/**
 * Mailgun order confirmation. Sends exactly once per order — the caller
 * guards with orders.email_sent_at. Failures are logged, never thrown:
 * email problems must not block a paying customer.
 */

export interface EmailOrder {
  reference: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  total_kobo: number;
  demo: boolean;
}

export interface EmailOrderItem {
  name: string;
  unit_price_kobo: number;
  quantity: number;
}

function buildHtml(order: EmailOrder, items: EmailOrderItem[]): string {
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;color:#1a0f30;">${i.name}</td>
        <td style="padding:10px 0;text-align:center;color:#1a0f30;">${i.quantity}</td>
        <td style="padding:10px 0;text-align:right;color:#1a0f30;">${formatNaira(i.unit_price_kobo * i.quantity)}</td>
      </tr>`,
    )
    .join("");

  const address = [order.full_name, order.address, order.city, order.state]
    .filter(Boolean)
    .join(", ");

  return `<!doctype html>
<html><body style="margin:0;background:#f7f2ea;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <div style="background:#241441;padding:28px;text-align:center;">
      <div style="color:#c9a45c;font-size:26px;letter-spacing:5px;">AROMA DE LUZ</div>
      <div style="color:#e3c77f;font-size:10px;letter-spacing:8px;margin-top:6px;">ALL ABOUT SCENT</div>
    </div>
    <div style="background:#fdfbf7;padding:32px;border:1px solid #e5ddcf;">
      <p style="color:#c9a45c;font-size:11px;letter-spacing:3px;margin:0 0 8px;">THANK YOU FOR YOUR ORDER</p>
      <h1 style="color:#1a0f30;font-size:26px;font-weight:500;margin:0 0 16px;">Order ${order.reference} confirmed</h1>
      ${order.demo ? `<p style="background:#f7f2ea;border:1px solid #c9a45c;color:#1a0f30;font-size:12px;padding:10px 14px;">Demo mode — no payment was taken.</p>` : ""}
      <table style="width:100%;border-collapse:collapse;font-family:Helvetica,Arial,sans-serif;font-size:14px;">
        <tr style="border-bottom:1px solid #e5ddcf;">
          <th align="left" style="padding:8px 0;color:#3b2367;">Item</th>
          <th style="padding:8px 0;color:#3b2367;">Qty</th>
          <th align="right" style="padding:8px 0;color:#3b2367;">Price</th>
        </tr>
        ${rows}
        <tr>
          <td colspan="2" style="padding:14px 0;text-align:right;color:#3b2367;font-weight:bold;">Total</td>
          <td style="padding:14px 0;text-align:right;color:#3b2367;font-weight:bold;">${formatNaira(order.total_kobo)}</td>
        </tr>
      </table>
      ${address ? `<p style="color:#1a0f30;font-family:Helvetica,Arial,sans-serif;font-size:13px;margin-top:24px;"><strong>Delivering to:</strong><br/>${address}</p>` : ""}
      <p style="color:#1a0f30;font-family:Helvetica,Arial,sans-serif;font-size:13px;margin-top:24px;">
        We are preparing your fragrance with care. Questions? Reply to this email — we read every one.
      </p>
    </div>
    <p style="text-align:center;color:#6b5f52;font-size:11px;font-family:Helvetica,Arial,sans-serif;margin-top:16px;">
      © ${new Date().getFullYear()} Aroma De Luz · Hand-poured in Lagos
    </p>
  </div>
</body></html>`;
}

export async function sendOrderConfirmation(
  order: EmailOrder,
  items: EmailOrderItem[],
): Promise<boolean> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM || `Aroma De Luz <orders@${domain ?? "example.com"}>`;

  if (!apiKey || !domain) {
    console.log(
      `[email] MAILGUN not configured — skipping confirmation for ${order.reference}`,
    );
    return false;
  }

  try {
    const mailgun = new Mailgun(formData);
    const client = mailgun.client({ username: "api", key: apiKey });
    await client.messages.create(domain, {
      from,
      to: [order.email],
      subject: `Your Aroma De Luz order ${order.reference} is confirmed`,
      html: buildHtml(order, items),
    });
    return true;
  } catch (error) {
    console.error(`[email] failed to send confirmation for ${order.reference}:`, error);
    return false;
  }
}
