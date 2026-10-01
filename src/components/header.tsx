"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { KIND_BADGE, PRODUCT_KINDS } from "@/lib/products";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { useAuth } from "@/components/auth-provider";
import { GoogleIcon } from "@/components/google-icon";

function AccountMenu() {
  const { user, available, ready, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (!available || !ready) return null;

  return (
    <div className="relative">
      {user ? (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Account"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-[0.7rem] font-semibold tracking-wide text-gold uppercase transition hover:bg-gold/30"
          >
            {(user.user_metadata?.name ?? user.email ?? "?").slice(0, 1)}
          </button>
          {open && (
            <div className="absolute right-0 z-50 mt-2 w-56 border border-purple-deep/15 bg-white py-2 shadow-xl">
              <div className="border-b border-purple-deep/10 px-4 py-2">
                <p className="truncate text-sm font-medium text-purple-ink">
                  {user.user_metadata?.name ?? "Welcome"}
                </p>
                <p className="truncate text-xs text-purple-ink/60">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  void signOut();
                }}
                className="block w-full px-4 py-2 text-left text-sm text-purple-ink/80 transition hover:bg-cream"
              >
                Sign out
              </button>
            </div>
          )}
        </>
      ) : (
        <Link
          href={`/signin?next=${encodeURIComponent(pathname)}`}
          className="flex items-center gap-2 text-gold transition hover:text-gold-bright"
          aria-label="Sign in"
        >
          <GoogleIcon />
          <span className="hidden text-[0.7rem] font-medium tracking-[0.2em] uppercase lg:inline">
            Sign in
          </span>
        </Link>
      )}
    </div>
  );
}

const FRAGRANCE_KINDS = PRODUCT_KINDS.filter((kind) => kind !== "candle");

function FragrancesMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex items-center gap-1 text-[0.7rem] font-medium tracking-[0.2em] uppercase transition ${
          open ? "text-gold" : "text-purple-ink hover:text-gold"
        }`}
      >
        Fragrances
        <svg
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
          className={`h-2.5 w-2.5 transition ${open ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 4l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 w-56 border border-purple-deep/15 bg-white py-2 shadow-xl"
        >
          {FRAGRANCE_KINDS.map((kind) => (
            <Link
              key={kind}
              href={`/products?category=${kind}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-[0.7rem] tracking-[0.18em] text-purple-ink uppercase transition hover:bg-cream hover:text-gold"
            >
              {KIND_BADGE[kind]}
            </Link>
          ))}
          <Link
            href="/products"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-1 block border-t border-purple-deep/10 px-4 py-2 text-[0.7rem] tracking-[0.18em] text-purple-ink/70 uppercase transition hover:bg-cream hover:text-gold"
          >
            All fragrances
          </Link>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { count, hydrated } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const left = [
    { href: "/products", label: "Shop" },
    { href: "/products?category=candle", label: "Candles" },
  ];
  const right = [
    { href: "/#story", label: "Our Story" },
    { href: "mailto:hello@aromadeluz.com", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40">
      {/* Announcement bar */}
      <div className="bg-purple-darkest text-center text-[0.65rem] tracking-[0.25em] text-gold uppercase">
        <p className="px-4 py-2">
          Complimentary delivery over ₦150,000&ensp;·&ensp;Sample with every order&ensp;·&ensp;Luxury gift wrapping
        </p>
      </div>

      {/* Main bar */}
      <div
        className={`border-b border-purple-deep/10 bg-ivory/95 backdrop-blur transition-shadow ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          {/* Mobile spacer keeps the centered logo centered at every width */}
          <div className="flex-1 lg:hidden" aria-hidden />
          <nav className="hidden flex-1 items-center gap-6 lg:flex">
            {left.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className={`text-[0.7rem] font-medium tracking-[0.2em] uppercase transition ${
                  pathname === l.href ? "text-gold" : "text-purple-ink hover:text-gold"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <FragrancesMenu />
          </nav>

          {/* Brand logo on a deep-purple plaque — gold reads vividly on
              the brand purple, exactly as in the original artwork */}
          <Link
            href="/"
            className="group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-darkest px-3 py-1.5 shadow-sm transition group-hover:shadow-md"
            aria-label="Aroma De Luz — All About Scent"
          >
            <Image
              src="/brand/logo.png"
              alt=""
              width={96}
              height={60}
              priority
              className="h-10 w-auto md:h-11"
            />
          </Link>

          <div className="flex flex-1 items-center justify-end gap-5">
            <nav className="hidden items-center gap-6 lg:flex">
              {right.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-[0.7rem] font-medium tracking-[0.2em] text-purple-ink uppercase transition hover:text-gold"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <AccountMenu />
            <Link
              href="/cart"
              className="relative text-purple-ink transition hover:text-gold"
              aria-label={`Cart (${hydrated ? count : 0})`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m-3.12 0h13.74l-.9 9.1a2.25 2.25 0 01-2.24 2.03H8.02a2.25 2.25 0 01-2.24-2.03l-.9-9.1z" />
              </svg>
              {hydrated && count > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-deep px-1 text-[0.6rem] font-semibold text-gold">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
