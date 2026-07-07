-- ============================================================================
-- Seed the single OWNER account for Musicphonetics Teacher OS.
--
-- There is NO public sign-up. Create the owner's auth user first, then run
-- this to mark that user as the owner. Two ways to create the auth user:
--
--   A) Supabase Dashboard → Authentication → Users → "Add user"
--      (set an email + password, or a phone). Copy the generated User UID.
--
--   B) Or via the Supabase Admin API / CLI.
--
-- Then set OWNER_UID below to that UID and run this file in the SQL editor.
-- The handle_new_user() trigger will already have created a 'teacher' profile
-- row; this promotes it to 'owner'.
-- ============================================================================

-- \set OWNER_UID '00000000-0000-0000-0000-000000000000'   -- <-- replace

-- Promote the owner (edit the UID literal, then run):
update public.profiles
set role = 'owner',
    full_name = coalesce(nullif(full_name,''), 'Abhishek Kumar'),
    status = 'active'
where id = '00000000-0000-0000-0000-000000000000';  -- <-- replace with the owner User UID

-- Verify:
-- select id, role, full_name, email from public.profiles where role = 'owner';
