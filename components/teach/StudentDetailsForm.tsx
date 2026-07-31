"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { Field, Select, TextArea, MoneyField } from "@/components/portal/kit";
import { GENDERS, RELATIONSHIPS, OCCUPATIONS, EXPERIENCE_LEVELS, LEAD_SOURCES, GRADES, ageFromDob } from "@/lib/admission";
import { PLAN_LABEL } from "@/lib/plan";
import { cn } from "@/lib/utils";

const INSTRUMENTS = ["Guitar", "Piano", "Keyboard", "Vocals (Western)", "Vocals (Hindustani)", "Ukulele", "Drums", "Cajon", "Violin", "Music Theory"];
const MODES = ["-", "At home", "Online", "At the centre"];
const STATUS = ["active", "trial", "paused", "completed"];
const opt = (list: readonly string[]) => ["-", ...list];

type Form = Record<string, string>;
const PHOTO_BUCKET = "student-photos";

// The full admission form the teacher fills for each student — captures the
// demographic + operational data that powers the owner Statistics dashboard.
// Works on existing students (edit) as well as freshly-activated ones.
export function StudentDetailsForm({ studentId, onSaved }: { studentId: string; onSaved?: () => void }) {
  const [f, setF] = useState<Form>({});
  const [loaded, setLoaded] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: string, v: string) => { setF((p) => ({ ...p, [k]: v })); setMsg(null); };

  useEffect(() => {
    getSupabase().from("students").select("*").eq("id", studentId).single().then(async ({ data, error }) => {
      if (error) {
        if (/column|does not exist|schema cache/i.test(error.message)) setNeedsMigration(true);
      } else if (data) {
        const row = data as Record<string, unknown>;
        const next: Form = {};
        for (const [k, v] of Object.entries(row)) next[k] = v == null ? "" : String(v);
        setF(next);
        if (row.photo_url) {
          setPhotoPath(String(row.photo_url));
          const { data: signed } = await getSupabase().storage.from(PHOTO_BUCKET).createSignedUrl(String(row.photo_url), 3600);
          if (signed?.signedUrl) setPhotoUrl(signed.signedUrl);
        }
      }
      setLoaded(true);
    });
  }, [studentId]);

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr(null);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${studentId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await getSupabase().storage.from(PHOTO_BUCKET).upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      setPhotoPath(path);
      setPhotoUrl(URL.createObjectURL(file));
      setMsg("Photo added — remember to Save.");
    } catch (e2) {
      setErr(/bucket|not found/i.test((e2 as Error)?.message || "") ? "Photo storage isn't set up yet — run supabase/student_admission_fields.sql." : "Couldn't upload the photo.");
    }
    setUploading(false);
  }

  async function save() {
    setBusy(true); setErr(null); setMsg(null);
    const numOrNull = (v: string) => { const n = Number(v); return v.trim() && Number.isFinite(n) ? n : null; };
    const payload = {
      name: f.name?.trim() || null, gender: f.gender || null, dob: f.dob || null,
      school: f.school || null, school_grade: f.school_grade || null, photo_url: photoPath,
      parent_name: f.parent_name || null, parent_relationship: f.parent_relationship || null,
      parent_occupation: f.parent_occupation || null, parent_phone: f.parent_phone || null,
      parent_email: f.parent_email || null, address: f.address || null, area: f.area || null,
      instrument: f.instrument || null, previous_experience: f.previous_experience || null,
      learning_goal: f.learning_goal || null, class_mode: f.class_mode || null,
      preferred_days: f.preferred_days || null, preferred_time: f.preferred_time || null,
      start_date: f.start_date || null, fee_quoted: numOrNull(f.fee_quoted || ""),
      lead_source: f.lead_source || null, referred_by: f.referred_by || null, status: f.status || "active",
    };
    const { error } = await getSupabase().from("students").update(payload).eq("id", studentId);
    setBusy(false);
    if (error) {
      if (/column|does not exist|schema cache/i.test(error.message)) setNeedsMigration(true);
      else setErr(error.message);
    } else { setMsg("Saved."); onSaved?.(); }
  }

  if (needsMigration) return <p className="mt-3 rounded-lg bg-mist px-3 py-2 text-xs text-ink/70">Run <code className="rounded bg-white px-1">supabase/student_admission_fields.sql</code> once in Supabase to enable the admission form.</p>;
  if (!loaded) return <p className="mt-3 text-xs text-ink/50">Loading…</p>;

  const age = ageFromDob(f.dob);

  return (
    <div className="mt-3 space-y-5">
      <Section title="Student information">
        <div className="flex items-start gap-4">
          <div className="shrink-0 text-center">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border border-hairline bg-mist text-ink/40">
              {photoUrl ? <img src={photoUrl} alt="Student" className="h-full w-full object-cover" /> : <span className="text-2xl">🎓</span>}
            </div>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="mt-1.5 text-[11px] font-semibold text-[#7A5E0F] disabled:opacity-50">{uploading ? "Uploading…" : photoUrl ? "Change" : "Add photo"}</button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <Field label="Full name" req value={f.name || ""} onChange={(v) => set("name", v)} placeholder="Student's full name" />
            <Select label="Gender" value={f.gender || "-"} onChange={(v) => set("gender", v)} options={opt(GENDERS)} />
            <div>
              <Field label="Date of birth" type="date" value={f.dob || ""} onChange={(v) => set("dob", v)} />
              {age != null && <p className="mt-1 text-xs text-ink/60">Age: {age}</p>}
            </div>
            <Field label="School name" value={f.school || ""} onChange={(v) => set("school", v)} />
            <Select label="Class / Grade" value={f.school_grade || "-"} onChange={(v) => set("school_grade", v)} options={opt(GRADES)} />
          </div>
        </div>
      </Section>

      <Section title="Parent / guardian">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Parent / guardian name" value={f.parent_name || ""} onChange={(v) => set("parent_name", v)} />
          <Select label="Relationship" value={f.parent_relationship || "-"} onChange={(v) => set("parent_relationship", v)} options={opt(RELATIONSHIPS)} />
          <Select label="Parent occupation" value={f.parent_occupation || "-"} onChange={(v) => set("parent_occupation", v)} options={opt(OCCUPATIONS)} />
          <Field label="Mobile number" inputMode="tel" value={f.parent_phone || ""} onChange={(v) => set("parent_phone", v)} />
          <Field label="Email" inputMode="email" value={f.parent_email || ""} onChange={(v) => set("parent_email", v)} />
          <Field label="Area / locality" value={f.area || ""} onChange={(v) => set("area", v)} />
          <div className="sm:col-span-2"><Field label="Address" value={f.address || ""} onChange={(v) => set("address", v)} /></div>
        </div>
      </Section>

      <Section title="Music">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Instrument" value={f.instrument || "-"} onChange={(v) => set("instrument", v)} options={opt(INSTRUMENTS)} />
          <Select label="Previous experience" value={f.previous_experience || "-"} onChange={(v) => set("previous_experience", v)} options={opt(EXPERIENCE_LEVELS)} />
          <Select label="Preferred class mode" value={f.class_mode || "-"} onChange={(v) => set("class_mode", v)} options={MODES} />
          <Field label="Preferred days" value={f.preferred_days || ""} onChange={(v) => set("preferred_days", v)} placeholder="e.g. Sat & Sun" />
          <Field label="Preferred time" value={f.preferred_time || ""} onChange={(v) => set("preferred_time", v)} placeholder="e.g. 5:00 PM" />
          <div className="sm:col-span-2"><Field label="Learning goal" value={f.learning_goal || ""} onChange={(v) => set("learning_goal", v)} /></div>
        </div>
      </Section>

      <Section title="Admission / business">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Join date" type="date" value={f.start_date || ""} onChange={(v) => set("start_date", v)} />
          <div>
            <p className="text-xs font-semibold text-ink/60">Package</p>
            <p className="mt-1.5 rounded-lg bg-mist px-3 py-2 text-sm text-ink/70">{f.plan && PLAN_LABEL[f.plan as "foundation" | "main" | "directors"] ? PLAN_LABEL[f.plan as "foundation" | "main" | "directors"] : "Set by office"} <span className="text-[11px] text-ink/45">· set by office</span></p>
          </div>
          <MoneyField label="Monthly fee (office confirms)" value={f.fee_quoted || ""} onChange={(v) => set("fee_quoted", v)} />
          <Select label="Lead source" value={f.lead_source || "-"} onChange={(v) => set("lead_source", v)} options={opt(LEAD_SOURCES)} />
          <Field label="Referred by (optional)" value={f.referred_by || ""} onChange={(v) => set("referred_by", v)} placeholder="Name of who referred them" />
          <Select label="Status" value={f.status || "active"} onChange={(v) => set("status", v)} options={STATUS} />
        </div>
      </Section>

      {err && <p className="text-sm text-red-600">{err}</p>}
      {msg && <p className="text-sm font-semibold text-feature-green">{msg}</p>}
      <button onClick={save} disabled={busy}
        className={cn("w-full rounded-xl py-2.5 text-sm font-semibold text-ink", busy ? "bg-gold/50" : "bg-gold hover:bg-deep-gold")}>
        {busy ? "Saving…" : "Save admission details"}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-hairline bg-white p-3.5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">{title}</p>
      {children}
    </div>
  );
}
