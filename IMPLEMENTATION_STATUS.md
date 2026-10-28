# Musicphonetics — Implementation Status

_Single source of truth for progress across sessions. Keep concise. Updated: 2026-10-28._

## Execution model

As of 2026-10-28 the owner moved to **Execution Model v2** (batched, autonomous — see `docs/IMPLEMENTATION_ROADMAP.md`). Work proceeds in large coherent batches (B1–B10), continuing through the roadmap and reporting at milestones/blockers. Security + data-preservation rules unchanged; student/musician accounts stay gated. **Hard environment limit:** this container has no Supabase session, so authenticated data flows + writes are **deploy-verified by the owner**; everything visual/structural is verified here.

## Batch board (v2)

| Batch | Name | Status |
|------|------|--------|
| B1 | /app premium design system + UX overhaul | **DONE (local verify)** — shared ui kit, premium shell/sign-in, applied across all 3a screens; tsc/lint/build/e2e green, screenshots captured |
| B2 | Education loop writes (record a lesson) | NEXT — deploy-verified; reuses secure `class_updates` insert |
| B3 | In-app identity, account & notifications | PLANNED |
| B4 | Teacher discovery & enquiries | PLANNED |
| B5 | Subscriptions & payments (test mode) | PLANNED (gated: live billing) |
| B6 | Owner operations | PLANNED |
| B7 | Community & events | PLANNED (gated: new tables) |
| B8 | Musician/student accounts | PLANNED (gated: role design) |
| B9 | AI-assisted learning | PLANNED (gated: creds) |
| B10 | Hardening & release | PLANNED |

### B1 — what was built (premium design system)

- **New shared UI kit** `components/app/ui.tsx`: `Icon` (expanded set), `Button` (primary/accent/ghost/soft/danger, loading, href), `Field`/`inputCls`, `Card` (interactive), `PageHeader`, `SectionLabel`, `Badge`, `Chip`, `Avatar`, `Metric`, `Spinner`, `Skeleton`/`SkeletonList`, `EmptyState`, `BrandWave`, `ToastProvider`/`useToast`, `fmtDate`, `StatusPill`. Visible focus rings throughout; motion respects `prefers-reduced-motion`.
- **Refactored onto the kit** (export names/signatures preserved so no page broke): `components/app/states.tsx` (re-exports `Icon`; premium panels + honest in-dev `ModulePage`), `components/app/data.tsx` (re-exports `fmtDate`/`StatusPill`/`Metric`; `Empty`/`Unauthorized`/`ErrorBox`/`LessonItem` on the kit).
- **Upgraded shell** `components/app/AppShell.tsx`: premium header (logo badge + role pill), `Avatar` account menu, nav rail with active states, mobile bottom nav with gold active pill, content wrapped in `ToastProvider`.
- **Upgraded sign-in** `app/app/page.tsx`: brand-wave + gold ambience, kit `Button`/`inputCls` (all e2e hooks preserved — no public sign-up).
- **Applied across 3a screens** (teacher home/students, parent home/children/updates): `PageHeader`, `SkeletonList` loading, `Avatar`, `Card`, `SectionLabel` — consistent hierarchy + responsive.

### B1 evidence (local)
- tsc exit 0 · lint 0 errors (only pre-existing `<img>` warnings, none in `/app`) · build ✓ (all `/app` routes export) · **e2e 10/10**.
- Screenshots captured: sign-in (desktop + mobile), teacher shell (desktop + mobile), parent shell (mobile), in-dev module route. Populated data views remain a **deploy check** (no Supabase session locally; minors' records never rendered in dev).
- No schema / `functions/*` / classic-portal changes. Reversible (code-only).


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

- **Active model:** Execution Model v2 (batched). **B1 (premium design system) DONE** and locally verified; **B2 (education loop writes) is next.**
- **Last completed:** B1 — shared `components/app/ui.tsx` kit; premium shell + sign-in; applied consistently across every `/app` screen (teacher + parent). tsc/lint/build/e2e all green; screenshots captured. No schema / functions / classic-portal changes.
- **Carried forward (deploy checks, unchanged):** Phase 3a real-data views + RLS boundaries still to be production-verified by owner on deploy (teacher sees only own students; parent sees only own children + no `teacher_notes`; classic portals unchanged). B1 did not alter any data path, so these checks stand.
- **Next task:** B2 — add a "Record a lesson" flow in `/app/teacher` via the existing secure `class_updates` insert path (RLS `with check` = teacher owns student). Writes real data → **deploy-verified**; isolate to a designated test student or local/test env before any real student's history.

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
