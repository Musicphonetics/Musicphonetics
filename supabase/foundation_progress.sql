-- ============================================================================
-- Musicphonetics — Foundation learning fields (ADDITIVE, idempotent)
-- The 32-class journey (EXPLORE / PLAY / MAKE MUSIC / PERFORM) is DERIVED from
-- completed countable classes — never stored. These three fields are the
-- teacher-updated learning content the parent/student card shows:
--   • current_topic   → "Now Learning"
--   • next_milestone  → "Next Milestone"
--   • repertoire      → "Songs Learned" (jsonb array of titles)
-- Run once in the Supabase SQL editor.
-- ============================================================================

alter table public.students add column if not exists current_topic  text;
alter table public.students add column if not exists next_milestone text;
alter table public.students add column if not exists repertoire     jsonb not null default '[]'::jsonb;
