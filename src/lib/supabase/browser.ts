import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (anon key, cookie-based sessions).
 * Returns null when Supabase env vars are absent — the UI renders signed-out.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createBrowserClient(url, anon);
}
