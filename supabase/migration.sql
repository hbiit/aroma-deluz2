-- Aroma Deluz — Supabase schema (run in Supabase dashboard -> SQL Editor)

create extension if not exists "pgcrypto";

-- ============ PRODUCTS ============
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  category text not null check (category in ('candle','perfume','edp','edt','edc','body-mist','hair-perfume')),
  collection text,
  price_kobo integer not null check (price_kobo > 0),
  scent_notes text[],
  image_url text,
  stock integer not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Public read access to products" on public.products;
create policy "Public read access to products"
  on public.products for select
  using (true);

-- ============ ORDERS ============
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  full_name text,
  phone text,
  address text,
  city text,
  state text,
  note text,
  status text not null default 'pending'
    check (status in ('pending','paid','cancelled','failed')),
  total_kobo integer not null,
  paystack_authorization_url text,
  paystack_access_code text,
  demo boolean not null default false,
  email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);

-- ============ ORDER ITEMS ============
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  name text not null,
  unit_price_kobo integer not null,
  quantity integer not null check (quantity > 0)
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- ============ SUBSCRIBERS ============
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

-- orders / order_items have RLS enabled implicitly-safe default (no public policies):
-- all writes go through the service-role key on the server, never the browser.
