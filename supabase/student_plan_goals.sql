-- Student plan (batch) + rolling monthly goal.
-- The parent/student portal shows the curriculum PROGRESS BAR only for the
-- Foundation batch. Foundation and Main Pathway students also see a MONTHLY GOAL
-- that the teacher sets and updates each month. Director's Circle students see
-- neither a progress bar nor a monthly goal (a bespoke, personally-guided plan).
--
-- Run this once in the Supabase SQL editor. All columns are additive and safe.

alter table public.students add column if not exists plan text;          -- 'foundation' | 'main' | 'directors' (null -> inferred from fee)
alter table public.students add column if not exists monthly_goal text;   -- this month's goal, set by the teacher
alter table public.students add column if not exists goal_month text;      -- e.g. '2026-07' - the month the goal belongs to
alter table public.students add column if not exists goal_set_at timestamptz;

-- Optional integrity: keep plan to known values when set.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'students_plan_check') then
    alter table public.students
      add constraint students_plan_check
      check (plan is null or plan in ('foundation', 'main', 'directors'));
  end if;
end $$;
