-- ============================================================================
-- Musicphonetics — Teacher Onboarding v2 (derived status, no self-approval)
-- Run ONCE in the Supabase SQL editor (after musicphonetics_operations_upgrade).
-- Additive & idempotent. No DROP TABLE, no destructive changes.
--
-- Principle: onboarding item status is DERIVED from real profile data / evidence
-- / owner verification — never set by a teacher pressing a button.
--   • Teachers enter data in the Teacher Portal (profiles + teacher_private_details).
--   • public.mp_sync_onboarding() (SECURITY DEFINER) recomputes each item's status
--     from that data. AUTOMATIC items self-complete when the data is valid;
--     OWNER-VERIFIED items go to 'submitted' and require owner approval. Every
--     verified item carries a deterministic fingerprint so a change/removal of the
--     underlying data resets it (approved→submitted on change, →pending on removal;
--     a rejected item only returns to submitted once its fingerprint changes).
--   • Only the owner sets approved/rejected/not_required via mp_review_onboarding().
--   • Teachers have NO direct write access to teacher_onboarding_items.
--
-- Schema note (verified): the availability flag column is public.teacher_availability.active
-- (boolean, created by musicphonetics_operations_upgrade.sql) — there is no is_active.
-- ============================================================================

-- ---- 0) Role helper (SECURITY DEFINER so it ignores profiles RLS) ----------
create or replace function public.mp_is_teacher() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher');
$$;

-- ---- 1) Additive profile columns (reuse existing where possible) -----------
alter table public.profiles add column if not exists legal_name text;
alter table public.profiles add column if not exists alternate_phone text;
alter table public.profiles add column if not exists dob date;
alter table public.profiles add column if not exists address_line_1 text;
alter table public.profiles add column if not exists address_line_2 text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists state text;
alter table public.profiles add column if not exists postal_code text;
alter table public.profiles add column if not exists primary_instrument text;
alter table public.profiles add column if not exists teaching_levels text[];
alter table public.profiles add column if not exists languages text;
alter table public.profiles add column if not exists certifications text;
alter table public.profiles add column if not exists short_bio text;
alter table public.profiles add column if not exists full_biography text;
alter table public.profiles add column if not exists demo_video_url text;
alter table public.profiles add column if not exists public_slug text;          -- owner-controlled
alter table public.profiles add column if not exists public_visible boolean default false;  -- owner-controlled
-- Payment (masked / non-secret parts only; full account & PAN live in the private table)
alter table public.profiles add column if not exists bank_account_holder text;
alter table public.profiles add column if not exists bank_account_last4 text;
alter table public.profiles add column if not exists bank_name text;
alter table public.profiles add column if not exists bank_branch text;
alter table public.profiles add column if not exists ifsc text;
alter table public.profiles add column if not exists upi_id text;
alter table public.profiles add column if not exists pan_masked text;
-- Compliance
alter table public.profiles add column if not exists safeguarding_acknowledged_at timestamptz;
alter table public.profiles add column if not exists safeguarding_version text;
alter table public.profiles add column if not exists joining_agreement_acknowledged_at timestamptz;
alter table public.profiles add column if not exists joining_agreement_version text;
alter table public.profiles add column if not exists typed_signature text;
alter table public.profiles add column if not exists profile_updated_at timestamptz;

-- ---- 2) Restricted table for full sensitive values -------------------------
-- Never public. Teacher writes own; owner reads for verification.
create table if not exists public.teacher_private_details (
  teacher_id          uuid primary key references public.profiles(id) on delete cascade,
  bank_account_number text,
  pan                 text,
  identity_proof_path text,
  pan_proof_path      text,
  bank_proof_path     text,
  updated_at          timestamptz not null default now()
);
alter table public.teacher_private_details enable row level security;
drop policy if exists "tpd teacher rw" on public.teacher_private_details;
create policy "tpd teacher rw" on public.teacher_private_details for all
  using (teacher_id = auth.uid() and public.mp_is_teacher())
  with check (teacher_id = auth.uid() and public.mp_is_teacher());
drop policy if exists "tpd owner read" on public.teacher_private_details;
create policy "tpd owner read" on public.teacher_private_details for select
  using (public.mp_is_owner());

-- ---- 3) Onboarding: change-detection fingerprint ---------------------------
alter table public.teacher_onboarding_items add column if not exists value_fingerprint text;

-- ---- 4) LOCK DOWN teacher_onboarding_items for teachers --------------------
-- Teachers may only SELECT. All of their status changes flow through the
-- SECURITY DEFINER sync function. Owner keeps update/delete + review function.
drop policy if exists "onb teacher rw" on public.teacher_onboarding_items;
drop policy if exists "onb insert" on public.teacher_onboarding_items;
drop policy if exists "onb teacher update" on public.teacher_onboarding_items;
drop policy if exists "onb select" on public.teacher_onboarding_items;
create policy "onb select" on public.teacher_onboarding_items for select
  using (teacher_id = auth.uid() or public.mp_is_owner());
