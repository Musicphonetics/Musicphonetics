// ============================================================================
// Prototype 1 — synthetic demo data.
//
// EVERYTHING in this file is fictional, created only for the investor
// demonstration. No real people, students, bookings or metrics. The prototype
// UI watermarks this data as "DEMO" / "SAMPLE" wherever it is shown.
// ============================================================================

export type Status = "live" | "building" | "planned";

export const PILLARS: { key: string; name: string; line: string; status: Status; d: string }[] = [
  {
    key: "education",
    name: "Music Education OS",
    line: "Teachers, parents and students run and track real learning — the part that already ships.",
    status: "live",
    d: "M12 4L3 8l9 4 9-4-9-4zM6 10v4c0 1.5 2.7 3 6 3s6-1.5 6-3v-4",
  },
  {
    key: "profiles",
    name: "Professional Profiles",
    line: "Subscription identities for teachers and performing musicians, with a shareable public page.",
    status: "building",
    d: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0",
  },
  {
    key: "discovery",
    name: "Discovery & Bookings",
    line: "Families, venues and organisers find musicians and start a booking enquiry.",
    status: "building",
    d: "M21 21l-4.3-4.3M11 18a7 7 0 100-14 7 7 0 000 14z",
  },
  {
    key: "community",
    name: "Music Community",
    line: "Open mics, workshops, auditions and collaborations — structured, not a noisy feed.",
    status: "planned",
    d: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z",
  },
];

export type Persona = {
  key: "public" | "teacher" | "parent" | "musician" | "owner";
  label: string;
  who: string;
  sub: string;
  initials: string;
};

export const PERSONAS: Record<Persona["key"], Persona> = {
  public: { key: "public", label: "Visitor", who: "Guest", sub: "Exploring the platform", initials: "" },
  teacher: { key: "teacher", label: "Teacher", who: "Rohan Mehta", sub: "Guitar · Professional plan", initials: "RM" },
  parent: { key: "parent", label: "Parent", who: "Anjali Sharma", sub: "Family Plus · 2 children", initials: "AS" },
  musician: { key: "musician", label: "Musician", who: "Kabir Rao", sub: "Musician Pro · performer", initials: "KR" },
  owner: { key: "owner", label: "Owner", who: "Studio Admin", sub: "Platform administrator", initials: "SA" },
};

// ---------------------------------------------------------------- Teachers ---
export type Teacher = {
  slug: string;
  name: string;
  initials: string;
  instruments: string[];
  genres: string[];
  years: number;
  modes: string[];
  locations: string[];
  languages: string[];
  approach: string;
  bio: string;
  verification: "verified" | "pending" | "unverified";
  plan: string;
};

export const TEACHERS: Teacher[] = [
  {
    slug: "rohan-mehta",
    name: "Rohan Mehta",
    initials: "RM",
    instruments: ["Guitar", "Ukulele"],
    genres: ["Fingerstyle", "Blues", "Rock"],
    years: 8,
    modes: ["In-person", "Online"],
    locations: ["Delhi NCR"],
    languages: ["Hindi", "English"],
    approach: "Technique-first, song-driven. Every month has a goal; every class moves toward it.",
    bio: "Session guitarist turned teacher. Builds patient foundations, then unlocks the songs students actually want to play.",
    verification: "pending",
    plan: "Professional · ₹999/mo",
  },
  {
    slug: "sana-qureshi",
    name: "Sana Qureshi",
    initials: "SQ",
    instruments: ["Piano", "Keyboard"],
    genres: ["Classical", "Jazz"],
    years: 12,
    modes: ["Online"],
    locations: ["Online"],
    languages: ["English", "Urdu"],
    approach: "Strong sight-reading and theory, balanced with improvisation from day one.",
    bio: "Trinity-trained pianist. Twelve years preparing students for grades and for playing by ear.",
    verification: "verified",
    plan: "Studio · ₹1,999/mo",
  },
  {
    slug: "david-lobo",
    name: "David Lobo",
    initials: "DL",
    instruments: ["Vocals"],
    genres: ["Western", "Contemporary"],
    years: 6,
    modes: ["In-person", "Online"],
    locations: ["Mumbai", "Online"],
    languages: ["English", "Konkani"],
    approach: "Breath, pitch and performance confidence — safe technique for young voices.",
    bio: "Choir director and vocal coach focused on healthy technique and stage confidence.",
    verification: "unverified",
    plan: "Starter · ₹499/mo",
  },
];

