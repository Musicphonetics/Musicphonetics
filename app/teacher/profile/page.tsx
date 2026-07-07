"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Field, TextArea, Toast, Loading } from "@/components/portal/kit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth, signOut } from "@/lib/supabase/auth";

export default function TeacherProfile() {
  const { profile, loading } = useAuth();
  const [f, setF] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (profile) {
      setF({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        email: profile.email || "",
        instruments: (profile.instruments || []).join(", "),
        regions: (profile.regions || []).join(", "),
        experience_years: profile.experience_years != null ? String(profile.experience_years) : "",
        qualifications: profile.qualifications || "",
        bank_upi: profile.bank_upi || "",
      });
    }
  }, [profile]);

  async function save() {
    if (!isSupabaseConfigured() || !profile) return;
    setBusy(true);
    const { error } = await getSupabase().from("profiles").update({
      full_name: f.full_name || null,
      phone: f.phone || null,
      instruments: f.instruments ? f.instruments.split(",").map((s) => s.trim()).filter(Boolean) : [],
      regions: f.regions ? f.regions.split(",").map((s) => s.trim()).filter(Boolean) : [],
      experience_years: f.experience_years ? Number(f.experience_years) : null,
      qualifications: f.qualifications || null,
      bank_upi: f.bank_upi || null,
    }).eq("id", profile.id);
    setBusy(false);
    setToast(error ? { kind: "error", message: error.message } : { kind: "success", message: "Profile saved." });
  }

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="My Profile">
      {loading || !profile ? <Loading /> : (
        <div className="space-y-4">
          <Field label="Full name" value={f.full_name || ""} onChange={(v) => set("full_name", v)} />
          <Field label="Phone" inputMode="tel" value={f.phone || ""} onChange={(v) => set("phone", v)} />
          <Field label="Email" value={f.email || ""} onChange={() => {}} />
          <Field label="Instruments (comma-separated)" value={f.instruments || ""} onChange={(v) => set("instruments", v)} />
          <Field label="Regions (comma-separated)" value={f.regions || ""} onChange={(v) => set("regions", v)} />
          <Field label="Experience (years)" inputMode="numeric" value={f.experience_years || ""} onChange={(v) => set("experience_years", v)} />
          <TextArea label="Qualifications" value={f.qualifications || ""} onChange={(v) => set("qualifications", v)} />
          <Field label="Bank / UPI (for payouts)" value={f.bank_upi || ""} onChange={(v) => set("bank_upi", v)} />

          <button disabled={busy} onClick={save}
            className="w-full rounded-full bg-ink py-4 text-base font-semibold text-paper shadow-card disabled:opacity-60">
            {busy ? "Saving…" : "Save profile"}
          </button>

          <div className="mt-6 rounded-2xl border border-hairline bg-white p-4 text-center">
            <p className="text-xs text-ink/60">Payouts are managed by the Musicphonetics office.</p>
          </div>

          <button onClick={() => signOut()} className="w-full rounded-full border border-hairline py-3.5 text-sm font-semibold text-ink/70">
            Sign out
          </button>
        </div>
      )}
      {toast && <Toast kind={toast.kind} message={toast.message} />}
    </PortalShell>
  );
}
