-- ============================================================================
-- Musicphonetics — Teacher Onboarding v2 (derived status, no self-approval)
-- Run ONCE in the Supabase SQL editor (after musicphonetics_operations_upgrade).
-- Additive & idempotent. No DROP TABLE, no destructive changes.
--
-- Principle: onboarding item status is DERIVED from real profile data / evidence
-- / owner verification — never set by a teacher pressing a button.
--   • Teachers enter data in the Teacher Portal (profiles + teacher_private_details).
--   • public.mp_sync_onboarding() (SECURITY DEFINER) recomputes each item's status
--     from that data. It moves pending↔submitted, resets an approved SENSITIVE
--     item back to submitted when its verified value changes, and NEVER approves.
--   • Only the owner sets approved/rejected/not_required via mp_review_onboarding().
--   • Teachers have NO direct write access to teacher_onboarding_items.
-- ============================================================================

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
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
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
-- desired = submitted when data is present/valid, else pending.
--   not_required           → keep (owner set)
--   approved + sensitive change → submitted + clear reviewer (fresh verification)
--   approved + unchanged   → keep approved
--   rejected + now present  → submitted (teacher resubmits by fixing data), clear reason
--   else                    → desired
create or replace function public.mp__ob_upsert(
  v_target uuid, p_key text, p_label text, p_required boolean,
  p_present boolean, p_fp text, p_sensitive boolean
) returns void
language plpgsql as $$
declare desired text := case when p_present then 'submitted' else 'pending' end;
begin
  insert into public.teacher_onboarding_items
    (teacher_id, item_key, label, required_before_assignment, status, value_fingerprint, updated_at)
  values (v_target, p_key, p_label, p_required, desired, p_fp, now())
  on conflict (teacher_id, item_key) do update set
    label = excluded.label,
    required_before_assignment = excluded.required_before_assignment,
    updated_at = now(),
    status = case
      when public.teacher_onboarding_items.status = 'not_required' then 'not_required'
      when public.teacher_onboarding_items.status = 'approved' then
        case when p_sensitive and public.teacher_onboarding_items.value_fingerprint is distinct from p_fp
             then 'submitted' else 'approved' end
      when public.teacher_onboarding_items.status = 'rejected' then
        case when p_present then 'submitted' else 'rejected' end
      else desired
    end,
    reviewed_by = case
      when public.teacher_onboarding_items.status = 'approved' and p_sensitive
           and public.teacher_onboarding_items.value_fingerprint is distinct from p_fp then null
      else public.teacher_onboarding_items.reviewed_by end,
    reviewed_at = case
      when public.teacher_onboarding_items.status = 'approved' and p_sensitive
           and public.teacher_onboarding_items.value_fingerprint is distinct from p_fp then null
      else public.teacher_onboarding_items.reviewed_at end,
    rejection_reason = case
      when public.teacher_onboarding_items.status = 'rejected' and p_present then null
      else public.teacher_onboarding_items.rejection_reason end,
    value_fingerprint = p_fp;
end $$;
revoke all on function public.mp__ob_upsert(uuid,text,text,boolean,boolean,text,boolean) from public;

-- ---- 6) mp_sync_onboarding: recompute a teacher's checklist from real data --
create or replace function public.mp_sync_onboarding(p_teacher_id uuid default null) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_target uuid;
  pr public.profiles%rowtype;
  pv public.teacher_private_details%rowtype;
  av int;
  digits text;
