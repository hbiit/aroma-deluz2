import Link from "next/link";
import Image from "next/image";
import { COLLECTIONS } from "@/lib/products";

export function Footer() {
  return (
    <footer id="footer" className="bg-purple-darkest text-ivory">
      {/* Newsletter band */}
      <div className="border-b border-gold/20 bg-purple-deep">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center md:flex-row md:justify-between md:px-8 md:text-left">
          <div>
            <h2 className="font-serif text-2xl text-gold">Stay inspired &amp; be the first to know</h2>
            <p className="mt-1 text-xs tracking-wide text-ivory/80">
              Exclusive offers, new arrivals, and fragrance stories.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 md:px-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Image
            src="/brand/logo.png"
            alt="Aroma De Luz — All About Scent"
            width={150}
            height={96}
            className="h-24 w-auto"
          />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory/80">
            Scented candles &amp; fine perfumes — timeless fragrance,
            hand-poured in Lagos.
          </p>
          <div className="mt-6 flex gap-4 text-gold">
            <a href="https://instagram.com" aria-label="Instagram" className="transition hover:text-gold-bright">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg>
            </a>
            <a href="https://facebook.com" aria-label="Facebook" className="transition hover:text-gold-bright">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M13.5 21v-7h2.5l.5-3h-3V9.25c0-.87.25-1.25 1.25-1.25H16.5V5.1c-.42-.05-1.2-.1-2.1-.1-2.2 0-3.4 1.3-3.4 3.8V11H8.5v3H11v7h2.5z" /></svg>
            </a>
            <a href="https://tiktok.com" aria-label="TikTok" className="transition hover:text-gold-bright">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M16.6 5.82A4.28 4.28 0 0115.54 3h-3.09v12.4a2.59 2.59 0 11-2.59-2.59c.27 0 .53.04.78.12V9.75a5.76 5.76 0 00-.78-.05 5.66 5.66 0 105.66 5.66V9.01a7.35 7.35 0 004.3 1.38V7.3a4.28 4.28 0 01-3.22-1.48z" /></svg>
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-[0.7rem] font-semibold tracking-[0.25em] text-gold uppercase">Shop</h3>
          <ul className="mt-4 space-y-2 text-sm text-ivory/85">
            <li><Link href="/products" className="transition hover:text-gold-bright">Shop All — Candles & Perfumes</Link></li>
            <li><Link href="/products?category=candle" className="transition hover:text-gold-bright">Candles</Link></li>
            <li><Link href="/products?category=perfume" className="transition hover:text-gold-bright">Perfumes</Link></li>
            <li><Link href="/cart" className="transition hover:text-gold-bright">Your Cart</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-[0.7rem] font-semibold tracking-[0.25em] text-gold uppercase">Collections</h3>
          <ul className="mt-4 space-y-2 text-sm text-ivory/85">
            {COLLECTIONS.map((c) => (
              <li key={c.slug}>
                <Link href={`/products?collection=${encodeURIComponent(c.slug)}`} className="transition hover:text-gold-bright">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="text-[0.7rem] font-semibold tracking-[0.25em] text-gold uppercase">Complimentary delivery</h3>
            <p className="mt-1 text-sm text-ivory/85">On orders over ₦150,000.</p>
          </div>
          <div>
            <h3 className="text-[0.7rem] font-semibold tracking-[0.25em] text-gold uppercase">Easy returns</h3>
            <p className="mt-1 text-sm text-ivory/85">14-day, risk-free returns.</p>
          </div>
          <div>
            <h3 className="text-[0.7rem] font-semibold tracking-[0.25em] text-gold uppercase">Secure payments</h3>
            <p className="mt-1 text-sm text-ivory/85">Shop with confidence — powered by Paystack.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gold/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-ivory/70 md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} Aroma De Luz. All rights reserved.</p>
          <p>Privacy Policy · Terms of Service</p>
        </div>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  return (
    <form
      action="/api/newsletter"
      method="post"
      className="flex w-full max-w-md"
      id="newsletter"
    >
      <input
        type="email"
        name="email"
        required
        placeholder="Enter your email address"
        className="w-full border border-gold/40 bg-purple-darkest/60 px-4 py-3 text-sm text-ivory placeholder:text-ivory/50 focus:border-gold focus:outline-none"
      />
      <button
        type="submit"
        className="bg-gold px-6 py-3 text-[0.7rem] font-semibold tracking-[0.2em] text-purple-ink uppercase transition hover:bg-gold-bright"
      >
        Sign me up
      </button>
    </form>
  );
}
