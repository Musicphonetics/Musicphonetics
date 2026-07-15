-- ============================================================================
-- Musicphonetics — Operations Upgrade (consolidated, security-hardened)
-- Run ONCE in the Supabase SQL editor. Safe/idempotent: IF NOT EXISTS + guarded,
-- table-specific constraint blocks. NO DROP TABLE, no destructive type changes,
-- no broad data updates. Existing data is preserved.
--
-- Schema facts this migration relies on (verified against the app + prior SQL):
--   • Users live in public.profiles; profiles.id = auth.users.id.
--   • Teachers are profiles rows with role='teacher'; every *.teacher_id column
--     stores that auth user id (= auth.uid()). So RLS "teacher_id = auth.uid()"
--     is correct. Teacher FKs therefore reference public.profiles(id).
--   • students.parent_id = the family's auth.uid() (added by an earlier
--     migration; re-asserted below so this file is self-contained).
-- ============================================================================

-- Self-contained: make sure the columns other sections depend on exist.
alter table public.students add column if not exists parent_id uuid;
create index if not exists students_parent_id_idx on public.students (parent_id);

-- Helper: is the current auth user the owner? SECURITY DEFINER so it can read
-- profiles regardless of that table's RLS (no recursion).
create or replace function public.mp_is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner');
$$;

-- ----------------------------------------------------------------------------
-- 1) STUDENT PLAN (batch) + rolling MONTHLY GOAL
--    (foundation | main | directors). Included here per review request.
-- ----------------------------------------------------------------------------
alter table public.students add column if not exists plan text;          -- null → inferred from fee in the app
alter table public.students add column if not exists monthly_goal text;
alter table public.students add column if not exists goal_month text;     -- 'YYYY-MM'
alter table public.students add column if not exists goal_set_at timestamptz;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'students_plan_check' and conrelid = 'public.students'::regclass
  ) then
    alter table public.students
      add constraint students_plan_check
      check (plan is null or plan in ('foundation', 'main', 'directors'));
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 2) STUDENT CODES  (MP-YYYY-000001, generated server-side by a sequence)
-- ----------------------------------------------------------------------------
create sequence if not exists public.student_code_seq;
alter table public.students add column if not exists student_code text;

create or replace function public.mp_set_student_code() returns trigger
language plpgsql as $$
begin
  if new.student_code is null or new.student_code = '' then
    new.student_code := 'MP-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.student_code_seq')::text, 6, '0');
  end if;
  return new;
end $$;

drop trigger if exists trg_student_code on public.students;
create trigger trg_student_code before insert on public.students
  for each row execute function public.mp_set_student_code();

-- Backfill existing students (oldest first so codes read chronologically).
do $$
declare r record;
begin
  for r in (select id, created_at from public.students where student_code is null or student_code = '' order by created_at nulls last, id) loop
    update public.students
      set student_code = 'MP-' || to_char(coalesce(r.created_at, now()), 'YYYY') || '-' ||
        lpad(nextval('public.student_code_seq')::text, 6, '0')
      where id = r.id;
  end loop;
end $$;

create unique index if not exists students_student_code_key on public.students (student_code);

