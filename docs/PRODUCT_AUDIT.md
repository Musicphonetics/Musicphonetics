# PRODUCT AUDIT — current functionality & defects

_Phase 0. See `docs/SYSTEM_OVERVIEW.md` for the deeper existing reference; this file is the blueprint-oriented audit and is not a duplicate of it._

## 1. Stack & deployment (verified)

- **Framework:** Next.js 14.2.5, App Router, TypeScript, Tailwind CSS.
- **Output:** **static export** (`next.config` `output: "export"`, `images.unoptimized`). No Next.js server routes / middleware.
- **Server logic:** **Cloudflare Pages Functions** in `functions/api/*.js` (edge JS). This is the only server-side code, and it is real: it holds the Supabase **service-role** key server-side and verifies caller tokens (`functions/_shared/ops.js` → `getUser`, `assertOwner`).
- **Hosting:** Cloudflare Pages, auto-deploy from `main` (this session has been fast-forwarding `main`).
- **Database + auth:** Supabase (Postgres + GoTrue + RLS). Browser uses the anon key (RLS-gated); Functions use service role.
- **Payments:** **Razorpay** live (`functions/api/razorpay/create-order.js`, `verify-payment.js`). **Cashfree** code exists (`functions/api/cashfree/*`) but is **legacy** per SYSTEM_OVERVIEW — Razorpay is the live provider.
- **Email:** Resend (`functions/api/_mailer.js`, `process-email-outbox.js`); Web3forms for owner notifications only.
- **AI endpoints already exist:** `functions/api/ai/{ask,bio,journey,repertoire}.js` — used today for generating teacher bios / journeys / Q&A (LLM-backed helper text), **not** the music-assessment module from the blueprint.

## 2. Roles & auth model (verified)

- `lib/supabase/types.ts`: `type Role = "owner" | "teacher" | "parent"`. A **`sales`** login/portal also exists in routes + provisioning.
- **No `student` or `musician` auth role exists.** Students are *records* owned/linked to teachers and parents; the family logs in through the **parent** ("Student Portal") experience. Musicians do not exist in the production product at all.
- Client auth: `lib/supabase/auth.ts` (`useAuth`, `signOut`). `components/**/PortalShell.tsx` guards every portal screen (redirects to the role's login when signed out; blocks staff from the parent portal).
- Server authz: Functions verify the Supabase access token and check `profiles.role` before privileged actions (owner-gated provisioning etc.).

## 3. What exists and works (production, in real use)

| Area | Routes | Status |
|---|---|---|
| Marketing website | `app/(site)/*` (~28 pages: home, founder, method, curriculum, standards, teachers + `[slug]`, programmes, reviews, open-mic, teach-with-us, pay, welcome, activate, support, contact, trust, centre…) | **COMPLETE / live** |
| Owner/admin portal | `app/owner/*` (dashboard, students, teachers, applications, messages, payments, payouts, reports, statistics, schedule, teaching, trials, leads, qr, documents, settings, teacher-profiles) + `app/admin/*` | **COMPLETE / live** |
| Teacher portal | `app/teacher/*` (dashboard, students, add-student, class-update, reports, payments, earnings, profile, profile-maker, planner, calendar, schedule, today, trials, leads) | **COMPLETE / live** |
| Parent ("Student") portal | `app/parent/*` (dashboard, classes, progress, homework, reports, payments, notifications, documents, support, ask) | **COMPLETE / live** |
| Sales portal | `app/sales/*` (dashboard, leads, login) | **COMPLETE / live** |
| Trial portal | `app/trial/*` (login, dashboard, journey, updates, profile, ask) | **COMPLETE / live** |
| Lead capture / campaign | `app/delhi-cantt`, `app/start`, `app/studio`, `app/experience` | **COMPLETE / live** |
| Payments (one-time) | Razorpay create-order + verify-payment (server-verified) | **COMPLETE** (one-time lesson/enrolment payments) |
| Email / notifications | Supabase triggers → `email_outbox` → Resend; in-app notifications | **COMPLETE** |

Existing education data model already covers the blueprint's Phase 3 core: students, class updates/lesson notes (with subject, accuracy, struggled-areas, practice level, homework), attendance, curriculum/foundation progress, monthly reports, payment cycles. This is a strong base to reuse.

## 4. Experimental / non-production builds (present in repo)

| Route | What it is | Status |
|---|---|---|
| `app/prototype-1` | Investor-demo "ecosystem" app, **synthetic data**, `noindex` | EXPERIMENT — not production |
| `app/app` | Standalone consumer "practice/community" app, **localStorage + placeholder content**, `noindex` | EXPERIMENT — not production |

These informed design direction but are **not** wired to real auth/data. Fate is an owner decision (see `DECISIONS_AND_RISKS.md`). They must not be mistaken for the real product.

## 5. Gaps vs the blueprint (not yet built)

- **Student as a first-class identity/app** — none (family-centric today).
- **Musician identity, profiles, portfolio, discovery, bookings** — none in production.
- **Self-serve public registration + "choose primary identity"** — today accounts are largely **provisioned by owner / invite / application-approval**; there is no public self-service sign-up that selects an identity.
- **Public marketplace discovery/search with filters** — marketing teacher pages exist, but not a filtered marketplace.
- **Recurring subscriptions** (teacher Starter/Pro/Studio, parent Family Plus, musician plans) — **not implemented**; only one-time payments exist.
- **Community/events module** (beyond the `/open-mic` marketing page), **reviews/trust system**, **AI music-assessment module**, **in-app messaging**, **booking lifecycle** — planned, not built.

## 6. Known defects / hygiene (observed)

- **No automated tests** — a real gap for the blueprint's "tests pass" definition of done.
- **Hand-applied SQL** in `supabase/*.sql` (no CLI migration chain) → risk of drift between the live DB and the repo; schema recreation relies on `supabase/api_grants.sql` (added earlier) for Data API grants.
- Pre-existing lint warnings: `<img>` usage across several pages (intentional for static export; not errors).
- Two parallel experimental app surfaces (`/prototype-1`, `/app`) can confuse "what is the real app."

## 7. Reusable assets for upcoming phases

- `PortalShell` (role-gated layout with mobile bottom-nav + wide owner variant, light/night themes) — the basis for Phase 1's authenticated shell.
- `lib/supabase/{auth,client,parent,owner,roster,stats,leads,director}.ts` — per-role data access.
- The real education schema + `lib/cycles.ts` / `lib/settlement.ts` (payment-driven cycles) for Phase 3.
- Design tokens (`tailwind.config.ts`), `components/ui/*` (Reveal, Loader, etc.), portal frames.
- Server authz helpers in `functions/_shared/ops.js` for any new privileged endpoints.
