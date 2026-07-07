# Musicphonetics Teacher OS

A mobile-first teacher portal + owner command dashboard, backed by Supabase
(Postgres + Auth + RLS + Realtime). Built inside the existing Next.js
static-export app (Cloudflare Pages) as client-rendered routes under
`/teacher/*` and `/owner/*` — no framework migration, PWA-installable.

> **Money is server-computed.** The 70/30 split is a Postgres *generated column*
> — teachers cannot alter it. The final fee (`students.fee_quoted`) and payout
> status are owner-only, enforced by RLS + triggers, not just the UI.

---

## What ships in this installment

- **Database:** full schema, generated 70/30 split, indexes, `updated_at`
  triggers, sacred-field guards, RLS on every table, `student_stats` /
  `teacher_stats` views, `get_owner_stats()` RPC, realtime publication.
  (`supabase/migrations/0001_teacher_os.sql`, `0002_auth_and_realtime.sql`)
- **Teacher portal (complete):** `/teacher/login` (phone OTP + email),
  `/teacher/dashboard`, `/teacher/students` (list + inline history),
  `/teacher/add-student`, `/teacher/class-update`, `/teacher/payments`,
  `/teacher/profile`. Sticky bottom tab bar, big tap targets, optimistic toasts.
- **Server functions:** `POST /api/provision-teacher`, `POST /api/send-invite`
  (owner-JWT-guarded, service-role key server-side only).
- **PWA:** manifest, icons, offline-shell service worker, installable.

### Not yet built (next installment)
The **owner command dashboard** (`/owner/*`: dashboard KPIs + realtime charts,
teachers/students/classes/payments tables, payouts management) is scaffolded
(`components/portal/tabs.tsx` → `OWNER_TABS`, `get_owner_stats()` RPC ready) but
the owner screens are the next build. The existing mock `/owner` and `/admin`
pages are untouched — retire them once the real owner dashboard lands.

---

## What YOU must supply

| Item | Where |
| --- | --- |
| **Supabase project** (free tier is fine) | https://supabase.com → new project |
| `NEXT_PUBLIC_SUPABASE_URL` | Cloudflare Pages → Settings → Environment variables (build + runtime) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same (safe to expose — RLS protects data) |
| `SUPABASE_URL` | Cloudflare Pages env (for the Functions) |
| `SUPABASE_SERVICE_ROLE_KEY` | Cloudflare Pages env — **server only, never `NEXT_PUBLIC_*`** |
| **SMS provider** (for phone OTP) | Supabase → Auth → Providers → Phone (e.g. Twilio / MSG91) |
| **SMTP** (for email invites, optional) | Supabase → Auth → SMTP settings |

Find the keys in Supabase → Project Settings → API. After setting the two
`NEXT_PUBLIC_*` vars, **redeploy** so they're baked into the static build.

---

## Setup steps

1. **Create the Supabase project**, then open the SQL Editor.
2. **Run the migrations in order:**
   - paste `supabase/migrations/0001_teacher_os.sql` → Run
   - paste `supabase/migrations/0002_auth_and_realtime.sql` → Run
   (Or use the Supabase CLI: `supabase db push`.)
3. **Create the owner account:** Auth → Users → *Add user* (email + password, or
   phone). Copy the new **User UID**.
4. **Seed the owner:** open `supabase/seed.sql`, replace the placeholder UID with
   that User UID, run it. Verify: `select role from profiles where role='owner';`
5. **Set the env vars** in Cloudflare Pages (table above) and redeploy.
6. **Provision your first teacher** (owner must be signed in on the owner portal;
   until the owner UI ships, call the function directly):
   ```bash
   curl -X POST https://musicphonetics.pages.dev/api/provision-teacher \
     -H "Authorization: Bearer <OWNER_ACCESS_TOKEN>" \
     -H "content-type: application/json" \
     -d '{"full_name":"Priya Sharma","phone":"+9198xxxxxxxx","instruments":["Guitar"]}'
   ```
   (Owner access token = the owner's `access_token` from a signed-in session.)
7. Teacher opens `/teacher/login`, signs in by phone OTP (or email), and starts.

### Enable phone OTP
Supabase → Authentication → Providers → **Phone** → enable and connect an SMS
provider (Twilio, MSG91, Vonage, etc.). Without this, teachers use the **Email**
tab on the login screen instead.

---

## RLS test checklist (run in the SQL editor / two teacher sessions)

Prove isolation before going live:

- [ ] Teacher A **cannot** read Teacher B's students
      (`select * from students` as A returns only A's rows).
- [ ] Teacher A **cannot** `insert`/`update` a row with `teacher_id` = B.
- [ ] Teacher A **cannot** set or change `students.fee_quoted`
      (insert silently nulls it; update raises *"Only the owner can set…"*).
- [ ] Teacher A **cannot** read or write any `payouts` row that isn't theirs,
      and cannot change payout `status` at all.
- [ ] Teacher A **cannot** change their own `role`
      (update raises *"You cannot change your own role."*).
- [ ] `payments.teacher_share` / `company_share` always equal 70% / 30% of
      `amount_paid` regardless of what the client sends.
- [ ] Owner **can** read all rows across all teachers.
- [ ] `get_owner_stats()` returns *"Not authorised"* when called by a teacher.

---

## Architecture notes

- **Single source of truth per entity.** Derived values (age, classes
  remaining, shares, balances, revenue) are computed via generated columns,
  views, or the RPC — never duplicated.
- **Static export friendly.** Portal routes are client components; the anon
  Supabase client is created lazily so `next build` never needs the keys.
  Dynamic per-record pages are done as *inline* detail panels (not `[id]`
  routes) so everything stays statically exportable.
- **Realtime** uses the `supabase_realtime` publication (added in `0002`); the
  owner dashboard (next installment) subscribes via `supabase.channel(...)`.
- **CSP** in `public/_headers` already allows `https://*.supabase.co` and
  `wss://*.supabase.co`.
