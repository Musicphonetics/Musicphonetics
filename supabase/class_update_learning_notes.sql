-- ============================================================================
-- Musicphonetics, Class Update Learning Notes (ADDITIVE)
-- Run once in the Supabase SQL editor. Depends on the class_updates table.
--
-- Adds the learning feedback a teacher records per class and the family reads
-- on the portal home: an accuracy score, where the student struggled, and how
-- much practice is needed before the next class.
-- ============================================================================

alter table public.class_updates
  add column if not exists accuracy_percent int,
  add column if not exists error_areas      text,
  add column if not exists practice_level   text;

-- Keep accuracy a sane 0..100 (only when set).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'class_updates_accuracy_range'
  ) then
    alter table public.class_updates
      add constraint class_updates_accuracy_range
      check (accuracy_percent is null or (accuracy_percent >= 0 and accuracy_percent <= 100));
  end if;
end $$;

comment on column public.class_updates.accuracy_percent is
  'How accurately the student played this class, 0-100. Shown to the family.';
comment on column public.class_updates.error_areas is
  'Where the student struggled this class (e.g. chord changes, timing). Shown to the family.';
comment on column public.class_updates.practice_level is
  'How much practice is needed before the next class: light | moderate | focused | intensive.';
