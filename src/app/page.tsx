import Link from "next/link";
import Image from "next/image";
import { COLLECTIONS, getFeaturedProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

const HERO_VIDEO =
  "https://assets.mixkit.co/videos/48919/48919-720.mp4"; // verified: candle flame close-up, Mixkit license
const HERO_POSTER =
  "https://images.pexels.com/photos/10924522/pexels-photo-10924522.jpeg?auto=compress&cs=tinysrgb&w=1600";
const STORY_IMAGE =
  "https://images.pexels.com/photos/13395697/pexels-photo-13395697.jpeg?auto=compress&cs=tinysrgb&w=1200";

const TRUST_BADGES = [
  { icon: "leaf", label: "Clean ingredients" },
  { icon: "clock", label: "Long-lasting performance" },
  { icon: "hand", label: "Hand-poured in Lagos" },
  { icon: "gift", label: "Luxury packaging" },
];

const TESTIMONIALS = [
  {
    quote:
      "Aroma De Luz is pure luxury. The candles are sophisticated, long-lasting, and absolutely mesmerizing.",
    name: "Emily R.",
    city: "Victoria Island, Lagos",
  },
  {
    quote:
      "The attention to detail in every bottle is unmatched. I feel like wearing confidence and elegance.",
    name: "Sophia M.",
    city: "Abuja",
  },
  {
    quote:
      "I've found my signature scent. Velvety Oud is the only perfume brand I trust and adore.",
    name: "Lauren T.",
    city: "Lekki, Lagos",
  },
];

function BadgeIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    leaf: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.97 0-9-4.03-9-9 0-6 4-9 9-9 0 3 2.5 4.5 5 6-1.5.5-3 1.5-3 3 3 0 5-1 7-3 .5 6-3 12-9 12zM12 21c0-5 2-8 6-11" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />,
    hand: <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V6a2 2 0 114 0v5m0-3a2 2 0 114 0v3m0-1a2 2 0 114 0v6a7 7 0 01-7 7h-1a7 7 0 01-7-7v-3a2 2 0 114 0" />,
    gift: <path strokeLinecap="round" strokeLinejoin="round" d="M21 11v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8m18 0H3m18 0a2 2 0 00-2-2H5a2 2 0 00-2 2m9-2V3m0 6h6a2 2 0 100-4h-3l-3 4zm0 0H6a2 2 0 110-4h3l3 4z" />,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-6 w-6">
      {paths[name]}
    </svg>
  );
}

