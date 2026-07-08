-- Teacher applications from the public "Apply Now" form.
-- Written server-side by /api/teacher-application (service role) and reviewed by
-- the owner in the portal. No public read/write - RLS blocks the anon key;
-- the owner reads via the owner-only Cloudflare Functions (service role).
-- Run this once in the Supabase SQL editor.

create table if not exists public.teacher_applications (
  id             uuid primary key default gen_random_uuid(),
  ref            text,
  full_name      text not null,
  email          text not null,
  phone          text,
  dob            text,
  gender         text,
  city           text,
  address        text,
  languages      text,
  instruments    text[],
  years_teaching text,
  years_performing text,
  qualification  text,
  grade          text,
  commitment     text,
  days           text[],
  time_bands     text[],
  modes          text[],
  areas          text[],
  transport      text,
  bank_holder    text,
  bank_name      text,
  bank_account   text,
  bank_ifsc      text,
  bank_upi       text,
  why_join       text,
  status         text not null default 'pending',  -- pending | approved | rejected
  teacher_id     uuid,
  approved_at    timestamptz,
  created_at     timestamptz not null default now()
);

alter table public.teacher_applications enable row level security;
-- No anon/authenticated policies: only the service role (Functions) may touch it.

-- Optional: let a signed-in OWNER read applications directly from the client
-- (the portal Applications screen). Safe because it is scoped to owners.
drop policy if exists "owner reads applications" on public.teacher_applications;
create policy "owner reads applications" on public.teacher_applications
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
  );