-- ----------------------------------------------------------------------------
-- 3) ATTENDANCE & CLASS ACCOUNTING  (extend class_updates)
-- ----------------------------------------------------------------------------
alter table public.class_updates add column if not exists attendance_status text;      -- scheduled|present|absent|cancelled_by_parent|cancelled_by_teacher|rescheduled|holiday|no_show
alter table public.class_updates add column if not exists scheduled_start timestamptz;
alter table public.class_updates add column if not exists scheduled_end   timestamptz;
alter table public.class_updates add column if not exists actual_start    timestamptz;
alter table public.class_updates add column if not exists actual_end      timestamptz;
alter table public.class_updates add column if not exists rescheduled_to  date;
alter table public.class_updates add column if not exists counts_toward_cycle boolean default true;
alter table public.class_updates add column if not exists makeup_required boolean default false;
alter table public.class_updates add column if not exists makeup_completed boolean default false;
alter table public.class_updates add column if not exists parent_reason  text;         -- parent-visible reason
alter table public.class_updates add column if not exists last_modified_by uuid;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'class_updates_attendance_status_check' and conrelid = 'public.class_updates'::regclass
  ) then
    alter table public.class_updates add constraint class_updates_attendance_status_check
      check (attendance_status is null or attendance_status in
        ('scheduled','present','absent','cancelled_by_parent','cancelled_by_teacher','rescheduled','holiday','no_show'));
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 4) TEACHER SCHEDULE & AVAILABILITY
--    teacher_id → profiles(id) (a teacher is a profile). No cascade (restrict)
--    so a teacher can't be deleted out from under live schedule data.
-- ----------------------------------------------------------------------------
create table if not exists public.teacher_availability (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.profiles(id),
  weekday     int  not null check (weekday between 0 and 6),   -- 0 = Sunday
  start_time  time not null,
  end_time    time not null,
  mode        text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint teacher_availability_time_valid check (end_time > start_time)
);
create index if not exists teacher_availability_teacher_idx on public.teacher_availability (teacher_id);

create table if not exists public.teacher_time_off (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.profiles(id),
  start_date  date not null,
  end_date    date not null,
  reason      text,
  created_at  timestamptz not null default now(),
  constraint teacher_time_off_range_valid check (end_date >= start_date)
);
create index if not exists teacher_time_off_teacher_idx on public.teacher_time_off (teacher_id);

create table if not exists public.scheduled_classes (
  id             uuid primary key default gen_random_uuid(),
  teacher_id     uuid not null references public.profiles(id),
  student_id     uuid not null references public.students(id),
  scheduled_date date not null,
  start_time     time not null,
  end_time       time not null,
  mode           text,
  location       text,
  status         text not null default 'scheduled',
  rescheduled_to date,
  class_update_id uuid references public.class_updates(id) on delete set null,
  notes          text,
  created_by     uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint scheduled_classes_status_check check (status in
    ('scheduled','present','absent','cancelled_by_parent','cancelled_by_teacher','rescheduled','holiday','no_show')),
  constraint scheduled_classes_time_valid check (end_time > start_time)
);
create index if not exists scheduled_classes_teacher_date_idx on public.scheduled_classes (teacher_id, scheduled_date);
create index if not exists scheduled_classes_student_idx on public.scheduled_classes (student_id);

create table if not exists public.holidays (
  id           uuid primary key default gen_random_uuid(),
  holiday_date date not null unique,
  name         text,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5) NOTIFICATIONS
--    recipient/creator → auth.users. Deleting a user clears their notifications
--    (cascade on recipient) — safe, they are ephemeral.
-- ----------------------------------------------------------------------------
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  role         text,                        -- owner|teacher|parent (audience hint)
  type         text not null,
  title        text not null,
  body         text,
  action_url   text,
  entity_type  text,
  entity_id    text,
  is_read      boolean not null default false,
  must_ack     boolean not null default false,
  acked_at     timestamptz,
  expires_at   timestamptz,
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  constraint notifications_type_check check (type in
    ('class_reminder','homework_added','class_rescheduled','class_cancelled','payment_due',
     'payment_received','monthly_report_ready','teacher_assigned','teacher_changed',
     'director_message','general_announcement')),
  constraint notifications_role_check check (role is null or role in ('owner','teacher','parent'))
);
create index if not exists notifications_recipient_idx on public.notifications (recipient_id, is_read, created_at desc);

