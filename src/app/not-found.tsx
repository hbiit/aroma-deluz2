import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-serif text-4xl font-medium text-purple-ink">
        This page has faded
      </h1>
      <p className="mt-4 text-sm text-purple-ink/70">
        Like a beautiful top note, the page you&apos;re looking for is gone.
      </p>
      <Link href="/products" className="btn-purple mt-8">
        Discover the collection
      </Link>
    </div>
  );
}