begin
  -- Resolve target: teachers may only sync themselves; owner or an elevated
  -- (no-auth, e.g. seeding) caller may target a specific teacher.
  if auth.uid() is null then
    v_target := p_teacher_id;
  elsif public.mp_is_owner() then
    v_target := coalesce(p_teacher_id, auth.uid());
  else
    v_target := auth.uid();
  end if;
  if v_target is null then return; end if;

  select * into pr from public.profiles where id = v_target;
  if not found then return; end if;
  select * into pv from public.teacher_private_details where teacher_id = v_target;
  select count(*) into av from public.teacher_availability where teacher_id = v_target and active = true;

  digits := regexp_replace(coalesce(pr.phone,''), '\D', '', 'g');

  -- Optional / not-blocking
  perform public.mp__ob_upsert(v_target, 'profile_photo', 'Profile photo', false,
    coalesce(pr.photo_url,'') <> '', null, false);
  perform public.mp__ob_upsert(v_target, 'regions', 'Teaching regions', false,
    coalesce(array_length(pr.regions,1),0) >= 1, null, false);
  perform public.mp__ob_upsert(v_target, 'upi', 'UPI ID', false,
    coalesce(pr.upi_id,'') ~ '^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$', null, false);
  perform public.mp__ob_upsert(v_target, 'demo_video', 'Demo / performance link', false,
    coalesce(pr.demo_video_url,'') ~ '^https?://', null, false);

  -- Required, non-sensitive (owner still verifies)
  perform public.mp__ob_upsert(v_target, 'legal_name', 'Full legal name', true,
    length(coalesce(pr.legal_name,'')) >= 2, null, false);
  perform public.mp__ob_upsert(v_target, 'phone', 'Phone', true,
    digits ~ '^[6-9][0-9]{9}$', null, false);
  perform public.mp__ob_upsert(v_target, 'address', 'Address', true,
    coalesce(pr.address_line_1,'') <> '' and coalesce(pr.city,'') <> ''
      and coalesce(pr.state,'') <> '' and coalesce(pr.postal_code,'') ~ '^[0-9]{6}$', null, false);
  perform public.mp__ob_upsert(v_target, 'instruments', 'Instruments', true,
    coalesce(array_length(pr.instruments,1),0) >= 1, null, false);
  perform public.mp__ob_upsert(v_target, 'experience', 'Years of experience', true,
    pr.experience_years is not null and pr.experience_years >= 0, null, false);
  perform public.mp__ob_upsert(v_target, 'qualifications', 'Qualifications', true,
    length(coalesce(pr.qualifications,'')) >= 2, null, false);
  perform public.mp__ob_upsert(v_target, 'biography', 'Biography', true,
    length(coalesce(pr.full_biography,'')) >= 120, null, false);
  perform public.mp__ob_upsert(v_target, 'availability', 'Availability', true,
    av >= 1, null, false);

  -- Required, SENSITIVE (owner approves; approval resets on value change)
  perform public.mp__ob_upsert(v_target, 'bank_account', 'Bank account', true,
    coalesce(pr.bank_account_holder,'') <> '' and coalesce(pr.bank_account_last4,'') ~ '^[0-9]{4}$',
    md5(coalesce(pv.bank_account_number,'') || '|' || coalesce(pr.bank_account_holder,'')), true);
  perform public.mp__ob_upsert(v_target, 'ifsc', 'IFSC', true,
    coalesce(pr.ifsc,'') ~ '^[A-Z]{4}0[A-Z0-9]{6}$', md5(coalesce(pr.ifsc,'')), true);
  perform public.mp__ob_upsert(v_target, 'pan', 'PAN', true,
    coalesce(pr.pan_masked,'') <> '', md5(coalesce(pv.pan,'')), true);
  perform public.mp__ob_upsert(v_target, 'identity_verification', 'Identity verification', true,
    coalesce(pv.identity_proof_path,'') <> '', md5(coalesce(pv.identity_proof_path,'')), true);
  perform public.mp__ob_upsert(v_target, 'bank_proof', 'Cancelled cheque / bank proof', true,
    coalesce(pv.bank_proof_path,'') <> '', md5(coalesce(pv.bank_proof_path,'')), true);

  -- Required, declaration-based
  perform public.mp__ob_upsert(v_target, 'safeguarding', 'Safeguarding declaration', true,
    pr.safeguarding_acknowledged_at is not null, null, false);
  perform public.mp__ob_upsert(v_target, 'joining_agreement', 'Joining Agreement acknowledgement', true,
    pr.joining_agreement_acknowledged_at is not null and length(coalesce(pr.typed_signature,'')) >= 2, null, false);
end $$;
revoke all on function public.mp_sync_onboarding(uuid) from public;
grant execute on function public.mp_sync_onboarding(uuid) to authenticated;

-- ---- 7) mp_review_onboarding: owner-only approve / reject / not_required ----
create or replace function public.mp_review_onboarding(p_item_id uuid, p_status text, p_reason text default null)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.mp_is_owner() then
    raise exception 'Only the owner may review onboarding items.';
  end if;
  if p_status not in ('approved','rejected','not_required') then
    raise exception 'Invalid review status.';
  end if;
  update public.teacher_onboarding_items
    set status = p_status,
        rejection_reason = case when p_status = 'rejected' then p_reason else null end,
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        updated_at = now()
    where id = p_item_id;
end $$;
revoke all on function public.mp_review_onboarding(uuid,text,text) from public;
grant execute on function public.mp_review_onboarding(uuid,text,text) to authenticated;

-- ---- 8) Private evidence storage bucket (best-effort; needs storage schema) -
do $$ begin
  insert into storage.buckets (id, name, public) values ('teacher-evidence','teacher-evidence', false)
  on conflict (id) do nothing;
exception when others then null; end $$;

do $$ begin
  drop policy if exists "evidence teacher rw" on storage.objects;
  create policy "evidence teacher rw" on storage.objects for all
    using (bucket_id = 'teacher-evidence' and (storage.foldername(name))[1] = auth.uid()::text)
    with check (bucket_id = 'teacher-evidence' and (storage.foldername(name))[1] = auth.uid()::text);
  drop policy if exists "evidence owner read" on storage.objects;
  create policy "evidence owner read" on storage.objects for select
    using (bucket_id = 'teacher-evidence' and public.mp_is_owner());
exception when others then null; end $$;

-- ---- 9) Seed / refresh onboarding for all existing teachers ----------------
do $$
declare t record;
begin
  for t in select id from public.profiles where role = 'teacher' loop
    perform public.mp_sync_onboarding(t.id);
  end loop;
end $$;
