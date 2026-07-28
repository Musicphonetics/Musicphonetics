-- ============================================================================
-- Musicphonetics — FIXES: notification types + email on EVERY notification
-- Run once in the Supabase SQL editor. Additive/idempotent.
--
-- 1) Removes the stale notifications_type_check that blocked new types (this is
--    why assigning a lead to a teacher failed).
-- 2) Makes EVERY notification (owner/teacher/parent/student) send an email
--    automatically — sent directly from the database via pg_net → Resend, so it
--    works WITHOUT any cron or worker setup. You only set 3 config rows once.
-- 3) Owners get a notification (and email) for every new website lead.
-- ============================================================================

-- 0) pg_net lets the DB make outbound HTTP calls (to Resend). Safe + async.
create extension if not exists pg_net;

-- 1) Drop the restrictive type check — notification 'type' is a free-form label.
do $$ begin
  if exists (select 1 from pg_constraint where conname = 'notifications_type_check' and conrelid = 'public.notifications'::regclass) then
    alter table public.notifications drop constraint notifications_type_check;
  end if;
end $$;

-- 2) Small config table for the email settings (owner-managed, never public).
create table if not exists public.app_config (
  key   text primary key,
  value text
);
alter table public.app_config enable row level security;
drop policy if exists "app_config owner" on public.app_config;
create policy "app_config owner" on public.app_config for all
  using (public.mp_is_owner()) with check (public.mp_is_owner());

--   >>> SET THESE THREE ONCE (replace the values), then re-run just this block:
--   insert into public.app_config (key, value) values
--     ('resend_api_key', 're_xxxxxxphonetics'),                 -- your Resend key
--     ('mail_from',      'Musicphonetics <team@yourdomain.com>'),-- a verified sender
--     ('site_url',       'https://musicphonetics.com')
--   on conflict (key) do update set value = excluded.value;

-- Tiny HTML-escaper for values we drop into the email body.
create or replace function public.mp__h(t text) returns text language sql immutable as $$
  select replace(replace(replace(coalesce(t,''),'&','&amp;'),'<','&lt;'),'>','&gt;');
$$;

-- Send an email now, straight from Postgres via Resend (async; never blocks).
create or replace function public.mp__send_email_now(p_to text, p_subject text, p_html text)
returns void language plpgsql security definer set search_path = public as $$
declare v_key text; v_from text;
begin
  if p_to is null or p_to = '' then return; end if;
  select value into v_key  from public.app_config where key = 'resend_api_key';
  select value into v_from from public.app_config where key = 'mail_from';
  if v_key is null or v_key = '' then return; end if;  -- not configured yet → skip
  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || v_key, 'Content-Type', 'application/json'),
    body := jsonb_build_object(
      'from', coalesce(v_from, 'Musicphonetics <onboarding@resend.dev>'),
      'to', jsonb_build_array(p_to),
      'subject', p_subject,
      'html', p_html)
  );
end $$;

-- The ONE place email is sent: whenever a notification is created, email its
-- recipient. Covers owner, teacher, parent and student uniformly.
create or replace function public.mp__trg_notify_email() returns trigger
  language plpgsql security definer set search_path = public as $$
declare v_email text; v_site text; v_html text; v_cta text := '';
begin
  select nullif(email,'') into v_email from public.profiles where id = new.recipient_id;
  if v_email is null then return new; end if;
  select value into v_site from public.app_config where key = 'site_url';
  v_site := coalesce(v_site, 'https://musicphonetics.com');
  if new.action_url is not null then
    v_cta := '<p style="margin:22px 0"><a href="' || v_site || new.action_url ||
      '" style="background:#C9A227;color:#161B26;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">Open Musicphonetics</a></p>';
  end if;
  v_html := '<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:auto;color:#161B26">'
    || '<h2 style="font-family:Georgia,serif">' || public.mp__h(new.title) || '</h2>'
    || '<p style="font-size:15px;line-height:1.5;color:#333">' || public.mp__h(new.body) || '</p>'
    || v_cta
    || '<hr style="border:none;border-top:1px solid #eee;margin:22px 0"><p style="font-size:12px;color:#888">Musicphonetics · structured, personalised, transformational.</p></div>';
  perform public.mp__send_email_now(v_email, coalesce(new.title, 'Musicphonetics update'), v_html);
  return new;
