# Deploying Aroma De Luz

Hosting is **Vercel** with **GitHub auto-deploy**:

- push to `main` → GitHub Actions runs lint · typecheck · build → Vercel deploys to production
- pull requests → CI plus a shareable preview URL
- nothing to click per release; rollback is one button (Vercel → Deployments → **Promote to Production**)

The stack is a standard Next.js 16 app, so no platform config file is needed.

## 1 · Put the repository on GitHub

1. Create an **empty** repo at <https://github.com/new> (suggested name
   `aroma-deluz`; Private works fine — Vercel just needs read access).
2. From the project root:

   ```bash
   git remote add origin https://github.com/<you>/aroma-deluz.git
   git push -u origin main
   ```

   The first push runs the CI workflow — check the **Actions** tab goes green.

## 2 · Import into Vercel

1. Sign in at <https://vercel.com> (GitHub sign-in is easiest) →
   **Add New… → Project**.
2. **Import** the `aroma-deluz` repository and grant access if asked.
3. The **Next.js** framework preset is detected automatically — leave all
   build settings untouched.
4. Click **Deploy**. The first build takes about a minute and you get
   `https://<project>.vercel.app`.

## 3 · Environment variables

Demo mode needs **zero** variables: the deployed site is fully browsable with
a visible "Demo mode" label. When you're ready to go live, add these in
**Project → Settings → Environment Variables** (the README has the full
per-service checklists):

| Variable | Add when | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | go-live | your public URL, e.g. `https://aroma-deluz.vercel.app` — used for Paystack/OAuth callbacks |
| `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY` | real catalog, Google auth | Supabase → Project Settings → API |
| `PAYSTACK_SECRET_KEY` | real payments | start with test keys; NGN in kobo |
| `MAILGUN_API_KEY` · `MAILGUN_DOMAIN` · `MAILGUN_FROM` | confirmation emails | the sandbox domain works for testing |

After adding the Supabase keys: run `supabase/migration.sql` then
`supabase/seed.sql` in the Supabase SQL Editor, and redeploy
(Vercel → Deployments → ⋯ → **Redeploy**) so the server picks them up.

## 4 · Day-to-day automation

| Action | Happens |
|---|---|
| `git push` to `main` | CI on GitHub + production deploy on Vercel |
| Open a pull request | CI + preview deployment URL on the PR |
| Older deploy → Promote | instant rollback |

## 5 · Custom domain (optional)

Vercel → Project → **Settings → Domains** → add e.g. `aromadeluz.com`, point
the DNS records Vercel displays at your registrar. HTTPS certificates are
issued automatically.
