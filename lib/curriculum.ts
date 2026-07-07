// ============================================================================
// Musicphonetics - Curriculum, system flow & progression data.
// Honesty: timeframes are labelled "typical, varies by student"; only real,
// defensible numbers are used elsewhere. Nothing here is a company statistic.
// ============================================================================

// M1 - the method as a visible system (loops back to the start).
export type SystemStep = { title: string; line: string };
export const SYSTEM_STEPS: SystemStep[] = [
  { title: "Assessment", line: "We understand level, goals, and pace first." },
  { title: "Matched faculty", line: "A verified teacher chosen for the student." },
  { title: "Structured cycle", line: "8 classes a month, building real momentum." },
  { title: "Progress tracking", line: "Clear milestones and feedback after classes." },
  { title: "Home concerts", line: "Regular performance that builds confidence." },
  { title: "Parent reports", line: "Honest monthly updates - you stay in the loop." },
];

// M2 - curriculum by level. Timeframes are typical and vary by student.
export type CurriculumLevel = {
  key: string;
  name: string;
  works: string;
  timeframe: string; // labelled "typical" in the UI
  milestone: string;
  pathway: string;
};
export const CURRICULUM_LEVELS: CurriculumLevel[] = [
  {
    key: "foundation",
    name: "Foundation",
    works: "Posture, hand position, sound, and pulse - and the daily-practice habit.",
    timeframe: "Months 1-3",
    milestone: "Plays first simple pieces with steady time and a confident routine.",
    pathway: "Pre-grade / Initial",
  },
  {
    key: "developing",
    name: "Developing",
    works: "Reading fluency, dynamics, first full pieces; graded preparation begins.",
    timeframe: "Months 3-9",
    milestone: "Reads and performs full pieces; ready for a first graded exam.",
    pathway: "Trinity / ABRSM / Rockschool - early grades",
  },
  {
    key: "intermediate",
    name: "Intermediate",
    works: "Control, interpretation, and a growing repertoire across styles.",
    timeframe: "Year 1-2",
    milestone: "Interprets repertoire with control; works through middle grades.",
    pathway: "Trinity / ABRSM / Rockschool - middle grades",
  },
  {
    key: "advanced",
    name: "Advanced",
    works: "Refinement, expression, and ownership - performance and higher grades.",
    timeframe: "Year 2+",
    milestone: "Performs with personal voice; prepares higher graded exams.",
    pathway: "Higher grades & performance",
  },
];

// M2/M3 - a compact "typical journey" strip (labelled).
export const TYPICAL_JOURNEY = [
  { when: "Month 1", what: "First pieces, steady pulse" },
  { when: "Month 3", what: "Reading fluency, dynamics" },
  { when: "Month 6", what: "Full pieces, graded prep begins" },
  { when: "Grade exam", what: "Trinity / ABRSM / Rockschool ready" },
];

// M4 - the monthly report parents actually receive (sample/generic content).
export const SAMPLE_REPORT = {
  student: "Student name",
  instrument: "Guitar",
  level: "Foundation",
  focus: "Clean chord changes (G-C-D) and steady strumming at 70 bpm.",
  strengths: ["Great practice consistency", "Strong sense of rhythm"],
  improve: ["Smoother chord transitions", "Keeping wrist relaxed"],
  goals: "Play a full 8-bar song end-to-end next month.",
  remarks:
    "Focused and engaged in every class this month - real momentum building.",
  next: "Introduce the F chord and a simple picking pattern.",
  effort: 5,
  attendance: 5,
};
