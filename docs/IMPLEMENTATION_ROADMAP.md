# IMPLEMENTATION ROADMAP

_Phase order is authoritative per `docs/blueprint/MUSICPHONETICS_BUILD_SEQUENCE.txt` §6. This file adds repo-specific scope + acceptance criteria. Only Phase 1 is detailed here; later phases are summarised and will be detailed when approved._

## Phase ordering (with repo note)

0. Audit — **this phase (done, awaiting approval).**
1. Application shell & real navigation.
2. Identity, onboarding & permissions (introduces self-serve registration; decision needed on student/musician identities).
3. First complete education workflow (teacher → lesson → practice → student view → review → parent update) — **reuses the existing education schema/portals; highest early value.**
4. Student/parent experience. 5. Teacher workspace. 6. Discovery & enquiries. 7. Musician marketplace. 8. Subscriptions & payment test mode. 9. Owner/admin. 10. Community & events. 11. AI prototype. 12. Hardening.

> Repo reality: Phases 3–5 largely **stabilise/standardise existing working portals** rather than build from scratch. Phases 2, 6, 7, 10, 11 are mostly **new**. Phase 8 (recurring subscriptions) is new on top of the existing one-time Razorpay flow.

---

## PHASE 1 — Application shell & real navigation (PROPOSED SCOPE)

**Goal:** prove the product is a real multi-screen app with separated public/authenticated layers, robust protected routing, and consistent role-specific navigation — **without building new roles, new data, or redesigning screen content.**

**Pre-req decision:** adopt Option A/B/C from `PRODUCT_ARCHITECTURE.md §1` (recommended: **A — evolve existing portals**). Phase 1 below is written for Option A.

### In scope
1. **Confirm & document the layer separation** that already exists: marketing `(site)` vs authenticated portals. Ensure no marketing chrome leaks into portals and vice-versa.
2. **Standardise the authenticated shell** on `PortalShell` for teacher, parent, owner (and sales): consistent header, role-specific navigation (mobile bottom nav / desktop), account menu, back behaviour. No universal sidebar.
3. **Protected-route robustness:** signed-out access to any portal route redirects to that role's login; signed-in session persists across refresh; deep links + browser back/forward work; staff cannot land in the parent portal. (Mostly true today — Phase 1 verifies and fixes gaps, adds any missing guards.)
4. **App-wide states:** a single consistent **not-found (404)** page, plus shared **loading / empty / error** components used by the shell. (Create/standardise; don't restyle screen content.)
5. **Responsive check** of the shell at mobile + desktop.
6. **Reserve** (do not build) student/musician: document their target routes; show nothing that pretends to be a working student/musician app.

### Explicitly OUT of scope for Phase 1
- No new auth roles, no schema/RLS changes, no self-serve registration (Phase 2).
- No redesign of screen *content*, no new education features (Phase 3+).
- No subscriptions/payments/marketplace/community/AI work.
- No changes to the experimental `/prototype-1` or `/app` (decision pending).

### Files likely affected
`components/**/PortalShell.tsx` and portal `layout.tsx` files; a new `app/not-found.tsx` (if missing) + shared state components under `components/ui/*`; possibly small nav/data-attribute tweaks in portal pages. **No** `functions/*`, **no** `supabase/*` changes.

### Acceptance criteria (Phase 1 / Exit Gate 1)
- [ ] Public site and authenticated portals are clearly separate; no cross-leak of chrome.
- [ ] Each portal uses consistent role-specific navigation; no universal sidebar; owner not publicly selectable.
- [ ] Direct URL to a protected route while **signed out** → correct role login; while **signed in** → the page renders and **survives refresh and back/forward** (no bounce to a marketing/intro page).
- [ ] Session persists across reload; sign-out returns to the right place; staff blocked from parent portal.
- [ ] Consistent 404 + loading/empty/error states exist and are used by the shell.
- [ ] Shell is usable at 390px mobile and desktop widths.
- [ ] `tsc --noEmit` clean · `next lint` clean (no new warnings) · `next build` passes · manual walkthrough screenshots captured.
- [ ] **No regression:** all four production portals behave exactly as before except for the standardised shell/nav; no data/schema/auth-logic change.

### How Phase 1 is verified (no test suite today)
- Manual journey checklist (per role: signed-out redirect, signed-in deep link, refresh, back/forward, sign-out).
- Build + lint + typecheck.
- Playwright screenshot smoke of each portal's shell at mobile + desktop (tooling already used ad-hoc this session). **Optionally** formalise a minimal Playwright smoke harness — see decision #4.

---

## PHASE 3 — First complete education workflow (PROPOSED — awaiting approval)

**Adapted to this codebase:** there is no student login (the family's view is the parent "Student Portal"), and recordings/AI are later (Phase 11). So the real, complete, data-backed loop here is:

> **Teacher records a lesson (topics, attendance, accuracy, where they struggled, practice/homework, next step) → the family sees that update + homework + progress in their parent view.**

Built **inside `/app`**, reusing the existing education schema + data paths. Recommended as two safe increments:

### Phase 3a — read-only (no write risk)
- `/app/teacher/students` — real list via `lib/supabase/roster.loadRoster()` (RLS: only the teacher's students) + search/empty/loading/error.
- `/app/teacher/students/[id]` — student details + recent lesson history (read `class_updates`).
- `/app/parent` home/updates/children — show the latest lesson updates, homework and progress via `lib/supabase/parent.loadParentData()/studentView()` (RLS: only the parent's children).
- Pure reads of existing data; **no writes, no schema, no permission change.** Verifies the end-to-end "see the real data in the new app" path.

### Phase 3b — recording (adds writes, after 3a verified)
- A "Record a lesson" form in `/app/teacher` that writes a `class_updates` row via the **same** path the classic `/teacher/class-update` uses (`sb.from("class_updates").insert(...)` with the subject-column fallback), with validation + confirmation. The record then appears for the family in `/app/parent` **and** in the classic portals (same data).

### Explicitly OUT of scope
Student login; student-submitted recordings/uploads; AI feedback; marketplace/community/subscriptions. No schema/column changes, no new RLS/roles, no changes to the classic portals.

### Reuse (not rebuild)
`lib/supabase/{roster,parent,stats,types}`, the `class_updates` insert path, `AppShell`, `components/app/states`.

### Data-safety note
Phase 3b writes **real** lesson records (same as the classic portal does today) through the existing RLS-protected path — inserts only, reversible by normal record management. Optionally pointed at a designated test student first. **Needs owner go-ahead** (writing production data from `/app`).

### Acceptance (Exit Gate 3)
Teacher sees only their students → opens one → (3b) records a lesson that persists → family sees it for the right child and only their children; cross-teacher / cross-family access blocked (RLS); history preserved; empty/error states; no regression; tsc/lint/build/e2e clean. **Real persistence + RLS boundaries verified on deploy** (local has no Supabase env).

## Later phases — one-line acceptance (to be expanded on approval)
- **P2:** a new user self-registers, picks one identity, lands in the right workspace; role boundaries enforced server+DB; existing users unaffected.
- **P3:** a real lesson→practice→feedback→parent-update journey persists with correct permissions (reusing existing schema).
- **P5/P6/P7:** teacher workspace / teacher discovery+enquiry / musician profiles+booking lifecycle each pass the 5-point Definition of Done.
- **P8:** test-mode subscriptions with server-verified state; production billing stays disabled until separately approved.
