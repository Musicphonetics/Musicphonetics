-- ============================================================================
-- Musicphonetics, Teacher Weekly Planner (ADDITIVE)
-- Run once in the Supabase SQL editor. Depends on the students table and
-- student_update_policy.sql (teachers may update their own students).
--
-- Adds a per-student recurring weekly schedule and a weekly class target so the
-- teacher planner can: fill each week automatically in the calendar, count how
-- many classes are done this week per student, and flag who has been missed.
-- ============================================================================

alter table public.students
  add column if not exists weekly_slots  jsonb not null default '[]'::jsonb,
  add column if not exists weekly_target int   not null default 2;

comment on column public.students.weekly_slots is
  'Recurring weekly schedule: array of {day:0-6 (0=Sun), time:"HH:MM", mode:text}. Generates the calendar each week.';
comment on column public.students.weekly_target is
  'Target classes per week for the planner (default 2; some students 3).';
