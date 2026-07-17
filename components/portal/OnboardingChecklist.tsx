"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase/client";
import type { TeacherOnboardingItem, TeacherPrivateDetails } from "@/lib/supabase/types";
import { metaFor, statusCopy, completion, STATE_COPY, maskAccount, maskPan } from "@/lib/teacher-profile";
import { cn } from "@/lib/utils";

export function OnboardingChecklist({ mode, teacherId }: { mode: "teacher" | "owner"; teacherId: string }) {
  const [items, setItems] = useState<TeacherOnboardingItem[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  // Owner-only: masked private data + evidence links.
  const [priv, setPriv] = useState<TeacherPrivateDetails | null>(null);
  const [ifsc, setIfsc] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<Record<string, string>>({});
  const [reveal, setReveal] = useState<Record<string, boolean>>({});

  async function load(seedIfEmpty = false) {
    const sb = getSupabase();
    const { data, error } = await sb.from("teacher_onboarding_items").select("*").eq("teacher_id", teacherId);
    if (error) { setErr(error.message); setItems([]); return; }
    let rows = (data as TeacherOnboardingItem[]) ?? [];
    if (rows.length === 0 && seedIfEmpty) {
      // Derive-and-seed from the teacher's real profile data (owner or self only).
      await sb.rpc("mp_sync_onboarding", { p_teacher_id: mode === "owner" ? teacherId : null });
      const r = await sb.from("teacher_onboarding_items").select("*").eq("teacher_id", teacherId);
      rows = (r.data as TeacherOnboardingItem[]) ?? [];
    }
    rows.sort((a, b) => Number(b.required_before_assignment) - Number(a.required_before_assignment));
    setItems(rows);

    if (mode === "owner") {
      const [pd, pr] = await Promise.all([
        sb.from("teacher_private_details").select("*").eq("teacher_id", teacherId).maybeSingle(),
        sb.from("profiles").select("ifsc").eq("id", teacherId).maybeSingle(),
      ]);
      const d = pd.data as TeacherPrivateDetails | null;
      setPriv(d);
      setIfsc((pr.data as { ifsc: string | null } | null)?.ifsc ?? null);
      // Short-lived signed URLs for uploaded evidence.
      const links: Record<string, string> = {};
      for (const [key, path] of [["identity_verification", d?.identity_proof_path], ["bank_proof", d?.bank_proof_path], ["pan", d?.pan_proof_path]] as const) {
        if (path) {
          const { data: sig } = await sb.storage.from("teacher-evidence").createSignedUrl(path, 300);
          if (sig?.signedUrl) links[key] = sig.signedUrl;
        }
      }
      setEvidence(links);
    }
  }
  useEffect(() => { load(true); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [teacherId, mode]);

  async function review(it: TeacherOnboardingItem, status: "approved" | "rejected" | "not_required") {
    setBusy(it.id); setErr(null);
    let reason: string | null = null;
    if (status === "rejected") { reason = window.prompt("Reason for the change request (shown to the teacher):") || ""; if (!reason.trim()) { setBusy(null); return; } }
    const { error } = await getSupabase().rpc("mp_review_onboarding", { p_item_id: it.id, p_status: status, p_reason: reason });
    setBusy(null);
    if (error) { setErr(error.message); return; }
    load();
  }

  if (!items) return <div className="rounded-2xl border border-hairline bg-white p-4 text-sm text-ink/50">Loading checklist…</div>;

  const c = completion(items);
  const state = STATE_COPY[c.state];
  const stateTone = { green: "bg-feature-green/12 text-feature-green", gold: "bg-gold/15 text-[#7A5E0F]", red: "bg-red-500/10 text-red-600", ink: "bg-ink/5 text-ink/60" }[state.tone];

  // Owner sees the actual submitted value (masked) so they never approve blind.
  const ownerValue = (key: string): string | null => {
    if (mode !== "owner") return null;
    if (key === "bank_account") return priv?.bank_account_number ? (reveal[key] ? priv.bank_account_number : maskAccount(priv.bank_account_number)) : null;
    if (key === "pan") return priv?.pan ? (reveal[key] ? priv.pan : maskPan(priv.pan)) : null;
    if (key === "ifsc") return ifsc || null;
    return null;
  };

  return (
    <div className="rounded-2xl border border-hairline bg-white p-4">
      {/* Completion summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-base font-semibold text-ink">Onboarding checklist</p>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", stateTone)}>{state.label}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Meter label="Profile completed" pct={c.profilePct} tone="gold" />
        <Meter label="Verification approved" pct={c.verificationPct} tone="green" />
      </div>
      <p className="mt-2 text-xs text-ink/60">{c.requiredApproved} of {c.requiredTotal} required items approved{c.ready ? " · ready for student assignment" : ""}.</p>
      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}

      <div className="mt-3 divide-y divide-hairline">
        {items.map((it) => {
          const meta = metaFor(it.item_key);
          const sc = statusCopy(it);
          const toneCls = { pending: "text-ink/55", submitted: "text-[#7A5E0F]", approved: "text-feature-green", rejected: "text-red-600", muted: "text-ink/45" }[sc.tone];
          const val = ownerValue(it.item_key);
          const link = evidence[it.item_key];
          return (
            <div key={it.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">
                  {meta.label}
                  {it.required_before_assignment && <span className="ml-1.5 text-[10px] font-semibold uppercase text-[#7A5E0F]">required</span>}
                </p>
                <p className={cn("text-xs", toneCls)}>{sc.label}</p>
                {mode === "owner" && val && (
                  <p className="mt-1 text-xs text-ink/70">
                    Value: <span className="font-mono">{val}</span>
                    {(it.item_key === "bank_account" || it.item_key === "pan") && priv && (
                      <button onClick={() => setReveal((r) => ({ ...r, [it.item_key]: !r[it.item_key] }))} className="ml-2 font-semibold text-[#7A5E0F]">{reveal[it.item_key] ? "Hide" : "Reveal"}</button>
                    )}
                  </p>
                )}
                {mode === "owner" && link && (
                  <a href={link} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-semibold text-[#7A5E0F]">View uploaded evidence →</a>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {mode === "teacher" && it.status !== "approved" && it.status !== "not_required" && it.status !== "submitted" && (
                  <Link href={`/teacher/profile?section=${meta.section}`} className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-paper">
                    {it.status === "rejected" ? "Fix and resubmit" : meta.action}
                  </Link>
                )}
                {mode === "teacher" && it.status === "submitted" && (
                  <Link href={`/teacher/profile?section=${meta.section}`} className="text-xs font-semibold text-ink/50">Edit</Link>
                )}
                {mode === "owner" && it.status !== "approved" && (
                  <>
                    <button disabled={busy === it.id} onClick={() => review(it, "approved")} className="rounded-full bg-feature-green/15 px-3 py-1.5 text-xs font-semibold text-feature-green disabled:opacity-50">Approve</button>
                    <button disabled={busy === it.id} onClick={() => review(it, "rejected")} className="rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600 disabled:opacity-50">Reject</button>
                    <button disabled={busy === it.id} onClick={() => review(it, "not_required")} className="rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-ink/60 disabled:opacity-50">N/A</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Convenience wrapper for the signed-in teacher (their own checklist).
export function TeacherOnboardingSelf() {
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => { getSupabase().auth.getUser().then(({ data }) => setUid(data.user?.id ?? null)); }, []);
  if (!uid) return null;
  return <OnboardingChecklist mode="teacher" teacherId={uid} />;
}

function Meter({ label, pct, tone }: { label: string; pct: number; tone: "gold" | "green" }) {
  const bar = tone === "gold" ? "from-gold to-deep-gold" : "from-feature-green to-emerald-600";
  return (
    <div className="rounded-xl border border-hairline bg-paper p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink/60">{label}</span>
        <span className="font-semibold text-ink">{pct}%</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-mist">
        <div className={cn("h-full rounded-full bg-gradient-to-r", bar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
