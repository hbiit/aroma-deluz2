export type Category = "candle" | "perfume";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: Category;
  collection: string | null;
  price_kobo: number;
  scent_notes: string[] | null;
  image_url: string | null;
  stock: number;
  featured: boolean;
}

export interface CollectionCard {
  slug: string;
  title: string;
  tagline: string;
  image: string;
}

/**
 * "supabase" = real database; "demo" = env vars absent, site runs on the
 * documented in-memory catalog so it is fully browsable before credentials
 * are configured. See README.
 */
export type DataMode = "supabase" | "demo";

export function dataMode(): DataMode {
  return process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? "supabase"
    : "demo";
}

export const COLLECTIONS: CollectionCard[] = [
  {
    slug: "floral-bouquets",
    title: "Floral Bouquets",
    tagline: "Soft. Romantic. Timeless.",
    image:
      "https://images.pexels.com/photos/32259042/pexels-photo-32259042.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    slug: "warm-sensual",
    title: "Warm & Sensual",
    tagline: "Rich. Alluring. Addictive.",
    image:
      "https://images.pexels.com/photos/13395697/pexels-photo-13395697.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    slug: "fresh-radiant",
    title: "Fresh & Radiant",
    tagline: "Light. Elegant. Uplifting.",
    image:
      "https://images.pexels.com/photos/17145779/pexels-photo-17145779.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    slug: "exclusive-collection",
    title: "Exclusive Collection",
    tagline: "Rare. Unique. Unforgettable.",
    image:
      "https://images.pexels.com/photos/34433313/pexels-photo-34433313.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
];

/**
 * Demo catalog: mirrors supabase/seed.sql so the site is identical with or
 * without a configured database. Prices are in kobo.
 */
export const DEMO_PRODUCTS: Product[] = [
  { id: "d01", slug: "midnight-fig-cedar", name: "Midnight Fig & Cedar", description: "A slow-burning soy candle that wraps dark fig and cedarwood in a glow of tonka warmth.", category: "candle", collection: "Warm & Sensual", price_kobo: 2800000, scent_notes: ["fig", "cedarwood", "tonka bean"], image_url: "https://images.pexels.com/photos/10343245/pexels-photo-10343245.jpeg?auto=compress&cs=tinysrgb&w=1200", stock: 24, featured: true },
  { id: "d02", slug: "golden-hour-vanilla", name: "Golden Hour Vanilla", description: "Vanilla bean and amber poured into hand-finished glass — the scent of late, lingering light.", category: "candle", collection: "Warm & Sensual", price_kobo: 2450000, scent_notes: ["vanilla", "amber", "sandalwood"], image_url: "https://images.pexels.com/photos/13395697/pexels-photo-13395697.jpeg?auto=compress&cs=tinysrgb&w=1200", stock: 30, featured: false },
  { id: "d03", slug: "eucalyptus-dawn", name: "Eucalyptus Dawn", description: "Crisp eucalyptus and sea salt; a clean, clear candle for brightening quiet mornings.", category: "candle", collection: "Fresh & Radiant", price_kobo: 2100000, scent_notes: ["eucalyptus", "sea salt", "mint"], image_url: "https://images.pexels.com/photos/17145779/pexels-photo-17145779.jpeg?auto=compress&cs=tinysrgb&w=1200", stock: 32, featured: false },
  { id: "d04", slug: "rose-petal-luxe", name: "Rose Petal Luxe", description: "Damask rose and peony over soft musk — romance, poured in wax.", category: "candle", collection: "Floral Bouquets", price_kobo: 2650000, scent_notes: ["damask rose", "peony", "musk"], image_url: "https://images.pexels.com/photos/32259042/pexels-photo-32259042.jpeg?auto=compress&cs=tinysrgb&w=1200", stock: 26, featured: true },
  { id: "d05", slug: "oud-amber-noir", name: "Oud & Amber Noir", description: "Our most opulent candle: smoky oud, black orchid and glowing amber for long evenings.", category: "candle", collection: "Exclusive Collection", price_kobo: 4500000, scent_notes: ["oud", "black orchid", "amber"], image_url: "https://images.pexels.com/photos/34433313/pexels-photo-34433313.jpeg?auto=compress&cs=tinysrgb&w=1200", stock: 15, featured: true },
  { id: "d06", slug: "lavender-aurum", name: "Lavender Aurum", description: "Lavender and chamomile sweetened with honey — calm, poured by hand in Lagos.", category: "candle", collection: "Floral Bouquets", price_kobo: 1800000, scent_notes: ["lavender", "chamomile", "honey"], image_url: "https://images.pexels.com/photos/35505859/pexels-photo-35505859.jpeg?auto=compress&cs=tinysrgb&w=1200", stock: 40, featured: false },
  { id: "d07", slug: "aroma-deluz-signature", name: "Aroma De Luz Signature", description: "The house perfume: bergamot brightening into jasmine and a base of rare oud. Our legacy in a bottle.", category: "perfume", collection: "Exclusive Collection", price_kobo: 14500000, scent_notes: ["bergamot", "jasmine", "oud"], image_url: "https://images.pexels.com/photos/10924522/pexels-photo-10924522.jpeg?auto=compress&cs=tinysrgb&w=1200", stock: 12, featured: true },
  { id: "d08", slug: "rose-noir-elixir", name: "Rose Noir Elixir", description: "Rose and saffron over dark chocolate — a magnetic evening eau de parfum.", category: "perfume", collection: "Floral Bouquets", price_kobo: 9800000, scent_notes: ["rose", "saffron", "dark chocolate"], image_url: "https://images.pexels.com/photos/12461865/pexels-photo-12461865.jpeg?auto=compress&cs=tinysrgb&w=1200", stock: 18, featured: true },
  { id: "d09", slug: "lumiere-dor", name: "Lumière d'Or", description: "Neroli and white tea over vetiver; light, radiant and effortless for every day.", category: "perfume", collection: "Fresh & Radiant", price_kobo: 8600000, scent_notes: ["neroli", "white tea", "vetiver"], image_url: "https://images.pexels.com/photos/13516802/pexels-photo-13516802.jpeg?auto=compress&cs=tinysrgb&w=1200", stock: 22, featured: false },
  { id: "d10", slug: "velvet-oud", name: "Velvet Oud", description: "Velvet plum and tobacco folded into oud — warmth that lingers long after you leave.", category: "perfume", collection: "Warm & Sensual", price_kobo: 12000000, scent_notes: ["oud", "velvet plum", "tobacco"], image_url: "https://images.pexels.com/photos/14736080/pexels-photo-14736080.jpeg?auto=compress&cs=tinysrgb&w=1200", stock: 16, featured: false },
  { id: "d11", slug: "fleur-eternelle", name: "Fleur Éternelle", description: "Peony and lily wrapped in white musk — timeless, weightless florals.", category: "perfume", collection: "Floral Bouquets", price_kobo: 7500000, scent_notes: ["peony", "lily", "white musk"], image_url: "https://images.pexels.com/photos/15096784/pexels-photo-15096784.jpeg?auto=compress&cs=tinysrgb&w=1200", stock: 25, featured: false },
  { id: "d12", slug: "ambre-solaire", name: "Ambre Solaire", description: "Blood orange and amber warmed by cedar — sunset, bottled.", category: "perfume", collection: "Warm & Sensual", price_kobo: 6500000, scent_notes: ["amber", "blood orange", "cedar"], image_url: "https://images.pexels.com/photos/15574229/pexels-photo-15574229.jpeg?auto=compress&cs=tinysrgb&w=1200", stock: 28, featured: false },
];

export interface ProductFilters {
  category?: string;
  collection?: string;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  if (dataMode() === "supabase") {
    try {
      const { getAdminClient } = await import("@/lib/supabase/admin");
      let query = getAdminClient().from("products").select("*").order("created_at");
      if (filters.category) query = query.eq("category", filters.category);
      if (filters.collection) query = query.eq("collection", filters.collection);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Product[];
      if (error) console.error("[products] supabase error, falling back to demo:", error.message);
    } catch (e) {
      console.error("[products] supabase unavailable, falling back to demo:", e);
    }
  }
  return DEMO_PRODUCTS.filter(
    (p) =>
      (!filters.category || p.category === filters.category) &&
      (!filters.collection || p.collection === filters.collection),
  );
}

export async function getFeaturedProducts(limit = 5): Promise<Product[]> {
  if (dataMode() === "supabase") {
    try {
      const { getAdminClient } = await import("@/lib/supabase/admin");
      const { data, error } = await getAdminClient()
        .from("products")
        .select("*")
        .eq("featured", true)
        .limit(limit);
      if (!error && data && data.length > 0) return data as Product[];
      if (error) console.error("[products] featured query error:", error.message);
    } catch (e) {
      console.error("[products] supabase unavailable:", e);
    }
  }
  return DEMO_PRODUCTS.filter((p) => p.featured).slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (dataMode() === "supabase") {
    try {
      const { getAdminClient } = await import("@/lib/supabase/admin");
      const { data, error } = await getAdminClient()
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (!error && data) return data as Product;
      if (error) console.error("[products] slug query error:", error.message);
    } catch (e) {
      console.error("[products] supabase unavailable:", e);
    }
  }
  return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
}
