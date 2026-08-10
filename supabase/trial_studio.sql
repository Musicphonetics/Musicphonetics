-- ============================================================================
-- TRIAL STUDIO — the conversion funnel that opens the moment someone books a
-- trial. A tokenised, no-login "studio" that captures the lead instantly, runs
-- an exciting questionnaire, generates a personalised curriculum preview, and
-- later becomes the student's real portal.
--
-- Public access is ALWAYS through the /api/trial/* Pages Functions using the
-- service role + the row's secret token; the browser never gets a Supabase key.
-- Staff (owner/sales) read everything through RLS for the pipeline views.
-- Safe to run multiple times.
-- ============================================================================

create table if not exists public.trial_sessions (
  id                 uuid primary key default gen_random_uuid(),
  token              uuid not null unique default gen_random_uuid(),
  lead_id            uuid references public.leads(id) on delete set null,
  lead_code          text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  status             text not null default 'booked',   -- booked → assessed → guitar_arranged → class_scheduled → enrolled | lost
  -- who
  student_name       text,
  parent_name        text,
  who                text,
  student_age        text,
  phone              text,
  email              text,
  instrument         text,
  -- questionnaire
  experience_level   text,
  learning_goal      text,
  preferred_start    text,
  preferred_mode     text,
  preferred_area     text,
  dream_songs        jsonb not null default '[]'::jsonb,   -- [{title, lang}]
  answers            jsonb not null default '{}'::jsonb,   -- full raw questionnaire
  -- generated
  plan               jsonb,                                -- personalised roadmap (from _songs engine / AI)
  guitar_reco        jsonb,
  -- human touch (later phases)
  assigned_teacher_id uuid references auth.users(id) on delete set null,
  teacher_summary    text,
  teacher_summary_at timestamptz,
  director_note      text,
  director_note_at   timestamptz,
  feedback           jsonb not null default '[]'::jsonb,   -- [{by,text,at}]
  notes              jsonb not null default '[]'::jsonb,   -- staff/AI thread [{by,role,text,at}]
  converted_student_id uuid
);

create index if not exists trial_sessions_token_idx  on public.trial_sessions(token);
create index if not exists trial_sessions_status_idx on public.trial_sessions(status);
create index if not exists trial_sessions_created_idx on public.trial_sessions(created_at desc);

alter table public.trial_sessions enable row level security;

-- Staff (owner/sales) can read + update every trial session for the pipeline.
drop policy if exists "trial staff read"  on public.trial_sessions;
drop policy if exists "trial staff write" on public.trial_sessions;
create policy "trial staff read"  on public.trial_sessions for select using (public.mp_is_lead_staff());
create policy "trial staff write" on public.trial_sessions for update using (public.mp_is_lead_staff()) with check (public.mp_is_lead_staff());
-- The assigned teacher can read their own trial sessions.
drop policy if exists "trial teacher read" on public.trial_sessions;
create policy "trial teacher read" on public.trial_sessions for select using (assigned_teacher_id = auth.uid());

-- keep updated_at fresh
create or replace function public.mp__trial_touch() returns trigger
  language plpgsql as $$ begin new.updated_at := now(); return new; end $$;
drop trigger if exists trg_trial_touch on public.trial_sessions;
create trigger trg_trial_touch before update on public.trial_sessions
  for each row execute function public.mp__trial_touch();

-- ---------------------------------------------------------------------------
-- Public RPCs (service_role only — always called from /api/trial/* server-side)
-- ---------------------------------------------------------------------------

-- Start a trial: create/attach a CRM lead (dedupe-aware) + a studio session.
create or replace function public.mp_trial_start(p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_lead   record;
  v_token  uuid;
  v_id     uuid;
begin
  -- reuse the canonical lead intake so the CRM, dedupe + attribution all work
  select * into v_lead from public.mp_intake_lead(
    jsonb_build_object(
      'student_name', p->>'student_name',
      'parent_name',  p->>'parent_name',
      'phone',        p->>'phone',
      'email',        p->>'email',
      'student_age',  p->>'student_age',
      'instrument_interest', p->>'instrument',
      'preferred_mode',      p->>'preferred_mode',
      'preferred_area',      p->>'preferred_area',
      'experience_level',    p->>'experience_level',
      'learning_goal',       p->>'learning_goal',
      'source',       coalesce(p->>'source','trial_studio'),
      'landing_page', coalesce(p->>'landing_page','/studio'),
      'utm_source',   p->>'utm_source',
      'utm_medium',   p->>'utm_medium',
      'utm_campaign', p->>'utm_campaign'
    )
  );

  insert into public.trial_sessions(
    lead_id, lead_code, student_name, parent_name, who, student_age, phone, email,
    instrument, preferred_mode, preferred_area, experience_level, learning_goal, answers
  ) values (
    v_lead.lead_id, v_lead.lead_code, p->>'student_name', p->>'parent_name', p->>'who',
    p->>'student_age', p->>'phone', p->>'email', p->>'instrument', p->>'preferred_mode',
    p->>'preferred_area', p->>'experience_level', p->>'learning_goal', coalesce(p->'answers','{}'::jsonb)
  )
  returning id, token into v_id, v_token;

  return jsonb_build_object('ok', true, 'token', v_token, 'id', v_id, 'lead_code', v_lead.lead_code);
end $$;
grant execute on function public.mp_trial_start(jsonb) to service_role;

-- Fetch a studio session by its secret token (public-safe subset).
create or replace function public.mp_trial_get(p_token uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_row public.trial_sessions%rowtype;
begin
  select * into v_row from public.trial_sessions where token = p_token;
  if not found then return null; end if;
  return jsonb_build_object(
    'token', v_row.token, 'status', v_row.status,
    'student_name', v_row.student_name, 'who', v_row.who, 'student_age', v_row.student_age,
    'instrument', v_row.instrument, 'experience_level', v_row.experience_level,
    'learning_goal', v_row.learning_goal, 'preferred_start', v_row.preferred_start,
    'dream_songs', v_row.dream_songs, 'answers', v_row.answers, 'plan', v_row.plan,
    'guitar_reco', v_row.guitar_reco, 'teacher_summary', v_row.teacher_summary,
    'director_note', v_row.director_note, 'feedback', v_row.feedback,
    'created_at', v_row.created_at
  );
end $$;
grant execute on function public.mp_trial_get(uuid) to service_role;

-- Save questionnaire answers + the generated plan (merges provided keys only).
create or replace function public.mp_trial_save(p_token uuid, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_row public.trial_sessions%rowtype;
begin
  update public.trial_sessions set
    experience_level = coalesce(p->>'experience_level', experience_level),
    learning_goal    = coalesce(p->>'learning_goal', learning_goal),
    preferred_start  = coalesce(p->>'preferred_start', preferred_start),
    preferred_mode   = coalesce(p->>'preferred_mode', preferred_mode),
    dream_songs      = coalesce(p->'dream_songs', dream_songs),
    answers          = coalesce(p->'answers', answers) || coalesce(answers,'{}'::jsonb),
    plan             = coalesce(p->'plan', plan),
    guitar_reco      = coalesce(p->'guitar_reco', guitar_reco),
    status           = coalesce(p->>'status', status)
  where token = p_token
  returning * into v_row;
  if not found then return null; end if;
  return jsonb_build_object('ok', true, 'plan', v_row.plan);
end $$;
grant execute on function public.mp_trial_save(uuid, jsonb) to service_role;

-- A visitor can leave feedback / a message from their studio (appends).
create or replace function public.mp_trial_feedback(p_token uuid, p_text text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_row public.trial_sessions%rowtype;
begin
  update public.trial_sessions
    set feedback = feedback || jsonb_build_array(jsonb_build_object('by','student','text', left(p_text, 2000), 'at', now()))
  where token = p_token returning * into v_row;
  if not found then return null; end if;
  return jsonb_build_object('ok', true);
end $$;
grant execute on function public.mp_trial_feedback(uuid, text) to service_role;
