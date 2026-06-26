# Musicphonetics

A premium, market-ready website **and** owner/operating dashboard for
Musicphonetics — a structured, director-led music education company in Delhi NCR.

The public site builds trust and routes families to WhatsApp. The `/admin`
portal is a mock CRM that is architected to become the operating system for
leads, students, teachers, classes, payments, and future academy programs.

> **Positioning:** One-to-one personal learning is the current primary route,
> but the brand and codebase are built to expand into group classes, academy
> batches, workshops, camps, Trinity prep, and online programs.

---

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (custom design system)
- **Google Fonts** — Fraunces (display) + Hanken Grotesk (body)
- Local mock data today; integration-ready for **Google Sheets / Apps Script /
  Supabase** later
- No paid backend required for v1. Deploys cleanly to **Vercel / Netlify**.

---

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Then open <http://localhost:3000>.

- Public site: `/`
- Owner portal: `/admin` (redirects to `/admin/login`)
- **Demo admin password:** `musicphonetics-admin`

## Build for production

```bash
npm run build
npm run start
```

---

## Deploy to Vercel (recommended)

This project is **zero-config** on Vercel — Next.js is auto-detected and no
environment variables are required (the owner-portal password has a built-in
fallback).

### Option A — Import the GitHub repo (easiest, auto-deploys on push)

1. Go to <https://vercel.com/new> and sign in with GitHub.
2. **Import** the `musicphonetics/musicphonetics` repository.
3. Framework preset: **Next.js** (auto-detected). Leave build settings default
   (`next build`, output handled automatically). Root directory: `./`.
4. Click **Deploy**. First build takes ~1–2 minutes; you'll get a live
   `*.vercel.app` URL.
5. Every push to `main` now deploys automatically. Pull requests get preview
   URLs.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel        # first run links the project and deploys a preview
vercel --prod # promote to production
```

### Environment variables (optional)

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_OWNER_PASSWORD` | Owner portal (`/owner`) password | `Abhi@7276` |

