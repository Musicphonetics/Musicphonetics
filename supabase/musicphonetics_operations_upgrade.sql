-- ============================================================================
-- Musicphonetics — Operations Upgrade (consolidated migration)
-- Run ONCE in the Supabase SQL editor. Safe/idempotent: uses IF NOT EXISTS and
-- guarded DO blocks so re-running does no harm. Does NOT drop existing tables.
--
-- NOTE (author): this file was written by the app implementation from the spec,
-- because the SQL wasn't received with the prompt. Review before running.
-- The application is built against exactly these tables and columns.
-- ============================================================================

-- Helper: is the current auth user the owner?
create or replace function public.mp_is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner');
$$;

-- ----------------------------------------------------------------------------
-- 1) STUDENT CODES  (MP-YYYY-000001, generated server-side by a sequence)
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
  for r in (select id from public.students where student_code is null or student_code = '' order by created_at nulls last, id) loop
    update public.students
      set student_code = 'MP-' || to_char(coalesce((select created_at from public.students s where s.id = r.id), now()), 'YYYY') || '-' ||
        lpad(nextval('public.student_code_seq')::text, 6, '0')
      where id = r.id;
  end loop;
end $$;

create unique index if not exists students_student_code_key on public.students (student_code);

-- ----------------------------------------------------------------------------
-- 2) ATTENDANCE & CLASS ACCOUNTING  (extend class_updates)
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
  if not exists (select 1 from pg_constraint where conname = 'class_updates_attendance_status_check') then
    alter table public.class_updates add constraint class_updates_attendance_status_check
      check (attendance_status is null or attendance_status in
        ('scheduled','present','absent','cancelled_by_parent','cancelled_by_teacher','rescheduled','holiday','no_show'));
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 3) TEACHER SCHEDULE & AVAILABILITY
-- ----------------------------------------------------------------------------
create table if not exists public.teacher_availability (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null,
  weekday     int  not null check (weekday between 0 and 6),   -- 0 = Sunday
  start_time  time not null,
  end_time    time not null,
  mode        text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists teacher_availability_teacher_idx on public.teacher_availability (teacher_id);

create table if not exists public.teacher_time_off (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null,
  start_date  date not null,
  end_date    date not null,
  reason      text,
  created_at  timestamptz not null default now()
);
create index if not exists teacher_time_off_teacher_idx on public.teacher_time_off (teacher_id);

create table if not exists public.scheduled_classes (
  id             uuid primary key default gen_random_uuid(),
  teacher_id     uuid not null,
  student_id     uuid not null,
  scheduled_date date not null,
  start_time     time not null,
  end_time       time not null,
  mode           text,
  location       text,
  status         text not null default 'scheduled',   -- scheduled|present|absent|cancelled_by_parent|cancelled_by_teacher|rescheduled|holiday|no_show
  rescheduled_to date,
  class_update_id uuid,                                -- link to the logged class_updates row, once logged
  notes          text,
  created_by     uuid,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
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
-- 4) NOTIFICATIONS
-- ----------------------------------------------------------------------------
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null,               -- auth user id
  role         text,                        -- owner|teacher|parent (audience hint)
  type         text not null,               -- class_reminder|homework_added|...|general_announcement
  title        text not null,
  body         text,
  action_url   text,
  entity_type  text,
  entity_id    text,
  is_read      boolean not null default false,
  must_ack     boolean not null default false,
  acked_at     timestamptz,
  expires_at   timestamptz,
  created_by   uuid,
  created_at   timestamptz not null default now()
);
create index if not exists notifications_recipient_idx on public.notifications (recipient_id, is_read, created_at desc);

-- ----------------------------------------------------------------------------
-- 5) PAYMENTS — invoices, receipts, settlement (extend payments)
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
alter table public.payments add column if not exists settlement_status text;      -- pending|settled|on_hold
alter table public.payments add column if not exists settlement_date date;
alter table public.payments add column if not exists payment_cycle text;          -- e.g. '2026-07'
alter table public.payments add column if not exists classes_included int;
alter table public.payments add column if not exists renewal_due_date date;
alter table public.payments add column if not exists outstanding_amount int;
alter table public.payments add column if not exists discount int;
alter table public.payments add column if not exists verified_at timestamptz;

-- Idempotency: a Razorpay payment id maps to at most one row.
create unique index if not exists payments_razorpay_payment_id_key
  on public.payments (razorpay_payment_id) where razorpay_payment_id is not null;

