"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading, formatMoney, Field, Select, MoneyField, Toast } from "@/components/portal/kit";
import { OwnerTable, type Col } from "@/components/portal/OwnerTable";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";
import { loadOwnerData } from "@/lib/supabase/owner";
import type { Student } from "@/lib/supabase/types";

interface Row extends Record<string, unknown> {
  date: string; student: string; teacher: string; amount: number;
  teacher70: number; company30: number; status: string; bill: string;
}

export default function OwnerPayments() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const reload = () => loadOwnerData().then((d) => {
    setErr(d.error);
    setStudents(d.students);
    const tName = new Map(d.teachers.map((t) => [t.id, t.full_name || "-"]));
    const sName = new Map(d.students.map((s) => [s.id, s.name]));
    setRows(d.payments.map((p) => ({
      date: p.payment_date, student: sName.get(p.student_id) ?? "-", teacher: tName.get(p.teacher_id) ?? "-",
      amount: p.amount_paid, teacher70: p.teacher_share, company30: p.company_share,
      status: p.payment_status, bill: p.cashfree_bill_no ?? "-",
    })));
  });

  useEffect(() => { if (isSupabaseConfigured()) reload(); }, []);

  const cols: Col<Row>[] = [
    { key: "date", label: "Date" },
    { key: "student", label: "Student" },
    { key: "teacher", label: "Teacher" },
    { key: "amount", label: "Amount", render: (r) => formatMoney(r.amount), csv: (r) => r.amount },
    { key: "teacher70", label: "Teacher 70%", render: (r) => formatMoney(r.teacher70), csv: (r) => r.teacher70 },
    { key: "company30", label: "Company 30%", render: (r) => formatMoney(r.company30), csv: (r) => r.company30 },
    { key: "status", label: "Status" },
    { key: "bill", label: "Payment reference" },
  ];

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Payments">
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!rows ? <Loading /> : (
        <div className="space-y-6">
          <RecordPayment students={students} onDone={reload} />
          <OwnerTable rows={rows} cols={cols} searchKeys={["student", "teacher", "bill", "status"]} filename="payments" title="payments" />
        </div>
      )}
    </PortalShell>
  );
}

const CYCLES = ["-", "Monthly", "Advance (multiple months)", "Quarterly", "One-time"];
const MODES = ["Cash", "UPI", "Bank transfer", "Secure gateway", "Other"];
const today = () => new Date().toISOString().slice(0, 10);

function RecordPayment({ students, onDone }: { students: Student[]; onDone: () => void }) {
  const [sid, setSid] = useState("");
  const [f, setF] = useState<Record<string, string>>({ payment_date: today(), payment_status: "Received", payment_mode: "UPI", billing_cycle: "Monthly" });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const picked = students.find((s) => s.id === sid) || null;
  const amt = Number(f.amount_paid || 0);
  const fee = picked?.fee_quoted || 0;
  const cpm = picked?.classes_per_month || 8;
  const classesBought = fee > 0 && amt > 0 ? Math.round((amt / fee) * cpm) : 0;

  async function save() {
    if (!sid) { setToast({ kind: "error", message: "Pick a student." }); return; }
    if (!amt || amt <= 0) { setToast({ kind: "error", message: "Enter the amount received." }); return; }
    setBusy(true);
    const { data, error } = await getSupabase().rpc("mp_record_payment", {
      p: {
        student_id: sid, amount_paid: String(amt), payment_date: f.payment_date,
        billing_cycle: f.billing_cycle === "-" ? "" : f.billing_cycle,
        payment_status: f.payment_status, payment_mode: f.payment_mode, notes: f.notes || "",
      },
    });
    setBusy(false);
    if (error || (data && (data as { ok?: boolean }).ok === false)) {
      setToast({ kind: "error", message: error?.message || "Could not record." }); return;
    }
    setToast({ kind: "success", message: `Recorded ${amt ? "₹" + amt.toLocaleString("en-IN") : "payment"}${classesBought ? ` · ${classesBought} classes` : ""}.` });
    setF({ payment_date: today(), payment_status: "Received", payment_mode: "UPI", billing_cycle: "Monthly" });
    setSid("");
    onDone();
  }

  return (
    <div className="rounded-2xl border border-hairline bg-white p-5 shadow-card">
      <h2 className="font-display text-lg font-bold text-ink">Record a payment (incl. advance)</h2>
      <p className="mt-1 text-sm text-ink/60">Record any amount a parent pays, one month, or several in advance. The parent&rsquo;s portal updates instantly with classes bought and remaining.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Student *</span>
          <select value={sid} onChange={(e) => setSid(e.target.value)} className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-base focus:outline-none focus-visible:outline-2 focus-visible:outline-gold">
            <option value="">Select…</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <Field label="Payment date" type="date" value={f.payment_date || ""} onChange={(v) => set("payment_date", v)} />
        <MoneyField label="Amount received" value={f.amount_paid || ""} onChange={(v) => set("amount_paid", v)} />
        <Select label="Type" value={f.billing_cycle || "Monthly"} onChange={(v) => set("billing_cycle", v)} options={CYCLES} />
        <Select label="Mode" value={f.payment_mode || "UPI"} onChange={(v) => set("payment_mode", v)} options={MODES} />
        <Field label="Note (optional)" value={f.notes || ""} onChange={(v) => set("notes", v)} placeholder="e.g. 2 months advance" />
      </div>
      {picked && amt > 0 && fee > 0 && (
        <p className="mt-3 rounded-xl bg-mist px-4 py-2.5 text-sm text-ink/75">
          {picked.name}: <b className="text-ink">₹{amt.toLocaleString("en-IN")}</b> buys <b className="text-[#7A5E0F]">{classesBought} classes</b> ({formatMoney(fee)} = {cpm} classes).
        </p>
      )}
      <button onClick={save} disabled={busy} className="mt-4 rounded-full bg-ink px-7 py-3 text-sm font-semibold text-paper disabled:opacity-60">
        {busy ? "Recording…" : "Record payment"}
      </button>
      {toast && <Toast kind={toast.kind} message={toast.message} />}
    </div>
  );
}
