# Musicphonetics — Implementation Status

_Single source of truth for progress across sessions. Keep concise. Updated: 2026-10-28._

## Phase board

| Phase | Name | Status |
|------|------|--------|
| 0 | Discovery, audit & baseline | **COMPLETE** |
| 1 | Application shell & real navigation | **COMPLETE** (baseline @ e91edca) |
| 2 | Account identity, onboarding & permissions | **COMPLETE** (owner-approved 2026-10-28; no public sign-up; `/app` real sign-in + role routing) |
| 3 | First complete education workflow | **PLANNING** — plan presented, awaiting owner approval before any code |
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

- **Active phase:** Phase 3 — First complete education workflow (**PLANNING**).
- **Phase 2 closed:** owner approved Exit Gate 2 on 2026-10-28. `/app` real sign-in + role routing shipped; provisioned/application account model unchanged.
- **Next task:** present Phase 3 plan → **await owner approval before writing any Phase 3 code.**
- **Phase 3 intent:** wire the *first real, data-backed workflow* into `/app`, reusing the existing education schema + data paths: teacher records a lesson/observation + homework → the family (parent "Student Portal") sees it. No student login, no recordings/AI, no schema/permission changes, classic portals untouched. (Full plan in `docs/IMPLEMENTATION_ROADMAP.md`.)

## Phase 2 — scope & evidence (given "no public sign-up")

- 2.1 Stabilise login → **DONE**: `/app` sign-in via existing `signInWithPassword`; classic `/teacher/login`, `/parent/login`, … untouched.
- 2.2 Identity selection → **N/A** (owner declined self-serve; role is fixed at provisioning — no selection UI built, by design).
- 2.3 Owner/admin out of public registration → **Satisfied** (there is no public registration at all).
- 2.4 Post-login routing → **DONE** (role-based redirect into `/app`).
- 2.5 Preserve existing users/records → **Preserved** (no account/schema/permission changes).
- 2.6 Server/RLS permission enforcement → **Unchanged** (already enforced; `/app` adds client-side role gating on top).
- 2.7 Cross-role/cross-user tests → **PARTIAL**: `/app` client role-gating in place; real RLS cross-user tests need live env + accounts → **NEEDS VERIFICATION on deploy**.
- Verification: tsc exit 0; lint 0 errors; build ✓; **e2e 8/8**; screenshots captured. Signed-in routing requires live Supabase env (not present locally).

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
