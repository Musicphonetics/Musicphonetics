"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState, formatMoney } from "@/components/portal/kit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadRoster } from "@/lib/supabase/roster";
import type { StudentStat, ClassUpdate, Payment } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export default function MyStudents() {
  const [rows, setRows] = useState<StudentStat[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadRoster().then(({ rows, error }) => { setRows(rows); setErr(error); });
  }, []);

  const filtered = (rows ?? []).filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="My Students">
      {err && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Couldn&apos;t load students: {err}
        </div>
      )}
      {!rows ? <Loading /> : rows.length === 0 ? (
        <EmptyState title="No students yet" hint="Add your first student to get started." />
      ) : (
        <>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students…"
            className="mb-4 w-full rounded-xl border border-hairline bg-white px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
          <div className="space-y-3">
            {filtered.map((s) => (
              <div key={s.student_id} className="overflow-hidden rounded-2xl border border-hairline bg-white">
                <button onClick={() => setOpenId(openId === s.student_id ? null : s.student_id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{s.name}</p>
                    <p className="mt-0.5 text-xs text-ink/60">{s.instrument || "—"} · {s.level || "—"}</p>
                  </div>
                  <div className="text-right">
                    <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      s.status === "active" ? "bg-feature-green/10 text-feature-green" : "bg-mist text-ink/60")}>{s.status}</span>
                    <p className="mt-1 text-xs text-ink/60">{s.classes_completed}/{(s.classes_per_month ?? 0)} classes</p>
                  </div>
                </button>
                {openId === s.student_id && <StudentDetail stat={s} />}
              </div>
            ))}
          </div>
        </>
      )}

      <Link href="/teacher/add-student" className="fixed bottom-24 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-ink text-2xl text-gold shadow-card-hover">+</Link>
    </PortalShell>
  );
}

function StudentDetail({ stat }: { stat: StudentStat }) {
  const [classes, setClasses] = useState<ClassUpdate[] | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    sb.from("class_updates").select("*").eq("student_id", stat.student_id).order("class_date", { ascending: false }).limit(8)
      .then(({ data }) => setClasses((data as ClassUpdate[]) ?? []));
    sb.from("payments").select("*").eq("student_id", stat.student_id).order("payment_date", { ascending: false }).limit(8)
      .then(({ data }) => setPayments((data as Payment[]) ?? []));
  }, [stat.student_id]);

  return (
    <div className="border-t border-hairline bg-paper p-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        <Mini label="Completed" value={String(stat.classes_completed)} />
        <Mini label="Remaining" value={String(stat.classes_remaining)} />
        <Mini label="Paid" value={formatMoney(stat.total_paid)} />
      </div>
      {stat.classes_remaining <= 2 && stat.status === "active" && (
        <p className="mt-3 rounded-lg bg-gold/15 px-3 py-2 text-xs font-semibold text-[#7A5E0F]">Renewal due — {stat.classes_remaining} classes left.</p>
      )}

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/60">Recent classes</p>
      {!classes ? <p className="mt-1 text-xs text-ink/50">Loading…</p> :
        classes.length === 0 ? <p className="mt-1 text-xs text-ink/50">No classes logged yet.</p> : (
        <ul className="mt-2 space-y-1.5">
          {classes.map((c) => (
            <li key={c.id} className="flex justify-between text-xs text-ink/75">
              <span>{c.class_date} · {c.class_status}</span>
              <span className="truncate pl-2 text-ink/55">{c.taught || ""}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/60">Recent payments</p>
      {!payments ? <p className="mt-1 text-xs text-ink/50">Loading…</p> :
        payments.length === 0 ? <p className="mt-1 text-xs text-ink/50">No payments yet.</p> : (
        <ul className="mt-2 space-y-1.5">
          {payments.map((p) => (
            <li key={p.id} className="flex justify-between text-xs text-ink/75">
              <span>{p.payment_date} · {p.payment_status}</span>
              <span className="font-semibold">{formatMoney(p.amount_paid)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-2.5">
      <p className="font-display text-lg font-semibold text-ink">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-ink/55">{label}</p>
    </div>
  );
}
