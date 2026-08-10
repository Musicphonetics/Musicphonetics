-- ============================================================================
-- TRIAL PORTAL (Phase 2e) — trial completion via an OTP, feedback gating, and a
-- booking-confirmation email.
--
--   • Booking issues a 4-digit trial code (like an at-home service OTP) and emails
--     the family "your details have been submitted, your trial is booked".
--   • At the END of the class the teacher enters that code (the student reads it
--     out) → the trial is CLOSED → the family's feedback opens.
--   • Feedback only opens once the trial is completed; submitting it unlocks the
--     learning pathway.
--
-- Also re-creates the feedback function and reloads the PostgREST schema cache
-- (fixes "Could not find function ... in the schema cache").
-- Builds on the earlier trial migrations. Idempotent.
-- ============================================================================

alter table public.trial_sessions add column if not exists trial_otp          text;
alter table public.trial_sessions add column if not exists trial_completed_at  timestamptz;

-- Booking: issue the OTP, log to CRM, and email the confirmation.
create or replace function public.mp_trial_book_slot(p_datetime timestamptz)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.trial_sessions%rowtype; v_otp text;
begin
  v_otp := lpad((floor(random()*10000))::int::text, 4, '0');
  update public.trial_sessions set
    trial_datetime = p_datetime,
    trial_otp = coalesce(trial_otp, v_otp),
    stage = case when stage in ('booked','pre_assessed') then 'trial_scheduled' else stage end
  where user_id = auth.uid()
  returning * into v;
  if not found then return null; end if;

  begin
    if v.lead_id is not null then
      insert into public.lead_activity(lead_id, event_type, actor_role, metadata)
      values (v.lead_id, 'trial_booked', 'family', jsonb_build_object('trial_datetime', p_datetime, 'trial_id', v.id));
    end if;
  exception when others then null; end;

  -- Email the family via the notifications → outbox pipeline.
  begin
    insert into public.notifications(user_id, type, title, body, action_url)
    values (v.user_id, 'trial_booked', 'Your trial is booked',
      'Your details have been submitted and your trial has been booked for '
        || to_char(p_datetime at time zone 'Asia/Kolkata', 'Dy DD Mon at HH12:MI AM')
        || '. Your teacher will be allotted in advance, and the details along with the Director''s confirmation will reach you on WhatsApp.',
      '/trial/journey');
  exception when others then null; end;

  return jsonb_build_object('ok', true, 'stage', v.stage, 'trial_datetime', v.trial_datetime, 'otp', coalesce(v.trial_otp, v_otp));
end $$;
grant execute on function public.mp_trial_book_slot(timestamptz) to authenticated;

-- Teacher (or staff) closes the trial by entering the student's OTP.
create or replace function public.mp_trial_complete(p_id uuid, p_otp text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.trial_sessions%rowtype;
begin
  select * into v from public.trial_sessions where id = p_id;
  if not found then return null; end if;
  if not (public.mp_is_lead_staff() or v.assigned_teacher_id = auth.uid()) then raise exception 'Not authorised'; end if;
  if v.trial_otp is null or v.trial_otp <> trim(coalesce(p_otp,'')) then
    return jsonb_build_object('ok', false, 'error', 'Incorrect trial code. Ask the student to read it from their portal.');
  end if;
  update public.trial_sessions set
    trial_completed_at = coalesce(trial_completed_at, now()),
    stage = case when stage in ('trial_scheduled','teacher_assigned') then 'trial_done' else stage end
  where id = p_id returning * into v;
  begin
    insert into public.notifications(user_id, type, title, body, action_url)
    values (v.user_id, 'trial_complete', 'How was your trial?',
      'Your trial class is complete. Please share your feedback to unlock your personalised learning pathway.', '/trial/journey');
  exception when others then null; end;
  return jsonb_build_object('ok', true);
end $$;
grant execute on function public.mp_trial_complete(uuid, text) to authenticated;

-- Feedback — only AFTER the trial is completed; unlocks the pathway.
create or replace function public.mp_trial_trial_feedback(p_rating int, p_text text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.trial_sessions%rowtype;
begin
  select * into v from public.trial_sessions where user_id = auth.uid() order by created_at desc limit 1;
  if not found then return null; end if;
  if v.trial_completed_at is null then
    return jsonb_build_object('ok', false, 'error', 'Feedback opens once your trial class is completed.');
  end if;
  update public.trial_sessions set
    trial_rating = coalesce(p_rating, trial_rating),
    feedback = feedback || jsonb_build_array(jsonb_build_object('by','family','rating',p_rating,'text',left(coalesce(p_text,''),2000),'at',now())),
    stage = case when stage in ('trial_done','assessed','director_reviewed') then 'feedback_submitted' else stage end
  where id = v.id returning * into v;
  return jsonb_build_object('ok', true, 'stage', v.stage);
end $$;
grant execute on function public.mp_trial_trial_feedback(int, text) to authenticated;

-- Detail for staff/teacher — but NEVER expose the OTP (they must ask the student).
create or replace function public.mp_trial_get_one(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.trial_sessions%rowtype;
begin
  select * into v from public.trial_sessions where id = p_id;
  if not found then return null; end if;
  if not (public.mp_is_lead_staff() or v.assigned_teacher_id = auth.uid()) then raise exception 'Not authorised'; end if;
  return to_jsonb(v) - 'trial_otp';
end $$;
grant execute on function public.mp_trial_get_one(uuid) to authenticated;

-- mp_trial_mine — expose the OTP (to show the family) + completion state.
create or replace function public.mp_trial_mine()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.trial_sessions%rowtype;
begin
  select * into v from public.trial_sessions where user_id = auth.uid() order by created_at desc limit 1;
  if not found then return null; end if;
  return jsonb_build_object(
    'stage', v.stage, 'status', v.status, 'student_name', v.student_name, 'who', v.who,
    'student_age', v.student_age, 'school', v.school, 'instrument', v.instrument,
    'experience_level', v.experience_level, 'learning_goal', v.learning_goal,
    'dream_songs', v.dream_songs, 'pre_assessment', v.pre_assessment,
    'trial_datetime', v.trial_datetime, 'trial_otp', v.trial_otp, 'trial_completed_at', v.trial_completed_at,
    'trial_rating', v.trial_rating, 'teacher_summary', v.teacher_summary, 'director_note', v.director_note,
    'director_review', v.director_review, 'recommendation', v.recommendation,
    'converted_student_id', v.converted_student_id, 'feedback', v.feedback, 'created_at', v.created_at
  );
end $$;
grant execute on function public.mp_trial_mine() to authenticated;

-- Refresh PostgREST so the new/updated functions are found immediately.
notify pgrst, 'reload schema';
