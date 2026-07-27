-- ============================================================================
-- Musicphonetics — Lead management CRM (ADDITIVE, idempotent)
-- Run once in the Supabase SQL editor. No drops, no data rewrite.
--
-- DB is the record of truth for every website enquiry. Email is secondary.
-- Built for bursts (1,000+ leads): a single atomic intake RPC, dedupe by
-- normalized phone/email, an activity timeline, and an email OUTBOX so no
-- request ever blocks on (or is lost to) a slow email provider.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0) Staff roles: add 'sales'. Owner stays the superset. Helpers mirror the
--    existing mp_is_owner().
-- ---------------------------------------------------------------------------
create or replace function public.mp_is_sales() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('sales','sales_manager','marketing'));
$$;
create or replace function public.mp_is_lead_staff() returns boolean
  language sql stable security definer set search_path = public as $$
  select public.mp_is_owner() or public.mp_is_sales();
$$;
grant execute on function public.mp_is_sales() to authenticated;
grant execute on function public.mp_is_lead_staff() to authenticated;

-- Allow 'sales' family as a notification audience.
do $$ begin
  if exists (select 1 from pg_constraint where conname = 'notifications_role_check') then
    alter table public.notifications drop constraint notifications_role_check;
  end if;
  alter table public.notifications add constraint notifications_role_check
    check (role is null or role in ('owner','teacher','parent','sales','sales_manager','marketing'));
exception when others then null; end $$;

-- ---------------------------------------------------------------------------
-- 1) Human-readable lead code: MPL-YYYY-000001
-- ---------------------------------------------------------------------------
create sequence if not exists public.leads_code_seq;

-- ---------------------------------------------------------------------------
-- 2) Leads
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id                     uuid primary key default gen_random_uuid(),
  lead_code              text unique,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  -- contact
  student_name           text,
  parent_name            text,
  email                  text,
  email_norm             text,
  phone                  text,
  phone_norm             text,
  alternate_phone        text,
  student_age            text,
  date_of_birth          date,
  -- interest
  instrument_interest    text,
  preferred_mode         text,
  preferred_area         text,
  city                   text,
  preferred_days         text,
  preferred_time         text,
  experience_level       text,
  learning_goal          text,
  message                text,
  preferred_program      text,
  coupon_code            text,
  -- attribution (first-touch preserved)
  source                 text,
  campaign               text,
  utm_source             text,
  utm_medium             text,
  utm_campaign           text,
  utm_content            text,
  utm_term               text,
  landing_page           text,
  referrer               text,
  -- pipeline
  status                 text not null default 'new',
  priority               text not null default 'normal',
  assigned_teacher_id    uuid references public.profiles(id) on delete set null,
  assigned_sales_user_id uuid references public.profiles(id) on delete set null,
  assigned_at            timestamptz,
  first_contacted_at     timestamptz,
  last_contacted_at      timestamptz,
  next_follow_up_at      timestamptz,
  converted_at           timestamptz,
  lost_at                timestamptz,
  lost_reason            text,
  internal_notes         text,
  converted_student_id   uuid references public.students(id) on delete set null,
  enquiry_count          int not null default 1,
  last_activity_at       timestamptz not null default now(),
  created_by             uuid
);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'leads_status_check') then
    alter table public.leads add constraint leads_status_check check (status in (
      'new','unassigned','assigned','contacted','follow_up','trial_booked','trial_completed',
      'interested','payment_pending','converted','not_interested','lost','duplicate'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'leads_priority_check') then
    alter table public.leads add constraint leads_priority_check check (priority in ('low','normal','high','urgent'));
  end if;
end $$;

-- Indexes for the filters/search the lead centre uses (no SELECT * scans).
create index if not exists leads_created_idx      on public.leads (created_at desc);
create index if not exists leads_status_idx        on public.leads (status, created_at desc);
create index if not exists leads_teacher_idx        on public.leads (assigned_teacher_id, status, created_at desc);
create index if not exists leads_sales_idx          on public.leads (assigned_sales_user_id, created_at desc);
create index if not exists leads_phone_idx          on public.leads (phone_norm);
create index if not exists leads_email_idx          on public.leads (email_norm);
create index if not exists leads_followup_idx       on public.leads (next_follow_up_at) where next_follow_up_at is not null;
create index if not exists leads_campaign_idx       on public.leads (campaign, created_at desc);
create index if not exists leads_source_idx         on public.leads (source, created_at desc);

-- Set the lead code + keep updated_at fresh.
create or replace function public.mp__leads_before() returns trigger
  language plpgsql as $$
begin
  if tg_op = 'INSERT' and (new.lead_code is null or new.lead_code = '') then
    new.lead_code := 'MPL-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.leads_code_seq')::text, 6, '0');
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists trg_leads_before on public.leads;
create trigger trg_leads_before before insert or update on public.leads
  for each row execute function public.mp__leads_before();

