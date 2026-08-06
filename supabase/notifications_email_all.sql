-- ============================================================================
-- Musicphonetics — email on EVERY update (universal notification bridge)
-- Run once in the Supabase SQL editor, AFTER notifications_email.sql.
--
-- Every in-app notification (from any portal: owner, teacher, parent, sales)
-- now also queues an email to that recipient. The dedicated rich-template
-- events (class update, payment, report) keep their own nicer emails, so they
-- are skipped here to avoid sending twice.
--
-- As always, this only ENQUEUES into email_outbox; the worker sends later, so a
-- slow or failing email never blocks the app write.
-- ============================================================================

create or replace function public.mp__trg_notification_email() returns trigger
  language plpgsql security definer set search_path = public as $$
declare v_email text;
begin
  -- These types already send a dedicated, nicer email elsewhere. Skip to avoid
  -- a duplicate. Everything else gets a clean generic email.
  if new.type in ('class_update','payment_received','payment','monthly_report_ready','report','report_published') then
    return new;
  end if;

  -- Resolve the recipient's email. Staff/teachers have a profiles row; parents
  -- may only exist via students.parent_email, so fall back to that.
  select nullif(email,'') into v_email from public.profiles where id = new.recipient_id;
  if v_email is null then
    select nullif(parent_email,'') into v_email
      from public.students where parent_id = new.recipient_id
      order by created_at limit 1;
  end if;

  if v_email is not null then
    perform public.mp__queue_email(
      new.recipient_id, v_email, coalesce(new.role, 'user'), new.type,
      coalesce(new.entity_type, 'notification'), coalesce(new.entity_id, new.id::text),
      coalesce(nullif(new.title, ''), 'Musicphonetics update'),
      'generic',
      jsonb_build_object('title', new.title, 'body', coalesce(nullif(new.body,''), new.title), 'action_url', new.action_url),
      'notif:' || new.id::text   -- idempotency: one email per notification
    );
  end if;
  return new;
exception when others then return new;  -- never break the app write
end $$;

drop trigger if exists trg_notification_email on public.notifications;
create trigger trg_notification_email after insert on public.notifications
  for each row execute function public.mp__trg_notification_email();
