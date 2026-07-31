-- ============================================================================
-- Musicphonetics — full admission form fields + student photo storage
-- Run once in the Supabase SQL editor. Additive/idempotent.
--
-- Adds the demographic/operational fields the teacher admission form captures,
-- so you can see real statistics at scale (gender, age, grade, locality, school,
-- instrument, program, teacher, parent occupation, lead source).
-- ============================================================================

alter table public.students add column if not exists gender               text;
alter table public.students add column if not exists school_grade         text;  -- Class / Grade
alter table public.students add column if not exists photo_url            text;
alter table public.students add column if not exists parent_relationship  text;
alter table public.students add column if not exists parent_occupation    text;
alter table public.students add column if not exists previous_experience  text;
alter table public.students add column if not exists preferred_days        text;
alter table public.students add column if not exists preferred_time        text;
alter table public.students add column if not exists lead_source           text;
alter table public.students add column if not exists referred_by           text;

-- Student photo storage. A private bucket keeps children's photos out of public
-- listing; the app reads them with short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('student-photos', 'student-photos', false)
on conflict (id) do nothing;

-- Staff (owner/teacher) may upload/replace and read student photos. Parents are
-- not given write access here; reads happen via signed URLs from the app.
drop policy if exists "student photos staff write" on storage.objects;
create policy "student photos staff write" on storage.objects
  for all to authenticated
  using (bucket_id = 'student-photos' and (public.mp_is_owner() or public.mp_is_lead_staff() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')))
  with check (bucket_id = 'student-photos' and (public.mp_is_owner() or public.mp_is_lead_staff() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')));
