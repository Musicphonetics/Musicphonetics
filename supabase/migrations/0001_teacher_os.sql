-- ============================================================================
-- Musicphonetics Teacher OS — initial schema, security, views & RPC
-- Database-first: single source of truth per entity. Derived values are
-- computed (generated columns / views / RPC), never stored redundantly.
-- RLS is enabled from this first migration (child-safety / privacy requirement).
-- Money is stored as integer rupees. 70/30 split is a GENERATED column so
-- teachers can never alter it.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ===========================================================================
-- profiles  (1 row per auth user; mirrors auth.users)
-- ===========================================================================
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  role           text not null default 'teacher' check (role in ('owner','teacher')),
  full_name      text,
  phone          text,
  email          text,
  instruments    text[] default '{}',
  regions        text[] default '{}',
  experience_years int,
  qualifications text,
  preferred_modes text[] default '{}',
  bank_upi       text,
  status         text not null default 'active' check (status in ('active','inactive','blacklisted')),
  blacklist_until date,
  photo_url      text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ===========================================================================
-- students  (source of truth for student profile)
-- ===========================================================================
create table if not exists public.students (
  id              uuid primary key default gen_random_uuid(),
  teacher_id      uuid not null references public.profiles(id) on delete restrict,
  name            text not null,
  dob             date,
  school          text,
  parent_name     text,
  parent_phone    text,
  parent_email    text,
  area            text,
  address         text,
  instrument      text,
  level           text,
  learning_goal   text,
  student_profile text,
  class_mode      text,
  class_day       text,
  class_time      text,
  fee_quoted      int,            -- OWNER-ONLY writable (sacred line: final fee)
  classes_per_month int default 8,
  start_date      date,
  status          text not null default 'active' check (status in ('active','paused','left','trial')),
  media_consent   boolean default false,
  birthday_gift_notes text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ===========================================================================
-- class_updates  (source of truth for class delivery)
-- ===========================================================================
create table if not exists public.class_updates (
  id              uuid primary key default gen_random_uuid(),
  teacher_id      uuid not null references public.profiles(id) on delete restrict,
  student_id      uuid not null references public.students(id) on delete cascade,
  class_date      date not null,
  class_status    text not null default 'Completed'
                    check (class_status in ('Completed','Rescheduled','Cancelled','No-Show')),
  class_number    int,
  duration_min    int,
  taught          text,
  homework        text,
  student_response text,
  parent_feedback text,
  next_class_date date,
  teacher_notes   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ===========================================================================
-- payments  (source of truth for money received)
-- 70/30 split is generated — teachers cannot alter it.
-- ===========================================================================
create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  teacher_id      uuid not null references public.profiles(id) on delete restrict,
  student_id      uuid not null references public.students(id) on delete cascade,
  payment_date    date not null,
  billing_cycle   text,
  fee_quoted      int,
  amount_paid     int not null,
  teacher_share   int generated always as ((round(amount_paid * 0.7))::int) stored,
  company_share   int generated always as (amount_paid - (round(amount_paid * 0.7))::int) stored,
  payment_status  text not null default 'Received'
                    check (payment_status in ('Received','Pending','Partial','Refunded')),
  payment_mode    text not null default 'Cashfree',
  cashfree_bill_no text,
  txn_reference   text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ===========================================================================
-- payouts  (OWNER-ONLY tracking; teacher payout is advance-based, not per class)
-- ===========================================================================
create table if not exists public.payouts (
  id              uuid primary key default gen_random_uuid(),
  teacher_id      uuid not null references public.profiles(id) on delete restrict,
  period          text,
  total_earned    int not null default 0,
  advance_paid    int not null default 0,
  balance         int generated always as (total_earned - advance_paid) stored,
  last_paid       date,
  status          text not null default 'pending'
                    check (status in ('pending','advance_paid','settled','on_hold')),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_students_teacher       on public.students(teacher_id);
create index if not exists idx_students_status         on public.students(status);
create index if not exists idx_class_updates_teacher   on public.class_updates(teacher_id);
create index if not exists idx_class_updates_student   on public.class_updates(student_id);
create index if not exists idx_class_updates_date      on public.class_updates(class_date);
create index if not exists idx_payments_teacher        on public.payments(teacher_id);
create index if not exists idx_payments_student        on public.payments(student_id);
create index if not exists idx_payments_date           on public.payments(payment_date);
create index if not exists idx_payouts_teacher         on public.payouts(teacher_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['profiles','students','class_updates','payments','payouts'] loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format('create trigger set_updated_at before update on public.%I
                    for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- ===========================================================================
-- Security helpers
-- ===========================================================================
-- is_owner(): true when the current auth user has role 'owner'.
create or replace function public.is_owner()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'owner'
  );
$$;

-- Guard: a user cannot change their OWN role (privilege escalation).
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and auth.uid() = old.id then
    raise exception 'You cannot change your own role.';
  end if;
  return new;
end;
$$;
drop trigger if exists guard_profile_role on public.profiles;
create trigger guard_profile_role before update on public.profiles
  for each row execute function public.guard_profile_role();

-- Guard: sacred owner-only fields on students (final fee). Teachers may READ
-- fee_quoted but only the owner may write/change it.
create or replace function public.guard_student_owner_fields()
returns trigger
language plpgsql
as $$
begin
  if not public.is_owner() then
    if tg_op = 'INSERT' then
      -- teacher creates the student but cannot set the final fee
      new.fee_quoted := null;
    elsif tg_op = 'UPDATE' then
      if new.fee_quoted is distinct from old.fee_quoted then
        raise exception 'Only the owner can set or change the final fee (fee_quoted).';
      end if;
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists guard_student_owner_fields on public.students;
create trigger guard_student_owner_fields before insert or update on public.students
  for each row execute function public.guard_student_owner_fields();

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.profiles      enable row level security;
alter table public.students      enable row level security;
alter table public.class_updates enable row level security;
alter table public.payments      enable row level security;
alter table public.payouts       enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists profiles_select_self_or_owner on public.profiles;
create policy profiles_select_self_or_owner on public.profiles
  for select using (id = auth.uid() or public.is_owner());

drop policy if exists profiles_update_self_or_owner on public.profiles;
create policy profiles_update_self_or_owner on public.profiles
  for update using (id = auth.uid() or public.is_owner())
  with check (id = auth.uid() or public.is_owner());

drop policy if exists profiles_insert_owner on public.profiles;
create policy profiles_insert_owner on public.profiles
  for insert with check (public.is_owner() or id = auth.uid());

-- students ------------------------------------------------------------------
drop policy if exists students_owner_all on public.students;
create policy students_owner_all on public.students
  for all using (public.is_owner()) with check (public.is_owner());

drop policy if exists students_teacher_select on public.students;
create policy students_teacher_select on public.students
  for select using (teacher_id = auth.uid());

drop policy if exists students_teacher_insert on public.students;
create policy students_teacher_insert on public.students
  for insert with check (teacher_id = auth.uid());

drop policy if exists students_teacher_update on public.students;
create policy students_teacher_update on public.students
  for update using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

drop policy if exists students_teacher_delete on public.students;
create policy students_teacher_delete on public.students
  for delete using (teacher_id = auth.uid());

-- class_updates -------------------------------------------------------------
drop policy if exists class_owner_all on public.class_updates;
create policy class_owner_all on public.class_updates
  for all using (public.is_owner()) with check (public.is_owner());

drop policy if exists class_teacher_rw on public.class_updates;
create policy class_teacher_rw on public.class_updates
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- payments ------------------------------------------------------------------
drop policy if exists payments_owner_all on public.payments;
create policy payments_owner_all on public.payments
  for all using (public.is_owner()) with check (public.is_owner());

drop policy if exists payments_teacher_rw on public.payments;
create policy payments_teacher_rw on public.payments
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- payouts (owner full; teacher read-only own) -------------------------------
drop policy if exists payouts_owner_all on public.payouts;
create policy payouts_owner_all on public.payouts
  for all using (public.is_owner()) with check (public.is_owner());

drop policy if exists payouts_teacher_select on public.payouts;
create policy payouts_teacher_select on public.payouts
  for select using (teacher_id = auth.uid());

-- ===========================================================================
-- Views (security_invoker so RLS of the caller applies: teacher sees own only)
-- ===========================================================================
create or replace view public.student_stats
with (security_invoker = true) as
select
  s.id                as student_id,
  s.teacher_id,
  s.name,
  s.instrument,
  s.level,
  s.status,
  s.dob,
  s.classes_per_month,
  s.fee_quoted,
  count(cu.id) filter (where cu.class_status = 'Completed')       as classes_completed,
  greatest(coalesce(s.classes_per_month,0)
           - count(cu.id) filter (where cu.class_status = 'Completed'), 0) as classes_remaining,
  coalesce(sum(p.amount_paid), 0)                                  as total_paid,
  coalesce(sum(p.teacher_share), 0)                               as teacher_share_total
from public.students s
left join public.class_updates cu on cu.student_id = s.id
left join public.payments p       on p.student_id = s.id
group by s.id;

create or replace view public.teacher_stats
with (security_invoker = true) as
select
  pr.id                                        as teacher_id,
  pr.full_name,
  pr.status,
  count(distinct s.id)                         as students,
  count(distinct s.id) filter (where s.status = 'active') as active_students,
  coalesce(sum(p.amount_paid), 0)              as revenue,
  coalesce(sum(p.teacher_share), 0)            as teacher_share,
  coalesce(sum(p.company_share), 0)            as company_share,
  count(cu.id)                                 as classes_logged
from public.profiles pr
left join public.students s      on s.teacher_id = pr.id
left join public.payments p      on p.teacher_id = pr.id
left join public.class_updates cu on cu.teacher_id = pr.id
where pr.role = 'teacher'
group by pr.id;

-- ===========================================================================
-- RPC: owner dashboard aggregates (single call, not row pulls). Owner-only.
-- ===========================================================================
create or replace function public.get_owner_stats()
returns json
language plpgsql
security definer
set search_path = public
stable
as $$
declare result json;
begin
  if not public.is_owner() then
    raise exception 'Not authorised';
  end if;

  select json_build_object(
    'active_students', (select count(*) from students where status = 'active'),
    'total_students',  (select count(*) from students),
    'active_teachers', (select count(*) from profiles where role='teacher' and status='active'),
    'revenue_month',   (select coalesce(sum(amount_paid),0) from payments
                          where date_trunc('month', payment_date) = date_trunc('month', current_date)),
    'company_share_month', (select coalesce(sum(company_share),0) from payments
                          where date_trunc('month', payment_date) = date_trunc('month', current_date)),
    'teacher_share_month', (select coalesce(sum(teacher_share),0) from payments
                          where date_trunc('month', payment_date) = date_trunc('month', current_date)),
    'pending_balance', (select coalesce(sum(balance),0) from payouts where status in ('pending','advance_paid')),
    'classes_completed_month', (select count(*) from class_updates
                          where class_status='Completed'
                          and date_trunc('month', class_date) = date_trunc('month', current_date)),
    'renewals_due',    (select count(*) from student_stats where classes_remaining <= 2 and status='active'),
    'birthdays_30d',   (select count(*) from students where dob is not null
                          and status='active'
                          and (extract(doy from dob)::int - extract(doy from current_date)::int + 366) % 366 <= 30)
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_owner_stats() to authenticated;
grant execute on function public.is_owner() to authenticated;