-- ----------------------------------------------------------------------------
-- 6) PAYMENTS — invoices, receipts, settlement (extend payments)
-- ----------------------------------------------------------------------------
alter table public.payments add column if not exists invoice_number text;
alter table public.payments add column if not exists receipt_number text;
alter table public.payments add column if not exists razorpay_order_id text;
alter table public.payments add column if not exists razorpay_payment_id text;
alter table public.payments add column if not exists gateway_txn_id text;
alter table public.payments add column if not exists gross_amount int;
alter table public.payments add column if not exists gateway_charge int;
alter table public.payments add column if not exists gateway_charge_estimated boolean default true;
alter table public.payments add column if not exists net_amount int;
alter table public.payments add column if not exists settlement_status text;
alter table public.payments add column if not exists settlement_date date;
alter table public.payments add column if not exists payment_cycle text;          -- e.g. '2026-07'
alter table public.payments add column if not exists classes_included int;
alter table public.payments add column if not exists renewal_due_date date;
alter table public.payments add column if not exists outstanding_amount int;
alter table public.payments add column if not exists discount int;
alter table public.payments add column if not exists verified_at timestamptz;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'payments_settlement_status_check' and conrelid = 'public.payments'::regclass
  ) then
    alter table public.payments add constraint payments_settlement_status_check
      check (settlement_status is null or settlement_status in ('pending','settled','on_hold'));
  end if;
end $$;

-- Idempotency: a Razorpay payment id maps to at most one row.
create unique index if not exists payments_razorpay_payment_id_key
  on public.payments (razorpay_payment_id) where razorpay_payment_id is not null;

-- ----------------------------------------------------------------------------
-- 7) STUDENT DOCUMENT CENTRE
-- ----------------------------------------------------------------------------
create table if not exists public.student_documents (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.students(id),
  type          text not null,
  title         text not null,
  visibility    text not null default 'parent_visible',
  document_url  text,
  storage_path  text,
  internal_route text,           -- e.g. /parent/reports?month=2026-07
  generated     boolean not null default false,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  constraint student_documents_visibility_check check (visibility in ('owner_only','owner_teacher','parent_visible')),
  constraint student_documents_type_check check (type in
    ('enrolment_confirmation','enrolment_agreement','invoice','receipt','monthly_report',
     'progress_report','certificate','uploaded_document','internal_document'))
);
create index if not exists student_documents_student_idx on public.student_documents (student_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 8) TEACHER ONBOARDING CHECKLIST
-- ----------------------------------------------------------------------------
create table if not exists public.teacher_onboarding_items (
  id            uuid primary key default gen_random_uuid(),
  teacher_id    uuid not null references public.profiles(id),
  item_key      text not null,
  label         text not null,
  status        text not null default 'pending',
  required_before_assignment boolean not null default false,
  notes         text,
  rejection_reason text,
  evidence_url  text,
  reviewed_by   uuid references auth.users(id) on delete set null,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (teacher_id, item_key),
  constraint teacher_onboarding_status_check check (status in ('pending','submitted','approved','rejected','not_required'))
);
create index if not exists teacher_onboarding_teacher_idx on public.teacher_onboarding_items (teacher_id);

-- ----------------------------------------------------------------------------
-- 9) MONTHLY REPORTS
-- ----------------------------------------------------------------------------
create table if not exists public.student_reports (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null references public.students(id),
  teacher_id        uuid not null references public.profiles(id),
  report_month      text not null,   -- 'YYYY-MM'
  plan              text,
  instrument        text,
  classes_scheduled int,
  classes_completed int,
  attendance_percent int,
  topics_covered    text,
  skills_improved   text,
  homework_completion text,
  teacher_comments  text,
  current_goal      text,
  goal_outcome      text,
  next_goal         text,
  attention_areas   text,
  director_note     text,
  status            text not null default 'draft',
  submitted_at      timestamptz,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (student_id, report_month),
  constraint student_reports_status_check check (status in ('draft','submitted','published')),
  constraint student_reports_month_format check (report_month ~ '^\d{4}-\d{2}$')
);
create index if not exists student_reports_student_idx on public.student_reports (student_id, report_month desc);
create index if not exists student_reports_teacher_idx on public.student_reports (teacher_id);

create table if not exists public.student_report_topics (
  id         uuid primary key default gen_random_uuid(),
  report_id  uuid not null references public.student_reports(id) on delete cascade,  -- safe: dependent child rows
  topic      text not null,
  created_at timestamptz not null default now()
);
create index if not exists student_report_topics_report_idx on public.student_report_topics (report_id);

