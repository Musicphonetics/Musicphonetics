-- ============================================================================
-- Musicphonetics — per-class SUBJECT + student SETTLEMENT (ADDITIVE)
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- 1) subject on each class update, so a student taking more than one subject
--    (e.g. Music + History) has every class tagged and countable separately.
-- 2) settled_until / settlement_note on a student, so a chapter taught on a
--    different arrangement can be closed off on a date: classes & payments up to
--    that date stay as history, and the paid-cycle tracking restarts after it.
-- ============================================================================

-- 1) Per-class subject ------------------------------------------------------
alter table public.class_updates add column if not exists subject text;
comment on column public.class_updates.subject is 'What was taught this class (e.g. Guitar, Music, History). Lets one student run more than one subject.';

-- 2) Student settlement boundary -------------------------------------------
alter table public.students add column if not exists settled_until date;
alter table public.students add column if not exists settlement_note text;
comment on column public.students.settled_until is 'Classes & payments on or before this date are a closed, settled chapter; paid-cycle tracking restarts after it.';
comment on column public.students.settlement_note is 'Optional note describing the settled chapter (old fee/arrangement).';
