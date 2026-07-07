# Musicphonetics Teacher OS

A mobile-first teacher portal (owner command dashboard is the next installment),
backed by **your existing Supabase project**. Built inside the existing Next.js
static-export app (Cloudflare Pages) as client-rendered routes under `/teacher/*`,
PWA-installable.

> **The backend is already built and live in Supabase.** This app connects the
> frontend to your existing tables/views — it does **not** create or migrate the
> schema. No migration files ship in this repo.

---

## Your backend (source of truth — already provisioned)

Tables `profiles · students · class_updates · payments · payouts`; the 70/30
split as generated `teacher_share` / `company_share`; views `student_stats` /
`teacher_stats`; RPC `get_owner_stats()`; RLS on every table; owner account
promoted. The frontend queries exactly these names (`class_updates`,
`cashfree_bill_no`, `amount_paid`, generated shares, etc.).

Project: `https://pvgrtytyycagdrhvismj.supabase.co`

---

## Auth: email + password (no SMS/OTP)

Teachers sign in with **email + password** at `/teacher/login`. You provision
each teacher yourself (no public sign-up); email confirmation is off. There is
no phone-OTP path and no SMS provider to configure.

---

## Environment variables (Cloudflare Pages → Settings → Environment variables)

| Variable | Scope | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Build | `https://pvgrtytyycagdrhvismj.supabase.co` (no `/rest/v1/`) |
| `VITE_SUPABASE_ANON_KEY` | Build | the **anon** key (safe to expose — RLS protects data) |
| `SUPABASE_URL` | Functions | same project URL (used by `/api/*` server functions) |
| `SUPABASE_SERVICE_ROLE_KEY` | Functions | **server only — never client / never committed** |

> **Stack note:** this app is **Next.js**, not Vite, so only build-time values
> reach the browser. `next.config.mjs` bridges `VITE_SUPABASE_URL` /
> `VITE_SUPABASE_ANON_KEY` into the client bundle for you — so the Vite-style
> names you set in Cloudflare work. (It also accepts `NEXT_PUBLIC_*` as a
> fallback.) A trailing `/rest/v1/` on the URL is stripped automatically.

After adding the vars, **redeploy** so they bake into the static build. When the
keys are present, the login screen's "Portal not configured" banner disappears.

`.env` is gitignored; the two secret values live only in Cloudflare, never in code.

### ⚠️ Rotate your service-role key
The service-role key was shared in chat, so treat it as exposed. In Supabase →
Project Settings → API → **roll the `service_role` key**, then paste the new one
into the `SUPABASE_SERVICE_ROLE_KEY` Cloudflare var. (The anon key is public by
design — no need to rotate it.)

---

## Provision a teacher

Two ways:

- **Supabase dashboard:** Auth → Users → *Add user* → set email + password →
  the `handle_new_user` trigger creates their `profiles` row as `teacher`.
- **API (owner signed in):**
  ```bash
  curl -X POST https://musicphonetics.pages.dev/api/provision-teacher \
    -H "Authorization: Bearer <OWNER_ACCESS_TOKEN>" \
    -H "content-type: application/json" \
    -d '{"full_name":"Priya Sharma","email":"priya@example.com","instruments":["Guitar"]}'
  ```
  (The owner's access token comes from their signed-in Supabase session.)

Then set the teacher's password (dashboard, or a recovery email) and share the
`/teacher/login` link.

---

## Prove the teacher loop (do this once keys are in)

Sign in as a test teacher and confirm the full loop:

1. **Log in** at `/teacher/login` (email + password).
2. **Add a student** → appears under *My Students*.
3. **Log a class** (student picker → status/date/notes) → *completed/remaining*
   updates on the student card and dashboard.
4. **Record a payment** with a Cashfree bill number → the **70% / 30% split**
   shows and the dashboard's *received this month* rises.
5. Confirm the teacher sees **only their own** students and a **70% earnings**
   summary — never payout status.

### RLS isolation check (the important one)
With two teacher accounts (A and B), in the Supabase SQL editor run as each user
(or via two browser sessions):
- As A: `select count(*) from students;` → sees only A's rows.
- As A: `update students set fee_quoted = 1 where id = '<any>';` → **rejected**
  (*"Only the owner can set or change the final fee"*).
- As A: `update profiles set role='owner' where id = auth.uid();` → **rejected**.
- As A: `select * from payouts;` → only A's rows, and A cannot change `status`.

---

## What's next
The **owner command dashboard** (`/owner/*`): KPIs from `get_owner_stats()`,
realtime charts, teacher/student/payment tables, and payouts management. The RPC,
realtime publication, and tab scaffolding are already in place for it.