-- ----------------------------------------------------------------------------
-- 10) AUDIT LOG (append-only, owner-visible). Entity refs use ON DELETE SET NULL
--     so history survives entity removal.
-- ----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references auth.users(id) on delete set null,
  actor_role  text,
  action      text not null,
  entity_type text,
  entity_id   text,
  student_id  uuid references public.students(id) on delete set null,
  teacher_id  uuid references public.profiles(id) on delete set null,
  summary     text,
  meta        jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_action_idx on public.audit_logs (action);
create index if not exists audit_logs_student_idx on public.audit_logs (student_id);
create index if not exists audit_logs_teacher_idx on public.audit_logs (teacher_id);

-- ============================================================================
-- FIELD-LEVEL GUARD TRIGGERS
-- RLS is row-level; these BEFORE triggers enforce WHO may change WHICH fields.
-- Both are SECURITY DEFINER; auth.uid() still reflects the caller's JWT.
-- ============================================================================

-- Onboarding: a teacher may submit their own info/evidence, but may NOT approve
-- or reject themselves, set reviewer fields, or change the required-before-
-- assignment flag. Only the owner may.
create or replace function public.mp_guard_onboarding() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.mp_is_owner() then
    return new;                       -- owner may change anything
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.rejection_reason := null;
    return new;
  end if;

  -- UPDATE by the teacher: protected fields are pinned to their old values.
  new.required_before_assignment := old.required_before_assignment;
  new.reviewed_by := old.reviewed_by;
  new.reviewed_at := old.reviewed_at;
  new.rejection_reason := old.rejection_reason;
  if old.status = 'approved' then
    new.status := 'approved';         -- cannot un-approve themselves
  elsif new.status not in ('pending','submitted') then
    new.status := old.status;         -- may only submit
  end if;
  return new;
end $$;

drop trigger if exists trg_guard_onboarding on public.teacher_onboarding_items;
create trigger trg_guard_onboarding before insert or update on public.teacher_onboarding_items
  for each row execute function public.mp_guard_onboarding();

-- Reports: a teacher may create/edit drafts and submit, but may NOT publish,
-- set the director note, or edit a published report. Only the owner may.
create or replace function public.mp_guard_report() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.mp_is_owner() then
    return new;                       -- owner may publish / edit director note
  end if;

  if tg_op = 'INSERT' then
    new.director_note := null;
    new.published_at := null;
    if new.status not in ('draft','submitted') then
      new.status := 'draft';
    end if;
    return new;
  end if;

  -- UPDATE by the teacher.
  if old.status = 'published' then
    raise exception 'A published report can only be changed by the owner.';
  end if;
  new.director_note := old.director_note;
  new.published_at := old.published_at;
  if new.status not in ('draft','submitted') then
    new.status := old.status;         -- cannot publish
  end if;
  return new;
end $$;

drop trigger if exists trg_guard_report on public.student_reports;
create trigger trg_guard_report before insert or update on public.student_reports
  for each row execute function public.mp_guard_report();

-- ============================================================================
-- SECURE AUDIT WRITER
-- Clients may NOT insert into audit_logs directly (no insert policy). They call
-- this SECURITY DEFINER function, which pins actor_id/actor_role to the caller's
-- real identity — so audit entries cannot be fabricated or impersonated.
-- (Cloudflare Functions keep writing via the service role, which bypasses RLS.)
-- ============================================================================
create or replace function public.mp_audit(
  p_action text,
  p_entity_type text default null,
  p_entity_id text default null,
  p_student_id uuid default null,
  p_teacher_id uuid default null,
  p_summary text default null,
  p_meta jsonb default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    return;                           -- never log for an unauthenticated caller
  end if;
  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, student_id, teacher_id, summary, meta)
  values (
    auth.uid(),
    (select role from public.profiles where id = auth.uid()),
    left(coalesce(p_action, 'unknown'), 80),
    p_entity_type, p_entity_id, p_student_id, p_teacher_id,
    p_summary, p_meta
  );
