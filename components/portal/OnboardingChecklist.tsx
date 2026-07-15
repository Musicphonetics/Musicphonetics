"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { logAudit } from "@/lib/audit";
import type { TeacherOnboardingItem, OnboardingStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

// Default onboarding items. Required-before-assignment items gate a clean roster.
const DEFAULTS: { key: string; label: string; required: boolean }[] = [
  { key: "profile_photo", label: "Profile photo", required: false },
  { key: "legal_name", label: "Legal name", required: true },
  { key: "phone", label: "Phone", required: true },
  { key: "address", label: "Address", required: true },
  { key: "instruments", label: "Instruments", required: true },
  { key: "regions", label: "Regions", required: false },
  { key: "experience", label: "Experience", required: false },
  { key: "qualifications", label: "Qualifications", required: false },
  { key: "biography", label: "Biography", required: false },
  { key: "bank_account", label: "Bank account", required: true },
  { key: "ifsc", label: "IFSC", required: true },
  { key: "upi", label: "UPI", required: false },
  { key: "pan", label: "PAN", required: true },
  { key: "identity", label: "Identity verification", required: true },
  { key: "safeguarding", label: "Safeguarding declaration", required: true },
  { key: "joining_agreement", label: "Joining Agreement acknowledgement", required: true },
  { key: "demo_video", label: "Demo / performance link", required: false },
  { key: "availability", label: "Availability", required: false },
  { key: "signature", label: "Signature / typed acknowledgement", required: true },
];

const DONE: OnboardingStatus[] = ["approved", "not_required"];

export function OnboardingChecklist({ mode, teacherId }: { mode: "teacher" | "owner"; teacherId: string }) {
  const [items, setItems] = useState<TeacherOnboardingItem[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const { data, error } = await getSupabase().from("teacher_onboarding_items").select("*").eq("teacher_id", teacherId);
    if (error) { setErr(error.message); setItems([]); return; }
    let rows = (data as TeacherOnboardingItem[]) ?? [];
    if (rows.length === 0 && mode === "teacher") {
      const seed = DEFAULTS.map((d) => ({ teacher_id: teacherId, item_key: d.key, label: d.label, required_before_assignment: d.required, status: "pending" as OnboardingStatus }));
      const { error: e2 } = await getSupabase().from("teacher_onboarding_items").insert(seed);
      if (!e2) { const r = await getSupabase().from("teacher_onboarding_items").select("*").eq("teacher_id", teacherId); rows = (r.data as TeacherOnboardingItem[]) ?? []; }
    }
    rows.sort((a, b) => DEFAULTS.findIndex((d) => d.key === a.item_key) - DEFAULTS.findIndex((d) => d.key === b.item_key));
    setItems(rows);
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [teacherId, mode]);

  async function setStatus(it: TeacherOnboardingItem, status: OnboardingStatus, rejection_reason?: string) {
    setBusy(it.id);
    // The DB trigger enforces field-level rules; we send only what each role owns.
    // Teacher may submit; owner records the review decision + reviewer.
    let payload: Record<string, unknown>;
    if (mode === "owner") {
      const { data } = await getSupabase().auth.getUser();
      payload = { status, rejection_reason: rejection_reason ?? null, reviewed_by: data.user?.id ?? null, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    } else {
      payload = { status, updated_at: new Date().toISOString() };
    }
    await getSupabase().from("teacher_onboarding_items").update(payload).eq("id", it.id);
    if (mode === "owner") logAudit({ action: "onboarding_reviewed", teacher_id: teacherId, entity_type: "onboarding_item", entity_id: it.id, summary: `${it.label}: ${status}` });
    setBusy(null); load();
  }

  if (!items) return <div className="rounded-2xl border border-hairline bg-white p-4 text-sm text-ink/50">Loading checklist…</div>;

  const total = items.length || DEFAULTS.length;
  const done = items.filter((i) => DONE.includes(i.status)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const missingRequired = items.filter((i) => i.required_before_assignment && !DONE.includes(i.status));

  return (
    <div className="rounded-2xl border border-hairline bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-base font-semibold text-ink">Onboarding checklist</p>
        <span className="text-sm font-semibold text-[#7A5E0F]">{pct}%</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-mist">
        <div className="h-full rounded-full bg-gradient-to-r from-gold to-deep-gold" style={{ width: `${pct}%` }} />
      </div>
      {err && <p className="mt-2 text-xs text-red-600">{err} — run the operations upgrade migration.</p>}
      {mode === "owner" && missingRequired.length > 0 && (
        <p className="mt-2 rounded-lg bg-gold/10 px-3 py-2 text-xs font-semibold text-[#7A5E0F]">Missing before assignment: {missingRequired.map((i) => i.label).join(", ")}</p>
      )}

      <div className="mt-3 divide-y divide-hairline">
        {items.map((it) => (
          <div key={it.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{it.label}{it.required_before_assignment && <span className="ml-1 text-[10px] font-semibold uppercase text-[#7A5E0F]">required</span>}</p>
              {it.status === "rejected" && it.rejection_reason && <p className="text-xs text-red-600">Rejected: {it.rejection_reason}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Badge status={it.status} />
              {mode === "teacher" && it.status !== "approved" && it.status !== "submitted" && (
                <button disabled={busy === it.id} onClick={() => setStatus(it, "submitted")} className="rounded-full border border-hairline px-3 py-1 text-xs font-semibold text-ink/70 disabled:opacity-50">Mark done</button>
              )}
              {mode === "owner" && it.status !== "approved" && (
                <>
                  <button disabled={busy === it.id} onClick={() => setStatus(it, "approved")} className="rounded-full bg-feature-green/15 px-3 py-1 text-xs font-semibold text-feature-green disabled:opacity-50">Approve</button>
                  <button disabled={busy === it.id} onClick={() => { const r = window.prompt("Reason for rejection?") || ""; setStatus(it, "rejected", r); }} className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 disabled:opacity-50">Reject</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Convenience wrapper for the signed-in teacher (fetches their own id).
export function TeacherOnboardingSelf() {
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => { getSupabase().auth.getUser().then(({ data }) => setUid(data.user?.id ?? null)); }, []);
  if (!uid) return null;
  return <OnboardingChecklist mode="teacher" teacherId={uid} />;
}

function Badge({ status }: { status: OnboardingStatus }) {
  const map: Record<OnboardingStatus, string> = {
    pending: "bg-ink/5 text-ink/55", submitted: "bg-gold/15 text-[#7A5E0F]", approved: "bg-feature-green/12 text-feature-green",
    rejected: "bg-red-500/10 text-red-600", not_required: "bg-ink/5 text-ink/45",
  };
  return <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", map[status])}>{status.replace(/_/g, " ")}</span>;
}