// --------------------------------------------------------------- Musicians ---
export type Musician = {
  slug: string;
  name: string;
  initials: string;
  tagline: string;
  instruments: string[];
  genres: string[];
  location: string;
  performanceTypes: string[];
  fromFee: number; // INR, indicative
  plan: "Musician" | "Musician Pro";
};

export const MUSICIANS: Musician[] = [
  {
    slug: "kabir-rao",
    name: "Kabir Rao",
    initials: "KR",
    tagline: "Acoustic sets that read the room.",
    instruments: ["Acoustic Guitar", "Vocals"],
    genres: ["Acoustic", "Bollywood Unplugged", "Pop"],
    location: "Delhi NCR",
    performanceTypes: ["Weddings", "Private events", "Café gigs"],
    fromFee: 12000,
    plan: "Musician Pro",
  },
  {
    slug: "the-indigo-trio",
    name: "The Indigo Trio",
    initials: "IT",
    tagline: "A tight three-piece for corporate & venue nights.",
    instruments: ["Guitar", "Bass", "Cajón"],
    genres: ["Jazz", "Funk", "Retro"],
    location: "Gurugram",
    performanceTypes: ["Corporate", "Venue residencies"],
    fromFee: 35000,
    plan: "Musician Pro",
  },
  {
    slug: "meera-nair",
    name: "Meera Nair",
    initials: "MN",
    tagline: "Lounge piano & remote session work.",
    instruments: ["Piano", "Keys"],
    genres: ["Jazz", "Lounge", "Film"],
    location: "Online · Bengaluru",
    performanceTypes: ["Session work", "Lounge sets"],
    fromFee: 8000,
    plan: "Musician",
  },
  {
    slug: "arjun-sethi",
    name: "Arjun Sethi",
    initials: "AS",
    tagline: "Tabla–percussion fusion, open to collabs.",
    instruments: ["Tabla", "Percussion"],
    genres: ["Fusion", "World", "Electronic"],
    location: "Delhi NCR",
    performanceTypes: ["Collaborations", "Studio sessions"],
    fromFee: 10000,
    plan: "Musician",
  },
];

export const MUSICIAN_FILTERS = {
  instrument: ["Any", "Guitar", "Piano", "Vocals", "Bass", "Tabla", "Percussion"],
  genre: ["Any", "Acoustic", "Jazz", "Pop", "Funk", "Fusion", "Lounge"],
  type: ["Any", "Weddings", "Corporate", "Private events", "Session work", "Collaborations"],
};

// ------------------------------------------------------------- Booking flow ---
export const BOOKING_STAGES = [
  "Enquiry submitted",
  "Under review",
  "Quote proposed",
  "Awaiting client response",
  "Accepted",
  "Confirmed",
  "Completed",
] as const;
export type BookingStage = (typeof BOOKING_STAGES)[number];

// ------------------------------------------------------------------ Events ---
export type DemoEvent = {
  title: string;
  type: "Open Mic" | "Workshop" | "Audition" | "Collaboration" | "Showcase";
  date: string;
  where: string;
  tags: string[];
  state: "published" | "draft";
  spotsNote: string;
};

export const EVENTS: DemoEvent[] = [
  { title: "Monsoon Open Mic — Vol. 7", type: "Open Mic", date: "Sat 8 Nov · 6:30 PM", where: "Hybrid · Delhi + Online", tags: ["All levels", "Acoustic"], state: "published", spotsNote: "12 of 20 performer slots left" },
  { title: "Fingerstyle Guitar Masterclass", type: "Workshop", date: "Sun 16 Nov · 11:00 AM", where: "Online", tags: ["Guitar", "Intermediate+"], state: "published", spotsNote: "Seats limited" },
  { title: "Winter Showcase — Vocal Auditions", type: "Audition", date: "Fri 21 Nov · 5:00 PM", where: "Delhi NCR", tags: ["Vocals", "By slot"], state: "published", spotsNote: "Book an audition slot" },
  { title: "Indie project needs a bassist", type: "Collaboration", date: "Rolling", where: "Gurugram / Online", tags: ["Bass", "Original music"], state: "published", spotsNote: "2 collaborators responded" },
  { title: "Teacher roundtable — assessment rubrics", type: "Workshop", date: "Draft", where: "Online", tags: ["Teachers only"], state: "draft", spotsNote: "Not yet published" },
];

