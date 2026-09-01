// The Monthly Report Card, recreated as a premium progress document (screen 05,
// the climax of the reveal). Faithful to the real portal report: header, a set
// celebration, the tremendous-progress quote, four stat tiles, observations,
// achievements, a class-by-class journey, where-we-grow-next, what's-next, and a
// faculty signature. Sample learner Aarav, Guitar. No em dashes, no AI wording.

const STAT: [string, string, string][] = [
  ["8", "Classes completed", ""],
  ["1", "Sets earned", "every 8 classes"],
  ["0/8", "Into current set", ""],
  ["28 Jul 2026", "Learning since", ""],
];

const ACHIEVEMENTS = [
  'Played "Happy Birthday" with a clean introduction and basic theory',
  "Learned the C major chord and played tunes leading with rhythm",
  'Played "London Bridge" with the C chord and "Mary Had a Little Lamb"',
  "Reached the goal of playing without a single mistake",
];

const JULY: [string, string, string][] = [
  ["28 Jul 2026", "Introduction", "Yes"],
  ["30 Jul 2026", "Completed Happy Birthday, intro to chords, Sargam, basic theory", "Revision"],
];
const AUGUST: [string, string, string][] = [
  ["2 Aug 2026", "Happy Birthday intro", "Revision"],
  ["3 Aug 2026", "Sargam with chords", "Yes, C chord with Sargam"],
  ["4 Aug 2026", "Learned the C major chord, played tunes, revised previous topics", "Refine the C chord, focus on rhythm"],
  ["5 Aug 2026", "A minor, changing between chords", "Practising smooth chord changes"],
  ["10 Aug 2026", 'Played "London Bridge" with the C chord', "Playing London Bridge with the chord"],
  ["12 Aug 2026", '"Mary Had a Little Lamb"', "Practise the first two lines"],
];

function Month({ title, count, rows }: { title: string; count: string; rows: [string, string, string][] }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-4 sm:p-5">
      <div className="flex items-baseline justify-between">
        <p className="font-display text-base font-bold text-ink">{title}</p>
        <span className="text-xs text-ink/45">{count}</span>
      </div>
      <div className="mt-3 space-y-3">
        {rows.map(([date, worked, practice]) => (
          <div key={date} className="border-l-2 border-gold/40 pl-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/40">{date}</p>
            <p className="mt-0.5 text-[13px] text-ink/80"><span className="font-semibold text-ink">Worked on:</span> {worked}</p>
            <p className="text-[13px] text-ink/60"><span className="font-semibold text-ink/80">Practice:</span> {practice}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PortalReport() {
  return (
    <div className="mx-auto w-full max-w-[600px] overflow-hidden rounded-[1.6rem] bg-white shadow-[0_40px_100px_-40px_rgba(22,27,38,0.5)] ring-1 ring-hairline">
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-sm font-bold text-ink">Musicphonetics</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-deep-gold">Student Progress Report</p>
          </div>
          <p className="shrink-0 text-[11px] text-ink/45">Issued 22 August 2026</p>
        </div>

        <p className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink">🎉 1 set of classes complete!</p>
        <h3 className="mt-2 font-display text-[clamp(1.7rem,5vw,2.3rem)] font-bold leading-tight text-ink">Aarav</h3>
        <p className="text-[13px] text-ink/55">Guitar · with the faculty</p>

        <blockquote className="mt-4 border-l-2 border-gold pl-4 font-display text-[15px] italic leading-relaxed text-ink/80">
          Aarav has made tremendous progress on the guitar, confidently playing his first songs and reaching his goal of playing them cleanly, without mistakes.
        </blockquote>

        {/* stat tiles */}
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {STAT.map(([v, k, s]) => (
            <div key={k} className="rounded-2xl border border-hairline px-3 py-3 text-center">
              <p className="font-display text-lg font-bold leading-none text-ink">{v}</p>
              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink/50">{k}</p>
              {s && <p className="text-[9px] text-ink/40">{s}</p>}
            </div>
          ))}
        </div>

        {/* observations */}
        <h4 className="mt-7 font-display text-base font-bold text-ink">Our observations</h4>
        <p className="mt-2 text-[13px] leading-relaxed text-ink/70">
          Aarav started from scratch, learning the fundamentals of the guitar, and has shown remarkable focus in his classes. He takes a few minutes to warm up, then his practice becomes sharp and productive. Playing his first songs confidently is a big win, and his dedication to practice shows in his progress.
        </p>

        {/* achievements */}
        <h4 className="mt-6 flex items-center gap-2 font-display text-base font-bold text-ink"><span className="text-gold">★</span> Achievements to celebrate</h4>
        <ul className="mt-2 space-y-1.5">
          {ACHIEVEMENTS.map((a) => (
            <li key={a} className="flex gap-2 text-[13px] leading-snug text-ink/70">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />{a}
            </li>
          ))}
        </ul>

        <div className="my-7 border-t border-dashed border-hairline" />

        {/* journey */}
        <h4 className="font-display text-lg font-bold text-ink">Aarav&apos;s journey, class by class</h4>
        <p className="text-xs text-ink/50">What we actually worked on together</p>
        <div className="mt-4 space-y-3">
          <Month title="July 2026" count="2 classes" rows={JULY} />
          <Month title="August 2026" count="6 classes" rows={AUGUST} />
        </div>

        {/* grow next */}
        <h4 className="mt-7 flex items-center gap-2 font-display text-base font-bold text-ink"><span>🌱</span> Where we&apos;ll grow next</h4>
        <ul className="mt-2 space-y-1.5">
          <li className="flex gap-2 text-[13px] leading-snug text-ink/70"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-feature-green" />Refine the C chord and tighten chord changes to improve overall playing</li>
          <li className="flex gap-2 text-[13px] leading-snug text-ink/70"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-feature-green" />Practise switching between chords smoothly to build coordination</li>
        </ul>

        {/* what's next */}
        <h4 className="mt-6 flex items-center gap-2 font-display text-base font-bold text-ink"><span className="text-gold">🎯</span> What&apos;s next</h4>
        <p className="mt-2 text-[13px] leading-relaxed text-ink/70">
          In the next phase of his journey, Aarav will learn songs that use a few more chords, adding richness to his playing. He will also sharpen his strumming and timing, so he can play more intricate tunes. With steady practice and dedication, Aarav will keep growing as a guitarist.
        </p>

        {/* signature */}
        <div className="mt-8 flex items-end justify-between border-t border-hairline pt-4">
          <div>
            <p className="text-[12px] text-ink/60">Shared with love by the Musicphonetics faculty.</p>
            <p className="text-[11px] text-ink/40">8 classes make one set; a new report is earned each set.</p>
          </div>
          <div className="text-right">
            <p className="font-display text-sm font-bold text-deep-gold">Faculty</p>
            <p className="text-[11px] text-ink/45">Musicphonetics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
