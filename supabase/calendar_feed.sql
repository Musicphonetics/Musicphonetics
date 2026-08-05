-- Calendar: in-portal week/month view + private iCal feed for phone sync.
-- Safe to re-run.

-- 1) A private per-user token that authorises their iCal subscription feed.
--    It is a capability (like a signed link) — read-only, revocable by resetting.
alter table public.profiles
  add column if not exists calendar_token uuid default gen_random_uuid();
update public.profiles set calendar_token = gen_random_uuid() where calendar_token is null;
alter table public.profiles alter column calendar_token set default gen_random_uuid();
create index if not exists profiles_calendar_token_idx on public.profiles (calendar_token);

-- 2) Free-form calendar events (not tied to a student): the owner can drop
--    anything into a teacher's calendar — a meeting, a reminder, a cover class.
create table if not exists public.calendar_events (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.profiles(id) on delete cascade,  -- whose calendar
  title       text not null,
  event_date  date not null,
  start_time  time,
  end_time    time,
  location    text,
  notes       text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists calendar_events_teacher_date_idx on public.calendar_events (teacher_id, event_date);

alter table public.calendar_events enable row level security;

-- Teacher sees/manages their own events; the owner can manage anyone's.
drop policy if exists "cal events teacher owner" on public.calendar_events;
create policy "cal events teacher owner" on public.calendar_events for all
  using (teacher_id = auth.uid() or public.mp_is_owner())
  with check (teacher_id = auth.uid() or public.mp_is_owner());
