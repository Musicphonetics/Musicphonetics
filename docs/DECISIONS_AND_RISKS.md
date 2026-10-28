# DECISIONS & RISKS

_Phase 0. Open decisions block or shape Phase 1+. Risks carry mitigations._

## A. Decisions requiring the owner's approval (before Phase 1 implementation)

1. **App architecture (Option A/B/C in `PRODUCT_ARCHITECTURE.md`).**
   Recommendation: **Option A — evolve the existing `/teacher` + `/parent` (+ `/owner`) portals** into the blueprint app and add new experiences as new route groups. Impact: sets routing for every later phase.

2. **Phase 1 scope = shell only, existing roles.**
   The Build Sequence Phase 1 text mentions "first student, parent, teacher, musician screens," but **student and musician do not exist** in this codebase. Recommendation: Phase 1 standardises the shell/navigation for the **roles that exist today** (teacher, parent, owner, sales) and **reserves** student/musician for Phase 2+. (This is the surfaced conflict below, item C1.) Confirm.

3. **Fate of experimental builds `/prototype-1` and `/app`.**
   Options: (a) **freeze** — keep for design reference, `noindex`, don't extend (recommended); (b) delete; (c) fold specific ideas into the real app later. Confirm.

4. **Introduce an automated test harness now?**
   There is **no test suite**. The blueprint's Definition of Done needs tests. Recommendation: add a **minimal Playwright smoke** (routing/auth/role-boundary/responsive) during Phase 1 so later phases have a safety net. Confirm whether to invest now or stay manual + build/lint for Phase 1.

5. **Self-serve public registration (Phase 2 shape).**
   Today accounts are owner/invite/application-provisioned. The marketplace vision needs public sign-up with identity selection. Decision for Phase 2: which identities get self-serve sign-up first (likely teacher + parent), and does teacher sign-up still require owner verification before going live?

6. **Student as a first-class login identity.**
   Blueprint wants a student app. Today it's family(parent)-centric. Students are **minors** → separate student logins raise safeguarding/consent obligations. Decision: build student logins (with guardian consent) vs keep family-centric and defer student-only accounts. Affects Phase 2 schema + RLS.

7. **Recurring subscriptions provider.**
   Only one-time Razorpay payments exist. Recurring billing (teacher/parent/musician plans) needs a subscription product + webhooks. Decision deferred to Phase 8, but flag now: confirm Razorpay Subscriptions vs another provider, and keep production billing disabled until separately approved.

## B. Risks & mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Breaking live portals used by real families/teachers | High | Phase-gated, additive changes; no schema/auth changes in Phase 1; regression check each phase; deploy via branch → review. |
| New roles (student/musician) touch `Role` + RLS across 33 tables | High | Additive new tables + new policies only; test with separate accounts (Day 5); owner approval before starting (Phase 2). |
| Schema drift (hand-applied SQL, no migration chain) | Medium | Verify live schema read-only before migrating; new changes as additive `supabase/*.sql` with grants+RLS; log here. |
| No automated tests → "tests pass" gate is weak | Medium | Decision #4 (Playwright smoke); until then, documented manual checklists + build/lint/tsc. |
| Minor safety (student data, future messaging/community/recordings) | High | Guardian consent + adult-to-minor restrictions as gating requirements for Phases 2/10/11; private media via signed expiring links. |
| Payment correctness (never trust the browser) | High | All payment state verified server-side in Functions (already the pattern); production billing stays off until Phase 8 readiness check. |
| Two experimental app surfaces cause confusion | Low/Med | Decision #3 (freeze); CLAUDE.md already flags them as non-production. |
| Static export limits (no middleware) | Low | Known; guard client-side + server-side + RLS; deep-link/refresh already works and is an acceptance criterion. |

## C. Surfaced conflicts between the two source files / repo reality

- **C1.** Build Sequence Phase 1 implies student+musician screens in the shell; the repo has **no** student/musician roles. → Resolution proposed in Decision #2 (shell for existing roles; reserve the rest). Awaiting confirmation.
- **C2.** Blueprint Part 2 proposes `/app/{role}/*` routes; the repo already serves authenticated areas at `/teacher`, `/parent`, `/owner`. → Resolution in Decision #1 (Option A keeps existing routes; don't churn URLs unnecessarily).

_No decision here authorises data, permission, billing, security or infra changes. Those require explicit owner approval per the Build Sequence §8._
