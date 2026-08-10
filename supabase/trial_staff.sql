-- ============================================================================
-- TRIAL PORTAL (Phase 2b/2c) — the staff side of the funnel.
--   Owner: see every trial, assign a teacher, write the Director Review.
--   Teacher: see assigned trials, submit a structured Trial Assessment.
-- The Director Review + the family's feedback together unlock the pathway.
--
-- Builds on trial_studio.sql + trial_portal.sql + trial_portal_2.sql. Idempotent.
-- ============================================================================

-- Fix: book-slot CRM logging using the real lead_activity columns.
create or replace function public.mp_trial_book_slot(p_datetime timestamptz)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.trial_sessions%rowtype;
begin
  update public.trial_sessions set
    trial_datetime = p_datetime,
    stage = case when stage in ('booked','pre_assessed') then 'trial_scheduled' else stage end
  where user_id = auth.uid()
  returning * into v;
  if not found then return null; end if;
  begin
    if v.lead_id is not null then
      insert into public.lead_activity(lead_id, event_type, actor_role, metadata)
      values (v.lead_id, 'trial_booked', 'family',
              jsonb_build_object('trial_datetime', p_datetime, 'trial_id', v.id));
    end if;
  exception when others then null; end;
  return jsonb_build_object('ok', true, 'stage', v.stage, 'trial_datetime', v.trial_datetime);
end $$;
grant execute on function public.mp_trial_book_slot(timestamptz) to authenticated;

-- Owner/sales: the trial pipeline.
create or replace function public.mp_trial_list()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  if not public.mp_is_lead_staff() then raise exception 'Not authorised'; end if;
  select coalesce(jsonb_agg(t order by t.created_at desc), '[]'::jsonb) into v
  from (
    select jsonb_build_object(
      'id', id, 'created_at', created_at, 'stage', stage, 'student_name', student_name,
      'who', who, 'student_age', student_age, 'school', school, 'instrument', instrument,
      'phone', phone, 'email', email, 'lead_code', lead_code, 'trial_datetime', trial_datetime,
      'trial_rating', trial_rating, 'assigned_teacher_id', assigned_teacher_id,
      'has_teacher_assessment', teacher_assessment is not null,
      'has_director_review', director_review is not null
    ) as t, created_at
    from public.trial_sessions order by created_at desc limit 300
  ) x;
  return v;
end $$;
grant execute on function public.mp_trial_list() to authenticated;

-- Full detail for a trial (staff, or the assigned teacher).
create or replace function public.mp_trial_get_one(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.trial_sessions%rowtype;
begin
  select * into v from public.trial_sessions where id = p_id;
  if not found then return null; end if;
  if not (public.mp_is_lead_staff() or v.assigned_teacher_id = auth.uid()) then
    raise exception 'Not authorised';
  end if;
  return to_jsonb(v);
end $$;
grant execute on function public.mp_trial_get_one(uuid) to authenticated;

-- Owner: assign (or reassign) a teacher to a trial.
create or replace function public.mp_trial_assign(p_id uuid, p_teacher uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.trial_sessions%rowtype;
begin
  if not public.mp_is_lead_staff() then raise exception 'Not authorised'; end if;
  update public.trial_sessions set
    assigned_teacher_id = p_teacher,
    stage = case when stage in ('booked','pre_assessed','trial_scheduled') then 'teacher_assigned' else stage end
  where id = p_id returning * into v;
  if not found then return null; end if;
  return jsonb_build_object('ok', true);
end $$;
grant execute on function public.mp_trial_assign(uuid, uuid) to authenticated;

-- Teacher: the trials assigned to me.
create or replace function public.mp_trial_teacher_list()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  select coalesce(jsonb_agg(t order by t.created_at desc), '[]'::jsonb) into v
  from (
    select jsonb_build_object(
      'id', id, 'created_at', created_at, 'stage', stage, 'student_name', student_name,
      'student_age', student_age, 'school', school, 'instrument', instrument,
      'trial_datetime', trial_datetime, 'has_assessment', teacher_assessment is not null
    ) as t, created_at
    from public.trial_sessions where assigned_teacher_id = auth.uid()
    order by created_at desc limit 100
  ) x;
  return v;
end $$;
grant execute on function public.mp_trial_teacher_list() to authenticated;

-- Teacher (assigned) or staff: submit the structured trial assessment.
create or replace function public.mp_trial_teacher_assessment(p_id uuid, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.trial_sessions%rowtype;
begin
  select * into v from public.trial_sessions where id = p_id;
  if not found then return null; end if;
  if not (public.mp_is_lead_staff() or v.assigned_teacher_id = auth.uid()) then
    raise exception 'Not authorised';
  end if;
  update public.trial_sessions set
    teacher_assessment = p,
    teacher_summary = nullif(p->>'summary',''),
    stage = case when stage in ('booked','pre_assessed','trial_scheduled','teacher_assigned','trial_done') then 'assessed' else stage end
  where id = p_id returning * into v;
  return jsonb_build_object('ok', true);
end $$;
grant execute on function public.mp_trial_teacher_assessment(uuid, jsonb) to authenticated;

-- Owner (Director): write the review + recommendation that unlock the pathway.
create or replace function public.mp_trial_director_review(p_id uuid, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.trial_sessions%rowtype;
begin
  if not public.mp_is_lead_staff() then raise exception 'Not authorised'; end if;
  update public.trial_sessions set
    director_review = p->'director_review',
    recommendation  = p->'recommendation',
    director_note   = coalesce(nullif(p->>'director_note',''), director_note),
    stage = case when stage not in ('enrolled') then 'director_reviewed' else stage end
  where id = p_id returning * into v;
  if not found then return null; end if;
  -- Notify the family in-app (best-effort).
  begin
    if v.user_id is not null then
      insert into public.notifications(user_id, type, title, body)
      values (v.user_id, 'trial_recommendation', 'Your learning pathway is ready',
              'The Director has reviewed your trial and prepared your personalised recommendation.');
    end if;
  exception when others then null; end;
  return jsonb_build_object('ok', true);
end $$;
grant execute on function public.mp_trial_director_review(uuid, jsonb) to authenticated;
