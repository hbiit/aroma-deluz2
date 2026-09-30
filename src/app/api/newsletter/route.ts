import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

/**
 * Newsletter signup. Accepts both a plain form POST (footer works without
 * JavaScript) and JSON. Stores the email in `subscribers` via the
 * service-role key; responds 303 back to the homepage for form posts.
 */
export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let email: string | null = null;
  let isForm = false;

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as { email?: string } | null;
    email = body?.email?.trim().toLowerCase() ?? null;
  } else {
    isForm = true;
    const form = await request.formData().catch(() => null);
    email = (form?.get("email") as string | null)?.trim().toLowerCase() ?? null;
  }

  const valid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!valid) {
    return isForm
      ? NextResponse.redirect(new URL("/?subscribed=0#newsletter", request.url), 303)
      : NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    const admin = getAdminClient();
    const { error } = await admin
      .from("subscribers")
      .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });
    if (error) throw error;
  } catch (e) {
    // Demo mode (Supabase not configured): accept gracefully so the site
    // stays fully browsable; the signup is simply not persisted.
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error("[newsletter] subscribe failed:", e);
      return isForm
        ? NextResponse.redirect(new URL("/?subscribed=0#newsletter", request.url), 303)
        : NextResponse.json({ error: "Could not subscribe" }, { status: 500 });
    }
    console.log("[newsletter] demo mode — not persisting", email);
    return isForm
      ? NextResponse.redirect(new URL("/?subscribed=1#newsletter", request.url), 303)
      : NextResponse.json({ ok: true, demo: true });
  }

  return isForm
    ? NextResponse.redirect(new URL("/?subscribed=1#newsletter", request.url), 303)
    : NextResponse.json({ ok: true });
}
