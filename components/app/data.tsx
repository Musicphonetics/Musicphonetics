import type { ClassUpdate } from "@/lib/supabase/types";
import { Icon, Chip, Card, EmptyState, StatusPill, Metric, fmtDate } from "./ui";

// Read-only presentational pieces for the education views, built on the shared
// ui.tsx kit. Real data only — no fabricated records or metrics.

// Re-exported from the kit so existing pages keep their imports from "./data".
export { fmtDate, StatusPill, Metric };

export function Empty({ icon = "book", title, hint }: { icon?: string; title: string; hint?: string }) {
  return <EmptyState icon={icon} title={title} hint={hint} />;
}

export function Unauthorized() {
  return <EmptyState icon="lock" title="Not available" hint="This record doesn’t exist or isn’t linked to your account." />;
}

export function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="mx-auto flex max-w-md items-start gap-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-800">
      <Icon n="warning" s={18} c="mt-0.5 shrink-0" />
      <span>Couldn’t load this right now. {msg ? <span className="block opacity-70">{msg}</span> : "Please try again."}</span>
    </div>
  );
}

// One lesson record, rendered honestly from its real fields. `showNotes` reveals
// the teacher's internal notes — TEACHER view ONLY; never passed in the family view.
export function LessonItem({ c, showNotes = false }: { c: ClassUpdate; showNotes?: boolean }) {
  return (
    <Card className="p-4" interactive>
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
    </Card>
  );
}