-- ---------------------------------------------------------------------------
-- 3) Lead activity timeline
-- ---------------------------------------------------------------------------
create table if not exists public.lead_activity (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads(id) on delete cascade,
  event_type  text not null,
  actor_id    uuid,
  actor_role  text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists lead_activity_lead_idx on public.lead_activity (lead_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 4) Email outbox (queue). Never send inside a request lifecycle.
-- ---------------------------------------------------------------------------
create table if not exists public.email_outbox (
  id                uuid primary key default gen_random_uuid(),
  recipient_user_id uuid,
  recipient_email   text not null,
  recipient_role    text,
  notification_type text not null,
  entity_type       text,
  entity_id         text,
  subject           text not null,
  template_key      text,
  payload           jsonb,
  status            text not null default 'pending',
  attempt_count     int  not null default 0,
  last_error        text,
  idempotency_key   text unique,
  scheduled_at      timestamptz not null default now(),
  sent_at           timestamptz,
  created_at        timestamptz not null default now()
);
create index if not exists email_outbox_ready_idx on public.email_outbox (status, scheduled_at) where status in ('pending','failed');

-- ---------------------------------------------------------------------------
-- 5) RLS
-- ---------------------------------------------------------------------------
alter table public.leads          enable row level security;
alter table public.lead_activity  enable row level security;
alter table public.email_outbox   enable row level security;

-- Leads: staff (owner/sales) see & manage all; teachers see ONLY their assigned
-- leads (read). Teacher writes go through SECURITY DEFINER RPCs (below) so they
-- can never reassign or edit another teacher's lead. No public/anon access.
drop policy if exists "leads staff read"   on public.leads;
create policy "leads staff read"   on public.leads for select using (public.mp_is_lead_staff());
drop policy if exists "leads staff write"  on public.leads;
create policy "leads staff write"  on public.leads for update using (public.mp_is_lead_staff()) with check (public.mp_is_lead_staff());
drop policy if exists "leads teacher read" on public.leads;
create policy "leads teacher read" on public.leads for select using (assigned_teacher_id = auth.uid());

-- Activity: staff read all; teacher reads activity for their own leads.
drop policy if exists "lead_activity staff read" on public.lead_activity;
create policy "lead_activity staff read" on public.lead_activity for select using (public.mp_is_lead_staff());
drop policy if exists "lead_activity teacher read" on public.lead_activity;
create policy "lead_activity teacher read" on public.lead_activity for select
  using (exists (select 1 from public.leads l where l.id = lead_id and l.assigned_teacher_id = auth.uid()));

-- Outbox: no client access at all (service-role only via the worker).
-- (RLS on, zero policies → authenticated/anon cannot read or write.)

-- ---------------------------------------------------------------------------
-- 6) Helper: queue an email (idempotent per key)
-- ---------------------------------------------------------------------------
create or replace function public.mp__queue_email(
  p_user uuid, p_email text, p_role text, p_type text, p_entity_type text, p_entity_id text,
  p_subject text, p_template text, p_payload jsonb, p_idem text
) returns void language plpgsql security definer set search_path = public as $$
begin
  if p_email is null or p_email = '' then return; end if;
  insert into public.email_outbox (recipient_user_id, recipient_email, recipient_role, notification_type,
    entity_type, entity_id, subject, template_key, payload, idempotency_key)
  values (p_user, lower(p_email), p_role, p_type, p_entity_type, p_entity_id, p_subject, p_template, p_payload, p_idem)
  on conflict (idempotency_key) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- 7) INTAKE — the atomic, dedupe-aware capture used by /api/lead.
