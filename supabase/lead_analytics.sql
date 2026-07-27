-- ============================================================================
-- Musicphonetics — lead analytics + follow-up reminders (ADDITIVE)
-- Run once. Depends on lead_management.sql (+ notifications_email.sql for the
-- email queue). Analytics are computed in the DB (never client-side).
-- ============================================================================

-- Aggregated lead analytics for owner/sales. One round-trip; staff-only.
create or replace function public.mp_lead_analytics()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v jsonb; v_today timestamptz := date_trunc('day', now()); v_week timestamptz := now() - interval '7 days';
begin
  if not public.mp_is_lead_staff() then raise exception 'Not authorised'; end if;
  select jsonb_build_object(
    'total',       (select count(*) from public.leads),
    'today',       (select count(*) from public.leads where created_at >= v_today),
    'week',        (select count(*) from public.leads where created_at >= v_week),
    'unassigned',  (select count(*) from public.leads where assigned_teacher_id is null and status not in ('converted','lost','not_interested','duplicate')),
    'due',         (select count(*) from public.leads where next_follow_up_at is not null and next_follow_up_at <= now() and status not in ('converted','lost','not_interested','duplicate')),
    'trials',      (select count(*) from public.leads where status in ('trial_booked','trial_completed')),
    'converted',   (select count(*) from public.leads where status = 'converted'),
    'lost',        (select count(*) from public.leads where status in ('lost','not_interested')),
    'conversion_rate', (select round(100.0 * count(*) filter (where status='converted') / nullif(count(*),0), 1) from public.leads),
    'by_instrument', (select coalesce(jsonb_agg(jsonb_build_object('label', coalesce(instrument_interest,'—'), 'count', c) order by c desc), '[]'::jsonb)
                      from (select instrument_interest, count(*) c from public.leads group by instrument_interest order by c desc limit 8) t),
    'by_source',     (select coalesce(jsonb_agg(jsonb_build_object('label', coalesce(source,'—'), 'count', c, 'converted', cc) order by c desc), '[]'::jsonb)
                      from (select source, count(*) c, count(*) filter (where status='converted') cc from public.leads group by source order by c desc limit 10) t),
    'by_teacher',    (select coalesce(jsonb_agg(jsonb_build_object('label', coalesce(p.full_name,'Unassigned'), 'count', t.c, 'converted', t.cc,
                          'rate', round(100.0 * t.cc / nullif(t.c,0), 0)) order by t.c desc), '[]'::jsonb)
                      from (select assigned_teacher_id, count(*) c, count(*) filter (where status='converted') cc
                            from public.leads where assigned_teacher_id is not null group by assigned_teacher_id order by c desc limit 12) t
                      left join public.profiles p on p.id = t.assigned_teacher_id)
  ) into v;
  return v;
end $$;
grant execute on function public.mp_lead_analytics() to authenticated;

-- Follow-up reminders: for each lead whose follow-up is now due, notify the
-- assigned teacher (in-app, once per lead per day) + queue an email. Idempotent.
-- Schedule daily via pg_cron (see the block at the bottom).
create or replace function public.mp_followup_reminders()
returns integer language plpgsql security definer set search_path = public as $$
declare r record; n int := 0; v_email text; v_name text;
begin
  for r in
    select l.id, l.lead_code, l.student_name, l.assigned_teacher_id, l.next_follow_up_at
    from public.leads l
    where l.assigned_teacher_id is not null
      and l.next_follow_up_at is not null and l.next_follow_up_at <= now()
      and l.status not in ('converted','lost','not_interested','duplicate')
  loop
    -- one in-app reminder per lead per day
    if not exists (
      select 1 from public.notifications
      where recipient_id = r.assigned_teacher_id and type = 'lead_followup_due'
        and entity_id = r.id::text and created_at >= date_trunc('day', now())
    ) then
      insert into public.notifications (recipient_id, role, type, title, body, action_url, entity_type, entity_id)
      values (r.assigned_teacher_id, 'teacher', 'lead_followup_due', 'Lead follow-up due',
        coalesce(r.student_name,'A lead') || ' is due for follow-up.', '/teacher/leads', 'lead', r.id::text);
      select nullif(email,''), full_name into v_email, v_name from public.profiles where id = r.assigned_teacher_id;
      if v_email is not null then
        perform public.mp__queue_email(r.assigned_teacher_id, v_email, 'teacher', 'lead_followup_due', 'lead', r.id::text,
          'Musicphonetics — a lead follow-up is due', 'teacher_lead_assigned',
          jsonb_build_object('teacher_name', v_name, 'student', r.student_name, 'lead_code', r.lead_code),
          'followup:'||r.id::text||':'||to_char(now(),'YYYYMMDD'));
      end if;
      n := n + 1;
    end if;
  end loop;
  return n;
end $$;
grant execute on function public.mp_followup_reminders() to authenticated;

-- OPTIONAL daily reminder schedule (needs pg_cron + pg_net; see notifications_email.sql):
-- select cron.schedule('mp-followups', '0 4 * * *', $$ select public.mp_followup_reminders(); $$);  -- 09:30 IST
