# Musicphonetics — working agreement for Claude

**At the start of every task, read these first (in order):**

1. `docs/blueprint/MUSICPHONETICS_BUILD_SEQUENCE.txt` — authoritative for *implementation order*, phase gates and session protocol.
2. `docs/blueprint/MUSICPHONETICS_MASTER_BLUEPRINT.txt` — the product vision, wireframes and technical principles (the destination).
3. `IMPLEMENTATION_STATUS.md` — the current phase, what's done, what's next, and whether owner approval is required.
4. The relevant existing code for the active task, plus `docs/SYSTEM_OVERVIEW.md` (the existing system reference). Do **not** re-run the whole audit each time — re-read the relevant files and the status, then continue from the last verified checkpoint.

**Non-negotiables (summarised; the Build Sequence is the full version):**

- **One phase at a time.** Work only the current approved phase. Present a plan + acceptance criteria at the start of a phase; show evidence at the end; stop at each exit gate for owner approval. Don't start the next phase on your own.
- **Complete workflows, not screens.** A feature is done only when the journey works end-to-end: UI + data persistence + permissions + error states + tests + no regressions.
- **Preserve data and functionality.** Never reset/overwrite/fabricate production data. Additive, reversible migrations only. The live portals (`/owner`, `/teacher`, `/parent`, `/sales`) are in real use — do not break them. Get approval before destructive data changes, production billing, significant permission changes, or infra/secret changes.
- **Security = authorisation, not just auth.** Enforce access on the server (Cloudflare Functions) and database (Supabase RLS), not by hiding buttons. No public admin registration; no client-side role selection that grants privileges. Protect minors' data and private recordings.
- **Truthful status.** Label work COMPLETE / IN PROGRESS / BLOCKED / PLANNED / NEEDS VERIFICATION. Never claim a feature, payment, integration or test works unless it was actually verified.
- **Design.** Real app with independent routes, persistent role-specific navigation, responsive mobile + desktop. No universal sidebar; no whole app on one scrollable page; no fake charts/activity; no dead buttons.

**Repository documentation (keep current; update, don't duplicate):**
`IMPLEMENTATION_STATUS.md`, `docs/PRODUCT_AUDIT.md`, `docs/ROUTE_INVENTORY.md`,
`docs/DATA_AND_PERMISSIONS.md`, `docs/PRODUCT_ARCHITECTURE.md`,
`docs/IMPLEMENTATION_ROADMAP.md`, `docs/DECISIONS_AND_RISKS.md`,
`docs/TESTING_AND_DEPLOYMENT.md`.

**`/app/*` is the new authenticated application** (Phase 1 shell, Option B) — it coexists with the live portals (`/owner`, `/teacher`, `/parent`, `/sales`, `/trial`) and does not replace them. The earlier experimental builds (`/prototype-1` and the old consumer `/app`) were **removed** in Phase 1. Shell code: `components/app/*`; routes: `app/app/*`. E2E: `npm run test:e2e` (Playwright, pinned to the container's Chromium).
