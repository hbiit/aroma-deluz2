/**
 * Paystack server client. Amounts are in kobo (NGN x 100), never floats.
 * Without PAYSTACK_SECRET_KEY the shop runs in demo mode: orders are
 * created and confirmed without a charge, clearly labeled in the UI.
 */

const PAYSTACK_BASE = "https://api.paystack.co";

export function paystackEnabled(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

interface InitializeResult {
  authorization_url: string | null;
  access_code: string | null;
}

export async function initializeTransaction(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
}): Promise<InitializeResult> {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return { authorization_url: null, access_code: null };

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      currency: "NGN",
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: { reference: params.reference },
    }),
    cache: "no-store",
  });

  const json = (await res.json()) as {
    status: boolean;
    message?: string;
    data?: { authorization_url: string; access_code: string };
  };

  if (!res.ok || !json.status || !json.data) {
    throw new Error(`Paystack initialize failed: ${json.message ?? res.status}`);
  }
  return {
    authorization_url: json.data.authorization_url,
    access_code: json.data.access_code,
  };
}

export interface VerifyResult {
  status: "success" | "failed" | "pending";
  amountKobo: number | null;
}

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return { status: "pending", amountKobo: null };

  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    },
  );

  const json = (await res.json()) as {
    status: boolean;
    message?: string;
    data?: { status: string; amount: number };
  };

  if (!res.ok || !json.status || !json.data) {
    throw new Error(`Paystack verify failed: ${json.message ?? res.status}`);
  }

  const s = json.data.status;
  return {
    status: s === "success" ? "success" : s === "failed" ? "failed" : "pending",
    amountKobo: json.data.amount,
  };
}
