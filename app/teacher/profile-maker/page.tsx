"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Loading, Field, TextArea } from "@/components/portal/kit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadMyProfile, submitProfile, aiBio, EMPTY_PROFILE, type TeacherProfile } from "@/lib/profile";
import { cn } from "@/lib/utils";

const BUCKET = "teacher-photos";

export default function ProfileMaker() {
  const [p, setP] = useState<TeacherProfile>(EMPTY_PROFILE);
  const [about, setAbout] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [freeUsed, setFreeUsed] = useState(false);
  const [genBusy, setGenBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof TeacherProfile, v: string) => { setP((s) => ({ ...s, [k]: v })); setMsg(null); };

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoaded(true); return; }
    loadMyProfile().then((row) => {
      if (row) { setP(row); setStatus(row.status || ""); setSlug(row.slug || ""); setFreeUsed(!!row.free_edit_used); }
      setLoaded(true);
    });
  }, []);

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${session?.user?.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await getSupabase().storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = getSupabase().storage.from(BUCKET).getPublicUrl(path);
      set("photo_url", data.publicUrl);
      setMsg("Photo added, remember to Save.");
    } catch {
      setErr("Couldn't upload the photo. If this keeps happening, run the profiles SQL.");
    }
  }

  async function generate() {
    setGenBusy(true); setErr(null); setMsg(null);
    try {
      const out = await aiBio({
        name: p.name, instruments: p.instruments, experience_years: p.experience_years, location: p.location,
        specialties: p.specialties, qualifications: p.qualifications, achievements: p.achievements,
        age_group: p.age_group, languages: p.languages, approach: p.approach, about, advice: p.advice,
      });
      setP((s) => ({ ...s, headline: out.headline || s.headline, bio: out.bio || s.bio }));
      setMsg("Bio drafted, review and edit, then Save.");
    } catch (e) { setErr(e instanceof Error ? e.message : "Couldn't write the bio."); }
    setGenBusy(false);
  }

  async function save() {
    if (!p.name.trim()) { setErr("Please add your name."); return; }
    setBusy(true); setErr(null); setMsg(null);
    const res = await submitProfile(p);
    setBusy(false);
    if ("error" in res) { setErr(res.error); return; }
    setStatus(res.status); setSlug(res.slug);
    setMsg(res.status === "published" ? "Saved and published! Your public profile is live." : "Saved. Sent to the office for approval.");
  }

  if (!loaded) return <PortalShell role="teacher" tabs={TEACHER_TABS} title="My public profile"><Loading /></PortalShell>;

  const published = status === "published";
  const pending = status === "pending";

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="My public profile">
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Status banner */}
        <div className={cn("rounded-2xl border p-4", published ? "border-feature-green/40 bg-feature-green/[0.06]" : pending ? "border-gold/40 bg-gold/[0.06]" : "border-hairline bg-white")}>
          {published ? (
            <p className="text-sm text-ink"><b className="text-feature-green">Live.</b> Your profile is public.{slug && <> <Link href={`/faculty?id=${slug}`} target="_blank" className="font-semibold text-[#7A5E0F] underline">View it →</Link></>}</p>
          ) : pending ? (
            <p className="text-sm text-ink"><b className="text-[#7A5E0F]">Awaiting approval.</b> Your update is with the office; it goes live once approved.</p>
          ) : (
            <p className="text-sm text-ink/70">Fill the questionnaire, let AI draft your bio, then publish. Your answers become your public profile page, like the faculty pages on the site.</p>
          )}
          {published && !freeUsed && <p className="mt-1 text-xs text-ink/60">You can make <b>one more free edit</b>. After that, changes need office approval.</p>}
          {published && freeUsed && <p className="mt-1 text-xs text-ink/60">Further edits will be sent to the office for approval before going live.</p>}
        </div>

        {/* Photo */}
        <div className="flex items-center gap-4 rounded-2xl border border-hairline bg-white p-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-hairline bg-mist text-ink/40">
            {p.photo_url ? <img src={p.photo_url} alt="" className="h-full w-full object-cover" /> : <span className="text-2xl">🎓</span>}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Profile photo</p>
            <p className="text-xs text-ink/60">A clear, friendly portrait works best.</p>
            <button onClick={() => fileRef.current?.click()} className="mt-1.5 text-sm font-semibold text-[#7A5E0F]">{p.photo_url ? "Change photo" : "Upload photo"}</button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          </div>
        </div>

        {/* Questionnaire */}
        <div className="space-y-3 rounded-2xl border border-hairline bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">Your details</p>
          <Field label="Full name" req value={p.name} onChange={(v) => set("name", v)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Instruments you teach" value={p.instruments} onChange={(v) => set("instruments", v)} placeholder="e.g. Guitar, Vocals" />
            <Field label="Years of experience" inputMode="numeric" value={p.experience_years} onChange={(v) => set("experience_years", v.replace(/[^\d]/g, ""))} />
            <Field label="Location / city" value={p.location} onChange={(v) => set("location", v)} placeholder="e.g. South Delhi" />
            <Field label="Age groups you teach" value={p.age_group} onChange={(v) => set("age_group", v)} placeholder="e.g. 6–60+" />
            <Field label="Languages" value={p.languages} onChange={(v) => set("languages", v)} placeholder="e.g. Hindi, English" />
            <Field label="Specialties" value={p.specialties} onChange={(v) => set("specialties", v)} placeholder="e.g. Fingerstyle, Trinity prep" />
          </div>
          <Field label="Qualifications / certifications" value={p.qualifications} onChange={(v) => set("qualifications", v)} placeholder="e.g. Trinity Grade 8, B.Mus" />
          <Field label="Achievements (optional)" value={p.achievements} onChange={(v) => set("achievements", v)} placeholder="e.g. 300+ students, live performances" />
          <TextArea label="How you teach (your approach)" value={p.approach} onChange={(v) => set("approach", v)} />
          <TextArea label="A bit about you (for the AI to use)" value={about} onChange={setAbout} />
          <Field label="One line of advice for beginners (optional)" value={p.advice} onChange={(v) => set("advice", v)} />
        </div>

        {/* AI bio */}
        <div className="rounded-2xl border border-dashed border-gold/50 bg-gold/[0.04] p-4">
          <p className="text-sm font-semibold text-ink">✨ Write my bio with AI</p>
          <p className="mt-0.5 text-xs text-ink/60">AI turns your answers into a warm, professional bio + headline. You can edit it after.</p>
          <button onClick={generate} disabled={genBusy} className="mt-2 w-full rounded-lg bg-ink py-2 text-sm font-semibold text-paper hover:brightness-110 disabled:opacity-60">
            {genBusy ? "Writing…" : "Generate my bio"}
          </button>
        </div>

        <div className="space-y-3 rounded-2xl border border-hairline bg-white p-5">
          <Field label="Headline" value={p.headline} onChange={(v) => set("headline", v)} placeholder="e.g. Guitar & Vocals Instructor · 8+ years" />
          <TextArea label="Public bio" value={p.bio} onChange={(v) => set("bio", v)} />
        </div>

        {err && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
        {msg && <p className="rounded-xl bg-feature-green/10 px-3 py-2 text-sm font-semibold text-feature-green">{msg}</p>}

        <button onClick={save} disabled={busy}
          className="w-full rounded-full bg-gold py-3 text-sm font-semibold text-ink hover:bg-deep-gold disabled:opacity-50">
          {busy ? "Saving…" : published ? "Save changes" : "Publish my profile"}
        </button>
      </div>
    </PortalShell>
  );
}