-- ----------------------------------------------------------------------------
-- 6) STUDENT DOCUMENT CENTRE
-- ----------------------------------------------------------------------------
create table if not exists public.student_documents (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null,
  type          text not null,   -- enrolment_confirmation|enrolment_agreement|invoice|receipt|monthly_report|progress_report|certificate|uploaded_document|internal_document
  title         text not null,
  visibility    text not null default 'parent_visible',  -- owner_only|owner_teacher|parent_visible
  document_url  text,
  storage_path  text,
  internal_route text,           -- e.g. /parent/reports?month=2026-07
  generated     boolean not null default false,
  created_by    uuid,
  created_at    timestamptz not null default now()
);
create index if not exists student_documents_student_idx on public.student_documents (student_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 7) TEACHER ONBOARDING CHECKLIST
-- ----------------------------------------------------------------------------
create table if not exists public.teacher_onboarding_items (
  id            uuid primary key default gen_random_uuid(),
  teacher_id    uuid not null,
  item_key      text not null,
  label         text not null,
  status        text not null default 'pending',   -- pending|submitted|approved|rejected|not_required
  required_before_assignment boolean not null default false,
  notes         text,
  rejection_reason text,
  evidence_url  text,
  reviewed_by   uuid,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (teacher_id, item_key)
);
create index if not exists teacher_onboarding_teacher_idx on public.teacher_onboarding_items (teacher_id);

-- ----------------------------------------------------------------------------
-- 8) MONTHLY REPORTS
-- ----------------------------------------------------------------------------
create table if not exists public.student_reports (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null,
  teacher_id        uuid not null,
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
  status            text not null default 'draft',  -- draft|submitted|published
  submitted_at      timestamptz,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (student_id, report_month)
);
create index if not exists student_reports_student_idx on public.student_reports (student_id, report_month desc);
create index if not exists student_reports_teacher_idx on public.student_reports (teacher_id);

create table if not exists public.student_report_topics (
  id         uuid primary key default gen_random_uuid(),
  report_id  uuid not null references public.student_reports(id) on delete cascade,
  topic      text not null,
  created_at timestamptz not null default now()
);
create index if not exists student_report_topics_report_idx on public.student_report_topics (report_id);

-- ----------------------------------------------------------------------------
-- 9) AUDIT LOG (append-only, owner-visible)
-- ----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid,
  actor_role  text,
  action      text not null,      -- student_created|teacher_assigned|payment_verified|...
  entity_type text,
  entity_id   text,
  student_id  uuid,
  teacher_id  uuid,
  summary     text,
  meta        jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_action_idx on public.audit_logs (action);
create index if not exists audit_logs_student_idx on public.audit_logs (student_id);
create index if not exists audit_logs_teacher_idx on public.audit_logs (teacher_id);

-- ============================================================================
-- ROW-LEVEL SECURITY
-- Service role (Cloudflare Functions) bypasses RLS. These policies govern the
-- browser anon/authenticated client only.
-- ============================================================================

-- notifications: recipient reads & updates (mark read/ack) own; senders insert
-- as themselves; owner reads all.
alter table public.notifications enable row level security;
drop policy if exists "notif read own" on public.notifications;
create policy "notif read own" on public.notifications for select
  using (recipient_id = auth.uid() or public.mp_is_owner());
drop policy if exists "notif update own" on public.notifications;
create policy "notif update own" on public.notifications for update
  using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
drop policy if exists "notif insert as self" on public.notifications;
create policy "notif insert as self" on public.notifications for insert
  with check (created_by = auth.uid());

-- teacher_availability / time_off / scheduled_classes: teacher owns own rows;
-- owner full; parent reads scheduled_classes for their own student.
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

-- holidays: everyone signed-in reads; owner writes.
alter table public.holidays enable row level security;
drop policy if exists "holiday read" on public.holidays;
create policy "holiday read" on public.holidays for select using (auth.uid() is not null);
drop policy if exists "holiday write" on public.holidays;
create policy "holiday write" on public.holidays for all
  using (public.mp_is_owner()) with check (public.mp_is_owner());

-- student_documents: parent reads parent_visible for own student; teacher reads
-- owner_teacher/parent_visible for assigned students; owner full.
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

-- teacher_onboarding_items: teacher reads/updates own; owner full.
alter table public.teacher_onboarding_items enable row level security;
drop policy if exists "onb teacher rw" on public.teacher_onboarding_items;
create policy "onb teacher rw" on public.teacher_onboarding_items for all
  using (teacher_id = auth.uid() or public.mp_is_owner())
  with check (teacher_id = auth.uid() or public.mp_is_owner());

-- student_reports: teacher manages reports for own students; parent reads
-- published for own student; owner full.
alter table public.student_reports enable row level security;
drop policy if exists "rep teacher rw" on public.student_reports;
create policy "rep teacher rw" on public.student_reports for all
  using (teacher_id = auth.uid() or public.mp_is_owner())
  with check (teacher_id = auth.uid() or public.mp_is_owner());
drop policy if exists "rep parent read" on public.student_reports;
create policy "rep parent read" on public.student_reports for select
  using (status = 'published'
    and student_id in (select id from public.students where parent_id = auth.uid()));

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

-- audit_logs: owner reads; authenticated may append only AS THEMSELVES; never
-- updatable/deletable through the client (no update/delete policies).
alter table public.audit_logs enable row level security;
drop policy if exists "audit owner read" on public.audit_logs;
create policy "audit owner read" on public.audit_logs for select using (public.mp_is_owner());
drop policy if exists "audit append self" on public.audit_logs;
create policy "audit append self" on public.audit_logs for insert
  with check (actor_id = auth.uid());
