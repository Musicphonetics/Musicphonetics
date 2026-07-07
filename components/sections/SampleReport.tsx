import { Reveal } from "@/components/ui/Reveal";
import { SAMPLE_REPORT as R } from "@/lib/curriculum";

function Stars({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-ink/50">{label}</p>
      <div className="mt-1 flex gap-0.5 text-gold" role="img" aria-label={`${n} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < n ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 2.2l2.95 6.4 6.85.7-5.1 4.6 1.45 6.9L12 17.7 5.9 21.2l1.45-6.9-5.1-4.6 6.85-.7z" />
          </svg>
        ))}
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7A5E0F]">{title}</p>
      <div className="mt-1 text-sm leading-relaxed text-ink/75">{children}</div>
    </div>
  );
}

export function SampleReport() {
  return (
    <Reveal>
      <figure className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-hairline bg-white shadow-card">
        {/* Document header */}
        <div className="flex items-center justify-between gap-4 border-b border-hairline bg-ink px-6 py-5 text-paper sm:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
              Musicphonetics · Monthly report
            </p>
            <p className="mt-1 font-display text-lg font-semibold">Progress summary</p>
          </div>
          <span className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-paper/80">
            Sample
          </span>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-3 gap-4 border-b border-hairline px-6 py-5 sm:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink/50">Student</p>
            <p className="mt-1 text-sm font-semibold text-ink">{R.student}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink/50">Instrument</p>
            <p className="mt-1 text-sm font-semibold text-ink">{R.instrument}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink/50">Level</p>
            <p className="mt-1 text-sm font-semibold text-ink">{R.level}</p>
          </div>
        </div>

        {/* Body */}
        <div className="grid gap-5 px-6 py-6 sm:grid-cols-2 sm:px-8">
          <Block title="This month's focus">{R.focus}</Block>
          <Block title="Goals">{R.goals}</Block>
          <Block title="Strengths">
            <ul className="list-disc pl-4">{R.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
          </Block>
          <Block title="Areas to improve">
            <ul className="list-disc pl-4">{R.improve.map((s) => <li key={s}>{s}</li>)}</ul>
          </Block>
          <Block title="Teacher remarks">{R.remarks}</Block>
          <Block title="Next steps">{R.next}</Block>
        </div>

        {/* Footer markers */}
        <div className="flex items-center gap-8 border-t border-hairline bg-paper px-6 py-4 sm:px-8">
          <Stars n={R.effort} label="Effort" />
          <Stars n={R.attendance} label="Attendance" />
        </div>
      </figure>
      <figcaption className="mt-4 text-center text-sm text-ink/55">
        Sample report - what parents receive every month. Content is illustrative;
        every student differs.
      </figcaption>
    </Reveal>
  );
}
