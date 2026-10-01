"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export interface EmailAuthResult {
  error: string | null;
  /** True when the account was created but must be confirmed via email first. */
  needsConfirmation: boolean;
}

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  /** False when Supabase env vars are absent (auth UI hides itself). */
  available: boolean;
  signInWithGoogle: (next?: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<EmailAuthResult>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<EmailAuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Created once during render — env config is static, so `available`
  // derives from it instead of effect state.
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const available = supabase !== null;
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!available);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setSession(data.session);
        setReady(true);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!cancelled) setSession(s);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = useCallback(
    async (next = "/") => {
      if (!supabase) return;
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
    },
    [supabase],
  );

  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<EmailAuthResult> => {
      if (!supabase) return { error: "Sign-in is not configured yet.", needsConfirmation: false };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null, needsConfirmation: false };
    },
    [supabase],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, fullName: string): Promise<EmailAuthResult> => {
      if (!supabase) return { error: "Sign-up is not configured yet.", needsConfirmation: false };
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          ...(fullName ? { data: { full_name: fullName, name: fullName } } : {}),
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) return { error: error.message, needsConfirmation: false };
      return { error: null, needsConfirmation: !data.session };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      ready,
      available,
      signInWithGoogle,
      signInWithPassword,
      signUpWithEmail,
      signOut,
    }),
    [session, ready, available, signInWithGoogle, signInWithPassword, signUpWithEmail, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
