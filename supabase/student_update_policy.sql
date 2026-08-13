-- ============================================================================
-- Let teachers save/edit their OWN students (admission details, fee, etc.).
-- Symptom this fixes: the admission form says "Saved" but nothing persists and
-- the form reopens blank — a classic RLS silent failure where the UPDATE matches
-- zero rows (teacher had SELECT/INSERT but no UPDATE policy). Policies are OR'd,
-- so this only ADDS access; owner + lead staff keep full access. Idempotent.
-- ============================================================================

alter table public.students enable row level security;

drop policy if exists "students teacher update own" on public.students;
create policy "students teacher update own" on public.students
  for update
  using (
    teacher_id = auth.uid()
    or public.mp_is_owner()
    or public.mp_is_lead_staff()
  )
  with check (
    teacher_id = auth.uid()
    or public.mp_is_owner()
    or public.mp_is_lead_staff()
  );

notify pgrst, 'reload schema';
