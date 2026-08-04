-- Teacher onboarding funnel: staged offer → acceptance → joining agreement.
-- Adds tracking columns + a per-application accept token to teacher_applications.
-- Safe to re-run.

alter table public.teacher_applications
  add column if not exists offer_sent_at     timestamptz,
  add column if not exists offer_accepted_at timestamptz,
  add column if not exists joining_sent_at   timestamptz,
  add column if not exists accept_token      uuid default gen_random_uuid();

-- Backfill a token for any existing rows created before this column existed.
update public.teacher_applications
   set accept_token = gen_random_uuid()
 where accept_token is null;

-- Make sure every future row gets one even if a client inserts without it.
alter table public.teacher_applications
  alter column accept_token set default gen_random_uuid();

-- Fast lookup by token for the public accept endpoint.
create index if not exists teacher_applications_accept_token_idx
  on public.teacher_applications (accept_token);
