"use client";

import { useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { groupIntoCycles, type ClassCycle } from "@/lib/cycles";
import { formatMoney } from "@/components/portal/kit";
import type { ClassUpdate, Payment } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const CINP = "rounded-lg border border-hairline bg-white px-2 py-1.5 text-xs focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

const shortDate = (iso: string | null | undefined) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const STATUS_PILL: Record<ClassCycle["status"], { label: string; cls: string }> = {
  done: { label: "Complete", cls: "bg-emerald-500/12 text-emerald-700" },
  active: { label: "In progress", cls: "bg-gold/20 text-[#7A5E0F]" },
  upcoming: { label: "Paid ahead", cls: "bg-forest/10 text-forest" },
  unpaid: { label: "Not paid", cls: "bg-red-500/10 text-red-600" },
};

// Classes grouped into paid sets ("cycles"). Each cycle shows a summary row;
// tapping it reveals only that set's classes, so a long-running student's 100+
// classes stay browsable set by set instead of one endless list.
export function StudentClassCycles({
  classes, setClasses, payments, feeQuoted, classesPerMonth,
}: {
  classes: ClassUpdate[];
  setClasses: React.Dispatch<React.SetStateAction<ClassUpdate[] | null>>;
  payments: Payment[];
  feeQuoted: number | null;
  classesPerMonth: number | null;
}) {
  const cycles = useMemo(
    () => groupIntoCycles(classes, payments, feeQuoted, classesPerMonth),
    [classes, payments, feeQuoted, classesPerMonth],
  );

  // Latest set first (that's the one being worked on); open the active one.
  const ordered = useMemo(() => cycles.slice().reverse(), [cycles]);
  const activeNumber = useMemo(() => {
    const a = cycles.find((c) => c.status === "active") || cycles.find((c) => c.status === "unpaid");
    return a?.number ?? cycles[cycles.length - 1]?.number ?? null;
  }, [cycles]);
  const [openN, setOpenN] = useState<number | null>(activeNumber);

  const [editId, setEditId] = useState<string | null>(null);
  const [ev, setEv] = useState<{ class_date: string; class_status: string; taught: string }>({ class_date: "", class_status: "", taught: "" });
  const [msg, setMsg] = useState<string | null>(null);

  function startEdit(c: ClassUpdate) {
    setMsg(null);
    setEditId(c.id);
    setEv({ class_date: (c.class_date || "").slice(0, 10), class_status: c.class_status || "Completed", taught: c.taught || "" });
  }
  async function saveClass(id: string) {
    const { error } = await getSupabase().from("class_updates")
      .update({ class_date: ev.class_date, class_status: ev.class_status, taught: ev.taught || null }).eq("id", id);
    if (error) { setMsg(error.message); return; }
    setClasses((prev) => prev && prev.map((c) => (c.id === id ? { ...c, class_date: ev.class_date, class_status: ev.class_status, taught: ev.taught } as ClassUpdate : c)));
    setEditId(null);
  }
  async function deleteClass(id: string) {
    const { error } = await getSupabase().from("class_updates").delete().eq("id", id);
    if (error) { setMsg(error.message); return; }
    setClasses((prev) => prev && prev.filter((c) => c.id !== id));
    setEditId(null);
  }

  if (classes.length === 0) {
    return <p className="mt-1 text-xs text-ink/50">No classes logged yet. They&apos;ll group into paid sets of {classesPerMonth ?? 8} here.</p>;
  }

  return (
    <div className="space-y-2.5">
      {msg && <p className="text-xs text-red-600">{msg}</p>}
      {ordered.map((cyc) => {
        const open = openN === cyc.number;
        const pill = STATUS_PILL[cyc.status];
        return (
          <div key={cyc.number} className="overflow-hidden rounded-xl border border-hairline bg-white">
            <button
              onClick={() => setOpenN(open ? null : cyc.number)}
              className="flex w-full items-center gap-3 px-3.5 py-3 text-left">
              <span className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold",
                cyc.status === "done" ? "bg-emerald-500/12 text-emerald-700"
                  : cyc.status === "unpaid" ? "bg-red-500/10 text-red-600" : "bg-gold/15 text-[#7A5E0F]")}>
                {cyc.number}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">
                  Cycle {cyc.number}
                  <span className="ml-2 text-xs font-normal text-ink/55">
                    {cyc.paid ? `Paid ${shortDate(cyc.paidOn)}` : "Awaiting payment"}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-ink/55">
                  {cyc.doneCount}/{cyc.size} classes done
                  {cyc.amount ? ` · ${formatMoney(cyc.amount)}` : ""}
                  {cyc.paymentMode ? ` · ${cyc.paymentMode}` : ""}
                </p>
              </div>
              <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", pill.cls)}>{pill.label}</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                className={cn("shrink-0 text-ink/40 transition-transform", open && "rotate-180")}>
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {open && (
              <div className="border-t border-hairline bg-paper px-3 py-3">
                {cyc.classes.length === 0 ? (
                  <p className="text-xs text-ink/50">No classes recorded in this set yet.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {cyc.classes.map((c, i) => (
                      <li key={c.id} className="rounded-lg border border-hairline bg-white p-2">
                        {editId === c.id ? (
                          <div className="space-y-1.5">
                            <div className="grid grid-cols-2 gap-1.5">
                              <input type="date" value={ev.class_date} onChange={(e) => setEv({ ...ev, class_date: e.target.value })} className={CINP} />
                              <select value={ev.class_status} onChange={(e) => setEv({ ...ev, class_status: e.target.value })} className={CINP}>
                                {["Completed", "Cancelled", "Absent", "Rescheduled"].map((s) => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                            <input value={ev.taught} onChange={(e) => setEv({ ...ev, taught: e.target.value })} placeholder="What was covered" className={CINP + " w-full"} />
                            <div className="flex items-center gap-2">
                              <button onClick={() => saveClass(c.id)} className="rounded-full bg-ink px-4 py-1.5 text-[11px] font-semibold text-paper">Save</button>
                              <button onClick={() => setEditId(null)} className="rounded-full border border-hairline px-4 py-1.5 text-[11px] font-semibold text-ink/70">Cancel</button>
                              <button onClick={() => deleteClass(c.id)} className="ml-auto text-[11px] font-semibold text-red-600">Delete</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2 text-xs">
                            <div className="flex min-w-0 gap-2">
                              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-ink/[0.06] text-[9px] font-semibold text-ink/50">{i + 1}</span>
                              <div className="min-w-0">
                                <span className="font-medium text-ink/80">{shortDate(c.class_date)}</span>
                                <span className={cn("ml-1.5", c.class_status === "Completed" ? "text-emerald-600" : "text-ink/45")}>· {c.class_status}</span>
                                {c.taught && <p className="mt-0.5 truncate text-ink/55">{c.taught}</p>}
                              </div>
                            </div>
                            <button onClick={() => startEdit(c)} className="shrink-0 font-semibold text-[#7A5E0F]">Edit</button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
