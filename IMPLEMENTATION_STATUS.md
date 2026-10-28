# Musicphonetics — Implementation Status

_Single source of truth for progress across sessions. Keep concise. Updated: 2026-10-28._

## Phase board

| Phase | Name | Status |
|------|------|--------|
| 0 | Discovery, audit & baseline | **COMPLETE** |
| 1 | Application shell & real navigation | **COMPLETE** (baseline @ e91edca) |
| 2 | Account identity, onboarding & permissions | **COMPLETE** (owner-approved 2026-10-28; no public sign-up; `/app` real sign-in + role routing) |
| 3 | First complete education workflow | **3a DONE (read-only)** — built + structurally tested; data/RLS to verify on deploy. 3b (recording) NOT started — needs separate approval |
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

- **Active phase:** Phase 3 — First complete education workflow. **3a (read-only) implemented**; **3b (recording) NOT started** (needs separate owner approval).
- **Last completed:** read-only education views wired into `/app`, reusing existing RLS-gated data paths. No writes, no schema, no permission changes, classic portals untouched.
- **Next task:** owner verifies the real data views on the **deployed** site (needs live session) → approve Exit Gate 3a. **Do not start Phase 3b (writes) without separate approval.**

## Phase 3a — what was built (read-only)

- **Teacher** (`/app/teacher`): `home` (real student count + recent lessons via `loadRoster` + `loadRecentLessons`), `students` (roster via `loadRoster`, RLS-scoped; search; student detail via `?id` using new read-only `loadTeacherStudent` with a defensive `teacher_id === uid` ownership check + lesson history from `class_updates`). Teacher view shows the teacher's own private notes.
- **Parent** (`/app/parent`): `home` (each child via `loadParentData`+`studentView`), `children` (list + per-child lesson history via `?id`, scoped to the family), `updates` (newest-first lesson feed). **Parent views never render `teacher_notes`** (privacy boundary preserved).
- **Reused:** `loadRoster`, `loadParentData`, `studentView`, `class_updates` reads, `AppShell`, `components/app/states`. **New (reads only):** `lib/supabase/lessons.ts`, `components/app/data.tsx`.
- **States:** loading, empty, error, and unauthorized implemented on every view. No fabricated records/metrics.
- Untouched: `/app/teacher/{lessons,calendar,enquiries,profile}` and `/app/parent/{teachers,profile}` remain honest "in development" placeholders (later phases).

### Evidence
- tsc exit 0 · lint 0 errors · build ✓ (routes export with real sizes) · **e2e 10/10**.
- Screenshots: new routes integrate into the role shell (desktop + mobile). **The populated data views cannot be shown locally** (no Supabase session) and I deliberately do **not** render real students' (minors') records in dev screenshots → **production check** below.

### Production verification (owner, on deploy — needs real accounts)
1. Sign in at `/app` as a **teacher** → `/app/teacher/students` lists **only your** students; open one → lesson history shows; visiting `/app/teacher/students?id=<another teacher's student id>` shows **"Not available"** (RLS + ownership check).
2. Sign in as a **parent** → `/app/parent/home` + `/children` show **only your** children; `/app/parent/children?id=<another family's id>` shows **"Not available"**; confirm **no `teacher_notes`** appear anywhere in the parent view.
3. Confirm the classic `/teacher/*` and `/parent/*` portals are unchanged.

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