--    Returns the lead id, code, and whether it was a repeat enquiry.
-- ---------------------------------------------------------------------------
create or replace function public.mp_intake_lead(p jsonb)
returns table (lead_id uuid, lead_code text, is_repeat boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_phone_norm text := nullif(regexp_replace(coalesce(p->>'phone',''), '\D', '', 'g'), '');
  v_email_norm text := nullif(lower(trim(coalesce(p->>'email',''))), '');
  v_existing   public.leads%rowtype;
begin
  if v_phone_norm is not null and length(v_phone_norm) > 10 then
    v_phone_norm := right(v_phone_norm, 10);
  end if;

  -- Find a likely duplicate by phone or email (most recent).
  select * into v_existing from public.leads
   where (v_phone_norm is not null and phone_norm = v_phone_norm)
      or (v_email_norm is not null and email_norm = v_email_norm)
   order by created_at desc limit 1;

  if found then
    -- Repeat enquiry: keep the lead + attribution, log the new activity.
    update public.leads set
      enquiry_count = enquiry_count + 1,
      last_activity_at = now(),
      -- fill only if previously empty (preserve first-touch attribution)
      instrument_interest = coalesce(nullif(instrument_interest,''), p->>'instrument_interest'),
      learning_goal = coalesce(nullif(learning_goal,''), p->>'learning_goal'),
      status = case when status in ('lost','not_interested','duplicate') then 'new' else status end
     where id = v_existing.id;
    insert into public.lead_activity (lead_id, event_type, metadata)
      values (v_existing.id, 'repeat_enquiry', p);
    return query select v_existing.id, v_existing.lead_code, true;
    return;
  end if;

  -- New lead.
  insert into public.leads (
    student_name, parent_name, email, email_norm, phone, phone_norm, alternate_phone,
    student_age, instrument_interest, preferred_mode, preferred_area, city, preferred_days,
    preferred_time, experience_level, learning_goal, message, preferred_program, coupon_code,
    source, campaign, utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    landing_page, referrer, status, priority
  ) values (
    p->>'student_name', p->>'parent_name', v_email_norm, v_email_norm, p->>'phone', v_phone_norm, p->>'alternate_phone',
    p->>'student_age', p->>'instrument_interest', p->>'preferred_mode', p->>'preferred_area', p->>'city', p->>'preferred_days',
    p->>'preferred_time', p->>'experience_level', p->>'learning_goal', p->>'message', p->>'preferred_program', p->>'coupon_code',
    coalesce(nullif(p->>'source',''),'website'), p->>'campaign', p->>'utm_source', p->>'utm_medium', p->>'utm_campaign', p->>'utm_content', p->>'utm_term',
    p->>'landing_page', p->>'referrer', 'new', 'normal'
  ) returning id, public.leads.lead_code into lead_id, lead_code;

  insert into public.lead_activity (lead_id, event_type, metadata) values (lead_id, 'submitted', p);
  is_repeat := false;
  return next;
end $$;
-- Called by the /api/lead Function using the service-role key (bypasses RLS).
grant execute on function public.mp_intake_lead(jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- 8) Staff pipeline RPCs (assignment, status, notes, follow-up) — audited +
--    notify + email-queue for the teacher on assignment.
-- ---------------------------------------------------------------------------
create or replace function public.mp_assign_lead(p_lead uuid, p_teacher uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_prev uuid; v_email text; v_name text; v_student text; v_instr text; v_area text; v_mode text; v_code text;
begin
  if not public.mp_is_lead_staff() then raise exception 'Not authorised'; end if;
  select assigned_teacher_id, student_name, instrument_interest, preferred_area, preferred_mode, lead_code
    into v_prev, v_student, v_instr, v_area, v_mode, v_code from public.leads where id = p_lead;
  update public.leads set assigned_teacher_id = p_teacher, assigned_at = now(),
     status = case when status in ('new','unassigned') then 'assigned' else status end,
     last_activity_at = now() where id = p_lead;
  insert into public.lead_activity (lead_id, event_type, actor_id, actor_role, metadata)
    values (p_lead, case when v_prev is null then 'assigned' else 'reassigned' end, auth.uid(), 'staff',
            jsonb_build_object('from', v_prev, 'to', p_teacher));
  if p_teacher is not null then
    select full_name, email into v_name, v_email from public.profiles where id = p_teacher;
    insert into public.notifications (recipient_id, role, type, title, body, action_url, entity_type, entity_id, created_by)
      values (p_teacher, 'teacher', 'lead_assigned', 'New lead assigned',
        coalesce(v_student,'A new enquiry') || ' · ' || coalesce(v_instr,'Music') || coalesce(' · '||v_area,''),
        '/teacher/leads', 'lead', p_lead::text, auth.uid());
    perform public.mp__queue_email(p_teacher, v_email, 'teacher', 'lead_assigned', 'lead', p_lead::text,
      'New Musicphonetics Lead Assigned', 'teacher_lead_assigned',
      jsonb_build_object('teacher_name', v_name, 'student', v_student, 'instrument', v_instr, 'area', v_area, 'mode', v_mode, 'lead_code', v_code),
      'lead_assigned:'||p_lead::text||':'||coalesce(p_teacher::text,'x')||':'||to_char(now(),'YYYYMMDDHH24MI'));
  end if;
end $$;
grant execute on function public.mp_assign_lead(uuid, uuid) to authenticated;

-- Update status / notes / follow-up / contacted. Staff may act on any lead;
-- a teacher may act ONLY on their own assigned lead (and cannot reassign).
create or replace function public.mp_lead_update(
  p_lead uuid, p_status text, p_note text, p_follow_up timestamptz, p_lost_reason text, p_mark_contacted boolean
) returns void language plpgsql security definer set search_path = public as $$
declare v_owner boolean := public.mp_is_lead_staff(); v_assigned uuid; v_role text;
begin
  select assigned_teacher_id into v_assigned from public.leads where id = p_lead;
  if not v_owner and v_assigned is distinct from auth.uid() then raise exception 'Not authorised'; end if;
  v_role := case when v_owner then 'staff' else 'teacher' end;

  update public.leads set
    status = coalesce(p_status, status),
    internal_notes = case when p_note is not null and p_note <> '' then coalesce(internal_notes,'') || case when internal_notes is null or internal_notes='' then '' else E'\n' end || to_char(now(),'DD Mon') || ': ' || p_note else internal_notes end,
    next_follow_up_at = coalesce(p_follow_up, next_follow_up_at),
    lost_reason = coalesce(p_lost_reason, lost_reason),
    lost_at = case when p_status in ('lost','not_interested') then now() else lost_at end,
    first_contacted_at = case when p_mark_contacted and first_contacted_at is null then now() else first_contacted_at end,
    last_contacted_at = case when p_mark_contacted then now() else last_contacted_at end,
    last_activity_at = now()
   where id = p_lead;

  if p_mark_contacted then
    insert into public.lead_activity (lead_id, event_type, actor_id, actor_role) values (p_lead, 'contacted', auth.uid(), v_role);
  end if;
  if p_status is not null then
    insert into public.lead_activity (lead_id, event_type, actor_id, actor_role, metadata) values (p_lead, 'status_changed', auth.uid(), v_role, jsonb_build_object('status', p_status));
  end if;
  if p_note is not null and p_note <> '' then
    insert into public.lead_activity (lead_id, event_type, actor_id, actor_role, metadata) values (p_lead, 'note_added', auth.uid(), v_role, jsonb_build_object('note', p_note));
  end if;
  if p_follow_up is not null then
    insert into public.lead_activity (lead_id, event_type, actor_id, actor_role, metadata) values (p_lead, 'follow_up_set', auth.uid(), v_role, jsonb_build_object('at', p_follow_up));
  end if;
end $$;
grant execute on function public.mp_lead_update(uuid, text, text, timestamptz, text, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- 9) CONVERT — idempotent. Staff or the assigned teacher. Creates the student,
--    links it, preserves attribution, marks the lead converted once.
-- ---------------------------------------------------------------------------
create or replace function public.mp_convert_lead(p_lead uuid, p_student jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_assigned uuid; v_existing uuid; v_student uuid; v_teacher uuid;
begin
  select assigned_teacher_id, converted_student_id into v_assigned, v_existing from public.leads where id = p_lead;
  if not (public.mp_is_lead_staff() or v_assigned = auth.uid()) then raise exception 'Not authorised'; end if;
  if v_existing is not null then return v_existing; end if;   -- already converted (idempotent)

  v_teacher := coalesce(v_assigned, auth.uid());
  insert into public.students (name, parent_name, parent_phone, parent_email, instrument, class_mode, learning_goal, teacher_id, status, lead_id)
  values (
    coalesce(p_student->>'name',''), p_student->>'parent_name', p_student->>'parent_phone', p_student->>'parent_email',
    p_student->>'instrument', p_student->>'class_mode', p_student->>'learning_goal', v_teacher, 'active', p_lead
  ) returning id into v_student;

  update public.leads set converted_student_id = v_student, converted_at = now(), status = 'converted', last_activity_at = now() where id = p_lead;
  insert into public.lead_activity (lead_id, event_type, actor_id, actor_role, metadata) values (p_lead, 'converted', auth.uid(), 'teacher', jsonb_build_object('student_id', v_student));
  return v_student;
end $$;
grant execute on function public.mp_convert_lead(uuid, jsonb) to authenticated;

-- Attribution link on students (nullable, additive).
alter table public.students add column if not exists lead_id uuid references public.leads(id) on delete set null;
