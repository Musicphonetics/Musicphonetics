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

- **Playwright smoke harness (added Phase 1):** `npm run test:e2e` runs `playwright test`.
  - Config: `playwright.config.ts` (pinned `@playwright/test@1.63.0` to match the container's `playwright-core`; `launchOptions.executablePath` points at the preinstalled Chromium `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, overridable via `PLAYWRIGHT_CHROMIUM_PATH`).
  - It builds nothing itself — **run `npm run build` first**, then `npm run test:e2e`. The config's `webServer` starts `tests/static-server.mjs`, which serves `out/` resolving clean URLs the way Cloudflare Pages does (`<path>.html`, `<path>/index.html`, `404.html`).
  - Specs: `tests/e2e/app-shell.spec.ts` — public/app separation, `/app` gate, teacher & parent shells + nav, client navigation, deep-link/refresh, 404, mobile bottom nav. **8/8 pass.**
  - **Known limit:** the local export has no Supabase env, so signed-in-session flows (role redirects, authed content) are **not** exercised locally; verify those on the deployed site (env set in Cloudflare) or by running the build with env vars.
- Still also run **build + lint + typecheck + manual walkthrough**. Never claim a test passed that wasn't run.

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
