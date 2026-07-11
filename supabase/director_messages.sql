-- Musicphonetics · Director's Messages
-- A space for the Director/Owner to write custom notes - either broadcast to an
-- audience, OR to one specific student's parent / one specific teacher.
-- Idempotent: safe to run once, or again to add the targeting columns.

create extension if not exists "pgcrypto";

create table if not exists public.director_messages (
  id uuid primary key default gen_random_uuid(),
  audience text not null check (audience in ('parents', 'teachers', 'all')),
  title text,
  body text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Per-recipient targeting (added here so re-running upgrades an existing table).
alter table public.director_messages
  add column if not exists target_student_id uuid references public.students(id) on delete cascade,
  add column if not exists target_teacher_id uuid references public.profiles(id) on delete cascade;

create index if not exists director_messages_audience_idx
  on public.director_messages (audience, is_published, created_at desc);
create index if not exists director_messages_target_student_idx
  on public.director_messages (target_student_id);
create index if not exists director_messages_target_teacher_idx
  on public.director_messages (target_teacher_id);

-- Auto-update updated_at whenever a message is edited
create or replace function public.set_director_messages_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_director_messages_updated_at on public.director_messages;

create trigger set_director_messages_updated_at
before update on public.director_messages
for each row
execute function public.set_director_messages_updated_at();

alter table public.director_messages enable row level security;

-- Owner: full control
drop policy if exists "owner manages director messages" on public.director_messages;

create policy "owner manages director messages"
on public.director_messages
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'owner'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'owner'
  )
);

-- Parents: read a broadcast to parents/all, OR a message aimed at their child.
drop policy if exists "parents read director messages" on public.director_messages;

create policy "parents read director messages"
on public.director_messages
for select
using (
  is_published = true
  and (
    (target_student_id is null and target_teacher_id is null and audience in ('parents', 'all'))
    or target_student_id in (select id from public.students where parent_id = auth.uid())
  )
);

-- Teachers: read a broadcast to teachers/all, OR a message aimed at them.
drop policy if exists "teachers read director messages" on public.director_messages;

create policy "teachers read director messages"
on public.director_messages
for select
using (
  is_published = true
  and (
    (target_student_id is null and target_teacher_id is null and audience in ('teachers', 'all'))
    or target_teacher_id = auth.uid()
  )
);
