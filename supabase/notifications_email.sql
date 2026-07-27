-- ============================================================================
-- Musicphonetics — event-driven notifications + email queue (ADDITIVE)
-- Run once in the Supabase SQL editor. Depends on lead_management.sql
-- (email_outbox + mp__queue_email) and the existing notifications table.
--
-- Principle: ONE event → in-app notification (synchronous, cheap) → email OUTBOX
-- (asynchronous, retried). Business writes NEVER block on email: the triggers
-- only enqueue; the worker (functions/api/process-email-outbox) sends later.
-- ============================================================================

-- Notify a student's parent: in-app notification + queued email (best-effort).
create or replace function public.mp_notify_parent(
  p_student uuid, p_type text, p_title text, p_body text, p_url text,
  p_template text, p_subject text, p_payload jsonb, p_idem text
) returns void language plpgsql security definer set search_path = public as $$
declare v_parent uuid; v_email text; v_pemail text;
begin
  select parent_id, nullif(parent_email,'') into v_parent, v_email from public.students where id = p_student;
  if v_parent is not null then
    select nullif(email,'') into v_pemail from public.profiles where id = v_parent;
    v_email := coalesce(v_pemail, v_email);
    insert into public.notifications (recipient_id, role, type, title, body, action_url, entity_type, entity_id)
      values (v_parent, 'parent', p_type, p_title, p_body, p_url, 'student', p_student::text);
  end if;
  if p_template is not null and v_email is not null then
    perform public.mp__queue_email(v_parent, v_email, 'parent', p_type, 'student', p_student::text, p_subject, p_template, p_payload, p_idem);
  end if;
end $$;

-- Class update posted → parent gets an update (in-app + email). The class save
-- is never affected if email later fails; this only enqueues.
create or replace function public.mp__trg_class_update() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  perform public.mp_notify_parent(
    new.student_id, 'class_update', 'New class update',
    coalesce(nullif(new.homework,''), nullif(new.taught,''), 'Your teacher posted a class update.'),
    '/parent/classes', 'parent_class_update', 'Musicphonetics — new class update',
    jsonb_build_object('taught', new.taught, 'homework', new.homework, 'date', new.class_date, 'notes', new.teacher_notes),
    'class_update:'||new.id::text);
  return new;
exception when others then return new; -- never break the class save
end $$;
drop trigger if exists trg_class_update_notify on public.class_updates;
create trigger trg_class_update_notify after insert on public.class_updates
  for each row execute function public.mp__trg_class_update();

-- Payment recorded → parent receipt notice (in-app + email).
create or replace function public.mp__trg_payment() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  perform public.mp_notify_parent(
    new.student_id, 'payment_received', 'Payment received',
    'We have recorded your payment. Thank you.',
    '/parent/payments', 'parent_payment', 'Musicphonetics — payment received',
    jsonb_build_object('amount', coalesce(new.final_amount, new.amount_paid), 'date', new.payment_date),
    'payment:'||new.id::text);
  return new;
exception when others then return new;
end $$;
drop trigger if exists trg_payment_notify on public.payments;
create trigger trg_payment_notify after insert on public.payments
  for each row execute function public.mp__trg_payment();

-- Monthly report published → email the parent (the in-app notification is
-- already created inside mp_publish_report; here we only enqueue the email so
-- there is no duplicate notification).
create or replace function public.mp__trg_report_published() returns trigger
  language plpgsql security definer set search_path = public as $$
declare v_email text; v_parent uuid;
begin
  if new.status = 'published' and coalesce(old.status,'') <> 'published' then
    select parent_id, nullif(parent_email,'') into v_parent, v_email from public.students where id = new.student_id;
    if v_parent is not null then select coalesce(nullif(email,''), v_email) into v_email from public.profiles where id = v_parent; end if;
    if v_email is not null then
      perform public.mp__queue_email(v_parent, v_email, 'parent', 'monthly_report_ready', 'student_report', new.id::text,
        'Musicphonetics — your monthly report is ready', 'parent_report',
        jsonb_build_object('month', new.report_month), 'report_pub:'||new.id::text);
    end if;
  end if;
  return new;
exception when others then return new;
end $$;
drop trigger if exists trg_report_published_email on public.student_reports;
create trigger trg_report_published_email after update on public.student_reports
  for each row execute function public.mp__trg_report_published();

-- ---------------------------------------------------------------------------
-- OPTIONAL: schedule the email worker with pg_cron + pg_net (robust, no extra
-- infra). Enable the extensions in Dashboard → Database → Extensions, then run
-- the block below with your real domain + a secret that matches the Cloudflare
-- env var EMAIL_WORKER_SECRET. The worker also runs when called manually.
-- ---------------------------------------------------------------------------
-- create extension if not exists pg_cron;
-- create extension if not exists pg_net;
-- select cron.schedule('mp-email-outbox', '* * * * *', $$
--   select net.http_post(
--     url := 'https://musicphonetics.com/api/process-email-outbox',
--     headers := jsonb_build_object('x-worker-secret', 'YOUR_EMAIL_WORKER_SECRET')
--   );
-- $$);
