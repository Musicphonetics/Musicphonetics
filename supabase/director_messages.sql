-- ============================================================================
-- Musicphonetics - Director's Messages
-- A space for the Director (owner) to write custom notes to students/parents
-- and to teachers. Messages appear in the relevant portal, replacing the fixed
-- signed note. Run this once in the Supabase SQL editor.
--
-- Roles: owner = profiles.role 'owner'; teacher = profiles.role 'teacher';
-- parent = a plain auth user linked via students.parent_id = auth.uid().
-- ============================================================================

create table if not exists public.director_messages (
  id            uuid primary key default gen_random_uuid(),
  audience      text not null check (audience in ('parents', 'teachers', 'all')),
  title         text,
  body          text not null,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists director_messages_audience_idx
  on public.director_messages (audience, is_published, created_at desc);

alter table public.director_messages enable row level security;

-- Owner: full control (compose, edit, publish, delete).
drop policy if exists "owner manages director messages" on public.director_messages;
create policy "owner manages director messages" on public.director_messages
  for all
  using      (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));

-- Parents: read published messages addressed to parents (or everyone).
drop policy if exists "parents read director messages" on public.director_messages;
create policy "parents read director messages" on public.director_messages
  for select using (
    is_published
    and audience in ('parents', 'all')
    and exists (select 1 from public.students s where s.parent_id = auth.uid())
  );

-- Teachers: read published messages addressed to teachers (or everyone).
drop policy if exists "teachers read director messages" on public.director_messages;
create policy "teachers read director messages" on public.director_messages
  for select using (
    is_published
    and audience in ('teachers', 'all')
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
  );
