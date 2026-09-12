# Stormproof — fake-door MVP

A conversion-instrumented landing page that validates demand for a premium,
wind-stable umbrella and rainwear brand in India, before a single unit is made.

Next.js 16 (App Router) · Tailwind CSS v4 · Supabase · Vercel.

---

## What it measures

| Signal | How it's captured | Table |
| --- | --- | --- |
| Traffic | Automatic on `/` and `/waitlist` | `page_views` |
| Premium vs. standard intent | Every product card click | `card_clicks` |
| Why people go cheap | MCQ modal after a standard click | `standard_survey_responses` |
| Who's ready to pay | Email + reason on `/waitlist` | `waitlist_signups` |

The number that decides the business is **premium clicks → emails captured**.
`v_funnel_summary` computes it for you.

### The two flows

- **Premium card** (₹2,499 umbrella / ₹2,999 rain shell) → modal with a mock
  GPay UPI QR → *"Or click here to continue"* → `/waitlist`, prefilled with
  which product they wanted.
- **Standard card** (₹399 umbrella / ₹499 raincoat) → one-tap MCQ, *"Why did
  you choose this option?"* → thank-you state.

---

## Project layout

```
app/
  layout.tsx              Root layout, metadata, storm backdrop
  page.tsx                Landing page + comparison grid + modal triggers
  globals.css             Tailwind v4 theme tokens & animations
  icon.svg                Favicon
  waitlist/page.tsx       "Coming Soon" page (server) wrapping the form
  api/track/route.ts      page_view + card_click events
  api/survey/route.ts     Standard-option MCQ answers
  api/waitlist/route.ts   Email capture + high-intent reason
components/
  ProductCard.tsx         Premium / standard card
  Modals.tsx              PremiumModal (QR) + StandardModal (MCQ)
  QrCode.tsx              Deterministic mock QR renderer
  WaitlistForm.tsx        Client form used by /waitlist
lib/
  supabase.ts             Supabase client initialisation
  products.ts             Product catalogue, prices, survey options
  analytics.ts            Session id + fire-and-forget event posting
supabase/
  schema.sql              Run this once in the Supabase SQL editor
public/images/            Four product illustrations (SVG placeholders)
```

---

## 1. Run it locally

```bash
npm install
cp .env.example .env.local     # fill in your Supabase values
npm run dev                    # http://localhost:3000
```

The page works **without** Supabase configured — writes are skipped rather than
erroring, so you can style and demo before the backend exists.

---

## 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com) (the free tier is
   more than enough for a fake-door test).
2. Open **SQL Editor → New query**, paste the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
   It creates the four tables, indexes, RLS policies and four reporting views.
3. Grab your keys from **Project Settings**:
   - **Data API → Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **API Keys → `anon` `public`** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Put both in `.env.local`.

### About security

Row Level Security is **on** for all four tables, and the `anon` role has
`INSERT` policies only — no `SELECT`, `UPDATE` or `DELETE`. A visitor holding
the public anon key can add a row but can never read the waitlist or the survey
results. You read the data from the Supabase dashboard.

If you would rather writes not depend on RLS at all, add the server-only
`SUPABASE_SERVICE_ROLE_KEY` — `lib/supabase.ts` prefers it inside API routes and
falls back to the anon key when it is absent. **Never** prefix that key with
`NEXT_PUBLIC_`; that would ship it to the browser.

### Reading your results

In the SQL editor:

```sql
select * from v_funnel_summary;      -- views → clicks → premium share → emails
select * from v_clicks_by_product;   -- which of the four cards wins
select * from v_survey_breakdown;    -- why people went cheap
select * from v_waitlist_breakdown;  -- why people were ready to pay
select email, reason, created_at from waitlist_signups order by created_at desc;
```

---

## 3. Deploy to Vercel

### Push to GitHub

```bash
git add .
git commit -m "feat: stormproof fake-door MVP"
git push -u origin main
```

### Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. **Import** this repository.
3. Vercel auto-detects Next.js — leave the framework preset, build command
   (`next build`), output directory and install command at their defaults.
4. Before clicking Deploy, open **Environment Variables** and add:

   | Name | Value | Environments |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<your-ref>.supabase.co` | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your `anon` `public` key | Production, Preview, Development |
   | `SUPABASE_SERVICE_ROLE_KEY` *(optional)* | your `service_role` key | Production, Preview |
   | `NEXT_PUBLIC_UPI_ID` *(optional)* | `stormproof@okhdfcbank` | Production, Preview, Development |
   | `NEXT_PUBLIC_UPI_NAME` *(optional)* | `Stormproof` | Production, Preview, Development |

5. Click **Deploy**. First build takes about a minute.

### After the first deploy

- Adding or changing an env var later does **not** rebuild automatically:
  **Deployments → ⋯ → Redeploy** after you save.
- Or do the same from the CLI:
  ```bash
  npm i -g vercel
  vercel link
  vercel env add NEXT_PUBLIC_SUPABASE_URL production
  vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
  vercel --prod
  ```
- Custom domain: **Project → Settings → Domains → Add**, then point your
  registrar at Vercel's nameservers or add the `A` / `CNAME` record it shows.
- Turn on **Vercel Web Analytics** (Project → Analytics) for a second,
  independent read on traffic alongside your own `page_views` table.

---

## 4. Running the experiment

1. Ship it, then drive ~500–1,000 targeted visitors (Instagram, Reddit
   r/india, WhatsApp groups, a small Meta ad set in Mumbai/Bengaluru/Pune during
   monsoon).
2. Let it run at least a week — rain days and dry days convert very differently.
3. Read `v_funnel_summary`.

Rough interpretation for a fake-door test:

- **Premium share of clicks < 15%** — price or positioning is wrong, not the
  product.
- **Premium clicks → email > 25%** — genuine intent; the QR wall is not what
  stopped them.
- **Survey skewing to B ("I lose them")** — loss, not cost, is the real
  objection. Sell replacement cover or a tracker, not more engineering.
- **Waitlist skewing to "Wind-Stability"** — lead with the engineering.
  Skewing to "Brand Vibe" — lead with the look and spend on photography.

---

## Swapping in real photography

The four illustrations in `public/images/*.svg` are placeholders. Drop your
photos in the same folder and update the `image` field in
[`lib/products.ts`](lib/products.ts). Cards already use `next/image` with `fill`
and correct `sizes`, so nothing else changes. Once no SVGs remain, you can
delete `dangerouslyAllowSVG` and `contentSecurityPolicy` from `next.config.ts`.

## Notes

- The QR code is a **mock**. `components/QrCode.tsx` renders a QR-shaped
  pattern; it encodes nothing and cannot take a payment. For a real checkout,
  swap it for `qrcode.react` and pass the same UPI payload string.
- Analytics never blocks the UI: every event is fire-and-forget with
  `keepalive`, and a failed write is logged server-side, never shown to the
  visitor.
- Prices, copy, badges and survey options all live in `lib/products.ts` — that
  is the one file to edit when you want to test a different price point.
