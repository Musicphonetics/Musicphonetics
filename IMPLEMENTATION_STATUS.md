# Musicphonetics — Implementation Status

_Single source of truth for progress across sessions. Keep concise. Updated: 2026-10-28._

## Phase board

| Phase | Name | Status |
|------|------|--------|
| 0 | Discovery, audit & baseline | **COMPLETE** |
| 1 | Application shell & real navigation | **NEEDS VERIFICATION** (built + tested locally; signed-in flows to confirm on deploy) |
| 2 | Account identity, onboarding & permissions | PLANNED |
| 3 | First complete education workflow | PLANNED |
| 4 | Student/parent experience | PLANNED |
| 5 | Teacher professional workspace | PLANNED |
| 6 | Public discovery & enquiries | PLANNED |
| 7 | Musician marketplace & booking | PLANNED |
| 8 | Subscriptions & payment test mode | PLANNED |
| 9 | Owner/admin operations | PLANNED |
| 10 | Community & events | PLANNED |
| 11 | AI music-learning prototype | PLANNED |
| 12 | Hardening & release readiness | PLANNED |

## Current

- **Active phase:** Phase 1 — Application shell (Option B: new app under `/app/*`).
- **Last completed:** Phase 0 audit (docs in `docs/`). Phase 1 shell implemented + local verification.
- **Next task:** Owner review at **Exit Gate 1**, then Phase 2 (identity/onboarding) — **do not start Phase 2 without approval.**
- **Owner approval required:** confirm Phase 1 on the deployed site (signed-in redirects need live Supabase env) before marking COMPLETE and starting Phase 2.

## Owner's decisions applied (this phase)

1. Architecture = **Option B** — new authenticated app under `/app/*`, coexisting with existing portals.
2. Roles = existing only (owner/teacher/parent/sales/trial preserved). No student/musician.
3. Experiments `/prototype-1` and the old experimental `/app` **removed** (verified self-contained; see commit).
4. **Minimal Playwright harness added.**

## Phase 1 — what was built

- New routes: `/app` (sign-in gate/router) + `/app/teacher/{home,students,lessons,calendar,enquiries,profile}` + `/app/parent/{home,children,updates,teachers,profile}`.
- New components: `components/app/{AppShell.tsx, nav.ts, states.tsx}` — role-aware shell (top bar + account menu, desktop rail + mobile bottom nav), auth-gated content, loading/error/sign-in/wrong-workspace/not-configured states, and honest "in development" module pages that link to the live classic portal.
- Reuses existing `useAuth`/`signOut`, logins, server authz + RLS. **No** schema, `functions/`, `next.config`, env, or existing-portal changes.
- Playwright: `playwright.config.ts`, `tests/e2e/app-shell.spec.ts`, `tests/static-server.mjs`; `npm run test:e2e`.

## Phase 1 acceptance criteria — evidence

| Criterion | Result |
|---|---|
| Public vs authenticated separation | PASS (home has no app shell; `/app/*` has shell) — Playwright |
| Role-specific nav, no universal sidebar | PASS — teacher 6-item + parent 5-item rails; owner not publicly selectable |
| Deep-link loads directly / refresh-safe | PASS — `/app/parent/children` returns 200 with shell — Playwright |
| Client navigation between screens | PASS — rail link navigates — Playwright |
| 404 for unknown `/app/*` | PASS — returns 404 + not-found page — Playwright |
| Responsive (mobile bottom nav) | PASS — bottom nav at 390px — Playwright |
| `tsc` / `lint` / `build` | PASS — tsc exit 0; lint 0 errors; build ✓ 138 static pages |
| Playwright smoke | **8/8 passed** |
| Signed-in redirects (teacher→/app/teacher/home, parent→…, owner→/owner) | **NOT RUN locally** — needs Supabase env; verify on deploy |
| No regression to 5 portals | PASS (build) — all portal routes still generate; no portal code changed |

## Baseline → final

- Baseline (pre-Phase-1): tsc exit 0, lint 0 errors / 39 `<img>` warnings, build ✓ 128 pages.
- Final: tsc exit 0, lint 0 errors (same pre-existing warnings), build ✓ **138 pages** (−2 experimental routes, +13 `/app` routes), **8/8 e2e**.

## Rollback

- Revert the Phase 1 commit; Cloudflare redeploys the previous state. No data/schema touched, so rollback is code-only and clean.