drop policy if exists "onb owner insert" on public.teacher_onboarding_items;
create policy "onb owner insert" on public.teacher_onboarding_items for insert
  with check (public.mp_is_owner());
drop policy if exists "onb owner update" on public.teacher_onboarding_items;
create policy "onb owner update" on public.teacher_onboarding_items for update
  using (public.mp_is_owner()) with check (public.mp_is_owner());
drop policy if exists "onb owner delete" on public.teacher_onboarding_items;
create policy "onb owner delete" on public.teacher_onboarding_items for delete
  using (public.mp_is_owner());

-- ---- 5) Internal upsert helper with the status transition rules ------------
-- p_auto = true  → AUTOMATIC item: valid data → approved (by rule), else pending.
-- p_auto = false → OWNER-VERIFIED item:
--     not_required                        → keep (owner set)
--     approved + data removed/invalid     → pending  (needs re-entry, clear reviewer)
--     approved + fingerprint changed      → submitted (re-verify, clear reviewer)
--     approved + unchanged                → approved
--     rejected + present + fp changed     → submitted (teacher corrected; clear reason/reviewer)
--     rejected otherwise                  → rejected  (stays until corrected)
--     else (pending/submitted)            → submitted when present, else pending
-- NEVER sets approved for an owner-verified item — only mp_review_onboarding can.
-- SECURITY DEFINER + fixed search_path; revoked from public so teachers cannot
-- call it directly (it is only invoked by mp_sync_onboarding).
create or replace function public.mp__ob_upsert(
  v_target uuid, p_key text, p_label text, p_required boolean,
  p_present boolean, p_fp text, p_auto boolean
) returns void
language plpgsql security definer set search_path = public as $$
declare
  ex public.teacher_onboarding_items%rowtype;
  new_status text;
  new_reviewer uuid;
  new_reviewed_at timestamptz;
  new_reason text;
begin
  select * into ex from public.teacher_onboarding_items
    where teacher_id = v_target and item_key = p_key;

  if not found then
    if p_auto then
      new_status := case when p_present then 'approved' else 'pending' end;
    else
      new_status := case when p_present then 'submitted' else 'pending' end;
    end if;
    insert into public.teacher_onboarding_items
      (teacher_id, item_key, label, required_before_assignment, status, value_fingerprint, updated_at)
    values (v_target, p_key, p_label, p_required, new_status, p_fp, now());
    return;
  end if;

  new_reviewer := ex.reviewed_by;
  new_reviewed_at := ex.reviewed_at;
  new_reason := ex.rejection_reason;

  if ex.status = 'not_required' then
    new_status := 'not_required';
  elsif p_auto then
    new_status := case when p_present then 'approved' else 'pending' end;
    new_reviewer := null; new_reviewed_at := null; new_reason := null;
  elsif ex.status = 'approved' then
    if not p_present then
      new_status := 'pending';   new_reviewer := null; new_reviewed_at := null;
    elsif ex.value_fingerprint is distinct from p_fp then
      new_status := 'submitted'; new_reviewer := null; new_reviewed_at := null;
    else
      new_status := 'approved';
    end if;
  elsif ex.status = 'rejected' then
    if p_present and ex.value_fingerprint is distinct from p_fp then
      new_status := 'submitted'; new_reason := null; new_reviewer := null; new_reviewed_at := null;
    else
      new_status := 'rejected';
    end if;
  else
    new_status := case when p_present then 'submitted' else 'pending' end;
  end if;

  update public.teacher_onboarding_items set
    label = p_label,
    required_before_assignment = p_required,
    status = new_status,
    value_fingerprint = p_fp,
    reviewed_by = new_reviewer,
    reviewed_at = new_reviewed_at,
    rejection_reason = new_reason,
    updated_at = now()
  where id = ex.id;
end $$;
revoke all on function public.mp__ob_upsert(uuid,text,text,boolean,boolean,text,boolean) from public;

-- ---- 6) mp_sync_onboarding: recompute a teacher's checklist from real data --
-- Classification:
--   AUTOMATIC (self-complete when valid): profile_photo, phone, instruments,
--     regions, experience, qualifications, biography, demo_video, upi, availability.
--   OWNER-VERIFIED (require owner approval): legal_name, address, bank_account,
--     ifsc, pan, identity_verification, bank_proof, safeguarding, joining_agreement.
create or replace function public.mp_sync_onboarding(p_teacher_id uuid default null) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_target uuid;
  pr public.profiles%rowtype;
  pv public.teacher_private_details%rowtype;
  av int;
  digits text;
