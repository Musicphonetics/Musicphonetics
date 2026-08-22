"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import type { ClassUpdate } from "@/lib/supabase/types";
import { buildReport, type ProgressReport } from "@/lib/report";
import { printDoc } from "@/lib/print";

export interface ReportStudent {
  id: string;
  name: string;
  instrument: string | null;
  level: string | null;
  classes_per_month: number | null;
}

export interface ReportNarrative {
  headline: string;
  observations: string;
  achievements: string; // newline-separated bullets
  improvements: string; // newline-separated bullets
  next: string;
}

const pretty = (iso: string | null) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-";
const firstName = (n: string) => n.split(" ")[0];
const toList = (s: string) => s.split(/\n+/).map((l) => l.trim()).filter(Boolean);

// A celebratory, two-page printable report. Page 1 is the proud front page
// (who, the milestone, observations, achievements); page 2 is the detail
// (what we worked on, where we'll grow, what's next).
export function ReportCard({ student, teacherName, report, narrative }: {
  student: ReportStudent; teacherName: string; report: ProgressReport; narrative?: ReportNarrative | null;
}) {
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const perMonth = student.classes_per_month ?? 8;
  const name = firstName(student.name);
  const achievements = narrative ? toList(narrative.achievements) : [];
  const improvements = narrative ? toList(narrative.improvements) : [];

  return (
    <div id="report-doc" className="overflow-hidden rounded-3xl border border-hairline bg-white shadow-card">
      {/* ===================== PAGE 1 — celebration ===================== */}
      <div className="relative p-7 sm:p-10">
        {/* soft festive header band */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-gold/[0.14] to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-ink">MUSICPHONETICS</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7A5E0F]">Student Progress Report</p>
            </div>
            <p className="text-[11px] text-ink/55">Issued {today}</p>
          </div>

          {/* Milestone ribbon */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-ink">
            <span aria-hidden>🎉</span>
            {report.cyclesCompleted > 0
              ? `${report.cyclesCompleted} set${report.cyclesCompleted === 1 ? "" : "s"} of classes complete!`
              : `${report.totalCompleted} classes and growing!`}
          </div>

          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink">{student.name}</h1>
          <p className="mt-1 text-sm text-ink/70">
            {[student.instrument, student.level].filter(Boolean).join(" · ") || "Music"} · with {teacherName || "the faculty"}
          </p>
          {narrative?.headline && (
            <p className="mt-4 border-l-[3px] border-gold pl-4 font-display text-lg italic leading-relaxed text-ink/90">{narrative.headline}</p>
          )}

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={String(report.totalCompleted)} label="Classes completed" />
            <Stat value={String(report.cyclesCompleted)} label="Sets earned" hint={`every ${perMonth} classes`} />
            <Stat value={`${report.classesIntoCycle}/${perMonth}`} label="Into current set" />
            <Stat value={pretty(report.firstClass)} label="Learning since" small />
          </div>

          {/* Observations */}
          <Section title="Our observations">
            {narrative?.observations
              ? <p className="text-sm leading-relaxed text-ink/85">{narrative.observations}</p>
              : <Placeholder>Draft this with AI, or write how {name} has grown this period.</Placeholder>}
          </Section>

          {/* Achievements */}
          <Section title="Achievements to celebrate" icon="⭐">
            {achievements.length > 0 ? (
              <ul className="space-y-2">
                {achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/85">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />{a}
                  </li>
                ))}
              </ul>
            ) : <Placeholder>The wins from this period will appear here.</Placeholder>}
          </Section>
        </div>
      </div>

      {/* ===================== PAGE 2 — detail + forward ===================== */}
      <div style={{ pageBreakBefore: "always", breakBefore: "page" }} className="border-t border-dashed border-hairline p-7 sm:p-10">
        <p className="font-display text-lg font-semibold text-ink">{name}&rsquo;s journey, class by class</p>
        <p className="mt-0.5 text-xs text-ink/55">What we actually worked on together</p>

        {report.months.length === 0 ? (
          <p className="mt-3 text-sm text-ink/55">No completed classes recorded yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {report.months.map((m) => (
              <div key={m.key} className="rounded-2xl border border-hairline p-4">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold text-ink">{m.label}</p>
                  <p className="text-xs text-ink/55">{m.classes.length} class{m.classes.length === 1 ? "" : "es"}</p>
                </div>
                <ul className="mt-3 space-y-2.5">
                  {m.classes.map((e, i) => (
                    <li key={`${m.key}-${i}`} className="border-l-2 border-gold/40 pl-3 text-sm">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-ink/45">{pretty(e.date)}</p>
                      {e.taught && <p className="text-ink/85"><span className="font-medium text-ink">Worked on:</span> {e.taught}</p>}
                      {e.homework && <p className="text-ink/70"><span className="font-medium text-ink">Practice:</span> {e.homework}</p>}
                      {!e.taught && !e.homework && <p className="text-ink/45">Class completed.</p>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Where we'll grow */}
        <Section title="Where we'll grow next" icon="🌱">
          {improvements.length > 0 ? (
            <ul className="space-y-2">
              {improvements.map((a, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/85">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7A5E0F]" />{a}
                </li>
              ))}
            </ul>
          ) : <Placeholder>Gentle areas to focus on next will appear here.</Placeholder>}
        </Section>

        {/* What's next */}
        <Section title="What's next" icon="🎯">
          {narrative?.next
            ? <p className="text-sm leading-relaxed text-ink/85">{narrative.next}</p>
            : report.latestProgress
              ? <p className="text-sm leading-relaxed text-ink/85">{report.latestProgress}</p>
              : <Placeholder>The next chapter of {name}&rsquo;s journey.</Placeholder>}
        </Section>

        <div className="mt-8 flex items-end justify-between border-t border-hairline pt-5">
          <p className="text-xs leading-relaxed text-ink/60">
            Shared with love by the Musicphonetics faculty.<br />{perMonth} classes make one set; a new report is earned each set.
          </p>
          <div className="text-right">
            <p className="font-display text-base font-semibold text-[#7A5E0F]">{teacherName || "Faculty"}</p>
            <p className="text-[11px] text-ink/55">Musicphonetics</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loads history, lets the teacher draft the narrative with AI, edit it, and print.
export function ReportCardModal({ student, teacherName, onClose }: {
  student: ReportStudent; teacherName: string; onClose: () => void;
}) {
  const [report, setReport] = useState<ProgressReport | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [aiErr, setAiErr] = useState<string | null>(null);
  const [narrative, setNarrative] = useState<ReportNarrative | null>(null);

  useEffect(() => {
    getSupabase()
      .from("class_updates").select("*").eq("student_id", student.id).order("class_date")
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        setReport(buildReport((data as ClassUpdate[]) ?? []));
      });
  }, [student.id]);

  async function draft() {
    if (!report) return;
    setDrafting(true); setAiErr(null);
    const entries = report.months.flatMap((m) => m.classes).slice(-16);
    try {
      const res = await fetch("/api/ai/report", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: student.name, instrument: student.instrument, level: student.level,
          prompt, goal: report.latestProgress,
          classes: entries.map((e) => ({ date: e.date, taught: e.taught, homework: e.homework, response: e.response })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) { setAiErr(data.error || "Couldn't draft the report. Please try again."); }
      else setNarrative({ headline: data.headline || "", observations: data.observations || "", achievements: data.achievements || "", improvements: data.improvements || "", next: data.next || "" });
    } catch { setAiErr("Couldn't reach the AI service. Please try again."); }
    setDrafting(false);
  }

  const upd = (k: keyof ReportNarrative, v: string) => setNarrative((n) => ({ ...(n ?? { headline: "", observations: "", achievements: "", improvements: "", next: "" }), [k]: v }));

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-ink/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="mx-auto my-6 max-w-2xl">
        <div className="no-print mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-paper">{student.name} · report card</p>
          <div className="flex gap-2">
            <button onClick={() => printDoc("report-doc")} disabled={!report}
              className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-deep-gold disabled:opacity-50">Print / Save PDF</button>
            <button onClick={onClose} className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-paper hover:border-white">Close</button>
          </div>
        </div>

        {/* AI drafting studio (not printed) */}
        {report && (
          <div className="no-print mb-3 rounded-2xl border border-gold/40 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">✨ Draft this report with AI</p>
            <p className="mt-1 text-xs text-ink/60">Say how you want it written — the tone, what to highlight. The AI reads {firstName(student.name)}&rsquo;s actual class notes (what was taught, practice, responses) and drafts observations, achievements, growth areas and what&rsquo;s next. Nothing is invented — edit every word below before you print.</p>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2}
              placeholder="e.g. Warm and proud. Celebrate her rhythm and first full song; gently push daily practice; mention the upcoming Trinity prep."
              className="mt-2.5 w-full rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
            <div className="mt-2 flex items-center gap-3">
              <button onClick={draft} disabled={drafting}
                className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper disabled:opacity-50">{drafting ? "Drafting…" : narrative ? "Re-draft" : "Draft with AI"}</button>
              {aiErr && <span className="text-xs text-red-600">{aiErr}</span>}
            </div>

            {narrative && (
              <div className="mt-4 space-y-2.5 border-t border-hairline pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">Review &amp; edit — this is what prints</p>
                <Editable label="Headline" value={narrative.headline} onChange={(v) => upd("headline", v)} rows={2} />
                <Editable label="Observations" value={narrative.observations} onChange={(v) => upd("observations", v)} rows={3} />
                <Editable label="Achievements (one per line)" value={narrative.achievements} onChange={(v) => upd("achievements", v)} rows={4} />
                <Editable label="Where we'll grow (one per line)" value={narrative.improvements} onChange={(v) => upd("improvements", v)} rows={3} />
                <Editable label="What's next" value={narrative.next} onChange={(v) => upd("next", v)} rows={3} />
              </div>
            )}
          </div>
        )}

        {err && <div className="no-print mb-3 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
        {!report ? (
          <div className="rounded-3xl border border-hairline bg-white p-10 text-center text-ink/50">Building the report…</div>
        ) : (
          <ReportCard student={student} teacherName={teacherName} report={report} narrative={narrative} />
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="mb-2 flex items-center gap-2 font-display text-base font-semibold text-ink">
        {icon && <span aria-hidden>{icon}</span>}
        <span>{title}</span>
      </h3>
      {children}
    </div>
  );
}
function Placeholder({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl bg-mist px-3 py-2.5 text-sm text-ink/50">{children}</p>;
}
function Stat({ value, label, hint, small }: { value: string; label: string; hint?: string; small?: boolean }) {
  return (
    <div className="rounded-2xl border border-hairline bg-paper p-3 text-center">
      <p className={small ? "font-display text-sm font-semibold text-ink" : "font-display text-2xl font-semibold text-ink"}>{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-ink/55">{label}</p>
      {hint && <p className="text-[10px] text-ink/40">{hint}</p>}
    </div>
  );
}
function Editable({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-ink/60">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
        className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
    </label>
  );
}