end $$;

revoke all on function public.mp_audit(text,text,text,uuid,uuid,text,jsonb) from public;
grant execute on function public.mp_audit(text,text,text,uuid,uuid,text,jsonb) to authenticated;

-- ============================================================================
-- ROW-LEVEL SECURITY
-- Service role (Cloudflare Functions) bypasses RLS. These policies govern the
-- browser anon/authenticated client only.
-- ============================================================================

-- ---- notifications --------------------------------------------------------
-- Recipient reads & marks their own; owner reads all. Owner may create any
-- notification. A teacher may create ONLY non-forced, non-system notifications
-- to the families of THEIR OWN students. Parents cannot create any.
alter table public.notifications enable row level security;
drop policy if exists "notif read own" on public.notifications;
create policy "notif read own" on public.notifications for select
  using (recipient_id = auth.uid() or public.mp_is_owner());
drop policy if exists "notif update own" on public.notifications;
create policy "notif update own" on public.notifications for update
  using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
drop policy if exists "notif insert as self" on public.notifications;      -- remove old permissive policy
drop policy if exists "notif insert owner" on public.notifications;
create policy "notif insert owner" on public.notifications for insert
  with check (public.mp_is_owner() and created_by = auth.uid());
drop policy if exists "notif insert teacher" on public.notifications;
create policy "notif insert teacher" on public.notifications for insert
  with check (
    created_by = auth.uid()
    and must_ack = false
    and type in ('class_reminder','homework_added','class_rescheduled','class_cancelled','monthly_report_ready')
    and recipient_id in (
      select s.parent_id from public.students s
      where s.teacher_id = auth.uid() and s.parent_id is not null
    )
  );

-- ---- teacher availability / time off / scheduled classes ------------------
alter table public.teacher_availability enable row level security;
drop policy if exists "avail teacher" on public.teacher_availability;
create policy "avail teacher" on public.teacher_availability for all
  using (teacher_id = auth.uid() or public.mp_is_owner())
  with check (teacher_id = auth.uid() or public.mp_is_owner());

alter table public.teacher_time_off enable row level security;
drop policy if exists "timeoff teacher" on public.teacher_time_off;
create policy "timeoff teacher" on public.teacher_time_off for all
  using (teacher_id = auth.uid() or public.mp_is_owner())
  with check (teacher_id = auth.uid() or public.mp_is_owner());

alter table public.scheduled_classes enable row level security;
drop policy if exists "sched teacher owner" on public.scheduled_classes;
create policy "sched teacher owner" on public.scheduled_classes for all
  using (teacher_id = auth.uid() or public.mp_is_owner())
  with check (teacher_id = auth.uid() or public.mp_is_owner());
drop policy if exists "sched parent read" on public.scheduled_classes;
create policy "sched parent read" on public.scheduled_classes for select
  using (student_id in (select id from public.students where parent_id = auth.uid()));

-- ---- holidays -------------------------------------------------------------
alter table public.holidays enable row level security;
drop policy if exists "holiday read" on public.holidays;
create policy "holiday read" on public.holidays for select using (auth.uid() is not null);
drop policy if exists "holiday write" on public.holidays;
create policy "holiday write" on public.holidays for all
  using (public.mp_is_owner()) with check (public.mp_is_owner());

-- ---- student documents ----------------------------------------------------
alter table public.student_documents enable row level security;
drop policy if exists "doc parent read" on public.student_documents;
create policy "doc parent read" on public.student_documents for select
  using (visibility = 'parent_visible'
    and student_id in (select id from public.students where parent_id = auth.uid()));
drop policy if exists "doc teacher read" on public.student_documents;
create policy "doc teacher read" on public.student_documents for select
  using (visibility in ('owner_teacher','parent_visible')
    and student_id in (select id from public.students where teacher_id = auth.uid()));
drop policy if exists "doc owner all" on public.student_documents;
create policy "doc owner all" on public.student_documents for all
  using (public.mp_is_owner()) with check (public.mp_is_owner());
