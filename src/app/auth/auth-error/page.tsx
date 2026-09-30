import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">Sign-in failed</p>
      <h1 className="mt-3 font-serif text-4xl font-medium text-purple-ink">
        We couldn&apos;t sign you in
      </h1>
      <p className="mt-4 text-sm text-purple-ink/70">
        The Google sign-in was cancelled or the provider isn&apos;t configured
        yet. You can keep browsing, or check the README for setup steps.
      </p>
      <Link href="/" className="btn-purple mt-8">
        Back to the shop
      </Link>
    </div>
  );
}
