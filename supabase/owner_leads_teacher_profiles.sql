-- ============================================================================
-- Musicphonetics — (1) owner quick-create lead + (2) teacher public profile maker
-- Run once in the Supabase SQL editor. Additive/idempotent.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) OWNER QUICK LEAD — owner/staff create a lead by hand and (optionally)
--    assign it to a teacher, who gets it in their inbox (+ email).
-- ---------------------------------------------------------------------------
create or replace function public.mp_owner_create_lead(
  p_name text, p_phone text, p_area text, p_mode text, p_instrument text, p_teacher uuid
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_phone_norm text;
begin
  if not public.mp_is_lead_staff() then raise exception 'Not authorised'; end if;
  v_phone_norm := nullif(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), '');
  if v_phone_norm is not null and length(v_phone_norm) > 10 then v_phone_norm := right(v_phone_norm, 10); end if;

  insert into public.leads (student_name, parent_name, phone, phone_norm, preferred_area, preferred_mode, instrument_interest, source, status, priority)
    values (nullif(btrim(p_name),''), nullif(btrim(p_name),''), nullif(btrim(p_phone),''), v_phone_norm,
            nullif(btrim(p_area),''), nullif(btrim(p_mode),''), nullif(btrim(p_instrument),''), 'owner', 'new', 'normal')
    returning id into v_id;

  insert into public.lead_activity (lead_id, event_type, actor_id, actor_role, metadata)
    values (v_id, 'submitted', auth.uid(), 'staff', jsonb_build_object('source', 'owner_manual'));

  if p_teacher is not null then
    perform public.mp_assign_lead(v_id, p_teacher);  -- assigns + notifies the teacher
  end if;
  return v_id;
end $$;
grant execute on function public.mp_owner_create_lead(text, text, text, text, text, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 2) TEACHER PUBLIC PROFILES — teachers build their own public profile via a
--    questionnaire (AI-assisted). Free to create + one free edit; further edits
--    need owner approval before they go live.
-- ---------------------------------------------------------------------------
create table if not exists public.teacher_public_profiles (
  id               uuid primary key references public.profiles(id) on delete cascade,
  slug             text unique,
  name             text,
  headline         text,
  location         text,
  instruments      text,
  experience_years int,
  specialties      text,
  qualifications   text,
  achievements     text,
  languages        text,
  age_group        text,
  approach         text,
  advice           text,
  bio              text,
  photo_url        text,
  status           text default 'draft' check (status in ('draft','pending','published','rejected')),
  free_edit_used   boolean default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  published_at     timestamptz
);
alter table public.teacher_public_profiles enable row level security;

drop policy if exists "tprofile self" on public.teacher_public_profiles;
create policy "tprofile self" on public.teacher_public_profiles for all to authenticated
  using (id = auth.uid() or public.mp_is_owner()) with check (id = auth.uid() or public.mp_is_owner());

drop policy if exists "tprofile public read" on public.teacher_public_profiles;
create policy "tprofile public read" on public.teacher_public_profiles for select using (status = 'published');

-- Public bucket for teacher profile photos (public profiles → public photos).
insert into storage.buckets (id, name, public) values ('teacher-photos', 'teacher-photos', true)
on conflict (id) do nothing;
drop policy if exists "teacher photos write" on storage.objects;
create policy "teacher photos write" on storage.objects for all to authenticated
  using (bucket_id = 'teacher-photos') with check (bucket_id = 'teacher-photos');

-- URL-safe slug from a name + a short unique suffix.
create or replace function public.mp__slugify(p_name text, p_id uuid) returns text language sql immutable as $$
  select nullif(regexp_replace(lower(coalesce(p_name,'teacher')), '[^a-z0-9]+', '-', 'g'), '-')
         || '-' || substr(replace(p_id::text,'-',''), 1, 5);
$$;

-- Teacher submits/updates their profile. Applies the free-edit rule server-side:
--   first creation = published, one more edit = published, after that = pending.
create or replace function public.mp_submit_teacher_profile(p jsonb)
returns table (status text, slug text) language plpgsql security definer set search_path = public as $$
declare v_id uuid := auth.uid(); v_ex public.teacher_public_profiles%rowtype; v_status text; v_slug text; v_free boolean;
begin
  if v_id is null then raise exception 'Not signed in'; end if;
  select * into v_ex from public.teacher_public_profiles where id = v_id;

  if v_ex.id is null then v_status := 'published'; v_free := false;
  elsif not coalesce(v_ex.free_edit_used, false) then v_status := 'published'; v_free := true;  -- one free edit
  else v_status := 'pending'; v_free := true; end if;

  v_slug := coalesce(v_ex.slug, public.mp__slugify(p->>'name', v_id));

  insert into public.teacher_public_profiles as t (
    id, slug, name, headline, location, instruments, experience_years, specialties, qualifications,
    achievements, languages, age_group, approach, advice, bio, photo_url, status, free_edit_used, published_at, updated_at
  ) values (
    v_id, v_slug, p->>'name', p->>'headline', p->>'location', p->>'instruments',
    nullif(p->>'experience_years','')::int, p->>'specialties', p->>'qualifications', p->>'achievements',
    p->>'languages', p->>'age_group', p->>'approach', p->>'advice', p->>'bio', p->>'photo_url',
    v_status, v_free, case when v_status='published' then now() else v_ex.published_at end, now()
  )
  on conflict (id) do update set
    name = excluded.name, headline = excluded.headline, location = excluded.location, instruments = excluded.instruments,
    experience_years = excluded.experience_years, specialties = excluded.specialties, qualifications = excluded.qualifications,
    achievements = excluded.achievements, languages = excluded.languages, age_group = excluded.age_group,
    approach = excluded.approach, advice = excluded.advice, bio = excluded.bio, photo_url = excluded.photo_url,
    status = excluded.status, free_edit_used = excluded.free_edit_used, published_at = excluded.published_at, updated_at = now();

  if v_status = 'pending' then
    insert into public.notifications (recipient_id, role, type, title, body, action_url, entity_type, entity_id)
      select pr.id, 'owner', 'profile_review', 'Teacher profile update needs approval',
        coalesce(p->>'name','A teacher') || ' updated their public profile.', '/owner/teacher-profiles', 'teacher_profile', v_id::text
      from public.profiles pr where pr.role = 'owner';
  end if;

  return query select v_status, v_slug;
end $$;
grant execute on function public.mp_submit_teacher_profile(jsonb) to authenticated;

-- Owner approves (publish) or rejects a pending profile.
create or replace function public.mp_review_teacher_profile(p_id uuid, p_approve boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.mp_is_owner() then raise exception 'Not authorised'; end if;
  update public.teacher_public_profiles
     set status = case when p_approve then 'published' else 'rejected' end,
         published_at = case when p_approve then now() else published_at end,
         free_edit_used = false,   -- approving resets their next free edit
         updated_at = now()
   where id = p_id;
  insert into public.notifications (recipient_id, role, type, title, body, action_url)
    values (p_id, 'teacher', 'profile_review',
      case when p_approve then 'Your profile is live' else 'Profile update needs changes' end,
      case when p_approve then 'Your public profile update has been approved and is live.' else 'Please review and resubmit your profile update.' end,
      '/teacher/profile-maker');
end $$;
grant execute on function public.mp_review_teacher_profile(uuid, boolean) to authenticated;

notify pgrst, 'reload schema';
