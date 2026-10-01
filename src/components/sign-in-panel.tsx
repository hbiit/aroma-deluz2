"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { GoogleIcon } from "@/components/google-icon";

const BENEFITS = [
  "Faster, pre-filled checkout",
  "Order tracking & confirmation emails",
  "Early access to new collections",
];

const INPUT_CLASS =
  "mt-1 w-full border border-purple-deep/25 bg-white px-4 py-3 text-sm text-purple-ink placeholder:text-purple-ink/40 focus:border-gold focus:outline-none";
const LABEL_CLASS = "text-[0.65rem] font-semibold tracking-[0.2em] text-purple-deep uppercase";

function friendlyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message))
    return "That email and password don't match an account.";
  if (/email not confirmed/i.test(message))
    return "Please confirm your email first — check your inbox.";
  if (/already registered/i.test(message))
    return "An account with this email already exists — sign in instead.";
  if (/rate limit/i.test(message))
    return "Too many attempts — please wait a moment and try again.";
  return message;
}

export function SignInPanel({ next }: { next: string }) {
  const { user, ready, available, signInWithGoogle, signInWithPassword, signUpWithEmail, signOut } =
    useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null);

  function switchMode(m: "signin" | "signup") {
    setMode(m);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error: err } = await signInWithPassword(email.trim(), password);
        if (err) {
          setError(friendlyAuthError(err));
          return;
        }
        router.push(next);
        router.refresh();
      } else {
        const { error: err, needsConfirmation } = await signUpWithEmail(
          email.trim(),
          password,
          fullName.trim(),
        );
        if (err) {
          setError(friendlyAuthError(err));
          return;
        }
        if (needsConfirmation) {
          setConfirmationSentTo(email.trim());
        } else {
          router.push(next);
          router.refresh();
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2">
      {/* Brand panel */}
      <section className="flex flex-col justify-center bg-purple-darkest px-6 py-16 md:px-14">
        <Image
          src="/brand/logo.png"
          alt="Aroma De Luz — All About Scent"
          width={150}
          height={96}
          priority
          className="h-20 w-auto"
        />
        <p className="eyebrow mt-12">Members of Aroma De Luz</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-gold md:text-5xl">
          All about scent.
          <br />
          <em className="font-normal italic">All about you.</em>
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory/85">
          One account for the whole house — your bag, your orders, and your
          first look at limited editions.
        </p>
        <ul className="mt-8 space-y-3">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-center gap-3 text-sm text-ivory/90">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5 shrink-0 text-gold"
                aria-hidden="true"
              >
                <path d="M10 0l2.5 7.5H20l-6 4.4L16.5 20 10 15.3 3.5 20 6 11.9 0 7.5h7.5L10 0z" />
              </svg>
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* Form panel */}
      <section className="flex items-center justify-center bg-ivory px-4 py-16 md:px-8">
        <div className="w-full max-w-md">
          {!available ? (
            <DemoNotice />
          ) : !ready ? (
            <div className="border border-purple-deep/10 bg-white p-8 text-center text-sm text-purple-ink/60 shadow-sm">
              One moment…
            </div>
          ) : user ? (
            <SignedInCard
              email={user.email ?? "your account"}
              next={next}
              onSignOut={() => void signOut()}
            />
          ) : confirmationSentTo ? (
            <ConfirmationCard
              email={confirmationSentTo}
              onBack={() => {
                setConfirmationSentTo(null);
                switchMode("signin");
              }}
            />
          ) : (
            <div className="border border-purple-deep/10 bg-white p-8 shadow-sm">
              {/* Tabs */}
              <div className="flex gap-6 border-b border-purple-deep/10">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    aria-pressed={mode === m}
                    className={`-mb-px border-b-2 pb-3 text-[0.7rem] font-semibold tracking-[0.2em] uppercase transition ${
                      mode === m
                        ? "border-gold text-purple-ink"
                        : "border-transparent text-purple-ink/50 hover:text-purple-ink"
                    }`}
                  >
                    {m === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => void signInWithGoogle(next)}
                className="mt-6 flex w-full items-center justify-center gap-3 border border-purple-deep/25 bg-white py-3 text-sm font-medium text-purple-ink transition hover:border-gold"
              >
                <GoogleIcon />
                {mode === "signin" ? "Sign in with Google" : "Sign up with Google"}
              </button>

              <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-purple-deep/10" />
                <span className="text-[0.6rem] tracking-[0.2em] text-purple-ink/50 uppercase">
                  or with email
                </span>
                <span className="h-px flex-1 bg-purple-deep/10" />
              </div>

              <form onSubmit={onSubmit} noValidate className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <label htmlFor="fullName" className={LABEL_CLASS}>
                      Full name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Amara Okafor"
                      className={INPUT_CLASS}
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="email" className={LABEL_CLASS}>
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor="password" className={LABEL_CLASS}>
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signin" ? "••••••••" : "At least 6 characters"}
                    className={INPUT_CLASS}
                  />
                </div>

                {error && (
                  <p role="alert" className="text-xs leading-relaxed text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="btn-purple w-full py-3 disabled:opacity-60"
                >
                  {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
                </button>
              </form>

              <p className="mt-6 text-center text-[0.65rem] leading-relaxed text-purple-ink/60">
                By continuing you agree to our terms of service and 14-day return policy.
              </p>
              {mode === "signin" && (
                <p className="mt-3 text-center text-xs text-purple-ink/70">
                  New to Aroma De Luz?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="font-semibold text-purple-deep underline-offset-2 transition hover:text-gold hover:underline"
                  >
                    Create an account
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function DemoNotice() {
  return (
    <div className="border border-purple-deep/15 bg-cream p-8 text-center">
      <p className="eyebrow">Demo mode</p>
      <h2 className="mt-2 font-serif text-2xl text-purple-ink">Sign-in is one switch away</h2>
      <p className="mt-4 text-sm leading-relaxed text-purple-ink/75">
        Google and email sign-in activate as soon as Supabase credentials are
        added to <code className="bg-white px-1.5 py-0.5 text-xs">.env.local</code> — the
        README&apos;s Supabase checklist walks through it in about two minutes.
      </p>
      <p className="mt-6 text-xs text-purple-ink/50">
        Until then, browsing, the cart and demo checkout work fully.
      </p>
    </div>
  );
}

function SignedInCard({
  email,
  next,
  onSignOut,
}: {
  email: string;
  next: string;
  onSignOut: () => void;
}) {
  return (
    <div className="border border-purple-deep/10 bg-white p-8 text-center shadow-sm">
      <p className="eyebrow">Welcome back</p>
      <h2 className="mt-2 font-serif text-2xl text-purple-ink">You&apos;re signed in</h2>
      <p className="mt-2 truncate text-sm text-purple-ink/70">{email}</p>
      <Link href={next} className="btn-purple mt-6 block py-3">
        Continue shopping
      </Link>
      <button
        type="button"
        onClick={onSignOut}
        className="mt-3 w-full border border-purple-deep/25 py-3 text-[0.7rem] font-semibold tracking-[0.2em] text-purple-ink uppercase transition hover:border-gold hover:text-gold"
      >
        Sign out
      </button>
    </div>
  );
}

function ConfirmationCard({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <div className="border border-purple-deep/10 bg-white p-8 text-center shadow-sm">
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-gold">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8l9 6 9-6M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z"
          />
        </svg>
      </span>
      <h2 className="mt-4 font-serif text-2xl text-purple-ink">Check your inbox</h2>
      <p className="mt-3 text-sm leading-relaxed text-purple-ink/75">
        We sent a confirmation link to{" "}
        <span className="font-semibold text-purple-deep">{email}</span>. Confirm your
        email, then sign in.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-6 text-[0.7rem] font-semibold tracking-[0.2em] text-purple-deep uppercase transition hover:text-gold"
      >
        Back to sign in
      </button>
    </div>
  );
}
