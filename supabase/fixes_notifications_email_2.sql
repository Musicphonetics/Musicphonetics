-- ============================================================================
-- Musicphonetics — notification email FOLLOW-UP fixes
-- Run once in the Supabase SQL editor, AFTER fixes_notifications_email.sql.
--
--  1) Emails now fall back to each user's LOGIN email (auth.users) when their
--     profiles.email is blank — so teachers/parents/students get emailed even
--     though only the owner's profile email was set manually.
--  2) Backfill: copy every user's login email into profiles.email once.
--  3) Owners are now also notified (→ emailed) on REPEAT enquiries, not only
--     brand-new ones — so a returning family still pings you.
-- ============================================================================

-- 1) Trigger: prefer profiles.email, else fall back to the auth login email.
create or replace function public.mp__trg_notify_email() returns trigger
  language plpgsql security definer set search_path = public as $$
declare v_email text; v_site text; v_html text; v_cta text := '';
begin
  select nullif(email,'') into v_email from public.profiles where id = new.recipient_id;
  if v_email is null then
    select nullif(email,'') into v_email from auth.users where id = new.recipient_id;
  end if;
  if v_email is null then return new; end if;
  select value into v_site from public.app_config where key = 'site_url';
  v_site := coalesce(v_site, 'https://musicphonetics.pages.dev');
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
exception when others then
  raise warning 'Email notification failed: %', sqlerrm;  -- log, but never break the write
  return new;
end $$;

-- 2) Backfill profiles.email from the login email where it is missing.
update public.profiles p
   set email = u.email
  from auth.users u
 where u.id = p.id
   and (p.email is null or p.email = '')
   and u.email is not null;

-- 3) mp_intake_lead: notify owners on BOTH new and repeat enquiries.
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

  v_label := coalesce(nullif(p->>'student_name',''), nullif(p->>'parent_name',''), 'New enquiry')
    || ' · ' || coalesce(nullif(p->>'instrument_interest',''), 'Music')
    || coalesce(' · ' || nullif(p->>'preferred_area',''), '');

  select * into v_existing from public.leads
   where (v_phone_norm is not null and phone_norm = v_phone_norm)
      or (v_email_norm is not null and email_norm = v_email_norm)
   order by created_at desc limit 1;

  if found then
    update public.leads set
      enquiry_count = enquiry_count + 1, last_activity_at = now(),
      instrument_interest = coalesce(nullif(p->>'instrument_interest',''), instrument_interest),
      learning_goal = coalesce(nullif(p->>'learning_goal',''), learning_goal),
      status = case when status in ('lost','not_interested','duplicate') then 'new' else status end
     where id = v_existing.id;
    insert into public.lead_activity (lead_id, event_type, metadata) values (v_existing.id, 'repeat_enquiry', p);
    -- Notify owners on repeat enquiries too.
    insert into public.notifications (recipient_id, role, type, title, body, action_url, entity_type, entity_id)
      select pr.id, 'owner', 'new_lead', 'Returning enquiry', v_label || ' (re-enquired)', '/owner/leads', 'lead', v_existing.id::text
      from public.profiles pr where pr.role = 'owner';
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

  insert into public.notifications (recipient_id, role, type, title, body, action_url, entity_type, entity_id)
    select pr.id, 'owner', 'new_lead', 'New website lead', v_label, '/owner/leads', 'lead', lead_id::text
    from public.profiles pr where pr.role = 'owner';

  is_repeat := false; return next;
end $$;
grant execute on function public.mp_intake_lead(jsonb) to service_role;
