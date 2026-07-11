-- Musicphonetics · Director's Messages
-- A space for the Director/Owner to write custom notes to parents/students
-- and teachers. Run this once in the Supabase SQL editor.

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

create index if not exists director_messages_audience_idx
  on public.director_messages (audience, is_published, created_at desc);

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
    select 1
    from public.profiles p
    where p.id = auth.uid()
    and p.role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
    and p.role = 'owner'
  )
);

-- Parents: read published messages for parents/all
drop policy if exists "parents read director messages" on public.director_messages;

create policy "parents read director messages"
on public.director_messages
for select
using (
  is_published = true
  and audience in ('parents', 'all')
  and exists (
    select 1
    from public.students s
    where s.parent_id = auth.uid()
  )
);

-- Teachers: read published messages for teachers/all
drop policy if exists "teachers read director messages" on public.director_messages;

create policy "teachers read director messages"
on public.director_messages
for select
using (
  is_published = true
  and audience in ('teachers', 'all')
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
    and p.role = 'teacher'
  )
);
