# ROUTE INVENTORY

_Phase 0. Status legend: **LIVE** = working in production · **EXPERIMENT** = non-production demo · **PLANNED** = in blueprint, not built._
_Deployment: static export, so every listed route is a prerendered page; auth is enforced client-side (PortalShell) + server-side (Functions)._

## Public marketing — `app/(site)/*` (shares Navbar/Footer/Ticker)  — LIVE
`/` · `/founder` · `/method` · `/curriculum` · `/standards` (+ `/standards/[slug]`) · `/programmes/[slug]` · `/programs` · `/music-classes` (+ `/music-classes/[area]`) · `/teachers` (+ `/teachers/[slug]`) · `/faculty` · `/reviews` · `/open-mic` · `/teach-with-us` (+ `/terms`) · `/pay` (+ `/pay/retry`) · `/welcome` · `/activate` · `/enrolment-agreement` · `/trust` · `/centre` · `/contact` · `/support` · `/preview`

## Authenticated portals (top-level route groups, no marketing chrome)
- **Owner/admin** — `app/owner/*` — LIVE: `dashboard, students, teachers, teacher-profiles, applications, messages, payments, payouts, reports, statistics, schedule, teaching, trials, leads, qr, documents, settings, login`. Plus `app/admin` + `app/admin/login` — LIVE.
- **Teacher** — `app/teacher/*` — LIVE: `dashboard, students, add-student, class-update, reports, payments, earnings, profile, profile-maker, planner, calendar, schedule, today, trials, leads, login`.
- **Parent ("Student Portal")** — `app/parent/*` — LIVE: `dashboard, classes, progress, homework, reports, payments, notifications, documents, support, ask, login`.
- **Sales** — `app/sales/*` — LIVE: `dashboard, leads, login`.
- **Trial** — `app/trial/*` — LIVE: `login, dashboard, journey, updates, profile, ask`.
- **Auth** — `app/auth/update-password` — LIVE.

## Lead-capture / campaign surfaces — LIVE
`app/delhi-cantt` · `app/start` · `app/studio` · `app/experience`

## Experimental (non-production) — EXPERIMENT
- `app/prototype-1` — investor-demo ecosystem app (synthetic, `noindex`).
- `app/app` — standalone practice/community app (localStorage/placeholder, `noindex`).

## Server API — `functions/api/*` (Cloudflare Pages Functions) — LIVE
- Payments: `razorpay/create-order`, `razorpay/verify-payment`; `cashfree/*` (legacy).
- Provisioning (owner-gated): `provision-teacher`, `provision-parent`, `provision-sales`, `approve-teacher`, `assign-teacher`, `activate-student`, `link-child`, `accept-offer`, `send-offer`, `send-invite`, `teacher-application`.
- Comms: `_mailer`, `process-email-outbox`, `email-test`, `lead`, `delhi-cantt-lead`, `calendar`.
- AI helpers: `ai/{ask,bio,journey,repertoire}` (teacher text generation / Q&A).
- Trial: `trial/{start,expect}`.

## Blueprint target routes NOT yet present — PLANNED
`/explore` · `/musicians` (+ `/musicians/[id]`) · `/pricing` (pricing lives inside marketing today) · `/sign-up` + `/onboarding` (self-serve identity selection) · `/app/student/*` · `/app/parent/*` (exists as `/parent/*`) · `/app/teacher/*` (exists as `/teacher/*`) · `/app/musician/*` · `/app/community` · `/app/events` · marketplace search/booking · reviews · AI assessment module.

## Notes on route behaviour (Phase 1 relevance)
- Deep links + refresh work today for portals (static HTML per route). The blueprint's "refresh must not bounce to intro" requirement is **already satisfied** for existing portals; must be preserved.
- No universal sidebar exists; each portal has role-specific navigation via `PortalShell`. Good alignment with the blueprint.
- Owner/admin is **not** publicly selectable — aligns with the blueprint's security rule.