begin
  -- Resolve target securely:
  --   • unauthenticated (migration seeding) → explicit p_teacher_id only;
  --   • owner → any teacher (or self, which then fails the teacher check below);
  --   • authenticated non-owner MUST be role='teacher' and may sync ONLY itself;
  --   • anyone else → no-op.
  if auth.uid() is null then
    v_target := p_teacher_id;
  elsif public.mp_is_owner() then
    v_target := coalesce(p_teacher_id, auth.uid());
  elsif public.mp_is_teacher() then
    v_target := auth.uid();
  else
    return;
  end if;
  if v_target is null then return; end if;

  -- The target profile must itself be a teacher.
  if not exists (select 1 from public.profiles where id = v_target and role = 'teacher') then
    return;
  end if;

  select * into pr from public.profiles where id = v_target;
  if not found then return; end if;
  select * into pv from public.teacher_private_details where teacher_id = v_target;
  select count(*) into av from public.teacher_availability where teacher_id = v_target and active = true;

  digits := regexp_replace(coalesce(pr.phone,''), '\D', '', 'g');

  -- ---- AUTOMATIC items (p_auto = true) -------------------------------------
  perform public.mp__ob_upsert(v_target, 'profile_photo', 'Profile photo', false,
    coalesce(pr.photo_url,'') <> '', md5(coalesce(pr.photo_url,'')), true);
  perform public.mp__ob_upsert(v_target, 'phone', 'Phone', true,
    digits ~ '^[6-9][0-9]{9}$', md5(digits), true);
  perform public.mp__ob_upsert(v_target, 'instruments', 'Instruments', true,
    coalesce(array_length(pr.instruments,1),0) >= 1, md5(coalesce(array_to_string(pr.instruments, ','), '')), true);
  perform public.mp__ob_upsert(v_target, 'regions', 'Teaching regions', false,
    coalesce(array_length(pr.regions,1),0) >= 1, md5(coalesce(array_to_string(pr.regions, ','), '')), true);
  perform public.mp__ob_upsert(v_target, 'experience', 'Years of experience', true,
    pr.experience_years is not null and pr.experience_years >= 0, md5(coalesce(pr.experience_years::text,'')), true);
  perform public.mp__ob_upsert(v_target, 'qualifications', 'Qualifications', true,
    length(coalesce(pr.qualifications,'')) >= 2, md5(coalesce(pr.qualifications,'')), true);
  perform public.mp__ob_upsert(v_target, 'biography', 'Biography', true,
    length(coalesce(pr.full_biography,'')) >= 120, md5(coalesce(pr.full_biography,'')), true);
  perform public.mp__ob_upsert(v_target, 'demo_video', 'Demo / performance link', false,
    coalesce(pr.demo_video_url,'') ~ '^https?://', md5(coalesce(pr.demo_video_url,'')), true);
  perform public.mp__ob_upsert(v_target, 'upi', 'UPI ID', false,
    coalesce(pr.upi_id,'') ~ '^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$', md5(coalesce(pr.upi_id,'')), true);
  perform public.mp__ob_upsert(v_target, 'availability', 'Availability', true,
    av >= 1, md5(av::text), true);

  -- ---- OWNER-VERIFIED items (p_auto = false) -------------------------------
  perform public.mp__ob_upsert(v_target, 'legal_name', 'Full legal name', true,
    length(coalesce(pr.legal_name,'')) >= 2, md5(coalesce(pr.legal_name,'')), false);
  perform public.mp__ob_upsert(v_target, 'address', 'Address', true,
    coalesce(pr.address_line_1,'') <> '' and coalesce(pr.city,'') <> ''
      and coalesce(pr.state,'') <> '' and coalesce(pr.postal_code,'') ~ '^[0-9]{6}$',
    md5(concat_ws('|', coalesce(pr.address_line_1,''), coalesce(pr.address_line_2,''),
      coalesce(pr.city,''), coalesce(pr.state,''), coalesce(pr.postal_code,''))), false);
  perform public.mp__ob_upsert(v_target, 'bank_account', 'Bank account', true,
    coalesce(pr.bank_account_holder,'') <> '' and coalesce(pr.bank_account_last4,'') ~ '^[0-9]{4}$',
    md5(coalesce(pv.bank_account_number,'') || '|' || coalesce(pr.bank_account_holder,'')), false);
  perform public.mp__ob_upsert(v_target, 'ifsc', 'IFSC', true,
    coalesce(pr.ifsc,'') ~ '^[A-Z]{4}0[A-Z0-9]{6}$', md5(coalesce(pr.ifsc,'')), false);
  perform public.mp__ob_upsert(v_target, 'pan', 'PAN', true,
    coalesce(pr.pan_masked,'') <> '', md5(coalesce(pv.pan,'')), false);
  perform public.mp__ob_upsert(v_target, 'identity_verification', 'Identity verification', true,
    coalesce(pv.identity_proof_path,'') <> '', md5(coalesce(pv.identity_proof_path,'')), false);
  perform public.mp__ob_upsert(v_target, 'bank_proof', 'Cancelled cheque / bank proof', true,
    coalesce(pv.bank_proof_path,'') <> '', md5(coalesce(pv.bank_proof_path,'')), false);
  perform public.mp__ob_upsert(v_target, 'safeguarding', 'Safeguarding declaration', true,
    pr.safeguarding_acknowledged_at is not null,
    md5(coalesce(pr.safeguarding_acknowledged_at::text,'') || '|' || coalesce(pr.safeguarding_version,'')), false);
  perform public.mp__ob_upsert(v_target, 'joining_agreement', 'Joining Agreement acknowledgement', true,
    pr.joining_agreement_acknowledged_at is not null and length(coalesce(pr.typed_signature,'')) >= 2,
    md5(coalesce(pr.joining_agreement_acknowledged_at::text,'') || '|' ||
        coalesce(pr.joining_agreement_version,'') || '|' || coalesce(pr.typed_signature,'')), false);
