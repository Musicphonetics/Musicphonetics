"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { FoundationJourney } from "@/components/parent/FoundationJourney";
import { FeedbackCard } from "@/components/parent/FeedbackCard";
import { DirectorNote } from "@/components/portal/DirectorNote";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadParentData, studentView, completedCount, loadCommunity, type ParentData } from "@/lib/supabase/parent";
import { computeFoundation } from "@/lib/foundation";
import { whatsappLink } from "@/lib/data";
import { cn } from "@/lib/utils";

const prettyDate = (iso: string | null) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "To be scheduled";
const isFoundation = (fee: number | null) => (fee ?? 8000) < 12000;

export default function ParentDashboard() {
  const [data, setData] = useState<ParentData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [community, setCommunity] = useState<string[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadParentData().then((d) => { setErr(d.error); setData(d); });
    loadCommunity().then(setCommunity);
  }, []);

  const student = data?.students[idx] ?? null;
  const view = useMemo(() => (data && student ? studentView(data, student) : null), [data, student]);
  const foundation = useMemo(() => {
    if (!data || !student) return null;
    return computeFoundation(completedCount(data, student.id), 1, false, !isFoundation(student.fee_quoted));
  }, [data, student]);

  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Musicphonetics">
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!data ? <Loading /> : data.students.length === 0 ? (
        <EmptyState title="No student linked yet" hint="Message us on WhatsApp and we'll link your child's profile to your login." />
      ) : view && student && foundation ? (
        <div className="space-y-4">
          {/* Child selector for siblings */}
          {data.students.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {data.students.map((s, i) => (
                <button key={s.id} onClick={() => setIdx(i)}
                  className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-medium",
                    i === idx ? "bg-ink text-paper" : "border border-hairline bg-white text-ink/70")}>{s.name}</button>
              ))}
            </div>
          )}

          {/* Student summary */}
          <div className="rounded-2xl border border-hairline bg-ink p-5 text-paper">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl font-semibold">{student.name}</p>
                <p className="mt-0.5 text-sm text-paper/70">{student.instrument || "Music"} · {student.level || "Beginner"}</p>
              </div>
              <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold",
                student.status === "active" ? "bg-feature-green/25 text-emerald-200" : "bg-white/10 text-paper/70")}>{student.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Mini label="Path" value={isFoundation(student.fee_quoted) ? "Foundation" : "Main"} />
              <Mini label="Teacher" value={(view.teacherName || "-").split(" ")[0]} />
              <Mini label="Done" value={`${view.completed}`} />
            </div>
          </div>

          {/* Foundation Journey */}
          {isFoundation(student.fee_quoted) ? (
            <FoundationJourney p={foundation} studentName={student.name} compact />
          ) : (
            <div className="rounded-2xl border border-gold/40 bg-white p-5">
              <p className="eyebrow">Learning path</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-ink">Main Musicphonetics Pathway</h3>
              <p className="mt-1 text-sm text-ink/70">Structured progress in confidence, theory, ear training and performance preparation.</p>
            </div>
          )}

          {/* Latest class update */}
          <Card>
            <Head>Latest class update</Head>
            {view.latest ? (
              <>
                <p className="text-xs font-medium text-ink/50">{prettyDate(view.latest.class_date)} · {view.latest.class_status}</p>
                {view.latest.taught && <Row label="Taught">{view.latest.taught}</Row>}
                {view.latest.homework && <Row label="Homework">{view.latest.homework}</Row>}
                {view.latest.student_response && <Row label="How it went">{view.latest.student_response}</Row>}
                {view.latest.teacher_notes && <Row label="Teacher note">{view.latest.teacher_notes}</Row>}
                <Link href="/parent/classes" className="mt-3 inline-block text-sm font-semibold text-[#7A5E0F]">See all classes →</Link>
              </>
            ) : <p className="text-sm text-ink/55">No class updates yet. They&apos;ll appear here right after each class.</p>}
          </Card>

          {/* Next class + homework */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <Head>Next class</Head>
              <p className="font-display text-lg font-semibold text-ink">{prettyDate(view.nextClassDate)}</p>
              <p className="mt-1 text-sm text-ink/60">{student.class_time || "Time confirmed on WhatsApp"} · {student.class_mode || "As scheduled"}</p>
            </Card>
            <Card>
              <Head>Practice reminder</Head>
              <p className="text-sm leading-relaxed text-ink/80">{view.latest?.homework || "Keep up daily practice - even 15 focused minutes makes a big difference."}</p>
            </Card>
          </div>

          {/* Fees / renewal */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <Head>Fees &amp; renewal</Head>
                <p className="text-sm text-ink/70">Status: <b className="text-ink">{view.paymentStatus}</b></p>
              </div>
              {view.renewalDue
                ? <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-[#7A5E0F]">Renewal due</span>
                : <span className="rounded-full bg-feature-green/10 px-3 py-1 text-xs font-semibold text-feature-green">Active</span>}
            </div>
            <Link href="/parent/payments" className="mt-3 inline-block text-sm font-semibold text-[#7A5E0F]">View fees &amp; renew →</Link>
          </Card>

          {/* Community snapshot */}
          <Card>
            <Head>Musicphonetics community</Head>
            <ul className="space-y-1.5 text-sm text-ink/75">
              {(community.length ? community : []).map((c) => <li key={c}>• {c}</li>)}
            </ul>
          </Card>

          {/* Parent feedback */}
          <FeedbackCard studentId={student.id} studentName={student.name} />

          {/* A personal note from the Director */}
          <DirectorNote variant="parent" />

          {/* WhatsApp support */}
          <a href={whatsappLink(`Hi Musicphonetics, this is ${student.parent_name || "a parent"} (${student.name}).`)}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-feature-green px-6 py-3.5 text-sm font-semibold text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .3-3.4-.7-2.9-1.2-4.7-4.2-4.9-4.4-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.1.3.7 1.1 1.4 1.8.9.8 1.7 1 2 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.5.3.1.3.1.7-.1 1.3Z" /></svg>
            Message us on WhatsApp
          </a>
        </div>
      ) : <Loading />}
    </PortalShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-2.5">
      <p className="truncate font-display text-base font-semibold text-paper">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-paper/55">{label}</p>
    </div>
  );
}
function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-hairline bg-white p-5">{children}</div>;
}
function Head({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/55">{children}</p>;
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <p className="mt-1.5 text-sm leading-relaxed text-ink/80"><span className="font-semibold text-ink">{label}:</span> {children}</p>;
}
