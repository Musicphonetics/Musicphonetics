-- ============================================================================
-- Owner records a payment (incl. advance) for any student. SECURITY DEFINER so
-- it works regardless of the payments table's insert policies; the amount can be
-- any value (e.g. two months in advance), and the class-based fee accounting in
-- the Student Portal reflects it immediately. Idempotency is the caller's job.
-- ============================================================================

create or replace function public.mp_record_payment(p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_student uuid; v_teacher uuid; v_fee numeric; v_amt numeric; v_id uuid;
begin
  if not public.mp_is_owner() then raise exception 'Owner access required'; end if;
  v_student := nullif(p->>'student_id','')::uuid;
  if v_student is null then raise exception 'student_id is required'; end if;
  v_amt := nullif(p->>'amount_paid','')::numeric;
  if v_amt is null or v_amt <= 0 then raise exception 'A valid amount is required'; end if;

  select teacher_id, fee_quoted into v_teacher, v_fee from public.students where id = v_student;

  insert into public.payments(
    teacher_id, student_id, payment_date, billing_cycle, fee_quoted, amount_paid,
    list_price, final_amount, discount, payment_status, payment_mode, notes
  ) values (
    coalesce(v_teacher, auth.uid()), v_student, coalesce(nullif(p->>'payment_date','')::date, current_date),
    nullif(p->>'billing_cycle',''), v_fee, v_amt, v_fee, v_amt,
    case when v_fee is not null and v_fee > v_amt then v_fee - v_amt else null end,
    coalesce(nullif(p->>'payment_status',''), 'Received'),
    coalesce(nullif(p->>'payment_mode',''), 'Manual'),
    nullif(p->>'notes','')
  ) returning id into v_id;

  return jsonb_build_object('ok', true, 'id', v_id);
end $$;
grant execute on function public.mp_record_payment(jsonb) to authenticated;

notify pgrst, 'reload schema';
