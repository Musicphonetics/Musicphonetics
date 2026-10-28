# TESTING & DEPLOYMENT

_Phase 0. How to run, verify, deploy and roll back. No secrets are stored here._

## Run & build

- Install: `npm ci` (fresh containers start with empty `node_modules`).
- Dev: `npm run dev`.
- Production build (static export → `out/`): `npm run build`.
- Typecheck: `npx tsc --noEmit`.
- Lint: `./node_modules/.bin/next lint --dir <dir>` (scoped) or `npm run lint`.
- Preview the export locally: `python3 -m http.server --directory out <port>` then open `/<route>.html`.

## Tests

- **There is no automated test framework** in the repo today (no vitest/jest/playwright/cypress in `package.json`).
- Current verification = **build + lint + typecheck + manual walkthrough** (+ ad-hoc Playwright screenshots via `playwright-core` with the preinstalled Chromium at `/opt/pw-browsers/...`).
- **Proposed (owner decision #4):** add a minimal **Playwright smoke** for routing, auth redirects, role boundaries and responsive layout, to satisfy the blueprint's Definition of Done in later phases.
- Per-phase, until a harness exists: keep a **manual acceptance checklist** in `IMPLEMENTATION_STATUS.md` and record actual results (never claim a test passed that wasn't run).

## Environment (names only — set in Cloudflare Pages dashboard, never committed)

- Public (browser): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, optional `NEXT_PUBLIC_OWNER_PASSWORD`, site-verification tokens.
- Server (Functions only): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, Resend/Web3forms keys, (legacy `CASHFREE_*`). **Service-role and secret keys must never appear in the browser bundle or the repo.**

## Deployment

- Cloudflare Pages auto-deploys from **`main`**. Build command `next build`, output `out/`; `functions/` is deployed as Pages Functions automatically.
- Working model this project has used: commit to the feature branch `claude/musicphonetics-platform-tsjtk7`, push, then fast-forward `main` to deploy. **Per the Build Sequence, deploy only approved, phase-gated work.**

## Rollback / recovery

- Code: revert the offending commit (or `git revert`) and fast-forward `main`; Cloudflare redeploys the previous state. Keep commits small and focused so a revert is clean.
- Data: migrations are additive/reversible by policy; never reset production data. For a schema mistake, write a new additive corrective migration rather than destructive rollback. `supabase/api_grants.sql` restores Data API grants if a schema is recreated.
- Secrets/infra/billing: do not change without explicit owner approval.
