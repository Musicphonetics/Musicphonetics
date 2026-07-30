-- ============================================================================
-- Musicphonetics — Director's Circle monthly plan (one big goal + 8 classes)
-- Run once in the Supabase SQL editor. Additive/idempotent.
--
-- Stores the premium, personally-guided plan the family sees: a single monthly
-- goal plus 8 defined mentorship classes. Teachers/owners write it (optionally
-- AI-drafted) and it is shown in the student portal. Shape:
--   { "month": "2026-07", "big_goal": "…",
--     "classes": [ { "n": 1, "title": "…", "focus": "…" }, … 8 ],
--     "updated_at": "…" }
-- ============================================================================

alter table public.students
  add column if not exists monthly_plan jsonb;

comment on column public.students.monthly_plan is
  'Director''s Circle (and optional) monthly plan: one big goal + 8 defined classes. See supabase/directors_plan.sql.';