drop policy if exists "doc teacher insert" on public.student_documents;
create policy "doc teacher insert" on public.student_documents for insert
  with check (student_id in (select id from public.students where teacher_id = auth.uid()));

-- ---- teacher onboarding items --------------------------------------------
-- Row access: teacher (own) or owner. Field-level rules (no self-approval) are
-- enforced by trg_guard_onboarding above.
alter table public.teacher_onboarding_items enable row level security;
drop policy if exists "onb teacher rw" on public.teacher_onboarding_items;   -- remove old for-all policy
drop policy if exists "onb select" on public.teacher_onboarding_items;
create policy "onb select" on public.teacher_onboarding_items for select
  using (teacher_id = auth.uid() or public.mp_is_owner());
drop policy if exists "onb insert" on public.teacher_onboarding_items;
create policy "onb insert" on public.teacher_onboarding_items for insert
  with check (teacher_id = auth.uid() or public.mp_is_owner());
drop policy if exists "onb teacher update" on public.teacher_onboarding_items;
create policy "onb teacher update" on public.teacher_onboarding_items for update
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
drop policy if exists "onb owner update" on public.teacher_onboarding_items;
create policy "onb owner update" on public.teacher_onboarding_items for update
  using (public.mp_is_owner()) with check (public.mp_is_owner());
drop policy if exists "onb owner delete" on public.teacher_onboarding_items;
create policy "onb owner delete" on public.teacher_onboarding_items for delete
  using (public.mp_is_owner());

-- ---- student reports ------------------------------------------------------
-- Row access split; field-level rules (teacher can't publish / set director
-- note / edit published) are enforced by trg_guard_report above.
alter table public.student_reports enable row level security;
drop policy if exists "rep teacher rw" on public.student_reports;           -- remove old for-all policy
drop policy if exists "rep parent read" on public.student_reports;
drop policy if exists "rep select" on public.student_reports;
create policy "rep select" on public.student_reports for select
  using (
    teacher_id = auth.uid()
    or public.mp_is_owner()
    or (status = 'published' and student_id in (select id from public.students where parent_id = auth.uid()))
  );
drop policy if exists "rep teacher insert" on public.student_reports;
create policy "rep teacher insert" on public.student_reports for insert
  with check (teacher_id = auth.uid() or public.mp_is_owner());
drop policy if exists "rep teacher update" on public.student_reports;
create policy "rep teacher update" on public.student_reports for update
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
drop policy if exists "rep owner update" on public.student_reports;
create policy "rep owner update" on public.student_reports for update
  using (public.mp_is_owner()) with check (public.mp_is_owner());
drop policy if exists "rep owner delete" on public.student_reports;
create policy "rep owner delete" on public.student_reports for delete
  using (public.mp_is_owner());

alter table public.student_report_topics enable row level security;
drop policy if exists "rep topics rw" on public.student_report_topics;
create policy "rep topics rw" on public.student_report_topics for all
  using (report_id in (select id from public.student_reports r
      where r.teacher_id = auth.uid() or public.mp_is_owner()))
  with check (report_id in (select id from public.student_reports r
      where r.teacher_id = auth.uid() or public.mp_is_owner()));
drop policy if exists "rep topics parent read" on public.student_report_topics;
create policy "rep topics parent read" on public.student_report_topics for select
  using (report_id in (select id from public.student_reports r
      where r.status = 'published'
        and r.student_id in (select id from public.students where parent_id = auth.uid())));

-- ---- audit logs -----------------------------------------------------------
-- Owner reads. NO insert/update/delete policy for clients: writes go only
-- through public.mp_audit() (SECURITY DEFINER) or the service role. Append-only.
alter table public.audit_logs enable row level security;
drop policy if exists "audit append self" on public.audit_logs;             -- remove old direct-insert policy
drop policy if exists "audit owner read" on public.audit_logs;
create policy "audit owner read" on public.audit_logs for select using (public.mp_is_owner());