// ------------------------------------------------- AI assessment (SAMPLE) ---
export const AI_TASKS: Record<string, string[]> = {
  Guitar: ["Barre chords — F & B♭", "Pentatonic scale — 1 octave", "Fingerstyle pattern — Travis picking"],
  Keyboard: ["C major scale — hands together", "Chord inversions — I–IV–V", "Simple arpeggio study"],
};

export const AI_SAMPLE_REPORT = {
  instrument: "Guitar",
  task: "Barre chords — F & B♭",
  submitted: "27 Oct 2026",
  wellDone: [
    "Clean fretting hand position on the F shape",
    "Steady tempo held through the first 4 bars",
    "Good thumb placement behind the neck",
  ],
  toReview: [
    "B-string often muted on the B♭ chord",
    "Slight rush on the chord change at bar 5",
    "Index barre pressure drops on the high E",
  ],
  timeline: [
    { at: "00:08", note: "F chord — all six strings ringing clearly" },
    { at: "00:24", note: "B♭ change — B string muted, likely index angle" },
    { at: "00:41", note: "Tempo pushes ~6 BPM ahead during the change" },
    { at: "01:02", note: "Recovers tempo; cleaner barre on the repeat" },
  ],
  exercises: [
    "60 sec/day: barre-and-release on B♭, checking each string",
    "Metronome at 60 BPM, change on beat 1 only",
    "Spider walk 1-2-3-4 for index independence",
  ],
  nextPlan: "Hold B♭ for 2 bars, then alternate F↔B♭ every 2 bars at 60 BPM. Re-record in one week.",
};

// ------------------------------------------------------------------ Pricing ---
export type Plan = {
  audience: "Teachers" | "Parents" | "Musicians";
  name: string;
  price: number;
  unit: string;
  pitch: string;
  features: string[];
  highlight?: boolean;
};

export const PLANS: Plan[] = [
  {
    audience: "Teachers", name: "Starter", price: 499, unit: "/month",
    pitch: "Independent teachers building a professional presence.",
    features: ["Public professional profile", "Shareable profile URL", "Core profile editing", "Basic student management", "Attendance & lesson records", "Basic homework & practice"],
  },
  {
    audience: "Teachers", name: "Professional", price: 999, unit: "/month", highlight: true,
    pitch: "Teachers growing their student base and practice.",
    features: ["Everything in Starter", "Enhanced profile presentation", "Detailed progress summaries", "Parent learning reports", "Practice tracking & feedback", "Profile & enquiry analytics"],
  },
  {
    audience: "Teachers", name: "Studio", price: 1999, unit: "/month",
    pitch: "Established teachers & small academies.",
    features: ["Everything in Professional", "Organisation / team tools", "Multiple teaching staff", "Consolidated student reports", "Administrative views", "Organisation configuration"],
  },
  {
    audience: "Parents", name: "Family Plus", price: 499, unit: "/family · month",
    pitch: "The whole family's learning in one place.",
    features: ["Per-family, not per-child", "Multiple linked children", "Lesson history & observations", "Homework & practice tasks", "Progress summaries", "Discover teachers, musicians & events"],
  },
  {
    audience: "Musicians", name: "Musician", price: 499, unit: "/month",
    pitch: "A professional public profile and enquiries.",
    features: ["Public performer profile", "Instruments & genres", "Portfolio links", "Performance experience", "Booking enquiry form", "Basic profile management"],
  },
  {
    audience: "Musicians", name: "Musician Pro", price: 999, unit: "/month", highlight: true,
    pitch: "For performers taking more bookings.",
    features: ["Everything in Musician", "Enhanced portfolio presentation", "Fairer discovery placement", "Booking enquiry management", "Availability & packages", "Performance analytics"],
  },
];

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

// --------------------------------------------- Owner analytics (SYNTHETIC) ---
export const OWNER_METRICS = {
  accountsByRole: [
    { role: "Teachers", n: 48 },
    { role: "Parents", n: 126 },
    { role: "Students", n: 141 },
    { role: "Musicians", n: 37 },
  ],
  profiles: { verified: 19, pending: 14, unverified: 15 },
  subscriptions: { active: 61, trial: 12, pastDue: 4 },
  enquiries: 29,
  bookingsConfirmed: 8,
  eventRegistrations: 93,
  moderationOpen: 2,
  // illustrative 8-week activity (lessons logged), purely synthetic
  activity: [34, 41, 38, 52, 49, 63, 58, 71],
};
