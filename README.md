# Aroma De Luz — All About Scent · Luxury Candles & Perfumes Store

Full-stack shop built with **Next.js 16**, **Supabase** (Postgres + Google auth), **Paystack** (NGN payments) and **Mailgun** (confirmation emails). The canonical spec lives in [aroma.md](aroma.md).

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Without any environment variables the site runs in **demo mode**: 19 seeded
products across 7 kinds (candles, perfume, EDP, EDT, EDC, body mists, hair
perfume), a working cart, and a checkout that confirms orders without taking
payment (clearly labeled "Demo mode"). Add credentials below to go live.

## 1 · Supabase (database)

1. Create a project at [database.new](https://database.new).
2. Open **SQL Editor**, paste the contents of [`supabase/migration.sql`](supabase/migration.sql), run it.
3. Paste the contents of [`supabase/seed.sql`](supabase/seed.sql), run it (19 products across 7 kinds).
4. Copy `Project URL`, `anon key` and `service_role key` from **Project Settings → API** into `.env.local` (see [.env.example](.env.example)).

The catalog then serves from Postgres; orders, order items and newsletter
signups persist to your database. If the database is unreachable the site
falls back to the demo catalog instead of erroring.

## 2 · Google auth (Google Cloud Console → Supabase)

1. [Google Cloud Console](https://console.cloud.google.com/) → create a project (or reuse one).
2. **APIs & Services → OAuth consent screen**: External, fill app name/support email, publish.
3. **Credentials → Create credentials → OAuth client ID → Web application**.
4. **Authorized redirect URI**: `https://<project-ref>.supabase.co/auth/v1/callback`
   (find the exact URL under Supabase Dashboard → Authentication → Sign In / URL Configuration).
5. Copy the **Client ID** and **Client secret** into Supabase Dashboard → **Authentication → Providers → Google** → enable.
6. In Supabase **Authentication → URL Configuration**, add `http://localhost:3000/**` (and your production URL) to Redirect URLs.

Email + password sign-in and sign-up work too via the dedicated **/signin**
page — the **Email** provider is on by default, and Supabase sends
confirmation mails from its built-in sender (no Mailgun setup needed for auth).

Restart `npm run dev`. The header's **Sign in** button now opens the sign-in
page; signed-in orders are linked to the user and checkout pre-fills contact
details from the account. Guest checkout always remains available.

## 3 · Paystack (NGN payments, test mode)

1. Create a [Paystack](https://paystack.com/) account (test mode by default).
2. **Settings → API Keys & Webhooks** → copy the **Secret Key** into `PAYSTACK_SECRET_KEY`.
3. Pay with the standard test card: `4084 0840 8408 4081`, any future expiry, any CVV, then enter the OTP `123456` on the mock bank page.
4. Amounts are sent in **kobo** (₦1 = 100 kobo) with `currency: NGN`. The order id is the transaction reference; verification happens **server-side** on return — the redirect alone is never trusted.

Until `PAYSTACK_SECRET_KEY` is set, checkout runs in labeled demo mode.

## 4 · Mailgun (confirmation emails)

1. Create a [Mailgun](https://www.mailgun.com/) account; the **sandbox domain** is fine for development.
2. Copy the **API key** into `MAILGUN_API_KEY` and the sandbox (or custom) domain into `MAILGUN_DOMAIN`.
3. In Mailgun, add your recipient email to **Authorized Recipients** (sandbox limitation).
4. `MAILGUN_FROM` defaults to `Aroma De Luz <orders@<domain>>`.

Every successfully paid order triggers one HTML confirmation email; the
`orders.email_sent_at` column guarantees no duplicates.

## Environment variables

Copy `.env.example` → `.env.local` and fill what you have; every service is
optional and degrades gracefully:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Database + Google auth (omit → demo catalog) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only writes for orders/subscribers |
| `NEXT_PUBLIC_SITE_URL` | Public URL for OAuth/Paystack callbacks |
| `PAYSTACK_SECRET_KEY` | NGN payments (omit → labeled demo checkout) |
| `MAILGUN_API_KEY` / `MAILGUN_DOMAIN` / `MAILGUN_FROM` | Confirmation emails (omit → logged skip) |

## Scripts

```bash
npm run dev     # start locally
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
npx tsc --noEmit
```

## Architecture

```
src/
  app/                     # routes (home, products, cart, checkout, auth, api)
    api/checkout/          # re-price cart → pending order → Paystack initialize
    api/orders/[reference]/# server-side verify → mark paid → email once
    api/newsletter/        # subscribers (form POST or JSON)
  components/              # header, footer, product card, cart/auth providers
  lib/
    products.ts            # catalog queries + demo fallback
    orders.ts              # order lifecycle, re-pricing, verification, email guard
    paystack.ts            # initialize/verify (kobo, NGN)
    email.ts               # Mailgun HTML confirmation
    supabase/              # browser / server / service-role clients
    format.ts              # kobo → ₦ formatting
supabase/                  # migration.sql + seed.sql (run in SQL Editor)
```

- **Client prices are never trusted**: the server re-prices every cart from the DB before creating an order.
- **The payment redirect is never trusted**: orders become `paid` only after `GET /transaction/verify/:reference` returns `success` with a matching amount.
- **Emails are sent exactly once** per order, and never block the customer.
