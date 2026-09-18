-- ============================================================================
-- Musicphonetics, QR / flyer scan tracking (ADDITIVE)
-- Run once in the Supabase SQL editor.
--
-- Records every scan of a printed QR code (via the /start landing page) so the
-- office can see how many times each flyer / QR was scanned and when. Anyone
-- may record a scan (the landing page is public); only owners may read them.
-- ============================================================================

create table if not exists public.qr_scans (
  id          uuid primary key default gen_random_uuid(),
  ref         text,                       -- which QR / placement (e.g. guide-cover)
  path        text,                       -- landing path
  referrer    text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

alter table public.qr_scans enable row level security;

-- Public: a scan can be recorded by anyone (the flyer is scanned before login).
drop policy if exists qr_scans_public_insert on public.qr_scans;
create policy qr_scans_public_insert on public.qr_scans
  for insert to anon, authenticated with check (true);

-- Private: only owners may read the scan data.
drop policy if exists qr_scans_owner_select on public.qr_scans;
create policy qr_scans_owner_select on public.qr_scans
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));

create index if not exists qr_scans_ref_idx on public.qr_scans (ref);
create index if not exists qr_scans_created_idx on public.qr_scans (created_at desc);

comment on table public.qr_scans is 'Printed-QR / flyer scan log. Public insert, owner read.';
