import type { ClassUpdate } from "@/lib/supabase/types";
import { Icon } from "./states";

// Shared read-only presentational pieces for the Phase 3a education views.
// Real data only — no fabricated records or metrics. Matches the /app design
// system (paper surfaces, ink text, gold accent).

export function fmtDate(ymd: string | null): string {
  if (!ymd) return "—";
  const d = new Date(ymd.length <= 10 ? ymd + "T00:00:00" : ymd);
  if (isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function Empty({ icon = "book", title, hint }: { icon?: string; title: string; hint?: string }) {
  return (
    <div className="mx-auto grid max-w-sm place-items-center py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-ink/5 text-ink/40"><Icon n={icon} s={24} /></span>
      <p className="mt-4 font-display text-lg font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1.5 text-[0.88rem] leading-relaxed text-ink/55">{hint}</p>}
    </div>
  );
}

export function Unauthorized() {
  return <Empty icon="lock" title="Not available" hint="This record doesn’t exist or isn’t linked to your account." />;
}

export function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-center text-sm text-amber-800">
      Couldn’t load this right now. {msg ? <span className="block opacity-70">{msg}</span> : "Please try again."}
    </div>
  );
}

const STATUS_CLS: Record<string, string> = {
  Completed: "bg-emerald-600/10 text-emerald-700 border-emerald-600/20",
  Rescheduled: "bg-gold/10 text-[#7A5E0F] border-gold/30",
  Cancelled: "bg-ink/[0.05] text-ink/55 border-hairline",
  "No-Show": "bg-red-500/10 text-red-700 border-red-500/20",
};
export function StatusPill({ status }: { status: string | null }) {
  if (!status) return null;
  return <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide ${STATUS_CLS[status] ?? "bg-ink/[0.05] text-ink/55 border-hairline"}`}>{status}</span>;
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-mist px-2.5 py-0.5 text-[0.72rem] font-medium text-ink/70">{children}</span>;
}

// One lesson record, rendered honestly from its real fields.
// `showNotes` reveals the teacher's internal notes — teacher view ONLY; never
// passed in the parent/family view.
export function LessonItem({ c, showNotes = false }: { c: ClassUpdate; showNotes?: boolean }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-[0.82rem] font-semibold text-ink">{fmtDate(c.class_date)}</p>
          {c.subject && <Chip>{c.subject}</Chip>}
          {c.class_number != null && <span className="text-[0.72rem] text-ink/40">Class {c.class_number}</span>}
        </div>
        <StatusPill status={c.class_status} />
      </div>

      {c.taught && <p className="mt-2 text-[0.9rem] leading-relaxed text-ink/85"><span className="text-ink/45">Covered: </span>{c.taught}</p>}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {typeof c.accuracy_percent === "number" && <Chip>Accuracy {c.accuracy_percent}%</Chip>}
        {c.practice_level && <Chip>Practice: {c.practice_level}</Chip>}
        {c.duration_min != null && <Chip>{c.duration_min} min</Chip>}
      </div>

      {c.error_areas && <p className="mt-2 text-[0.84rem] text-ink/70"><span className="text-ink/45">Focus: </span>{c.error_areas}</p>}
      {c.homework && <p className="mt-2 rounded-xl bg-mist/60 px-3 py-2 text-[0.84rem] text-ink/80"><span className="font-semibold">Homework: </span>{c.homework}</p>}
      {c.next_class_date && <p className="mt-2 text-[0.78rem] text-ink/50">Next class: {fmtDate(c.next_class_date)}</p>}

      {showNotes && c.teacher_notes && (
        <p className="mt-2 rounded-xl border border-dashed border-hairline px-3 py-2 text-[0.82rem] text-ink/65">
          <span className="font-semibold text-ink/50">Your private notes: </span>{c.teacher_notes}
        </p>
      )}
    </div>
  );
}

// A small labelled metric (real counts only).
export function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-3 text-center shadow-card">
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="text-[0.64rem] font-medium uppercase tracking-wide text-ink/45">{label}</p>
    </div>
  );
}
