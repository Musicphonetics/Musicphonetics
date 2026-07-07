"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Field, Select, TextArea, MoneyField, Toast, Label } from "@/components/portal/kit";
import { getSupabase } from "@/lib/supabase/client";

const INSTRUMENTS = ["Guitar", "Piano", "Keyboard", "Vocals (Western)", "Vocals (Hindustani)", "Ukulele", "Drums", "Cajon", "Violin", "Music Theory"];
const LEVELS = ["—", "Beginner", "Elementary", "Intermediate", "Advanced"];
const MODES = ["—", "At home", "Online", "At the centre"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STATUS = ["active", "trial", "paused"];

function ageFrom(dob: string): string {
  if (!dob) return "";
  const d = new Date(dob); if (isNaN(+d)) return "";
  const diff = Date.now() - d.getTime();
  const yrs = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  return yrs >= 0 && yrs < 120 ? `${yrs} yrs` : "";
}

export default function AddStudent() {
  const router = useRouter();
  const [f, setF] = useState<Record<string, string>>({ status: "active", classes_per_month: "8", instrument: "Guitar" });
  const [days, setDays] = useState<string[]>([]);
  const toggleDay = (d: string) => setDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function save() {
    if (!f.name || f.name.trim().length < 2) { setToast({ kind: "error", message: "Student name is required." }); return; }
    setBusy(true);
    const { data: u } = await getSupabase().auth.getUser();
    const uid = u.user?.id;
    if (!uid) { setBusy(false); setToast({ kind: "error", message: "Session expired — sign in again." }); return; }

    // Teacher's suggested fee is captured in notes; fee_quoted stays owner-only.
    const notes = [
      f.notes?.trim(),
      f.suggested_fee ? `Suggested fee: ₹${Number(f.suggested_fee).toLocaleString("en-IN")}` : "",
    ].filter(Boolean).join(" · ");

    const { error } = await getSupabase().from("students").insert({
      teacher_id: uid,
      name: f.name.trim(),
      dob: f.dob || null,
      school: f.school || null,
      parent_name: f.parent_name || null,
      parent_phone: f.parent_phone || null,
      parent_email: f.parent_email || null,
      area: f.area || null,
      address: f.address || null,
      instrument: f.instrument || null,
      level: f.level || null,
      learning_goal: f.learning_goal || null,
      student_profile: f.student_profile || null,
      class_mode: f.class_mode || null,
      class_day: days.length ? days.join(", ") : null,
      class_time: f.class_time || null,
      classes_per_month: f.classes_per_month ? Number(f.classes_per_month) : 8,
      start_date: f.start_date || null,
      status: f.status || "active",
      media_consent: consent,
      birthday_gift_notes: f.birthday_gift_notes || null,
      notes: notes || null,
    });
    setBusy(false);
    if (error) { setToast({ kind: "error", message: error.message }); return; }
    setToast({ kind: "success", message: "Student added." });
    setTimeout(() => router.push("/teacher/students"), 700);
  }

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="Add Student">
      <div className="space-y-4">
        <Field label="Student name" req value={f.name || ""} onChange={(v) => set("name", v)} placeholder="Full name" />
        <div>
          <Field label="Date of birth" type="date" value={f.dob || ""} onChange={(v) => set("dob", v)} />
          {ageFrom(f.dob || "") && <p className="mt-1 text-xs text-ink/60">Age: {ageFrom(f.dob || "")}</p>}
        </div>
        <Field label="School / College" value={f.school || ""} onChange={(v) => set("school", v)} />

        <SectionTitle>Parent / guardian</SectionTitle>
        <Field label="Parent name" value={f.parent_name || ""} onChange={(v) => set("parent_name", v)} />
        <Field label="Parent phone" inputMode="tel" value={f.parent_phone || ""} onChange={(v) => set("parent_phone", v)} />
        <Field label="Parent email" inputMode="email" value={f.parent_email || ""} onChange={(v) => set("parent_email", v)} />
        <Field label="Area" value={f.area || ""} onChange={(v) => set("area", v)} />
        <Field label="Address" value={f.address || ""} onChange={(v) => set("address", v)} />

        <SectionTitle>Learning</SectionTitle>
        <Select label="Instrument" value={f.instrument || "Guitar"} onChange={(v) => set("instrument", v)} options={INSTRUMENTS} />
        <Select label="Level" value={f.level || "—"} onChange={(v) => set("level", v)} options={LEVELS} />
        <Field label="Learning goal" value={f.learning_goal || ""} onChange={(v) => set("learning_goal", v)} />
        <TextArea label="Student profile" value={f.student_profile || ""} onChange={(v) => set("student_profile", v)} />

        <SectionTitle>Schedule</SectionTitle>
        <Select label="Class mode" value={f.class_mode || "—"} onChange={(v) => set("class_mode", v)} options={MODES} />
        <div>
          <Label>Class days <span className="font-normal text-ink/55">(select all that apply)</span></Label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => {
              const on = days.includes(d);
              return (
                <button key={d} type="button" onClick={() => toggleDay(d)} aria-pressed={on}
                  className={
                    "min-h-[42px] rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-gold " +
                    (on ? "border-deep-gold bg-gold/15 text-ink" : "border-hairline bg-white text-ink/70 hover:border-ink/40")
                  }>
                  {d}
                </button>
              );
            })}
          </div>
          {days.length > 0 && (
            <p className="mt-1.5 text-xs text-ink/60">{days.length}× per week · ~{days.length * 4} classes/month</p>
          )}
        </div>
        <Field label="Class time" value={f.class_time || ""} onChange={(v) => set("class_time", v)} placeholder="e.g. 5:00 PM" />
        <Field label="Classes per month" inputMode="numeric" value={f.classes_per_month || ""} onChange={(v) => set("classes_per_month", v)} />
        <Field label="Start date" type="date" value={f.start_date || ""} onChange={(v) => set("start_date", v)} />

        <SectionTitle>Fee &amp; status</SectionTitle>
        <MoneyField label="Suggested monthly fee (office confirms)" value={f.suggested_fee || ""} onChange={(v) => set("suggested_fee", v)} />
        <p className="-mt-2 text-xs text-ink/60">The final fee is set by the Musicphonetics office.</p>
        <Select label="Student status" value={f.status || "active"} onChange={(v) => set("status", v)} options={STATUS} />

        <label className="flex items-center gap-3 rounded-xl border border-hairline bg-white px-4 py-3">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="h-5 w-5 accent-gold" />
          <span className="text-sm text-ink/80">Media consent given by parent</span>
        </label>
        <TextArea label="Birthday / gift notes" value={f.birthday_gift_notes || ""} onChange={(v) => set("birthday_gift_notes", v)} />
        <TextArea label="Important notes" value={f.notes || ""} onChange={(v) => set("notes", v)} />

        <button disabled={busy} onClick={save}
          className="mt-2 w-full rounded-full bg-ink py-4 text-base font-semibold text-paper shadow-card disabled:opacity-60">
          {busy ? "Saving…" : "Save student"}
        </button>
      </div>
      {toast && <Toast kind={toast.kind} message={toast.message} />}
    </PortalShell>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">{children}</p>;
}
