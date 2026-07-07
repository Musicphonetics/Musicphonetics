-- ============================================================================
-- Auth bootstrap + Realtime publication for Teacher OS
-- ============================================================================

-- When a new auth user is created (via owner provisioning or OTP), ensure a
-- matching profile row exists. role/full_name can be passed in the user's
-- raw_user_meta_data by the provisioning function; defaults to 'teacher'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, full_name, role)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(nullif(new.raw_user_meta_data->>'role',''), 'teacher')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Realtime: let the owner dashboard subscribe to live changes.
-- (RLS still governs what each subscriber actually receives.)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.students;
    alter publication supabase_realtime add table public.class_updates;
    alter publication supabase_realtime add table public.payments;
    alter publication supabase_realtime add table public.payouts;
  end if;
exception when duplicate_object then
  null; -- tables already in the publication
end $$;