end $$;
revoke all on function public.mp_sync_onboarding(uuid) from public;
grant execute on function public.mp_sync_onboarding(uuid) to authenticated;

-- ---- 7) mp_review_onboarding: owner-only approve / reject / not_required ----
-- approve/reject only from 'submitted'; rejection needs a reason; unknown item
-- ids raise; not_required is an explicit owner action allowed from any state.
create or replace function public.mp_review_onboarding(p_item_id uuid, p_status text, p_reason text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare v_status text;
begin
  if not public.mp_is_owner() then
    raise exception 'Only the owner may review onboarding items.';
  end if;
  if p_status not in ('approved','rejected','not_required') then
    raise exception 'Invalid review status.';
  end if;

  select status into v_status from public.teacher_onboarding_items where id = p_item_id;
  if not found then
    raise exception 'Onboarding item not found.';
  end if;

  if p_status = 'approved' and v_status <> 'submitted' then
    raise exception 'Only a submitted item can be approved.';
  end if;
  if p_status = 'rejected' then
    if v_status <> 'submitted' then
      raise exception 'Only a submitted item can be rejected.';
    end if;
    if coalesce(btrim(p_reason), '') = '' then
      raise exception 'A rejection reason is required.';
    end if;
  end if;

  update public.teacher_onboarding_items set
    status = p_status,
    rejection_reason = case when p_status = 'rejected' then p_reason else null end,
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    updated_at = now()
  where id = p_item_id;
end $$;
revoke all on function public.mp_review_onboarding(uuid,text,text) from public;
grant execute on function public.mp_review_onboarding(uuid,text,text) to authenticated;

-- ---- 8) Private evidence bucket policies -----------------------------------
-- The 'teacher-evidence' bucket is private and already created in the dashboard.
-- This keeps it private and (re)creates the object policies idempotently. Errors
-- are NOT swallowed — if a policy cannot be created it will surface here.
insert into storage.buckets (id, name, public)
  values ('teacher-evidence', 'teacher-evidence', false)
  on conflict (id) do nothing;

drop policy if exists "evidence teacher rw" on storage.objects;
create policy "evidence teacher rw" on storage.objects for all
  using (bucket_id = 'teacher-evidence' and (storage.foldername(name))[1] = auth.uid()::text and public.mp_is_teacher())
  with check (bucket_id = 'teacher-evidence' and (storage.foldername(name))[1] = auth.uid()::text and public.mp_is_teacher());
drop policy if exists "evidence owner read" on storage.objects;
create policy "evidence owner read" on storage.objects for select
  using (bucket_id = 'teacher-evidence' and public.mp_is_owner());

-- Verify the bucket + policies (run these SELECTs separately after the migration):
--   select id, name, public from storage.buckets where id = 'teacher-evidence';
--   select policyname, cmd, roles from pg_policies
--     where schemaname = 'storage' and tablename = 'objects'
--       and policyname in ('evidence teacher rw','evidence owner read');

-- ---- 9) Seed / refresh onboarding for all existing teachers ----------------
do $$
declare t record;
begin
  for t in select id from public.profiles where role = 'teacher' loop
    perform public.mp_sync_onboarding(t.id);
  end loop;
end $$;
