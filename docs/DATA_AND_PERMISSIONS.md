# DATA & PERMISSIONS AUDIT

_Phase 0. Schema source: `supabase/*.sql` (hand-applied, no CLI migration chain). 33 tables, RLS enabled on all 33, 74 policies._

## 1. Access model

- **Browser** uses the Supabase **anon** key; every table has **RLS enabled**, so row access is governed by policies. Much write access goes through **SECURITY DEFINER functions** (`mp_*`) with explicit `grant execute`, rather than direct table DML — a deliberately tight design.
- **Cloudflare Functions** use the **service-role** key (server-only, never shipped to the browser) and verify the caller's token + `profiles.role` before privileged operations (`functions/_shared/ops.js`).
- Roles: `profiles.role ∈ {owner, teacher, parent}` (+ a `sales` concept). Staff (owner/teacher) are blocked from the parent portal in `PortalShell`.

## 2. Core tables (by domain; names from `supabase/*.sql`)

- **Identity:** `profiles` (role, email, phone…), parent↔child links on `students`.
- **Education:** `students` (name, parent_id, parent_email/phone, instrument, teacher_id, plan, fee, settlements…), `scheduled_classes`, `class_updates` (lesson notes: subject, accuracy, struggled areas, practice level, homework), attendance, `student_reports` / `student_report_topics`, curriculum: `curriculum_paths/chapters/milestones`, `student_curriculum_progress`, `student_milestones/_checks`, `student_documents`.
- **Teacher ops:** `teacher_public_profiles`, `teacher_private_details`, `teacher_availability`, `teacher_time_off`, `teacher_onboarding_items`, `teacher_applications`, `teacher_coupons`.
- **Leads/CRM:** `leads`, `lead_activity`, `campaign_leads`, `qr_scans`.
- **Comms/ops:** `notifications`, `email_outbox`, `director_messages`, `app_config`, `holidays`, `calendar_events`, `community_updates`, `parent_feedback`, `audit_logs`.
- **Trial:** `trial_sessions`.

(Full definitions + the 74 policies live in `supabase/*.sql`. `supabase/api_grants.sql` restores Data API grants on schema recreation.)

## 3. Permission posture (good today)

- All 33 tables RLS-enabled; parent/teacher/owner SELECT policies scope rows to the right owner (e.g. a parent sees only their linked children; a teacher sees only assigned students).
- Privileged creation (provisioning accounts, approving teachers, linking children) runs **server-side** in owner-gated Functions — not from the browser.
- No service-role key in any client bundle (confirmed: only `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` are public).

## 4. Risks & things to verify before later phases

1. **Adding `student` and `musician` as identities** (blueprint) will touch the `Role` union and require **new tables + new RLS** across the schema. This is significant and must be **additive, reversible, and RLS-tested with separate accounts** (Build Sequence Day 5 / Phase 2). Needs design + owner approval. **Do not do this in Phase 1.**
2. **Schema drift:** hand-applied SQL means the live DB may differ from `supabase/*.sql`. Before any migration, confirm the live schema (read-only) rather than trusting the files.
3. **Minor safety:** students are minors. Any future student login, messaging, community or public profile must enforce guardian consent and restrict adult-to-minor contact (blueprint Part 10/13). Treat as a gating requirement, not an afterthought.
4. **Private media/recordings** (Phase 11 AI): no media-recording storage/access rules exist yet; must use signed, expiring links and never expose private recordings publicly.
5. **IDOR checks:** before shipping any new "open by id" screen (student/teacher/musician details, enquiries), test that a user cannot read another's records by changing the id — at the **database** layer, not just the UI.
6. **No automated permission tests** today → Phase 1/2 should add at least a manual permission-test checklist, ideally an automated smoke (owner decision).

## 5. Migration discipline (agreed)

- New schema goes in **new** `supabase/*.sql` files, additive only, with grants + RLS in the same file.
- Never drop/reset tables or production data to simplify a demo.
- Record every schema change here with date, file, and rollback note.
