// ============================================================================
// Musicphonetics — Programs (instruments & tracks) and brand divisions
// ============================================================================

export interface ProgramItem {
  title: string;
  outcome: string;
  icon: IconKey;
}

export type IconKey =
  | "guitar"
  | "piano"
  | "vocals"
  | "ukulele"
  | "theory"
  | "grade"
  | "performance"
  | "adult"
  | "kids";

export const PROGRAM_ITEMS: ProgramItem[] = [
  { title: "Guitar", outcome: "From first chords to full songs.", icon: "guitar" },
  { title: "Piano / Keyboard", outcome: "Melody, harmony, and reading.", icon: "piano" },
  { title: "Vocals", outcome: "Healthy, confident singing.", icon: "vocals" },
  { title: "Ukulele", outcome: "An easy, joyful start to music.", icon: "ukulele" },
  { title: "Music Theory", outcome: "Understand the language of music.", icon: "theory" },
  { title: "Grade Preparation", outcome: "Ready for recognised graded exams.", icon: "grade" },
  { title: "Performance Coaching", outcome: "Confidence on any stage.", icon: "performance" },
  { title: "Beginner Adults", outcome: "It's never too late to start.", icon: "adult" },
  { title: "Kids Foundation", outcome: "A playful, structured first step.", icon: "kids" },
];

// Future brand architecture — each division has its own accent + vision line.
export interface Division {
  name: string;
  short: string;
  vision: string;
  accent: string; // hex
  icon: DivisionIcon;
  status: "live" | "vision";
}

export type DivisionIcon =
  | "learn"
  | "teachers"
  | "artists"
  | "studio"
  | "live"
  | "research"
  | "foundation"
  | "media";

export const DIVISIONS: Division[] = [
  { name: "Musicphonetics Learn", short: "Learn", vision: "Structured lessons — the heart of everything.", accent: "#C9A227", icon: "learn", status: "live" },
  { name: "Musicphonetics Teachers", short: "Teachers", vision: "A verified educator network.", accent: "#1F3D2F", icon: "teachers", status: "live" },
  { name: "Musicphonetics Artists", short: "Artists", vision: "Artist development for serious musicians.", accent: "#9B5DE5", icon: "artists", status: "vision" },
  { name: "Musicphonetics Studio", short: "Studio", vision: "Recording and practice spaces.", accent: "#0EA5E9", icon: "studio", status: "vision" },
  { name: "Musicphonetics Live", short: "Live", vision: "Recitals and events.", accent: "#EF476F", icon: "live", status: "vision" },
  { name: "Musicphonetics Research", short: "Research", vision: "Learning design and pedagogy.", accent: "#06D6A0", icon: "research", status: "vision" },
  { name: "Musicphonetics Foundation", short: "Foundation", vision: "Scholarships and access.", accent: "#F4A261", icon: "foundation", status: "vision" },
  { name: "Musicphonetics Media", short: "Media", vision: "Stories, content, and student showcases.", accent: "#118AB2", icon: "media", status: "vision" },
];

// Recognised exam pathways used as learning references (no partnership claim).
export const EXAM_PATHWAYS = [
  { name: "Trinity College London", note: "Graded & diploma music exams." },
  { name: "ABRSM", note: "Associated Board graded exams." },
  { name: "Rockschool", note: "Contemporary & rock/pop grades." },
];

export const EXAM_DISCLAIMER =
  "Names and logos belong to their respective organisations. Musicphonetics uses recognised exam pathways as learning references where applicable, and does not claim any official partnership unless explicitly confirmed.";
