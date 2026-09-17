"use client";

import Link from "next/link";
import { FeedbackCard } from "@/components/parent/FeedbackCard";
import { StudentSnapshot } from "@/components/parent/StudentSnapshot";
import { FeeDueSoonPopup } from "@/components/parent/FeeDueSoonPopup";
import type { StudentView } from "@/lib/supabase/parent";
import type { Student, Payment, ClassUpdate } from "@/lib/supabase/types";
import { FOUNDATION, type FoundationProgress, type ChapterState } from "@/lib/foundation";
import { studentPlan } from "@/lib/plan";
import { quoteOfTheDay } from "@/lib/quotes";
import { accuracyMeta, practiceLevel, classHeadline } from "@/lib/classNotes";
import { whatsappLink } from "@/lib/data";
import { addDaysIso, FEE_DUE_DAYS } from "@/lib/fees";
import { cn } from "@/lib/utils";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const firstName = (n: string) => n.split(" ")[0];

const prettyDate = (iso: string | null) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "To be scheduled";
const monthLabel = (iso?: string | null) =>
  new Date(iso ? iso + (iso.length <= 10 ? "T00:00:00" : "") : Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
const gcalLink = (iso: string, title: string) => {
  const d = iso.replaceAll("-", "");
  const nxt = new Date(iso + "T00:00:00"); nxt.setDate(nxt.getDate() + 1);
  const d2 = nxt.toISOString().slice(0, 10).replaceAll("-", "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${d}/${d2}`;
};

const GOLD = "text-[#7A5E0F]"; // gold that reads on white

// Parent dashboard: one calm page with everything a family checks - a snapshot,
// a daily line of encouragement, progress, the next class, the last update and
// fees. Deeper pages (classes, reports, documents) are one tap away.
export function DashboardBody({
  student, view, foundation, pay, pays = [], completedDates = [], lastClass = null,
}: { student: Student; view: StudentView; foundation: FoundationProgress; pay: Payment | null; pays?: Payment[]; completedDates?: string[]; lastClass?: ClassUpdate | null }) {
  const plan = studentPlan(student);
  const quote = quoteOfTheDay();
  return (
    <div className="space-y-4">
      {/* Fee-due-soon popup, fires once per set after the 6th class */}
      <FeeDueSoonPopup student={student} completed={view.completed} pays={pays} />

      {/* Greeting */}
      <div>
        <h1 className="font-display text-[1.6rem] font-semibold leading-tight text-ink">{firstName(student.name)}&apos;s learning journey</h1>
        <p className="mt-1 text-sm text-ink/70">
          Keep up the great progress.
          {student.student_code && <span className="ml-2 rounded-full bg-ink/[0.05] px-2 py-0.5 font-mono text-[11px] text-ink/60">{student.student_code}</span>}
        </p>
      </div>

      {/* At-a-glance snapshot: profile · classes · days remaining · fee due · health */}
      <StudentSnapshot student={student} view={view} pays={pays} completedDates={completedDates} />

      {/* A daily line of encouragement for the family */}
      <QuoteCard text={quote.text} author={quote.author} />

      {/* How the last class went - the teacher's learning notes, front and centre */}
      <LastClassCard update={lastClass} studentName={student.name} />

      {/* Progress bar - Foundation only. Foundation + Main also get a monthly
          goal. Director's Circle gets a bespoke card (no progress bar). */}
      {plan === "foundation" && (
        <Panel>
          <div className="flex items-center gap-5">
            <Ring pct={foundation.progressPercent} size={104} stroke={9}>
              <span className="font-display text-2xl font-semibold text-ink">{foundation.progressPercent}<span className="text-base">%</span></span>
              <span className="mt-0.5 text-[10px] text-ink/65">Overall</span>
            </Ring>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold text-ink">Curriculum progress</h2>
              <div className="mt-4 flex items-start justify-between">
                {foundation.chapters.map(({ chapter, state }, i) => (
                  <div key={chapter.number} className="flex flex-1 flex-col items-center">
                    <div className="flex w-full items-center">
                      {i > 0 && <span className={cn("h-px flex-1", state === "upcoming" ? "bg-line" : "bg-gold/50")} />}
                      <ChapterNode state={state} pct={chapterPct(chapter.startClass, state, foundation.effectiveClasses)} />
                      {i < foundation.chapters.length - 1 && <span className={cn("h-px flex-1", foundation.chapters[i + 1].state === "upcoming" ? "bg-line" : "bg-gold/50")} />}
                    </div>
                    <span className="mt-1.5 text-center text-[9px] font-semibold leading-tight text-ink/70">Ch {chapter.number}</span>
                    <span className={cn("text-center text-[8px] leading-tight", state === "upcoming" ? "text-ink/65" : GOLD)}>
                      {state === "completed" ? "Complete" : state === "in_progress" ? "In progress" : "Locked"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-hairline pt-3.5">
            <p className="flex items-center gap-2 text-sm text-ink/70">
              <span className="text-gold">★</span>
              {foundation.progressPercent >= 100
                ? `${firstName(student.name)} has completed the Foundation.`
                : `${firstName(student.name)} is ${foundation.progressPercent >= 50 ? "right on track" : "off to a great start"}.`}
            </p>
          </div>
        </Panel>
      )}

      {/* Next class */}
      <Card>
        <CardHead icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" /><path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>}>Next class</CardHead>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={cn("text-sm font-semibold", GOLD)}>{prettyDate(view.nextClassDate)}</p>
            {student.class_time && <p className="mt-1 font-display text-lg font-semibold text-ink">{student.class_time}</p>}
            {student.class_mode && (
              <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-ink/[0.05] px-2.5 py-1 text-[11px] font-medium text-ink/70">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M15 10l6-3v10l-6-3" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
                {/online/i.test(student.class_mode) ? "Online class" : student.class_mode}
              </span>
            )}
          </div>
          {view.nextClassDate && (
            <a href={gcalLink(view.nextClassDate, `Music class - ${firstName(student.name)}`)} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border border-hairline px-4 py-2.5 text-sm font-semibold text-ink/80 hover:border-ink/40">
              Add to calendar
            </a>
          )}
        </div>
      </Card>

      {/* Fees */}
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardHead icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.7" /><path d="M3 10h18M16.5 14.5h1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>}>{monthLabel(pay?.payment_date)} fees</CardHead>
            <p className="mt-3 font-display text-2xl font-semibold text-ink">₹{(pay?.amount_paid ?? student.fee_quoted ?? 8000).toLocaleString("en-IN")}</p>
            {pay?.payment_date && <p className="mt-1 text-xs text-ink/70">Fee due on {new Date(addDaysIso(pay.payment_date, FEE_DUE_DAYS) + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>}
          </div>
          <PayPill status={view.paymentStatus} />
        </div>
        <Link href="/parent/payments" className="mt-4 flex items-center justify-center gap-2 rounded-full border border-hairline py-2.5 text-sm font-semibold text-ink/80 hover:border-ink/40">
          View fees &amp; invoices →
        </Link>
      </Card>

      {/* WhatsApp help */}
      <a href={whatsappLink(`Hi Musicphonetics, this is ${student.parent_name || "a parent"} (${student.name}).`)}
        target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-2xl border border-hairline bg-white p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#25D366] text-white">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .3-3.4-.7-2.9-1.2-4.7-4.2-4.9-4.4-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.1.3.7 1.1 1.4 1.8.9.8 1.7 1 2 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.5.3.1.3.1.7-.1 1.3Z" /></svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">Need help? Chat with us on WhatsApp</span>
          <span className="block text-xs text-ink/70">We&apos;re here for you and {firstName(student.name)} anytime.</span>
        </span>
        <span className={cn("shrink-0 whitespace-nowrap text-xs font-semibold", GOLD)}>Chat →</span>
      </a>

      {/* More sections */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/parent/homework", label: "Homework" },
          { href: "/parent/reports", label: "Reports" },
          { href: "/parent/documents", label: "Documents" },
          { href: "/parent/notifications", label: "Notifications" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="rounded-2xl border border-hairline bg-white p-3.5 text-center text-sm font-semibold text-ink/80 transition hover:border-ink/30">
            {l.label}
          </Link>
        ))}
      </div>

      {/* Rate the classes / leave a review */}
      <FeedbackCard studentId={student.id} studentName={student.name} />

      <div className="pt-1 text-center">
        <Link href="/parent/support" className={cn("text-sm font-semibold", GOLD)}>Need help? Visit Support →</Link>
      </div>
    </div>
  );
}

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
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-ink/10" />
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
          <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-ink/12" />
          <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-gold" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
        </svg>
        <span className="text-[8px] font-bold text-[#7A5E0F]">{pct}%</span>
      </span>
    );
  }
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ink/40">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
    </span>
  );
}

// A warm daily line of encouragement, shown in place of a monthly goal so the
// family always sees something uplifting even when no goal has been written.
function QuoteCard({ text, author }: { text: string; author: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/[0.10] via-white to-white p-5 shadow-[0_12px_34px_-22px_rgba(22,27,38,0.2)]">
      <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="absolute -right-1 -top-1 text-gold/25">
        <path d="M7 7H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1l-2 3h2l2-3V8a1 1 0 0 0-1-1H7Zm10 0h-3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1l-2 3h2l2-3V8a1 1 0 0 0-1-1Z" />
      </svg>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/15 text-[#7A5E0F]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18V6l10-2v11" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><circle cx="6.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.7" /><circle cx="16.5" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.7" /></svg>
        </span>
        <div className="min-w-0">
          <p className="font-display text-[1.05rem] font-semibold leading-snug text-ink">&ldquo;{text}&rdquo;</p>
          <p className={cn("mt-1.5 text-xs font-semibold uppercase tracking-wide", GOLD)}>{author}</p>
        </div>
      </div>
    </div>
  );
}

// The teacher's learning notes for the most recent class, the centrepiece of
// the home screen: topic, how accurately it went, where the child struggled,
// and how much practice is needed before next time.
function LastClassCard({ update, studentName }: { update: ClassUpdate | null; studentName: string }) {
  const first = firstName(studentName);
  const dateLabel = update?.class_date
    ? new Date(update.class_date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
    : null;
  const isPresent = update ? (update.attendance_status === "present" || (!update.attendance_status && update.class_status === "Completed")) : false;
  const acc = typeof update?.accuracy_percent === "number" ? update.accuracy_percent : null;
  const meta = acc != null ? accuracyMeta(acc) : null;
  const practice = practiceLevel(update?.practice_level);
  const hasNotes = !!(update && (update.taught || acc != null || update.error_areas || practice || update.homework));

  return (
    <div className="overflow-hidden rounded-3xl border border-hairline bg-white shadow-[0_16px_40px_-24px_rgba(22,27,38,0.28)]">
      <div className="flex items-center justify-between gap-3 border-b border-hairline bg-gradient-to-r from-gold/[0.09] to-transparent px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold/15 text-[#7A5E0F]">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5A2 2 0 0 1 6 4h5v15H6a2 2 0 0 0-2 1.5V5.5ZM20 5.5A2 2 0 0 0 18 4h-5v15h5a2 2 0 0 1 2 1.5V5.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
          </span>
          <span className="font-display text-[0.95rem] font-semibold text-ink">How the last class went</span>
        </div>
        {dateLabel && <span className="shrink-0 rounded-full bg-ink/[0.05] px-2.5 py-1 text-[11px] font-medium text-ink/65">{dateLabel}</span>}
      </div>

      <div className="p-5">
        {!update || !hasNotes ? (
          <div className="py-2">
            {update && !isPresent ? (
              <p className="text-sm text-ink/70">The last session was marked <b className="text-ink">{update.parent_reason ? "changed" : (update.class_status || "not held").toLowerCase()}</b>. Notes will appear after the next class.</p>
            ) : (
              <p className="text-sm text-ink/65">No class notes yet. Right after each class, your teacher&apos;s update for {first} appears here, topic, accuracy and what to practise.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-display text-lg font-semibold text-ink">{classHeadline(acc)}</p>

            {update.taught && (
              <div className="rounded-2xl bg-paper p-3.5">
                <p className={cn("text-[11px] font-semibold uppercase tracking-wide", GOLD)}>Topic taught</p>
                <p className="mt-1 text-sm leading-snug text-ink/85">{update.taught}</p>
              </div>
            )}

            {acc != null && meta && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">Accuracy</span>
                  <span className={cn("text-sm font-bold", meta.tone)}>{acc}% · {meta.label}</span>
                </div>
                <div className={cn("h-2.5 w-full overflow-hidden rounded-full", meta.track)}>
                  <div className={cn("h-full rounded-full transition-all", meta.bar)} style={{ width: `${clamp(acc, 0, 100)}%` }} />
                </div>
              </div>
            )}

            {update.error_areas && (
              <div className="flex gap-2.5 rounded-2xl bg-orange-500/[0.07] p-3.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-orange-500"><path d="M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-600">Where {first} struggled</p>
                  <p className="mt-0.5 text-sm leading-snug text-ink/85">{update.error_areas}</p>
                </div>
              </div>
            )}

            {practice && (
              <div className="flex items-center gap-3 rounded-2xl border border-hairline p-3.5">
                <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", practice.chip, practice.text)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" /></svg>
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/55">Practice needed</p>
                  <p className="text-sm font-semibold text-ink">{practice.label} <span className={cn("font-normal", practice.text)}>· {practice.hint}</span></p>
                </div>
              </div>
            )}

            {update.homework && <FieldRow label="Homework">{update.homework}</FieldRow>}

            <Link href="/parent/classes" className={cn("inline-block text-sm font-semibold", GOLD)}>View all class updates →</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-hairline bg-white p-5 shadow-[0_12px_34px_-20px_rgba(22,27,38,0.2)]">{children}</div>;
}
function Card({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col rounded-2xl border border-hairline bg-white p-4 shadow-[0_12px_34px_-22px_rgba(22,27,38,0.18)] sm:p-5">{children}</div>;
}
function CardHead({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold/12 text-[#7A5E0F]">{icon}</span>
      <span className="font-display text-[0.92rem] font-semibold leading-tight text-ink">{children}</span>
    </div>
  );
}
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-ink/65">{label}</p>
      <p className="text-sm leading-snug text-ink/85">{children}</p>
    </div>
  );
}
function PayPill({ status }: { status: string }) {
  const paid = /received/i.test(status);
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
      paid ? "bg-emerald-500/12 text-emerald-700" : "bg-gold/15 text-[#7A5E0F]")}>
      {paid && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      {paid ? "Paid" : status}
    </span>
  );
}
