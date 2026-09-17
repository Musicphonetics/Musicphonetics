"use client";

import { TextArea } from "@/components/portal/kit";
import { PRACTICE_LEVELS, accuracyMeta } from "@/lib/classNotes";
import { cn } from "@/lib/utils";

// The learning feedback a teacher records per class: how accurately the student
// played, where they struggled, and how much practice is needed. Shown to the
// family on the portal home, so a class update becomes real guidance.
export interface LearningNotes {
  accuracy: number | null;   // 0-100
  errors: string;
  practice: string;          // PracticeLevelKey or ""
}

export const EMPTY_LEARNING: LearningNotes = { accuracy: null, errors: "", practice: "" };

export function LearningNotesFields({
  value, onChange,
}: { value: LearningNotes; onChange: (v: LearningNotes) => void }) {
  const set = (patch: Partial<LearningNotes>) => onChange({ ...value, ...patch });
  const acc = value.accuracy;
  const meta = acc != null ? accuracyMeta(acc) : null;

  return (
    <div className="space-y-4 rounded-2xl border border-gold/30 bg-gold/[0.04] p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-gold/15 text-[#7A5E0F]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Learning notes</p>
          <p className="text-[11px] text-ink/55">The family sees this on their home screen.</p>
        </div>
      </div>

      {/* Accuracy */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Accuracy this class</span>
          {acc != null
            ? <span className={cn("text-sm font-bold", meta!.tone)}>{acc}% · {meta!.label}</span>
            : <span className="text-xs text-ink/45">Not set</span>}
        </div>
        <input type="range" min={0} max={100} step={5} value={acc ?? 0}
          onChange={(e) => set({ accuracy: Number(e.target.value) })}
          className="w-full accent-gold" aria-label="Accuracy percent" />
        <div className="mt-1 flex justify-between text-[10px] text-ink/40"><span>0%</span><span>50%</span><span>100%</span></div>
        {acc != null && (
          <button type="button" onClick={() => set({ accuracy: null })} className="mt-1 text-[11px] font-semibold text-ink/45 hover:text-ink/70">Clear</button>
        )}
      </div>

      {/* Where they struggled */}
      <TextArea label="Where did they struggle?" value={value.errors} onChange={(v) => set({ errors: v })}
        placeholder="e.g. Chord change G to C, timing in the chorus" rows={2} />

      {/* Practice needed */}
      <div>
        <span className="mb-1.5 block text-sm font-semibold text-ink">Practice needed before next class</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRACTICE_LEVELS.map((p) => {
            const on = value.practice === p.key;
            return (
              <button key={p.key} type="button"
                onClick={() => set({ practice: on ? "" : p.key })}
                className={cn("rounded-xl border px-2 py-2 text-center transition",
                  on ? "border-gold bg-gold text-ink shadow-card" : "border-hairline bg-white text-ink/70 hover:border-gold/50")}>
                <span className="block text-sm font-semibold">{p.label}</span>
                <span className={cn("block text-[10px]", on ? "text-ink/70" : "text-ink/45")}>{p.hint}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