Set this in **Vercel → Project → Settings → Environment Variables** to override
the default. (This is a client-side gate for now — see "Adding real
authentication" before storing real data.)

### Deploying on Netlify instead

Netlify needs the official Next.js runtime plugin — it's configured in
`netlify.toml` (committed). When you import the repo into Netlify:

1. Build command and publish dir are read from `netlify.toml`
   (`npm run build`, `.next`).
2. Netlify auto-installs `@netlify/plugin-nextjs` (declared in `netlify.toml`).
3. Node 20 is pinned via `NODE_VERSION`.

If a Netlify build was started **before** `netlify.toml` existed, trigger a new
deploy (Deploys → Trigger deploy → Clear cache and deploy site) so it picks up
the config. Vercel remains the most turnkey host for Next.js, but both work.

### Custom domain

In **Vercel → Project → Settings → Domains**, add `musicphonetics.com` (or your
domain) and follow the DNS instructions. `metadataBase` is already set to
`https://musicphonetics.com` in `app/layout.tsx` — update it there if your final
domain differs.

---

## Project structure

```
app/
  (site)/                 # public website (shares Navbar + Footer)
    page.tsx              # home (long-scroll sales page)
    method/               # /method
    programs/             # /programs
    teachers/             # /teachers
    teach-with-us/        # /teach-with-us
    reviews/              # /reviews
    contact/              # /contact
  admin/
    page.tsx              # gated dashboard with tabs
    login/page.tsx        # demo password gate
  layout.tsx              # root layout (fonts, metadata)
  not-found.tsx           # 404

components/
  layout/                 # Navbar, Footer, MobileWhatsAppButton, Logo
  sections/               # Hero, WhyUs, Method, Programs, Reviews, Plans, FAQ, …
  admin/                  # AdminLayout, tables, DashboardCards, AutomationMap, …
  ui/                     # Button, Card, Section, Badge, Reveal, ImagePlaceholder

lib/
  data.ts                 # public content + brand constants (edit copy here)
  types.ts                # shared TypeScript types (CRM + content model)
  utils.ts                # cn(), formatINR(), formatDate()
  mock-crm.ts             # mock CRM data + derived metrics
  admin-auth.ts           # demo client-side password gate

styles/
  globals.css             # design system base, motion, reduced-motion
```

---

## Where to change things

| You want to change…            | Edit this file |
| ------------------------------ | -------------- |
| **WhatsApp number**            | `lib/data.ts` → `WHATSAPP_NUMBER` (single constant, drives every CTA) |
| **Package prices / names**     | `lib/data.ts` → `PACKAGES` |
| **Teacher profiles (public)**  | `lib/data.ts` → `PUBLIC_TEACHERS` |
| **Reviews**                    | `lib/data.ts` → `REVIEWS` (each marked `sample: true` until verified) |
| **FAQ**                        | `lib/data.ts` → `FAQS` |
| **Programs / pathways**        | `lib/data.ts` → `PROGRAMS` + `app/(site)/programs/page.tsx` |
| **Method stages / principles** | `lib/data.ts` → `METHOD_STAGES_FULL`, `METHOD_PRINCIPLES` |
| **Areas served**               | `lib/data.ts` → `AREAS_SERVED` |
| **Brand colors / fonts**       | `tailwind.config.ts` + `styles/globals.css` |
| **Admin demo password**        | `lib/admin-auth.ts` → `DEMO_ADMIN_PASSWORD` |
| **Mock CRM data**              | `lib/mock-crm.ts` |

### Image placeholders

Every image slot uses `<ImagePlaceholder label="…" />` with an internal label
(e.g. "Founder portrait", "Teacher headshot", "Trinity certificate photo").
Search the codebase for `ImagePlaceholder` to find and replace each one with a
real, alt-described image before launch.

---

## Connecting a real backend later (integration notes)

The admin reads from plain exports in `lib/mock-crm.ts`. To go live, swap those
for async fetchers **with the same return types** so components don't change.

### Google Sheets / Apps Script

1. Create a Sheet with tabs: `People`, `Students`, `Teachers`, `Payments`,
   `Classes`. The columns mirror the types in `lib/types.ts`.
2. Publish an Apps Script Web App (or use the Sheets API) that returns JSON.
3. Replace the arrays in `lib/mock-crm.ts`, e.g.:
   ```ts
   export async function getPeople(): Promise<Person[]> {
     const res = await fetch(process.env.SHEETS_PEOPLE_URL!, { cache: "no-store" });
     return res.json();
   }
   ```
4. Make the admin panels `async` server components (or fetch client-side).

### Supabase (recommended for write actions)

- Mirror `lib/types.ts` as tables.
- Use Row Level Security + Supabase Auth (see authentication below).
- Wire Class Tracker actions (complete / cancel / remarks) and payment updates
  to real mutations — they currently update local state only.

### WhatsApp automation (WATI / Astra)

The full bot journey (BOT_00–BOT_06) is documented in the admin
**Automation Map** tab and mirrors `lib/data.ts` copy. Qualification (BOT_03)
should write to the same People schema.

### Adding real authentication

`lib/admin-auth.ts` is a **demo** client-side gate — not real security.
Replace it with **NextAuth**, **Supabase Auth**, or an Apps Script token before
exposing real student or payment data. Update `app/admin/login/page.tsx` and the
gate in `app/admin/page.tsx` accordingly, and remove the demo password hint.

---

## Accessibility & motion

- Semantic HTML, keyboard focus states, skip-to-content link.
- Sufficient contrast, alt text on placeholders, labelled form fields.
- Fade-up animations via `IntersectionObserver`, fully disabled under
  `prefers-reduced-motion`.

---

## TODO list for integrations

- [ ] Replace `WHATSAPP_NUMBER` with the confirmed business number.
- [ ] Replace all `ImagePlaceholder` slots with real images + alt text.
- [ ] Replace **sample** reviews with verified parent testimonials.
- [ ] Replace placeholder teacher profiles with verified data.
- [ ] Connect Google Sheets / Apps Script (or Supabase) in `lib/mock-crm.ts`.
- [ ] Wire Class Tracker + payment actions to real persistence.
- [ ] Add invoice generation + real invoice links in Payments.
- [ ] Replace demo admin password with real authentication.
- [ ] Add the real Google Business reviews URL (Reviews page).
- [ ] Embed a real Google Map on the Contact page.
- [ ] Wire the "Apply to teach" form to storage/email.

---

Built by Abhishek Kumar · Musicphonetics.