exception when others then return new;  -- email must never break the write
end $$;
drop trigger if exists trg_notify_email on public.notifications;
create trigger trg_notify_email after insert on public.notifications
  for each row execute function public.mp__trg_notify_email();

-- Avoid double sends: the old outbox queue is now a no-op (the trigger above is
-- the single email path). Existing queue calls become harmless.
create or replace function public.mp__queue_email(
  p_user uuid, p_email text, p_role text, p_type text, p_entity_type text, p_entity_id text,
  p_subject text, p_template text, p_payload jsonb, p_idem text
) returns void language plpgsql security definer set search_path = public as $$
begin
  return;  -- superseded by trg_notify_email (email-per-notification)
end $$;

-- 3) Owners get notified (→ emailed) for every NEW website lead.
create or replace function public.mp_intake_lead(p jsonb)
returns table (lead_id uuid, lead_code text, is_repeat boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_phone_norm text := nullif(regexp_replace(coalesce(p->>'phone',''), '\D', '', 'g'), '');
  v_email_norm text := nullif(lower(trim(coalesce(p->>'email',''))), '');
  v_existing   public.leads%rowtype;
  v_label      text;
begin
  if v_phone_norm is not null and length(v_phone_norm) > 10 then v_phone_norm := right(v_phone_norm, 10); end if;

  select * into v_existing from public.leads
   where (v_phone_norm is not null and phone_norm = v_phone_norm)
      or (v_email_norm is not null and email_norm = v_email_norm)
   order by created_at desc limit 1;

  if found then
    update public.leads set
      enquiry_count = enquiry_count + 1, last_activity_at = now(),
      instrument_interest = coalesce(nullif(instrument_interest,''), p->>'instrument_interest'),
      learning_goal = coalesce(nullif(learning_goal,''), p->>'learning_goal'),
      status = case when status in ('lost','not_interested','duplicate') then 'new' else status end
     where id = v_existing.id;
    insert into public.lead_activity (lead_id, event_type, metadata) values (v_existing.id, 'repeat_enquiry', p);
    return query select v_existing.id, v_existing.lead_code, true; return;
  end if;

  insert into public.leads (
    student_name, parent_name, email, email_norm, phone, phone_norm, alternate_phone,
    student_age, instrument_interest, preferred_mode, preferred_area, city, preferred_days,
    preferred_time, experience_level, learning_goal, message, preferred_program, coupon_code,
    source, campaign, utm_source, utm_medium, utm_campaign, utm_content, utm_term, landing_page, referrer, status, priority
  ) values (
    p->>'student_name', p->>'parent_name', v_email_norm, v_email_norm, p->>'phone', v_phone_norm, p->>'alternate_phone',
    p->>'student_age', p->>'instrument_interest', p->>'preferred_mode', p->>'preferred_area', p->>'city', p->>'preferred_days',
    p->>'preferred_time', p->>'experience_level', p->>'learning_goal', p->>'message', p->>'preferred_program', p->>'coupon_code',
    coalesce(nullif(p->>'source',''),'website'), p->>'campaign', p->>'utm_source', p->>'utm_medium', p->>'utm_campaign', p->>'utm_content', p->>'utm_term',
    p->>'landing_page', p->>'referrer', 'new', 'normal'
  ) returning id, public.leads.lead_code into lead_id, lead_code;

  insert into public.lead_activity (lead_id, event_type, metadata) values (lead_id, 'submitted', p);

  -- Notify every owner (→ each gets an email via trg_notify_email).
  v_label := coalesce(nullif(p->>'student_name',''), nullif(p->>'parent_name',''), 'New enquiry')
    || ' · ' || coalesce(nullif(p->>'instrument_interest',''), 'Music')
    || coalesce(' · ' || nullif(p->>'preferred_area',''), '');
  insert into public.notifications (recipient_id, role, type, title, body, action_url, entity_type, entity_id)
    select pr.id, 'owner', 'new_lead', 'New website lead', v_label, '/owner/leads', 'lead', lead_id::text
    from public.profiles pr where pr.role = 'owner';

  is_repeat := false; return next;
end $$;
grant execute on function public.mp_intake_lead(jsonb) to service_role;
