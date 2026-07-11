"use client";

import Link from "next/link";
import { FeedbackCard } from "@/components/parent/FeedbackCard";
import { DirectorNote, type DirectorCustom } from "@/components/portal/DirectorNote";
import type { StudentView } from "@/lib/supabase/parent";
import type { Student, Payment } from "@/lib/supabase/types";
import { FOUNDATION, type FoundationProgress, type ChapterState } from "@/lib/foundation";
import { whatsappLink } from "@/lib/data";
import { cn } from "@/lib/utils";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const isFoundation = (fee: number | null) => (fee ?? 8000) < 12000;
const firstName = (n: string) => n.split(" ")[0];

const prettyDate = (iso: string | null) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "To be scheduled";
const monthLabel = (iso?: string | null) =>
  new Date(iso ? iso + (iso.length <= 10 ? "T00:00:00" : "") : Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
const addMonth = (iso: string) => {
  const d = new Date(iso + "T00:00:00"); d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};
const gcalLink = (iso: string, title: string) => {
  const d = iso.replaceAll("-", "");
  const nxt = new Date(iso + "T00:00:00"); nxt.setDate(nxt.getDate() + 1);
  const d2 = nxt.toISOString().slice(0, 10).replaceAll("-", "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${d}/${d2}`;
};

// The full parent-dashboard body (everything below the portal header). Kept as a
// pure presentational component so it can be previewed with mock data.
export function DashboardBody({
  student, view, foundation, pay, directorMessage,
}: { student: Student; view: StudentView; foundation: FoundationProgress; pay: Payment | null; directorMessage?: DirectorCustom | null }) {
  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-[1.75rem] font-medium leading-tight text-paper">{firstName(student.name)}&apos;s Learning Journey</h1>
        <p className="mt-1 text-sm text-paper/60">Keep up the great progress!</p>
      </div>

      {/* Curriculum Progress */}
      {isFoundation(student.fee_quoted) ? (
        <div className="rounded-3xl border border-white/10 bg-onyx-1 p-5">
          <div className="flex items-center gap-5">
            <Ring pct={foundation.progressPercent} size={116} stroke={9}>
              <span className="font-display text-2xl font-semibold text-paper">{foundation.progressPercent}<span className="text-base">%</span></span>
              <span className="mt-0.5 text-[10px] text-paper/55">Overall Progress</span>
            </Ring>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-medium text-paper">Curriculum Progress</h2>
              <div className="mt-4 flex items-start justify-between">
                {foundation.chapters.map(({ chapter, state }, i) => (
                  <div key={chapter.number} className="flex flex-1 flex-col items-center">
                    <div className="flex w-full items-center">
                      {i > 0 && <span className={cn("h-px flex-1", state === "upcoming" ? "bg-white/12" : "bg-gold/50")} />}
                      <ChapterNode state={state} pct={chapterPct(chapter.startClass, state, foundation.effectiveClasses)} />
                      {i < foundation.chapters.length - 1 && <span className={cn("h-px flex-1", foundation.chapters[i + 1].state === "upcoming" ? "bg-white/12" : "bg-gold/50")} />}
                    </div>
                    <span className="mt-1.5 text-center text-[9px] font-semibold leading-tight text-paper/80">Ch {chapter.number}</span>
                    <span className={cn("text-center text-[8px] leading-tight", state === "upcoming" ? "text-paper/70" : "text-gold")}>
                      {state === "completed" ? "Complete" : state === "in_progress" ? "In Progress" : "Locked"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-white/10 pt-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm text-paper/80">
                <span className="text-gold">★</span>
                {foundation.progressPercent >= 100
                  ? `${firstName(student.name)} has completed the Foundation!`
                  : `${firstName(student.name)} is ${foundation.progressPercent >= 50 ? "right on track" : "off to a great start"}.`}
              </p>
              <Link href="/parent/progress" className="shrink-0 whitespace-nowrap text-sm font-semibold text-gold">View Progress →</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-onyx-1 p-5">
          <div className="flex items-center gap-5">
            <Ring pct={clamp(Math.round((view.completed / (view.perMonth || 8)) * 100), 0, 100)} size={116} stroke={9}>
              <span className="font-display text-2xl font-semibold text-paper">{view.completed}</span>
              <span className="mt-0.5 text-[10px] text-paper/55">Classes done</span>
            </Ring>
            <div className="min-w-0 flex-1">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold">Main Pathway</p>
              <h2 className="mt-1 font-display text-lg font-medium text-paper">Serious, structured progress</h2>
              <p className="mt-1 text-sm text-paper/65">Confidence, theory, ear training and performance preparation - tracked every class.</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3.5">
            <p className="flex items-center gap-2 text-sm text-paper/80"><span className="text-gold">★</span> Great momentum this month.</p>
            <Link href="/parent/progress" className="text-sm font-semibold text-gold">View Progress →</Link>
          </div>
        </div>
      )}

      {/* 2x2 detail grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Next class */}
        <Card>
          <CardHead icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" /><path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>}>Next Class</CardHead>
          <p className="mt-3 text-sm font-semibold text-gold">{prettyDate(view.nextClassDate)}</p>
          {student.class_time && <p className="mt-1 font-display text-lg font-semibold text-paper">{student.class_time}</p>}
          {student.class_mode && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-paper/80">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M15 10l6-3v10l-6-3" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
              {/online/i.test(student.class_mode) ? "Online Class" : student.class_mode}
            </span>
          )}
          {view.nextClassDate && (
            <a href={gcalLink(view.nextClassDate, `Music class - ${firstName(student.name)}`)} target="_blank" rel="noopener noreferrer"
              className="mt-auto flex items-center justify-center gap-2 rounded-full border border-white/15 py-2.5 text-sm font-semibold text-paper/85 hover:border-white/30">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-gold"><rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" /><path d="M3.5 9.5h17M12 13v4M10 15h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
              Add to Calendar
            </a>
          )}
        </Card>

        {/* Last class update */}
        <Card>
          <CardHead icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5A2 2 0 0 1 6 4h5v15H6a2 2 0 0 0-2 1.5V5.5ZM20 5.5A2 2 0 0 0 18 4h-5v15h5a2 2 0 0 1 2 1.5V5.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>}>Last Class Update</CardHead>
          {view.latest ? (
            <>
              <div className="mt-3 space-y-2.5">
                {view.latest.taught && <FieldRow label="Topic Taught">{view.latest.taught}</FieldRow>}
                {view.latest.homework && <FieldRow label="Homework">{view.latest.homework}</FieldRow>}
                {view.latest.teacher_notes && <FieldRow label="Teacher Notes">{view.latest.teacher_notes}</FieldRow>}
              </div>
              <Link href="/parent/classes" className="mt-auto inline-block pt-3 text-sm font-semibold text-gold">View All Updates →</Link>
            </>
          ) : <p className="mt-3 text-sm text-paper/55">No class updates yet. They&apos;ll appear here right after each class.</p>}
        </Card>

        {/* Monthly report */}
        <Card>
          <CardHead icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 20V10M12 20V4M19 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>}>Monthly Report</CardHead>
          <p className="mt-3 text-sm font-semibold text-gold">{monthLabel(view.latest?.class_date)} Report</p>
          <p className="mt-1 text-sm leading-relaxed text-paper/65">View {firstName(student.name)}&apos;s performance, attendance, and teacher feedback.</p>
          <Link href="/parent/reports" className="mt-auto flex items-center justify-center gap-2 rounded-full bg-gold py-2.5 text-sm font-semibold text-ink">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h7l5 5v13H7V3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
            View Report →
          </Link>
        </Card>

        {/* Payment status */}
        <Card>
          <CardHead icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.7" /><path d="M3 10h18M16.5 14.5h1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>}>Payment Status</CardHead>
          <p className="mt-3 text-sm font-semibold text-gold">{monthLabel(pay?.payment_date)} Fees</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="font-display text-xl font-semibold text-paper">₹{(pay?.amount_paid ?? student.fee_quoted ?? 8000).toLocaleString("en-IN")}</span>
            <PayPill status={view.paymentStatus} />
          </div>
          {pay?.payment_date && <p className="mt-1 text-xs text-paper/55">Next billing on {addMonth(pay.payment_date)}</p>}
          <Link href="/parent/payments" className="mt-auto flex items-center justify-center gap-2 rounded-full border border-white/15 py-2.5 text-sm font-semibold text-paper/85 hover:border-white/30">
            View Invoices →
          </Link>
        </Card>
      </div>

      {/* WhatsApp help */}
      <a href={whatsappLink(`Hi Musicphonetics, this is ${student.parent_name || "a parent"} (${student.name}).`)}
        target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-onyx-1 p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#25D366] text-white">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .3-3.4-.7-2.9-1.2-4.7-4.2-4.9-4.4-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.1.3.7 1.1 1.4 1.8.9.8 1.7 1 2 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.5.3.1.3.1.7-.1 1.3Z" /></svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-paper">Need help? Chat with us on WhatsApp</span>
          <span className="block text-xs text-paper/60">We&apos;re here to help you and {firstName(student.name)} anytime.</span>
        </span>
        <span className="shrink-0 whitespace-nowrap rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-gold">Chat Now →</span>
      </a>

      {/* Director's note (live if the Director posted one) + feedback */}
      <DirectorNote variant="parent" dark custom={directorMessage} />
      <FeedbackCard studentId={student.id} studentName={student.name} dark />
    </div>
  );
}

// per-chapter fill for the in-progress node
function chapterPct(startClass: number, state: ChapterState, effectiveClasses: number) {
  if (state === "completed") return 100;
  if (state === "upcoming") return 0;
  return clamp(Math.round(((effectiveClasses - (startClass - 1)) / FOUNDATION.classesPerChapter) * 100), 0, 100);
}

function Ring({ pct, size, stroke, children }: { pct: number; size: number; stroke: number; children: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-white/10" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
          className="text-gold" strokeDasharray={c} strokeDashoffset={c * (1 - clamp(pct, 0, 100) / 100)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

function ChapterNode({ state, pct }: { state: ChapterState; pct: number }) {
  if (state === "completed") {
    return (
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-ink">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    );
  }
  if (state === "in_progress") {
    const r = 15, c = 2 * Math.PI * r;
    return (
      <span className="relative grid h-9 w-9 shrink-0 place-items-center">
        <svg width="36" height="36" viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
          <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-white/12" />
          <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-gold" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
        </svg>
        <span className="text-[8px] font-bold text-gold">{pct}%</span>
      </span>
    );
  }
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 text-paper/55">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
    </span>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col rounded-2xl border border-white/10 bg-onyx-1 p-4 sm:p-5">{children}</div>;
}
function CardHead({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold/12 text-gold">{icon}</span>
      <span className="font-display text-[0.92rem] font-semibold leading-tight text-paper">{children}</span>
    </div>
  );
}
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-paper/50">{label}</p>
      <p className="text-sm leading-snug text-paper/90">{children}</p>
    </div>
  );
}
function PayPill({ status }: { status: string }) {
  const paid = /received/i.test(status);
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
      paid ? "bg-emerald-500/15 text-emerald-300" : "bg-gold/15 text-gold")}>
      {paid && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      {paid ? "Paid" : status}
    </span>
  );
}
