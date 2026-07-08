"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Field, Select, TextArea, MoneyField, Toast, Loading, EmptyState, formatMoney } from "@/components/portal/kit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadRoster } from "@/lib/supabase/roster";
import type { StudentStat } from "@/lib/supabase/types";

const CYCLES = ["-", "Monthly", "Quarterly", "Half-yearly", "One-time"];
const PAY_STATUS = ["Received", "Pending", "Partial"];
const MODES = ["Secure gateway", "Other"];
const today = () => new Date().toISOString().slice(0, 10);

export default function PaymentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentStat[] | null>(null);
  const [sid, setSid] = useState("");
  const [f, setF] = useState<Record<string, string>>({ payment_date: today(), payment_status: "Received", payment_mode: "Secure gateway" });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadRoster().then(({ rows }) => setStudents(rows));
  }, []);

  const picked = useMemo(() => students?.find((s) => s.student_id === sid) || null, [students, sid]);
  const amount = Number(f.amount_paid || 0);

  async function save() {
    if (!sid) { setToast({ kind: "error", message: "Pick a student." }); return; }
    if (!amount || amount <= 0) { setToast({ kind: "error", message: "Enter the amount paid." }); return; }
    if ((f.payment_mode || "Secure gateway") === "Secure gateway" && !f.cashfree_bill_no) {
      setToast({ kind: "error", message: "Enter the payment / bill reference number." }); return;
    }
    setBusy(true);
    const { data: u } = await getSupabase().auth.getUser();
    const uid = u.user?.id;
    if (!uid) { setBusy(false); setToast({ kind: "error", message: "Session expired." }); return; }
    // teacher_share / company_share are DB-generated - we never send them.
    const { error } = await getSupabase().from("payments").insert({
      teacher_id: uid,
      student_id: sid,
      payment_date: f.payment_date,
      billing_cycle: f.billing_cycle || null,
      fee_quoted: picked?.fee_quoted ?? null,
      amount_paid: amount,
      payment_status: f.payment_status || "Received",
      payment_mode: f.payment_mode || "Secure gateway",
      cashfree_bill_no: f.cashfree_bill_no || null,
      txn_reference: f.txn_reference || null,
      notes: f.notes || null,
    });
    setBusy(false);
    if (error) { setToast({ kind: "error", message: error.message }); return; }
    setToast({ kind: "success", message: "Payment recorded." });
    setTimeout(() => router.push("/teacher/dashboard"), 700);
  }

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="Add Payment">
      {!students ? <Loading /> : students.length === 0 ? (
        <EmptyState title="No students yet" hint="Add a student before recording a payment." />
      ) : (
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Student <span className="text-[#7A5E0F]">*</span></span>
            <select value={sid} onChange={(e) => setSid(e.target.value)}
              className="w-full rounded-xl border border-hairline bg-white px-4 py-3.5 text-base focus-visible:outline-2 focus-visible:outline-gold focus:outline-none">
              <option value="">Select a student…</option>
              {students.map((s) => <option key={s.student_id} value={s.student_id}>{s.name}</option>)}
            </select>
          </label>

          {picked && (
            <p className="rounded-xl bg-mist px-4 py-3 text-sm text-ink/70">
              Office fee for {picked.name}: <b className="text-ink">{picked.fee_quoted ? formatMoney(picked.fee_quoted) : "not set yet"}</b>
            </p>
          )}

          <Field label="Payment date" req type="date" value={f.payment_date || ""} onChange={(v) => set("payment_date", v)} />
          <Select label="Billing cycle" value={f.billing_cycle || "-"} onChange={(v) => set("billing_cycle", v)} options={CYCLES} />
          <MoneyField label="Amount paid" req value={f.amount_paid || ""} onChange={(v) => set("amount_paid", v)} />

          <Select label="Payment status" value={f.payment_status || "Received"} onChange={(v) => set("payment_status", v)} options={PAY_STATUS} />
          <Select label="Payment mode" value={f.payment_mode || "Secure gateway"} onChange={(v) => set("payment_mode", v)} options={MODES} />
          <Field label="Payment / bill reference no." value={f.cashfree_bill_no || ""} onChange={(v) => set("cashfree_bill_no", v)} placeholder="From the payment receipt" />
          <Field label="Transaction reference" value={f.txn_reference || ""} onChange={(v) => set("txn_reference", v)} />
          <TextArea label="Notes" value={f.notes || ""} onChange={(v) => set("notes", v)} />

          <p className="text-xs text-ink/60">Parents pay only via the company&apos;s secure payment link - you just record the confirmation here.</p>

          <button disabled={busy} onClick={save}
            className="w-full rounded-full bg-ink py-4 text-base font-semibold text-paper shadow-card disabled:opacity-60">
            {busy ? "Saving…" : "Record payment"}
          </button>
        </div>
      )}
      {toast && <Toast kind={toast.kind} message={toast.message} />}
    </PortalShell>
  );
}
