"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Field, TextArea, Toast, Loading } from "@/components/portal/kit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth, signOut } from "@/lib/supabase/auth";
import type { Profile, TeacherPrivateDetails } from "@/lib/supabase/types";
import {
  validPhone, validPAN, validIFSC, validUPI, validURL, validPIN, validAccount, MIN_BIO,
  maskAccount, maskPan,
} from "@/lib/teacher-profile";
import { cn } from "@/lib/utils";

const SAFEGUARDING_VERSION = "v1-2026";
const AGREEMENT_VERSION = "v1-2026";
const arrToStr = (a?: string[] | null) => (a || []).join(", ");
const strToArr = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

type F = Record<string, string>;

export default function TeacherProfile() {
  const { profile, loading } = useAuth();
  const uid = profile?.id;
  const [f, setF] = useState<F>({});
  const [priv, setPriv] = useState<{ bank_account_number: string; pan: string; identity_proof_path: string; pan_proof_path: string; bank_proof_path: string }>(
    { bank_account_number: "", pan: "", identity_proof_path: "", pan_proof_path: "", bank_proof_path: "" });
  const [safeAck, setSafeAck] = useState(false);
  const [agreeAck, setAgreeAck] = useState(false);
  const [availCount, setAvailCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!profile || !uid) return;
    const p = profile as Profile;
    setF({
      legal_name: p.legal_name || p.full_name || "",
      full_name: p.full_name || "",
      phone: p.phone || "",
      alternate_phone: p.alternate_phone || "",
      email: p.email || "",
      dob: p.dob || "",
      address_line_1: p.address_line_1 || "",
      address_line_2: p.address_line_2 || "",
      city: p.city || "",
      state: p.state || "",
      postal_code: p.postal_code || "",
      instruments: arrToStr(p.instruments),
      primary_instrument: p.primary_instrument || "",
      teaching_levels: arrToStr(p.teaching_levels),
      preferred_modes: arrToStr(p.preferred_modes),
      regions: arrToStr(p.regions),
      experience_years: p.experience_years != null ? String(p.experience_years) : "",
      qualifications: p.qualifications || "",
      certifications: p.certifications || "",
      languages: p.languages || "",
      short_bio: p.short_bio || "",
      full_biography: p.full_biography || "",
      demo_video_url: p.demo_video_url || "",
      photo_url: p.photo_url || "",
      bank_account_holder: p.bank_account_holder || "",
      bank_name: p.bank_name || "",
      bank_branch: p.bank_branch || "",
      ifsc: p.ifsc || "",
      upi_id: p.upi_id || "",
      account_confirm: "",
    });
    setSafeAck(!!p.safeguarding_acknowledged_at);
    setAgreeAck(!!p.joining_agreement_acknowledged_at);
    if (p.typed_signature) setF((s) => ({ ...s, typed_signature: p.typed_signature || "" }));

    const sb = getSupabase();
    sb.from("teacher_private_details").select("*").eq("teacher_id", uid).maybeSingle()
      .then(({ data }) => {
        const d = data as TeacherPrivateDetails | null;
        if (d) setPriv({
          bank_account_number: d.bank_account_number || "",
          pan: d.pan || "",
          identity_proof_path: d.identity_proof_path || "",
          pan_proof_path: d.pan_proof_path || "",
          bank_proof_path: d.bank_proof_path || "",
        });
      });
    sb.from("teacher_availability").select("id", { count: "exact", head: true }).eq("teacher_id", uid).eq("active", true)
      .then(({ count }) => setAvailCount(count ?? 0));
    // Deep-link ?section=…
    const section = new URLSearchParams(window.location.search).get("section");
    if (section) setTimeout(() => document.getElementById(`sec-${section}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    setReady(true);
  }, [profile, uid]);

  // Inline validation (only for fields the teacher actually filled in).
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (f.phone && !validPhone(f.phone)) e.phone = "Enter a 10-digit Indian mobile number.";
    if (f.alternate_phone && !validPhone(f.alternate_phone)) e.alternate_phone = "Enter a valid 10-digit number.";
    if (f.postal_code && !validPIN(f.postal_code)) e.postal_code = "PIN must be 6 digits.";
    if (f.experience_years && (!/^\d+$/.test(f.experience_years) || Number(f.experience_years) < 0)) e.experience_years = "Enter a non-negative number.";
    if (f.demo_video_url && !validURL(f.demo_video_url)) e.demo_video_url = "Enter a valid https link.";
    if (f.ifsc && !validIFSC(f.ifsc)) e.ifsc = "Format: ABCD0123456.";
    if (f.upi_id && !validUPI(f.upi_id)) e.upi_id = "Format: name@bank.";
    if (priv.bank_account_number && !validAccount(priv.bank_account_number)) e.bank_account_number = "Enter a valid account number.";
    if (priv.bank_account_number && f.account_confirm !== priv.bank_account_number) e.account_confirm = "Account numbers do not match.";
    if (priv.pan && !validPAN(priv.pan)) e.pan = "Format: ABCDE1234F.";
    if (f.full_biography && f.full_biography.length > 0 && f.full_biography.length < MIN_BIO) e.full_biography = `At least ${MIN_BIO} characters for a meaningful bio (${f.full_biography.length}/${MIN_BIO}).`;
    return e;
  }, [f, priv]);

  async function uploadEvidence(file: File, kind: "identity" | "pan" | "bank") {
    if (!uid) return;
    if (file.size > 5 * 1024 * 1024) { setToast({ kind: "error", message: "File must be under 5 MB." }); return; }
    if (!/^(image\/(png|jpe?g|webp)|application\/pdf)$/.test(file.type)) { setToast({ kind: "error", message: "Use a PNG, JPG or PDF." }); return; }
    const ext = file.name.split(".").pop() || "dat";
    const path = `${uid}/${kind}-${Date.now()}.${ext}`;
    const { error } = await getSupabase().storage.from("teacher-evidence").upload(path, file, { upsert: true });
    if (error) { setToast({ kind: "error", message: `Upload failed: ${error.message}` }); return; }
    setPriv((p) => ({ ...p, [`${kind === "identity" ? "identity_proof" : kind === "pan" ? "pan_proof" : "bank_proof"}_path`]: path }));
    setToast({ kind: "success", message: "Uploaded. Save your profile to submit it for review." });
  }

  async function save() {
    if (!isSupabaseConfigured() || !uid) return;
    if (Object.keys(errors).length) { setToast({ kind: "error", message: "Please fix the highlighted fields first." }); return; }
    setBusy(true);
    const nowIso = new Date().toISOString();

    // Non-secret / masked parts → profiles. Full secrets → teacher_private_details.
    const acctDigits = priv.bank_account_number.replace(/\D/g, "");
    const profilePatch: Record<string, unknown> = {
      legal_name: f.legal_name || null,
      full_name: f.full_name || f.legal_name || null,
      phone: f.phone || null,
      alternate_phone: f.alternate_phone || null,
      dob: f.dob || null,
      address_line_1: f.address_line_1 || null,
      address_line_2: f.address_line_2 || null,
      city: f.city || null,
      state: f.state || null,
      postal_code: f.postal_code || null,
      instruments: strToArr(f.instruments),
      primary_instrument: f.primary_instrument || null,
      teaching_levels: strToArr(f.teaching_levels),
      preferred_modes: strToArr(f.preferred_modes),
      regions: strToArr(f.regions),
      experience_years: f.experience_years ? Number(f.experience_years) : null,
      qualifications: f.qualifications || null,
      certifications: f.certifications || null,
      languages: f.languages || null,
      short_bio: f.short_bio || null,
      full_biography: f.full_biography || null,
      demo_video_url: f.demo_video_url || null,
      bank_account_holder: f.bank_account_holder || null,
      bank_account_last4: acctDigits ? acctDigits.slice(-4) : null,
      bank_name: f.bank_name || null,
      bank_branch: f.bank_branch || null,
      ifsc: f.ifsc ? f.ifsc.toUpperCase() : null,
      upi_id: f.upi_id || null,
      pan_masked: priv.pan && validPAN(priv.pan) ? maskPan(priv.pan) : null,
      profile_updated_at: nowIso,
    };
    if (safeAck) { profilePatch.safeguarding_acknowledged_at = (profile as Profile).safeguarding_acknowledged_at || nowIso; profilePatch.safeguarding_version = SAFEGUARDING_VERSION; }
    if (agreeAck && (f.typed_signature || "").trim().length >= 2) {
      profilePatch.joining_agreement_acknowledged_at = (profile as Profile).joining_agreement_acknowledged_at || nowIso;
      profilePatch.joining_agreement_version = AGREEMENT_VERSION;
      profilePatch.typed_signature = f.typed_signature.trim();
    }

    const { error: pErr } = await getSupabase().from("profiles").update(profilePatch).eq("id", uid);
    if (pErr) { setBusy(false); setToast({ kind: "error", message: pErr.message }); return; }

    const { error: sErr } = await getSupabase().from("teacher_private_details").upsert({
      teacher_id: uid,
      bank_account_number: priv.bank_account_number || null,
      pan: priv.pan ? priv.pan.toUpperCase() : null,
      identity_proof_path: priv.identity_proof_path || null,
      pan_proof_path: priv.pan_proof_path || null,
      bank_proof_path: priv.bank_proof_path || null,
      updated_at: nowIso,
    }, { onConflict: "teacher_id" });
    if (sErr) { setBusy(false); setToast({ kind: "error", message: sErr.message }); return; }

    // Derive onboarding statuses from the freshly-saved data.
    await getSupabase().rpc("mp_sync_onboarding", { p_teacher_id: null });
    setBusy(false);
    setToast({ kind: "success", message: "Saved. Your checklist has been updated." });
  }

  const err = (k: string) => errors[k] ? <p className="mt-1 text-xs text-red-600">{errors[k]}</p> : null;

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="My Profile">
      {loading || !profile || !ready ? <Loading /> : (
        <div className="space-y-6">
          <p className="text-sm text-ink/60">Enter your details here — your onboarding checklist updates automatically. The office verifies sensitive items.</p>

          <Section id="personal" title="Personal details">
            <UploadRow label="Profile photo" hint={f.photo_url ? "A photo is on file" : "Optional — a clear headshot"} />
            <Field label="Full legal name" value={f.legal_name || ""} onChange={(v) => set("legal_name", v)} />
            <Field label="Display name" value={f.full_name || ""} onChange={(v) => set("full_name", v)} />
            <div className="grid grid-cols-2 gap-3">
              <div><Field label="Phone" inputMode="tel" value={f.phone || ""} onChange={(v) => set("phone", v)} />{err("phone")}</div>
              <div><Field label="Alternate phone" inputMode="tel" value={f.alternate_phone || ""} onChange={(v) => set("alternate_phone", v)} />{err("alternate_phone")}</div>
            </div>
            <Field label="Email (login)" value={f.email || ""} onChange={() => {}} />
            <Field label="Date of birth" type="date" value={f.dob || ""} onChange={(v) => set("dob", v)} />
            <Field label="Address line 1" value={f.address_line_1 || ""} onChange={(v) => set("address_line_1", v)} />
            <Field label="Address line 2" value={f.address_line_2 || ""} onChange={(v) => set("address_line_2", v)} />
            <div className="grid grid-cols-3 gap-3">
              <Field label="City" value={f.city || ""} onChange={(v) => set("city", v)} />
              <Field label="State" value={f.state || ""} onChange={(v) => set("state", v)} />
              <div><Field label="PIN" inputMode="numeric" value={f.postal_code || ""} onChange={(v) => set("postal_code", v)} />{err("postal_code")}</div>
            </div>
          </Section>

          <Section id="teaching" title="Teaching profile">
            <Field label="Instruments (comma-separated)" value={f.instruments || ""} onChange={(v) => set("instruments", v)} />
            <Field label="Primary instrument" value={f.primary_instrument || ""} onChange={(v) => set("primary_instrument", v)} />
            <Field label="Levels taught (comma-separated)" value={f.teaching_levels || ""} onChange={(v) => set("teaching_levels", v)} />
            <Field label="Teaching modes (e.g. Online, Home)" value={f.preferred_modes || ""} onChange={(v) => set("preferred_modes", v)} />
            <Field label="Teaching regions (comma-separated)" value={f.regions || ""} onChange={(v) => set("regions", v)} />
            <div><Field label="Years of experience" inputMode="numeric" value={f.experience_years || ""} onChange={(v) => set("experience_years", v)} />{err("experience_years")}</div>
            <Field label="Languages" value={f.languages || ""} onChange={(v) => set("languages", v)} />
            <TextArea label="Qualifications" value={f.qualifications || ""} onChange={(v) => set("qualifications", v)} />
            <TextArea label="Certifications" value={f.certifications || ""} onChange={(v) => set("certifications", v)} />
            <TextArea label="Short bio (one line)" value={f.short_bio || ""} onChange={(v) => set("short_bio", v)} />
            <div><TextArea label={`Full biography (min ${MIN_BIO} chars)`} value={f.full_biography || ""} onChange={(v) => set("full_biography", v)} />{err("full_biography")}</div>
          </Section>

          <Section id="availability" title="Availability">
            <p className="text-sm text-ink/70">You have <b className="text-ink">{availCount}</b> active availability slot{availCount === 1 ? "" : "s"}.</p>
            <Link href="/teacher/schedule" className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-5 py-2.5 text-sm font-semibold text-ink/80 hover:border-ink/40">
              Manage weekly availability & time off →
            </Link>
          </Section>

          <Section id="banking" title="Payment details" note="Full bank & PAN are stored privately and shown only to the office, masked.">
            <Field label="Account holder name" value={f.bank_account_holder || ""} onChange={(v) => set("bank_account_holder", v)} />
            <div><Field label="Bank account number" inputMode="numeric" value={priv.bank_account_number} onChange={(v) => setPriv((p) => ({ ...p, bank_account_number: v }))} />{err("bank_account_number")}</div>
            <div><Field label="Confirm account number" inputMode="numeric" value={f.account_confirm || ""} onChange={(v) => set("account_confirm", v)} />{err("account_confirm")}</div>
            {priv.bank_account_number && <p className="text-xs text-ink/55">Saved as {maskAccount(priv.bank_account_number)}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div><Field label="IFSC" value={f.ifsc || ""} onChange={(v) => set("ifsc", v.toUpperCase())} />{err("ifsc")}</div>
              <Field label="Bank name" value={f.bank_name || ""} onChange={(v) => set("bank_name", v)} />
            </div>
            <Field label="Branch" value={f.bank_branch || ""} onChange={(v) => set("bank_branch", v)} />
            <div><Field label="UPI ID" value={f.upi_id || ""} onChange={(v) => set("upi_id", v)} />{err("upi_id")}</div>
            <div><Field label="PAN" value={priv.pan} onChange={(v) => setPriv((p) => ({ ...p, pan: v.toUpperCase() }))} />{err("pan")}</div>
            {priv.pan && validPAN(priv.pan) && <p className="text-xs text-ink/55">Saved as {maskPan(priv.pan)}</p>}
          </Section>

          <Section id="compliance" title="Compliance & declarations">
            <UploadRow label="Identity proof" kind="identity" saved={!!priv.identity_proof_path} onFile={uploadEvidence} />
            <UploadRow label="PAN proof" kind="pan" saved={!!priv.pan_proof_path} onFile={uploadEvidence} />
            <UploadRow label="Cancelled cheque / bank proof" kind="bank" saved={!!priv.bank_proof_path} onFile={uploadEvidence} />
            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink/80">
              <input type="checkbox" checked={safeAck} onChange={(e) => setSafeAck(e.target.checked)} className="mt-0.5 h-4 w-4 accent-gold" />
              I accept the Musicphonetics safeguarding &amp; child-protection code.
            </label>
            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink/80">
              <input type="checkbox" checked={agreeAck} onChange={(e) => setAgreeAck(e.target.checked)} className="mt-0.5 h-4 w-4 accent-gold" />
              I have read and agree to the{" "}
              <Link href="/teach-with-us/terms" target="_blank" className="font-semibold text-[#7A5E0F] underline underline-offset-2">Joining Agreement</Link>.
            </label>
            <Field label="Typed signature (your legal name)" value={f.typed_signature || ""} onChange={(v) => set("typed_signature", v)} />
            {agreeAck && (f.typed_signature || "").trim().length < 2 && <p className="text-xs text-red-600">Type your legal name to complete the acknowledgement.</p>}
          </Section>

          <Section id="media" title="Profile media">
            <div><Field label="Demo / performance video link" value={f.demo_video_url || ""} onChange={(v) => set("demo_video_url", v)} />{err("demo_video_url")}</div>
          </Section>

          <button disabled={busy} onClick={save}
            className="w-full rounded-full bg-ink py-4 text-base font-semibold text-paper shadow-card disabled:opacity-60">
            {busy ? "Saving…" : "Save profile"}
          </button>

          <button onClick={() => signOut()} className="w-full rounded-full border border-hairline py-3.5 text-sm font-semibold text-ink/70">
            Sign out
          </button>
        </div>
      )}
      {toast && <Toast kind={toast.kind} message={toast.message} />}
    </PortalShell>
  );
}

function Section({ id, title, note, children }: { id: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section id={`sec-${id}`} className="scroll-mt-20 rounded-2xl border border-hairline bg-white p-4 sm:p-5">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      {note && <p className="mt-0.5 text-xs text-ink/55">{note}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function UploadRow({ label, hint, kind, saved, onFile }: { label: string; hint?: string; kind?: "identity" | "pan" | "bank"; saved?: boolean; onFile?: (file: File, kind: "identity" | "pan" | "bank") => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-paper p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className={cn("text-xs", saved ? "text-feature-green" : "text-ink/55")}>{saved ? "Uploaded — awaiting review" : hint || "PNG, JPG or PDF · under 5 MB"}</p>
      </div>
      {kind && onFile && (
        <label className="shrink-0 cursor-pointer rounded-full border border-hairline bg-white px-4 py-2 text-xs font-semibold text-ink/80 hover:border-ink/40">
          {saved ? "Replace" : "Upload"}
          <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="hidden"
            onChange={(e) => { const file = e.target.files?.[0]; if (file) onFile(file, kind); e.target.value = ""; }} />
        </label>
      )}
    </div>
  );
}
