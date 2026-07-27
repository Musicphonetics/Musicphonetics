-- ============================================================================
-- Musicphonetics — teacher coupon codes + payment price breakdown (ADDITIVE)
-- Run once in the Supabase SQL editor. Idempotent; no drops, no data rewrite.
--
-- Model: "codes only". The OWNER creates a unique coupon code per teacher and
-- sets its discount percent. The teacher carries the code but can NEVER edit it.
-- Applying a valid code stores the full price breakdown on the payment so reports
-- stay meaningful and historical revenue is never re-derived from today's prices.
-- ============================================================================

create table if not exists public.teacher_coupons (
  id               uuid primary key default gen_random_uuid(),
  code             text not null,
  teacher_id       uuid not null references public.profiles(id) on delete cascade,
  discount_percent int  not null check (discount_percent between 1 and 100),
  active           boolean not null default true,
  label            text,
  created_by       uuid,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Codes are unique, case-insensitively (store upper-cased).
create unique index if not exists teacher_coupons_code_key on public.teacher_coupons (upper(code));
-- One active coupon per teacher (partial unique).
create unique index if not exists teacher_coupons_one_active on public.teacher_coupons (teacher_id) where active;

alter table public.teacher_coupons enable row level security;

-- Owner manages coupons (relies on the existing mp_is_owner() helper).
drop policy if exists "coupons owner all" on public.teacher_coupons;
create policy "coupons owner all" on public.teacher_coupons for all
  using (public.mp_is_owner()) with check (public.mp_is_owner());

-- A teacher may READ their own coupon (never write it).
drop policy if exists "coupons teacher read own" on public.teacher_coupons;
create policy "coupons teacher read own" on public.teacher_coupons for select
  using (teacher_id = auth.uid());

-- Price breakdown on payments (additive; old rows keep NULLs / their own amounts).
alter table public.payments add column if not exists list_price       int;
alter table public.payments add column if not exists discount_percent  int;
alter table public.payments add column if not exists coupon_code       text;
alter table public.payments add column if not exists coupon_teacher_id uuid;
alter table public.payments add column if not exists final_amount      int;

-- Public, safe coupon validation used by the enrolment/pay page: returns only
-- the percent + a friendly label for a live code. SECURITY DEFINER so it can
-- read the table without exposing it. Never returns teacher PII beyond a name.
create or replace function public.mp_validate_coupon(p_code text)
returns table (valid boolean, discount_percent int, teacher_name text)
language sql security definer set search_path = public as $$
  select true, c.discount_percent, coalesce(p.full_name, 'Musicphonetics')
  from public.teacher_coupons c
  left join public.profiles p on p.id = c.teacher_id
  where upper(c.code) = upper(trim(p_code)) and c.active
  limit 1;
$$;
grant execute on function public.mp_validate_coupon(text) to anon, authenticated;
