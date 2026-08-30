import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Faithful, on-brand recreations of the seven Student Portal screens, rendered
// as crisp UI inside a phone frame (no raster screenshots). They reuse the same
// tokens as the real portal: paper/cream, charcoal ink, muted gold, serif
// display + sans body. Sample learner: "Abhishek", monthly fee ₹12,000.
// ---------------------------------------------------------------------------

const STUDENT = "Akshay";
const STUDENT_FULL = "Akshay";
const TEACHER = "Abhishek";
const CODE = "MP-2026-000004";

// ---- shared chrome --------------------------------------------------------

function Bell() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6ZM10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

const NAV: { label: string; key: string; d: string }[] = [
  { label: "Home", key: "home", d: "M3 11l9-8 9 8M5 10v10h14V10" },
  { label: "Classes", key: "classes", d: "M4 6h16M4 12h16M4 18h16" },
  { label: "Journey", key: "journey", d: "M4 18l5-6 4 4 7-9" },
  { label: "Ask", key: "ask", d: "M4 5h16v11H9l-5 4z" },
  { label: "Reports", key: "reports", d: "M7 3h8l4 4v14H7zM15 3v4h4" },
  { label: "Fees", key: "fees", d: "M3 7h18v10H3zM3 11h18" },
];

// The phone shell: dark bezel, cream screen, portal top bar + bottom nav.
function Phone({ active, children }: { active: string; children: ReactNode }) {
  return (
    <div className="relative mx-auto w-[300px]">
      <span aria-hidden="true" className="pointer-events-none absolute -inset-5 rounded-[3rem] bg-gold/15 blur-3xl" />
      <div className="relative rounded-[2.4rem] border-[7px] border-[#0b0e15] bg-[#0b0e15] shadow-[0_40px_90px_-30px_rgba(22,27,38,0.55)]">
        <div className="relative flex h-[588px] flex-col overflow-hidden rounded-[1.9rem] bg-paper">
          {/* top bar */}
          <div className="flex items-center justify-between border-b border-hairline px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-full border border-gold/40 bg-gold/10 font-display text-[11px] font-bold text-deep-gold">♪</span>
              <div className="leading-tight">
                <p className="font-display text-[12px] font-bold text-ink">Musicphonetics</p>
                <p className="text-[6.5px] font-semibold uppercase tracking-[0.16em] text-deep-gold">Student Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative grid h-6 w-6 place-items-center rounded-full border border-hairline text-ink/55"><Bell /><span className="absolute -right-1 -top-1 grid h-3 w-3 place-items-center rounded-full bg-red-500 text-[7px] font-bold text-white">2</span></span>
              <span className="flex items-center gap-1 rounded-full border border-hairline bg-white py-0.5 pl-0.5 pr-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-gold/15 font-display text-[9px] font-bold text-deep-gold">{STUDENT.charAt(0)}</span>
                <span className="text-[10px] font-semibold text-ink">{STUDENT}</span>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" className="text-ink/45"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </div>
          </div>

          {/* screen body */}
          <div className="min-h-0 flex-1 overflow-hidden px-3.5 pt-3">{children}</div>

          {/* bottom nav */}
          <div className="flex items-center justify-between border-t border-hairline px-2.5 py-1.5">
            {NAV.map((n) => (
              <div key={n.key} className={"flex flex-col items-center gap-0.5 " + (active === n.key ? "text-deep-gold" : "text-ink/40")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d={n.d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="text-[7.5px] font-medium">{n.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const Kicker = ({ children }: { children: ReactNode }) => (
  <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-deep-gold">{children}</p>
);
const Check = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// ---- 01 Journey -----------------------------------------------------------

function JourneyScreen() {
  const stats: [string, string, string][] = [
    ["Classes", "1/8", "this set"],
    ["Days remaining", "27", "to finish set"],
    ["Next class", "To be set", ""],
    ["Fee due", "4 Sep", ""],
  ];
  return (
    <Phone active="journey">
      <h3 className="font-display text-[19px] font-bold leading-tight text-ink">{STUDENT}&apos;s learning journey</h3>
      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink/55">Keep up the great progress. <span className="rounded bg-ink/[0.06] px-1.5 py-0.5 font-mono text-[8px] text-ink/60">{CODE}</span></p>

      <div className="mt-3 rounded-2xl bg-white p-3.5 shadow-[0_14px_30px_-20px_rgba(22,27,38,0.4)] ring-1 ring-hairline/70">
        <div className="flex items-start gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cream font-display text-base font-bold text-deep-gold">{STUDENT.charAt(0)}</span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-bold leading-tight text-ink">{STUDENT_FULL}</p>
            <p className="text-[9.5px] text-ink/55">Guitar · {CODE}</p>
          </div>
          <span className="text-[10px] font-semibold text-feature-green">On track</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {stats.map(([k, v, s]) => (
            <div key={k} className="rounded-xl bg-paper px-2.5 py-2">
              <p className="text-[7px] font-semibold uppercase tracking-wide text-ink/45">{k}</p>
              <p className="font-display text-[17px] font-bold leading-tight text-ink">{v}</p>
              {s && <p className="text-[8px] text-ink/45">{s}</p>}
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-feature-green/10 px-2.5 py-2">
          <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-feature-green/20 text-feature-green"><Check className="h-2.5 w-2.5" /></span>
          <p className="text-[10px] font-medium text-feature-green">Class schedule is healthy, keep up the steady pace.</p>
        </div>
      </div>

      <div className="mt-2.5 rounded-2xl bg-charcoal p-3">
        <div className="flex items-center justify-between">
          <Kicker><span className="text-gold">Director&apos;s Circle</span></Kicker>
          <span className="rounded-full border border-gold/40 px-2 py-0.5 text-[7px] font-semibold uppercase tracking-wide text-gold">Premium</span>
        </div>
        <p className="mt-1.5 font-display text-[14px] font-bold text-ivory">{STUDENT}&apos;s direct mentorship</p>
        <p className="mt-0.5 text-[9.5px] text-ivory/55">One-to-one with {TEACHER}, the Director · Guitar</p>
      </div>
    </Phone>
  );
}

// ---- 02 Home --------------------------------------------------------------

function HomeScreen() {
  const tiles = ["Homework", "Reports", "Documents", "Notifications"];
  return (
    <Phone active="home">
      <div className="rounded-2xl bg-white p-3 ring-1 ring-hairline/70">
        <p className="flex items-center gap-1.5 font-display text-[13px] font-bold text-ink"><span className="text-gold">▦</span> Next class</p>
        <p className="mt-1.5 text-[13px] font-semibold text-deep-gold">To be scheduled</p>
        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-paper px-2 py-1 text-[9px] text-ink/60">▷ At home</span>
      </div>

      <div className="mt-2.5 rounded-2xl bg-white p-3 ring-1 ring-hairline/70">
        <p className="flex items-center gap-1.5 font-display text-[13px] font-bold text-ink"><span className="text-gold">▢</span> Last class update</p>
        <p className="mt-1.5 text-[11px] font-semibold text-deep-gold">View all updates →</p>
      </div>

      <div className="mt-2.5 rounded-2xl bg-white p-3 ring-1 ring-hairline/70">
        <div className="flex items-center justify-between">
          <p className="font-display text-[13px] font-bold text-ink">August 2026 fees</p>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-feature-green"><Check className="h-2.5 w-2.5" /> Paid</span>
        </div>
        <p className="mt-1 font-display text-[22px] font-bold text-ink">₹12,000</p>
        <p className="text-[9px] text-ink/55">Fee due on 4 Sep 2026</p>
        <div className="mt-2 rounded-full border border-hairline py-1.5 text-center text-[10px] font-semibold text-ink/70">View fees &amp; invoices →</div>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        {tiles.map((t) => (
          <div key={t} className="rounded-xl bg-white py-2.5 text-center text-[10px] font-semibold text-ink/75 ring-1 ring-hairline/70">{t}</div>
        ))}
      </div>
    </Phone>
  );
}

// ---- 03 Lesson Plan -------------------------------------------------------

function LessonPlanScreen() {
  const classes: [string, string, string][] = [
    ["1", "Rhythm Basics", "Basic strumming patterns and timing, from down-strum to down-up, with songs like Twinkle Twinkle and Vande Mataram."],
    ["2", "Time Signature", "Understand 4/4 time and practise strumming to a metronome on Happy Birthday and You Are My Sunshine."],
    ["3", "Em and G Chords", "First open chords and clean changes, building toward the song of the month."],
  ];
  return (
    <Phone active="journey">
      <div className="rounded-2xl bg-cream px-3 py-2.5">
        <Kicker>🎯 This month&apos;s big goal</Kicker>
        <p className="mt-1 font-display text-[14px] font-bold leading-snug text-ink">{STUDENT} confidently plays &quot;Kesariya&quot; with strong rhythm and strumming by the end of the month.</p>
      </div>
      <p className="mt-3 text-[8px] font-semibold uppercase tracking-[0.16em] text-ink/45">The 8 mentorship classes</p>
      <div className="mt-2 space-y-1.5">
        {classes.map(([n, t, d]) => (
          <div key={n} className="flex gap-2 rounded-xl bg-white p-2.5 ring-1 ring-hairline/70">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cream font-display text-[11px] font-bold text-deep-gold">{n}</span>
            <div>
              <p className="text-[11px] font-semibold text-ink"><span className="text-ink/45">Class {n}:</span> {t}</p>
              <p className="mt-0.5 text-[9px] leading-snug text-ink/55">{d}</p>
            </div>
          </div>
        ))}
      </div>
    </Phone>
  );
}

// ---- 04 Progress ----------------------------------------------------------

function ProgressScreen() {
  const milestones: [string, boolean][] = [
    ["First open chords", true],
    ["Down-up strumming", true],
    ["Steady 4/4 with a metronome", false],
    ["Play Kesariya, full song", false],
  ];
  return (
    <Phone active="journey">
      <Kicker>Progress</Kicker>
      <h3 className="mt-1 font-display text-[18px] font-bold leading-tight text-ink">Where {STUDENT} stands</h3>

      <div className="mt-3 rounded-2xl bg-white p-3.5 ring-1 ring-hairline/70">
        <div className="flex items-end justify-between">
          <p className="text-[10px] font-semibold text-ink/60">Set 1 · month one</p>
          <p className="font-display text-[15px] font-bold text-ink">1 <span className="text-[11px] font-normal text-ink/45">/ 8 classes</span></p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper">
          <div className="h-full rounded-full bg-gold" style={{ width: "12.5%" }} />
        </div>
        <p className="mt-1.5 text-[9px] text-ink/50">7 classes left to complete this set.</p>
      </div>

      <div className="mt-2.5 rounded-2xl bg-white p-3.5 ring-1 ring-hairline/70">
        <p className="text-[8px] font-semibold uppercase tracking-wide text-ink/45">Milestones</p>
        <div className="mt-2 space-y-1.5">
          {milestones.map(([m, done]) => (
            <div key={m} className="flex items-center gap-2">
              <span className={"grid h-4 w-4 shrink-0 place-items-center rounded-full " + (done ? "bg-feature-green/20 text-feature-green" : "border border-hairline text-ink/30")}>{done ? <Check className="h-2.5 w-2.5" /> : <span className="text-[8px]">○</span>}</span>
              <span className={"text-[10.5px] " + (done ? "font-medium text-ink" : "text-ink/50")}>{m}</span>
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

// ---- 05 Reports -----------------------------------------------------------

function ReportsScreen() {
  return (
    <Phone active="reports">
      <div className="flex items-center justify-between">
        <Kicker>Monthly report</Kicker>
        <span className="rounded-full bg-cream px-2 py-0.5 text-[8px] font-semibold text-deep-gold">August 2026</span>
      </div>
      <h3 className="mt-1 font-display text-[17px] font-bold leading-tight text-ink">{STUDENT_FULL}, Guitar</h3>
      <p className="text-[9px] text-ink/50">Teacher · {TEACHER}</p>

      <div className="mt-3 rounded-2xl bg-white p-3.5 ring-1 ring-hairline/70">
        <div className="flex items-center justify-between border-b border-hairline pb-2">
          <span className="text-[10px] text-ink/55">Attendance</span>
          <span className="text-[11px] font-semibold text-ink">4 of 4 classes</span>
        </div>
        <p className="mt-2.5 text-[8px] font-semibold uppercase tracking-wide text-ink/45">What we covered</p>
        <p className="mt-1 text-[10px] leading-snug text-ink/70">Rhythm basics, steady 4/4 timing, and the first Em and G chord changes.</p>
        <p className="mt-2.5 text-[8px] font-semibold uppercase tracking-wide text-ink/45">Teacher&apos;s note</p>
        <p className="mt-1 text-[10px] leading-snug text-ink/70">{STUDENT} is strumming with real confidence. A little daily practice on chord changes and he is ready for the song.</p>
        <p className="mt-2.5 text-[8px] font-semibold uppercase tracking-wide text-ink/45">What&apos;s next</p>
        <p className="mt-1 text-[10px] leading-snug text-ink/70">Bring it together on &quot;Kesariya&quot; for the family performance.</p>
      </div>
      <div className="mt-2.5 rounded-full bg-charcoal py-2 text-center text-[10px] font-semibold text-cream">Download report</div>
    </Phone>
  );
}

// ---- 06 Fees --------------------------------------------------------------

function FeesScreen() {
  return (
    <Phone active="fees">
      <Kicker>Fees</Kicker>
      <h3 className="mt-1 font-display text-[18px] font-bold leading-tight text-ink">Clear, connected fees</h3>

      <div className="mt-3 rounded-2xl bg-white p-3.5 ring-1 ring-hairline/70">
        <div className="flex items-center justify-between">
          <p className="font-display text-[13px] font-bold text-ink">August 2026</p>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-feature-green"><Check className="h-2.5 w-2.5" /> Paid</span>
        </div>
        <p className="mt-1 font-display text-[26px] font-bold text-ink">₹12,000</p>
        <p className="text-[9px] text-ink/55">8 classes in this set · due 4 Sep 2026</p>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-paper">
          <div className="h-full rounded-full bg-gold" style={{ width: "12.5%" }} />
        </div>
        <p className="mt-1.5 text-[9px] text-ink/50">1 of 8 classes used</p>
      </div>

      <div className="mt-2.5 rounded-2xl bg-cream px-3 py-2.5">
        <p className="text-[10px] leading-snug text-ink/70">Each payment covers 8 classes. When the set is complete, the next fee is due. No guesswork.</p>
      </div>
      <div className="mt-2.5 rounded-full border border-hairline py-2 text-center text-[10px] font-semibold text-ink/70">View invoices &amp; receipts →</div>
    </Phone>
  );
}

// ---- 07 Ask ---------------------------------------------------------------

function AskScreen() {
  const qs = ["How does the Foundation journey work?", "What happens in a free trial class?", "How are the monthly fees billed?", "What will my child learn in the first month?"];
  return (
    <Phone active="ask">
      <div className="rounded-2xl bg-white p-3 ring-1 ring-hairline/70">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-cream text-[13px] text-deep-gold">✦</span>
          <div>
            <p className="font-display text-[14px] font-bold text-ink">Ask Musicphonetics</p>
            <p className="text-[9px] text-ink/55">Free, instant answers about the curriculum, classes and fees.</p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-[8px] font-semibold uppercase tracking-[0.16em] text-ink/45">Try asking</p>
      <div className="mt-2 space-y-1.5">
        {qs.map((q) => (
          <div key={q} className="rounded-xl bg-white px-3 py-2.5 text-[10.5px] text-ink/75 ring-1 ring-hairline/70">{q}</div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-hairline/70">
        <span className="flex-1 text-[9.5px] text-ink/40">Ask anything about the classes or curriculum...</span>
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-gold/80 text-ink">➤</span>
      </div>
    </Phone>
  );
}

// ---- registry -------------------------------------------------------------

export interface PortalScreen {
  num: string;
  tag: string;
  title: string;
  blurb: string;
  Screen: () => JSX.Element;
}

export const PORTAL_SCREENS: PortalScreen[] = [
  { num: "01", tag: "Journey", title: "See the journey.", blurb: "Every learner has a structured path, with goals, classes and milestones.", Screen: JourneyScreen },
  { num: "02", tag: "Home", title: "Everything in one place.", blurb: "Classes, updates, homework, reports and more.", Screen: HomeScreen },
  { num: "03", tag: "Lesson Plan", title: "Every class has a purpose.", blurb: "Your teacher's plan is built around the learner, not just the calendar.", Screen: LessonPlanScreen },
  { num: "04", tag: "Progress", title: "Know where they stand.", blurb: "Parents can see the journey instead of wondering how it's going.", Screen: ProgressScreen },
  { num: "05", tag: "Reports", title: "Progress, documented.", blurb: "Monthly reporting turns learning into something you can actually see.", Screen: ReportsScreen },
  { num: "06", tag: "Fees", title: "No guesswork.", blurb: "Classes, payments and remaining sessions stay clear and connected.", Screen: FeesScreen },
  { num: "07", tag: "Ask", title: "Questions? Just ask.", blurb: "Instant guidance about the Musicphonetics curriculum, classes and learning system.", Screen: AskScreen },
];