function Stars() {
  return (
    <div className="flex gap-0.5 text-gold" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M10 1l2.35 5.76 6.21.46-4.76 4.03 1.49 6.05L10 14.2l-5.29 3.1 1.49-6.05L1.44 7.22l6.21-.46L10 1z" />
        </svg>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const featured = await getFeaturedProducts(5);

  return (
    <div>
      {/* ============ 3 · HERO with promotional video ============ */}
      <section className="relative isolate min-h-[70vh] overflow-hidden bg-purple-darkest">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={HERO_VIDEO}
          poster={HERO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-darkest/90 via-purple-darkest/60 to-purple-deep/30" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-center px-4 py-28 md:px-8 md:py-40">
          <p className="eyebrow">Crafted to captivate</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] font-medium text-gold md:text-7xl">
            Scents that
            <br />
            <em className="font-normal italic">leave a legacy.</em>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/90 md:text-base">
            Hand-poured scented candles and fine perfumes that celebrate
            elegance, femininity, and unforgettable presence.
          </p>
          <Link href="/products" className="btn-gold mt-10">
            Discover the collection
          </Link>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-purple-deep/10 bg-ivory">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 text-purple-deep md:grid-cols-4 md:px-8">
          {TRUST_BADGES.map((b) => (
            <div key={b.label} className="flex items-center justify-center gap-3">
              <span className="text-gold">
                <BadgeIcon name={b.icon} />
              </span>
              <span className="text-[0.65rem] font-medium tracking-[0.2em] uppercase">{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 4 · SHOP BY COLLECTION ============ */}
      <section className="bg-cream py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="section-title text-center">Shop by Collection</h2>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {COLLECTIONS.map((c) => (
              <Link
                key={c.slug}
                href={`/products?collection=${encodeURIComponent(c.slug)}`}
                className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden bg-purple-darkest"
              >
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover opacity-90 transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-darkest/90 via-purple-darkest/30 to-transparent" />
                <div className="relative p-5">
                  <h3 className="font-serif text-lg leading-tight tracking-wide text-gold uppercase md:text-xl">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-[0.7rem] tracking-wide text-ivory/90">{c.tagline}</p>
                  <span className="mt-3 inline-block border border-gold px-3 py-1.5 text-[0.6rem] font-semibold tracking-[0.2em] text-gold uppercase transition group-hover:bg-gold group-hover:text-purple-ink">
                    Shop now
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 5 · FEATURED PRODUCTS ============ */}
      <section className="bg-ivory py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="section-title text-center">Featured Candles & Perfumes</h2>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="text-[0.7rem] font-semibold tracking-[0.25em] text-purple-deep uppercase transition hover:text-gold"
            >
              View all candles & perfumes →
            </Link>
          </div>
        </div>
      </section>

      {/* ============ 6 · OUR STORY ============ */}
      <section id="story" className="bg-cream py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:px-8 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Our story</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-gold md:text-4xl">
              The art of fine fragrance
              <br />
              is our heritage.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-purple-ink/80">
              At Aroma De Luz, every scent is a work of art — meticulously
              blended with the world&apos;s finest ingredients. We believe in
              timeless elegance, sustainable luxury, and the emotion that only
              a signature scent can evoke.
            </p>
            <Link href="/products" className="btn-purple mt-8">
              Discover our craft
            </Link>
            <div className="mt-10 grid grid-cols-2 gap-6">
              {[
                ["Finest ingredients", "Sourced responsibly from around the world"],
                ["Expert artisans", "Blended by master perfumers in Lagos"],
                ["Sustainable luxury", "Eco-conscious choices for a better tomorrow"],
                ["Timeless quality", "Made to be treasured for generations"],
              ].map(([title, sub]) => (
                <div key={title} className="flex gap-3">
                  <span className="mt-1 text-gold">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path d="M10 0l2.5 7.5H20l-6 4.4L16.5 20 10 15.3 3.5 20 6 11.9 0 7.5h7.5L10 0z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-xs font-semibold tracking-wide text-purple-deep uppercase">{title}</h3>
                    <p className="mt-1 text-xs text-purple-ink/70">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={STORY_IMAGE}
              alt="Aroma De Luz candle styling"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ============ 7 · PROMO BAND ============ */}
      <section className="bg-purple-darkest py-14">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 text-center md:flex-row md:justify-between md:px-8 md:text-left">
          <p className="font-serif text-6xl leading-none text-gold md:text-7xl">
            20<span className="text-3xl align-top">%</span>
            <span className="ml-1 text-2xl tracking-widest uppercase md:text-3xl">off</span>
          </p>
          <div>
            <h2 className="font-serif text-2xl text-ivory md:text-3xl">
              Because you deserve something exquisite.
            </h2>
            <p className="mt-1 text-sm text-ivory/80">
              Enjoy 20% off your order for a limited time only.
            </p>
          </div>
          <Link href="/products" className="btn-gold">
            Shop the sale
          </Link>
        </div>
      </section>

      {/* ============ 8 · TESTIMONIALS ============ */}
      <section className="bg-ivory py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="section-title text-center">Loved by our clients</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="flex flex-col border border-purple-deep/10 bg-cream p-8">
                <blockquote className="flex-1 text-sm leading-relaxed text-purple-ink/85 italic">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <Stars />
                <figcaption className="mt-4">
                  <p className="text-sm font-semibold text-purple-deep">{t.name}</p>
                  <p className="text-xs text-purple-ink/60">{t.city}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
