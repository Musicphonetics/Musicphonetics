-- ============================================================================
-- TRIAL PORTAL (Phase 2d) — enrolment converts the trial account into the full
-- Student Portal. No second account, no re-onboarding: we create a students row
-- linked to the SAME auth login (parent_id = trial user_id), so the family's
-- existing portal becomes their Student Portal and their whole history stays.
--
-- Builds on the earlier trial migrations. Idempotent.
-- ============================================================================

create or replace function public.mp_trial_enrol(p_id uuid, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v public.trial_sessions%rowtype;
  v_student uuid;
  v_fee numeric;
begin
  if not public.mp_is_lead_staff() then raise exception 'Not authorised'; end if;
  select * into v from public.trial_sessions where id = p_id;
  if not found then return null; end if;
  if v.converted_student_id is not null then
    return jsonb_build_object('ok', true, 'student_id', v.converted_student_id, 'existed', true);
  end if;
  if v.user_id is null then raise exception 'This trial has no login to convert.'; end if;
  if v.assigned_teacher_id is null then raise exception 'Assign a teacher before enrolling.'; end if;

  v_fee := nullif(regexp_replace(coalesce(p->>'fee',''), '\D', '', 'g'), '')::numeric;

  insert into public.students (
    name, parent_id, parent_name, parent_phone, parent_email, school, instrument,
    learning_goal, class_mode, teacher_id, status, lead_id, fee_quoted, classes_per_month, start_date
  ) values (
    coalesce(nullif(v.student_name,''), 'Student'), v.user_id, v.parent_name, v.phone, v.email,
    v.school, v.instrument, v.learning_goal, coalesce(nullif(p->>'class_mode',''), v.preferred_mode),
    v.assigned_teacher_id, 'active', v.lead_id, v_fee,
    coalesce((p->>'classes_per_month')::int, 8), nullif(p->>'start_date','')::date
  ) returning id into v_student;

  update public.trial_sessions
    set stage = 'enrolled', enrolled_at = now(), status = 'enrolled', converted_student_id = v_student
    where id = p_id;

  -- Keep the CRM lead in sync.
  begin
    if v.lead_id is not null then
      update public.leads
        set converted_student_id = v_student, converted_at = now(), status = 'converted', last_activity_at = now()
        where id = v.lead_id and converted_student_id is null;
    end if;
  exception when others then null; end;

  -- Welcome the family (in-app).
  begin
    insert into public.notifications(user_id, type, title, body)
    values (v.user_id, 'enrolled', 'Welcome to Musicphonetics!',
            'You are enrolled. Your Trial Portal is now your full Student Portal.');
  exception when others then null; end;

  return jsonb_build_object('ok', true, 'student_id', v_student);
end $$;
grant execute on function public.mp_trial_enrol(uuid, jsonb) to authenticated;

-- mp_trial_mine — expose enrolment so the family portal can redirect to the
-- Student Portal once converted.
create or replace function public.mp_trial_mine()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.trial_sessions%rowtype;
begin
  select * into v from public.trial_sessions where user_id = auth.uid() order by created_at desc limit 1;
  if not found then return null; end if;
  return jsonb_build_object(
    'stage', v.stage, 'status', v.status, 'student_name', v.student_name, 'who', v.who,
    'student_age', v.student_age, 'school', v.school, 'instrument', v.instrument,
    'experience_level', v.experience_level, 'learning_goal', v.learning_goal,
    'dream_songs', v.dream_songs, 'pre_assessment', v.pre_assessment,
    'trial_datetime', v.trial_datetime, 'trial_rating', v.trial_rating,
    'teacher_summary', v.teacher_summary, 'director_note', v.director_note,
    'director_review', v.director_review, 'recommendation', v.recommendation,
    'converted_student_id', v.converted_student_id, 'feedback', v.feedback, 'created_at', v.created_at
  );
end $$;
grant execute on function public.mp_trial_mine() to authenticated;
