-- ============================================================================
-- Musicphonetics — parent feedback table + email notification on submit
-- Run once in the Supabase SQL editor. Additive/idempotent.
--
-- Fixes the "How are the classes going?" card (it was failing because the table
-- / policies weren't set up) and notifies the owner AND the assigned teacher
-- (→ email via the notifications trigger) whenever a family submits feedback.
-- ============================================================================

create table if not exists public.parent_feedback (
  id                     uuid primary key default gen_random_uuid(),
  student_id             uuid references public.students(id) on delete cascade,
  parent_id              uuid,
  rating                 int check (rating between 1 and 5),
  feedback               text,
  permission_to_feature  boolean default false,
  created_at             timestamptz default now()
);

alter table public.parent_feedback enable row level security;

-- A parent may add feedback for their OWN child.
drop policy if exists "feedback parent insert" on public.parent_feedback;
create policy "feedback parent insert" on public.parent_feedback for insert to authenticated
  with check (exists (select 1 from public.students s where s.id = student_id and s.parent_id = auth.uid()));

-- Owner/staff read all; a parent reads their own child's; the teacher reads theirs.
drop policy if exists "feedback read" on public.parent_feedback;
create policy "feedback read" on public.parent_feedback for select using (
  public.mp_is_owner() or public.mp_is_lead_staff()
  or exists (select 1 from public.students s where s.id = student_id and (s.parent_id = auth.uid() or s.teacher_id = auth.uid()))
);

-- Notify the owner(s) and the assigned teacher on every submission (each gets an
-- email via the existing notifications → email trigger).
create or replace function public.mp__trg_feedback_notify() returns trigger
  language plpgsql security definer set search_path = public as $$
declare v_student text; v_teacher uuid; v_stars text; v_body text;
begin
  select name, teacher_id into v_student, v_teacher from public.students where id = new.student_id;
  v_stars := repeat('★', coalesce(new.rating, 0));
  v_body  := coalesce(v_student, 'A family') || ' rated ' || v_stars || coalesce(' — “' || nullif(btrim(new.feedback), '') || '”', '');

  insert into public.notifications (recipient_id, role, type, title, body, action_url, entity_type, entity_id)
    select pr.id, 'owner', 'feedback', 'New parent feedback', v_body, '/owner/teaching', 'feedback', new.id::text
    from public.profiles pr where pr.role = 'owner';

  if v_teacher is not null then
    insert into public.notifications (recipient_id, role, type, title, body, action_url, entity_type, entity_id)
      values (v_teacher, 'teacher', 'feedback', 'New parent feedback', v_body, '/teacher/students', 'feedback', new.id::text);
  end if;

  return new;
exception when others then return new;  -- feedback must save even if notify fails
end $$;

drop trigger if exists trg_feedback_notify on public.parent_feedback;
create trigger trg_feedback_notify after insert on public.parent_feedback
  for each row execute function public.mp__trg_feedback_notify();

notify pgrst, 'reload schema';
