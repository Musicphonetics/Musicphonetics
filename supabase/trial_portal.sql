-- ============================================================================
-- TRIAL PORTAL (Phase 2a) — evolves the Trial Studio into a real, logged-in
-- Trial → Assessment → Conversion funnel.
--
-- The moment someone books a trial we provision a real 'parent' auth account
-- (see /api/trial/start) and link it here via user_id. The account logs into a
-- premium, branded "Trial Zone" that shows their journey and collects a proper
-- pre-assessment. On enrolment the SAME account becomes the Student Portal — no
-- second account, full history preserved.
--
-- Requires trial_studio.sql to have been run first. Safe to run repeatedly.
-- ============================================================================

alter table public.trial_sessions add column if not exists user_id            uuid references auth.users(id) on delete set null;
alter table public.trial_sessions add column if not exists stage              text not null default 'booked';
alter table public.trial_sessions add column if not exists pre_assessment     jsonb not null default '{}'::jsonb;
alter table public.trial_sessions add column if not exists teacher_assessment jsonb;
alter table public.trial_sessions add column if not exists director_review    jsonb;
alter table public.trial_sessions add column if not exists recommendation     jsonb;
alter table public.trial_sessions add column if not exists trial_datetime     timestamptz;
alter table public.trial_sessions add column if not exists enrolled_at        timestamptz;

create index if not exists trial_sessions_user_idx on public.trial_sessions(user_id);

-- The journey stages, in order. The portal stepper lights up to the current one.
-- booked → pre_assessed → teacher_assigned → trial_scheduled → trial_done →
-- assessed → director_reviewed → recommended → enrolled   (or → nurture)
comment on column public.trial_sessions.stage is
  'booked|pre_assessed|teacher_assigned|trial_scheduled|trial_done|assessed|director_reviewed|recommended|enrolled|nurture';

-- The logged-in trial family can read ONLY their own session.
drop policy if exists "trial owner read" on public.trial_sessions;
create policy "trial owner read" on public.trial_sessions
  for select using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- mp_trial_start — extended to store the provisioned auth user_id.
-- (Called by /api/trial/start with the service role AFTER creating the login.)
-- ---------------------------------------------------------------------------
create or replace function public.mp_trial_start(p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_lead record; v_token uuid; v_id uuid;
begin
  select * into v_lead from public.mp_intake_lead(
    jsonb_build_object(
      'student_name', p->>'student_name', 'parent_name', p->>'parent_name',
      'phone', p->>'phone', 'email', p->>'email', 'student_age', p->>'student_age',
      'instrument_interest', p->>'instrument', 'preferred_mode', p->>'preferred_mode',
      'preferred_area', p->>'preferred_area', 'experience_level', p->>'experience_level',
      'learning_goal', p->>'learning_goal', 'source', coalesce(p->>'source','trial_portal'),
      'landing_page', coalesce(p->>'landing_page','/studio'),
      'utm_source', p->>'utm_source', 'utm_medium', p->>'utm_medium', 'utm_campaign', p->>'utm_campaign'
    )
  );

  insert into public.trial_sessions(
    user_id, lead_id, lead_code, student_name, parent_name, who, student_age, phone, email,
    instrument, preferred_mode, preferred_area, experience_level, learning_goal, answers
  ) values (
    nullif(p->>'user_id','')::uuid, v_lead.lead_id, v_lead.lead_code, p->>'student_name',
    p->>'parent_name', p->>'who', p->>'student_age', p->>'phone', p->>'email', p->>'instrument',
    p->>'preferred_mode', p->>'preferred_area', p->>'experience_level', p->>'learning_goal',
    coalesce(p->'answers','{}'::jsonb)
  )
  returning id, token into v_id, v_token;

  return jsonb_build_object('ok', true, 'token', v_token, 'id', v_id, 'lead_code', v_lead.lead_code);
end $$;
grant execute on function public.mp_trial_start(jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- mp_trial_mine — the logged-in family's own session (safe subset).
-- ---------------------------------------------------------------------------
create or replace function public.mp_trial_mine()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.trial_sessions%rowtype;
begin
  select * into v from public.trial_sessions where user_id = auth.uid() order by created_at desc limit 1;
  if not found then return null; end if;
  return jsonb_build_object(
    'stage', v.stage, 'status', v.status, 'student_name', v.student_name, 'who', v.who,
    'student_age', v.student_age, 'instrument', v.instrument, 'experience_level', v.experience_level,
    'learning_goal', v.learning_goal, 'dream_songs', v.dream_songs, 'pre_assessment', v.pre_assessment,
    'teacher_summary', v.teacher_summary, 'director_note', v.director_note,
    'director_review', v.director_review, 'recommendation', v.recommendation,
    'trial_datetime', v.trial_datetime, 'feedback', v.feedback, 'created_at', v.created_at
  );
end $$;
grant execute on function public.mp_trial_mine() to authenticated;

-- ---------------------------------------------------------------------------
-- mp_trial_pre_assessment — the family saves their pre-assessment (own row).
-- ---------------------------------------------------------------------------
create or replace function public.mp_trial_pre_assessment(p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.trial_sessions%rowtype;
begin
  update public.trial_sessions set
    pre_assessment   = coalesce(p->'pre_assessment', pre_assessment),
    dream_songs      = coalesce(p->'dream_songs', dream_songs),
    experience_level = coalesce(p->>'experience_level', experience_level),
    learning_goal    = coalesce(p->>'learning_goal', learning_goal),
    student_age      = coalesce(p->>'student_age', student_age),
    stage            = case when stage = 'booked' then 'pre_assessed' else stage end
  where user_id = auth.uid()
  returning * into v;
  if not found then return null; end if;
  return jsonb_build_object('ok', true, 'stage', v.stage);
end $$;
grant execute on function public.mp_trial_pre_assessment(jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- mp_trial_feedback (authed) — the family leaves feedback / an objection.
-- ---------------------------------------------------------------------------
create or replace function public.mp_trial_feedback(p_text text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.trial_sessions%rowtype;
begin
  update public.trial_sessions
    set feedback = feedback || jsonb_build_array(jsonb_build_object('by','family','text', left(p_text, 2000), 'at', now()))
  where user_id = auth.uid() returning * into v;
  if not found then return null; end if;
  return jsonb_build_object('ok', true);
end $$;
grant execute on function public.mp_trial_feedback(text) to authenticated;

-- (The old token-based mp_trial_feedback(uuid,text) from trial_studio.sql stays
--  for any in-flight token sessions; the authed overload above is the new path.)
