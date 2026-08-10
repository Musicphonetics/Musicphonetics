-- ============================================================================
-- TRIAL PORTAL (Phase 2a.2) — a self-driving family journey:
--   Build Profile → Book Trial (instant confirm) → Meet Teacher (allotted +
--   Director confirmed) → Share Feedback → Learning Pathway (unlocked by feedback)
--
-- Builds on trial_studio.sql + trial_portal.sql. Safe to run repeatedly.
-- ============================================================================

alter table public.trial_sessions add column if not exists school       text;
alter table public.trial_sessions add column if not exists trial_rating int;

-- Pre-assessment now also builds the student profile (name, age, school).
create or replace function public.mp_trial_pre_assessment(p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.trial_sessions%rowtype;
begin
  update public.trial_sessions set
    student_name     = coalesce(nullif(p->>'student_name',''), student_name),
    student_age      = coalesce(nullif(p->>'student_age',''), student_age),
    school           = coalesce(nullif(p->>'school',''), school),
    pre_assessment   = coalesce(p->'pre_assessment', pre_assessment),
    dream_songs      = coalesce(p->'dream_songs', dream_songs),
    experience_level = coalesce(p->>'experience_level', experience_level),
    learning_goal    = coalesce(p->>'learning_goal', learning_goal),
    stage            = case when stage = 'booked' then 'pre_assessed' else stage end
  where user_id = auth.uid()
  returning * into v;
  if not found then return null; end if;
  return jsonb_build_object('ok', true, 'stage', v.stage);
end $$;
grant execute on function public.mp_trial_pre_assessment(jsonb) to authenticated;

-- Book the trial slot — instant, no waiting. Advances to 'trial_scheduled'.
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
  -- Surface it in the CRM so staff/teacher see the booked trial.
  begin
    insert into public.lead_activity(lead_id, kind, detail)
    values (v.lead_id, 'trial_booked', 'Trial slot booked for ' || to_char(p_datetime, 'DD Mon, HH24:MI'));
  exception when others then null; end;
  return jsonb_build_object('ok', true, 'stage', v.stage, 'trial_datetime', v.trial_datetime);
end $$;
grant execute on function public.mp_trial_book_slot(timestamptz) to authenticated;

-- Trial feedback — this is the gate that UNLOCKS the learning pathway.
create or replace function public.mp_trial_trial_feedback(p_rating int, p_text text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.trial_sessions%rowtype;
begin
  update public.trial_sessions set
    trial_rating = coalesce(p_rating, trial_rating),
    feedback = feedback || jsonb_build_array(jsonb_build_object('by','family','rating',p_rating,'text',left(coalesce(p_text,''),2000),'at',now())),
    stage = case when stage in ('trial_scheduled','trial_done','assessed','director_reviewed') then 'feedback_submitted' else stage end
  where user_id = auth.uid()
  returning * into v;
  if not found then return null; end if;
  return jsonb_build_object('ok', true, 'stage', v.stage);
end $$;
grant execute on function public.mp_trial_trial_feedback(int, text) to authenticated;

-- mp_trial_mine — include the new profile + booking + rating fields.
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
    'feedback', v.feedback, 'created_at', v.created_at
  );
end $$;
grant execute on function public.mp_trial_mine() to authenticated;
