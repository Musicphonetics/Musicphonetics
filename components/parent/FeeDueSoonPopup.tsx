"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  computeFeeStanding, computeSetProgress, addDaysIso, FEE_DUE_DAYS, type FeePaymentLite,
} from "@/lib/fees";
import type { Student, Payment } from "@/lib/supabase/types";

const shortDate = (iso: string | null) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : null;

// A gentle nudge that appears ONCE per set, after the 6th class of an 8-class
// set (i.e. 2 left), unless the family has already paid ahead. It quietly makes
// renewal top-of-mind before the set runs out. Dismissed per set via localStorage.
export function FeeDueSoonPopup({ student, completed, pays }: {
  student: Student; completed: number; pays: Payment[];
}) {
  const [show, setShow] = useState(false);
  const s = computeFeeStanding(student.fee_quoted, student.classes_per_month, completed, pays as unknown as FeePaymentLite[]);
  const purchased = s?.classesPurchased ?? (student.classes_per_month ?? 8);
  const sp = computeSetProgress(completed, student.classes_per_month, purchased);
  const feeDue = pays[0]?.payment_date ? addDaysIso(pays[0].payment_date, FEE_DUE_DAYS) : null;
  const advanceSets = Math.max(0, sp.paidSets - sp.currentSet);
  const trigger = sp.currentDone >= sp.perSet - 2 && !sp.allComplete && advanceSets === 0;
  const key = `mp-feedue-${student.id}-set${sp.currentSet}`;

  useEffect(() => {
    if (!trigger) return;
    try { if (window.localStorage.getItem(key) === "1") return; } catch { /* ignore */ }
    const t = setTimeout(() => setShow(true), 900); // let the page settle first
    return () => clearTimeout(t);
  }, [trigger, key]);

  if (!show) return null;
  const dismiss = () => { setShow(false); try { window.localStorage.setItem(key, "1"); } catch { /* ignore */ } };
  const name = student.name.split(" ")[0];

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-charcoal/40 p-4 backdrop-blur-sm sm:items-center" onClick={dismiss}>
      <div className="w-full max-w-sm rounded-3xl border border-gold/40 bg-white p-6 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.4)]" onClick={(e) => e.stopPropagation()}>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15 text-2xl">🔔</span>
        <h3 className="mt-4 font-display text-xl font-bold text-ink">Fee due soon!</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/70">
          {name} has completed <b className="text-ink">{sp.currentDone} of {sp.perSet}</b> classes in this set.
          Renew {feeDue ? <>before <b className="text-[#7A5E0F]">{shortDate(feeDue)}</b> </> : "soon "}
          so classes never pause.
        </p>
        <div className="mt-5 flex gap-2.5">
          <button onClick={dismiss} className="rounded-full border border-hairline px-5 py-2.5 text-sm font-semibold text-ink/70 hover:border-ink/30">Later</button>
          <Link href="/parent/payments" onClick={dismiss} className="flex-1 rounded-full bg-gold py-2.5 text-center text-sm font-semibold text-ink hover:bg-deep-gold">Renew now</Link>
        </div>
      </div>
    </div>
  );
}
