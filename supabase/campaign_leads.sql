-- ============================================================================
-- Musicphonetics — campaign_leads (OPTIONAL)
-- Run this ONCE in Supabase only if you want Delhi Cantt (and future campaign)
-- leads stored in the database in addition to the email inbox. The landing page
-- works without it — /api/delhi-cantt-lead always emails the owner; it stores
-- here only when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are configured and
-- this table exists. Additive & idempotent. No destructive changes.
-- ============================================================================

create table if not exists public.campaign_leads (
  id                uuid primary key default gen_random_uuid(),
  ref               text unique,
  learner_name      text not null,
  enquirer_name     text,
  phone             text not null,
  email             text,
  age_group         text,
  instrument        text,
  mode              text,
  area              text,
  goal              text,
  status            text not null default 'New',   -- New · Contacted · Consultation booked · Trial booked · Enrolled · Not proceeding
  source            text,
  campaign          text,
  offer_code        text,
  offer_plan        text,
  plan_label        text,
  regular_price     integer,
  offer_price       integer,
  discount_amount   integer,
  classes_per_month integer,
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  utm_content       text,
  received_at       timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists campaign_leads_campaign_idx on public.campaign_leads (campaign, created_at desc);

alter table public.campaign_leads enable row level security;

-- Owner may read/manage leads (relies on the existing mp_is_owner() helper).
drop policy if exists "campaign_leads owner read" on public.campaign_leads;
create policy "campaign_leads owner read" on public.campaign_leads for select
  using (public.mp_is_owner());
drop policy if exists "campaign_leads owner update" on public.campaign_leads;
create policy "campaign_leads owner update" on public.campaign_leads for update
  using (public.mp_is_owner()) with check (public.mp_is_owner());

-- Inserts come only from the Cloudflare Function using the service-role key,
-- which bypasses RLS. No anon/public insert policy is granted on purpose.
