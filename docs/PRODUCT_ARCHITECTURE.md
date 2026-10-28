# PRODUCT ARCHITECTURE — blueprint target ↔ existing code (gap map)

_Phase 0. Maps the Master Blueprint's target modules to what exists, so we reuse rather than rebuild._

## 1. The central architecture decision (needs owner approval)

The blueprint describes an authenticated app under `/app/{role}/*` with student, parent, teacher and musician experiences. Today the authenticated product is the **existing portals** (`/teacher`, `/parent`, `/owner`, `/sales`), which already have role-specific navigation (`PortalShell`), real data and real auth.

**Three options (recommendation: Option A):**

- **Option A — Evolve the existing portals (recommended).** Treat `/teacher` + `/parent` (+ `/owner`) as the authenticated application and standardise them to the blueprint's shell/nav/state conventions. Add **new** experiences (student, musician, public marketplace) as new route groups when their phases arrive. Lowest risk; preserves live product and data; fastest to a coherent whole.
- **Option B — Greenfield `/app/*`.** Build a parallel new shell and migrate portals into it over time. Cleaner URL story, but duplicates working software and risks drift/regression during migration.
- **Option C — Hybrid.** New public surfaces (marketplace, musician) under blueprint routes; keep education portals where they are. Pragmatic but two conventions coexist.

This choice sets every later phase's routing. **Please pick one before Phase 1.**

> **DECIDED (owner, 2026-10-28): Option B** — build the new authenticated application under `/app/*`, coexisting with (not replacing) the existing portals. Phase 1 shell implemented accordingly.

## 2. Module-by-module mapping

| Blueprint module | Exists today? | Reuse / action |
|---|---|---|
| 00 Public experience | Marketing site `app/(site)/*` (LIVE) | Reuse. Add `/explore`, `/musicians`, a dedicated `/pricing`, self-serve `/sign-up` later. |
| 01 Account & onboarding | Partial: invite/application/owner-provisioned; no "choose identity" self-serve | **New** self-serve registration + identity selection (Phase 2). |
| 02 Student app | **None** (family-centric via parent) | **New** (needs student identity decision; Phase 2+). |
| 03 Parent app | `app/parent/*` (LIVE) | Reuse/standardise. Strongest base alongside teacher. |
| 04 Teacher app | `app/teacher/*` (LIVE) | Reuse/standardise. Core of Phase 3–5. |
| 05 Musician app | **None** | **New** (new role + schema + bookings; Phase 7). |
| 06 Marketplace (search/booking/reviews) | Marketing teacher pages only | **New** discovery/search/enquiry/booking (Phase 6–7). |
| 07 Community & events | `/open-mic` marketing only | **New** module after moderation/safety (Phase 10). |
| 08 AI music learning | AI *text* helpers exist (`functions/api/ai/*`); no assessment module | **New** assessment workflow; label sample honestly (Phase 11). |
| 09 Shared services | notifications, email, payments (one-time), audit all exist; search/messaging/reviews/subscriptions do not | Reuse what exists; build the rest per phase. |
| 10 Owner/admin | `app/owner/*` + `app/admin/*` (LIVE) + server authz | Reuse/extend (Phase 9). |

## 3. Target route conventions (proposal, pending Option A/B/C)

Under **Option A**, keep existing portal routes and add new groups as phases land:
`/teacher/*` (exists) · `/parent/*` (exists) · `/owner/*` (exists) · **new:** `/student/*`, `/musician/*`, `/explore`, `/musicians`, `/musicians/[id]`, `/pricing`, `/sign-up`, `/onboarding`, `/community`, `/events`.
Each authenticated group uses a `PortalShell`-style role layout (top bar + mobile bottom nav / desktop rail), protected client-side and enforced server-side + RLS.

## 4. Technical constraints that shape the architecture

- **Static export:** no Next middleware; route protection is client-side (redirect to login) + server-side (Functions) + RLS. Deep-link/refresh already works per route. Any new "server action" lives as a Cloudflare Function in `functions/api/*`.
- **Server-side work** (payments verification, webhooks, provisioning, privileged reads, AI calls) belongs in Functions with the service-role key — never in the browser.
- **Design system** already exists (tokens, `PortalShell`, `components/ui/*`); extend it rather than introducing a new one.
