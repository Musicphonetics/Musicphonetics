// ============================================================================
// Musicphonetics — Public Content & Brand Constants
// Edit copy, prices, reviews, and the WhatsApp number here.
// ============================================================================

import type {
  FaqItem,
  Package,
  ProgramCard,
  Review,
  Teacher,
} from "./types";

// ---------------------------------------------------------------------------
// WHATSAPP — change this single constant to update every CTA on the site.
// Format: country code + number, digits only. e.g. "918796199188"
// TODO(integration): confirm final business WhatsApp number before launch.
// ---------------------------------------------------------------------------
export const WHATSAPP_NUMBER = "918796199188";

export const WHATSAPP_DEFAULT_TEXT =
  "Hi Musicphonetics, I want to explore music classes";

/** Build a wa.me link with an optional custom prefilled message. */
export function whatsappLink(text: string = WHATSAPP_DEFAULT_TEXT): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------
export const BRAND = {
  name: "Musicphonetics",
  tagline: "Structured music education",
  region: "Delhi NCR",
  founder: "Abhishek Kumar",
  yearsExperience: "10+",
  studentsTaught: "1,000+",
};

// ---------------------------------------------------------------------------
// Primary navigation
// ---------------------------------------------------------------------------
export const NAV_LINKS = [
  { label: "Why us", href: "/#why-us" },
  { label: "Method", href: "/method" },
  { label: "Programs", href: "/programs" },
  { label: "Teachers", href: "/teachers" },
  { label: "Reviews", href: "/reviews" },
  { label: "Teach with us", href: "/teach-with-us" },
];

// ---------------------------------------------------------------------------
// Trust strip stats
// ---------------------------------------------------------------------------
export const TRUST_STATS = [
  { value: "10+", label: "Years" },
  { value: "1,000+", label: "Students" },
  { value: "Director-led", label: "Method" },
  { value: "Delhi NCR", label: "Home & online" },
];

// ---------------------------------------------------------------------------
// Why Musicphonetics
// ---------------------------------------------------------------------------
export const WHY_CARDS = [
  {
    title: "Personal matching",
    body: "A student is not randomly assigned. The teacher and path are selected around the learner's need.",
  },
  {
    title: "Structured progress",
    body: "Lessons follow a method, not scattered songs.",
  },
  {
    title: "Director-led philosophy",
    body: "The learning journey is guided by a central teaching standard.",
  },
  {
    title: "Safe and serious",
    body: "Teachers are selected with care and the experience is built for families.",
  },
];

// ---------------------------------------------------------------------------
// Method stages
// ---------------------------------------------------------------------------
export const METHOD_STAGES = [
  {
    name: "Foundation",
    body: "Posture, rhythm, sound, confidence.",
  },
  {
    name: "Fluency",
    body: "Technique, repertoire, expression.",
  },
  {
    name: "Performance",
    body: "Exam readiness, stage presence, musical identity.",
  },
];

// Method page has a fourth stage
export const METHOD_STAGES_FULL = [
  ...METHOD_STAGES,
  {
    name: "Mastery",
    body: "Independent musicianship, advanced repertoire, and a personal voice as a musician.",
  },
];

export const METHOD_PRINCIPLES = [
  "One-to-one attention",
  "Director-led standard",
  "Structured progress",
  "Practical musicianship",
  "Exam pathway where needed",
];

// ---------------------------------------------------------------------------
// How it works
// ---------------------------------------------------------------------------
export const HOW_STEPS = [
  {
    step: "1",
    title: "Message us",
    body: "Reach out on WhatsApp to begin a short, guided conversation.",
  },
  {
    step: "2",
    title: "Share what you are looking for",
    body: "Tell us who the classes are for, the instrument, and your goal.",
  },
  {
    step: "3",
    title: "We recommend the right learning path",
    body: "We guide you toward the right teacher, format, and plan.",
  },
];

// ---------------------------------------------------------------------------
// Programs / Pathways
// ---------------------------------------------------------------------------
export const PROGRAMS: ProgramCard[] = [
  {
    title: "One-to-One Lessons",
    description:
      "Our current primary offer. Home and online personal classes built around the student.",
    status: "Current",
  },
  {
    title: "Trinity Preparation",
    description:
      "Structured support for exam-oriented learners working toward graded milestones.",
    status: "Exam pathway",
  },
  {
    title: "Academy & Group Batches",
    description:
      "Opening as demand grows. Tell us during enquiry to be kept updated on future batches.",
    status: "Coming as demand grows",
  },
  {
    title: "Workshops & Camps",
    description:
      "Seasonal programs, summer batches, and focused performance preparation.",
    status: "Seasonal",
  },
];

// ---------------------------------------------------------------------------
// Reviews — SAMPLE placeholders. Mark clearly as sample until verified.
// TODO(content): replace with verified parent testimonials before launch.
// ---------------------------------------------------------------------------
export const REVIEWS: Review[] = [
  {
    quote:
      "The biggest difference was structure. My child stopped jumping from song to song and started understanding music properly.",
    author: "Parent, South Delhi",
    sample: true,
  },
  {
    quote:
      "The teacher was patient, but the system behind the classes felt very professional.",
    author: "Parent, Gurugram",
    sample: true,
  },
  {
    quote:
      "I wanted my son to learn seriously without making it stressful. Musicphonetics gave us that balance.",
    author: "Parent, Delhi NCR",
    sample: true,
  },
  {
    quote:
      "What stood out was the consistency. Every class had a purpose and built on the last one.",
    author: "Parent, Noida",
    sample: true,
  },
  {
    quote:
      "As an adult beginner I was nervous, but the pacing was respectful and I never felt rushed.",
    author: "Adult learner, Delhi",
    sample: true,
  },
  {
    quote:
      "The monthly session with the Director kept us motivated and on track for the exam.",
    author: "Parent, Faridabad",
    sample: true,
  },
];

// ---------------------------------------------------------------------------
// Packages / Learning Paths — exact copy per spec.
// TODO(pricing): update prices here when packages change.
// ---------------------------------------------------------------------------
export const PACKAGES: Package[] = [
  {
    key: "A",
    name: "The Foundation",
    tagline: "Steady start, trained teacher, two classes a week.",
    perClass: "Rs 1,200/class",
    monthly: "Rs 9,600/mo",
  },
  {
    key: "B",
    name: "The Transformation",
    tagline:
      "Everything in Foundation, plus our Director from day one + a monthly session with him.",
    perClass: "Rs 1,500/class",
    monthly: "Rs 12,000/mo",
    note: "About Rs 50 a day.",
    featured: true,
  },
  {
    key: "C",
    name: "The Director's Circle",
    tagline: "Learn from the Director himself, by prior booking.",
    perClass: "Rs 2,800/class",
    monthly: "Rs 20,000 for 8.",
    premium: true,
  },
];

export const PACKAGES_NOTE =
  "Every student follows a personalised pathway. Final teacher, slot, and confirmation are handled personally by the Musicphonetics team.";

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------
export const FAQS: FaqItem[] = [
  {
    q: "Do you offer home classes?",
    a: "Yes. Home classes across Delhi NCR are our current primary format, delivered by carefully selected teachers.",
  },
  {
    q: "Do you offer online classes?",
    a: "Yes. Online one-to-one classes are available for students who prefer to learn from anywhere.",
  },
  {
    q: "Are group classes available?",
    a: "Our current primary format is one-to-one learning. Group batches and academy programs open when a suitable batch is formed. If you are interested in group learning, tell us during enquiry so we can keep you updated.",
  },
  {
    q: "How are teachers selected?",
    a: "Teachers are chosen with care and verified before they teach. We match each student to a teacher based on the learner's instrument, level, and goal.",
  },
  {
    q: "Do you prepare students for Trinity?",
    a: "Yes. We offer structured Trinity preparation for exam-oriented learners, integrated into the wider Musicphonetics method.",
  },
  {
    q: "Can adults join?",
    a: "Absolutely. We teach beginners and serious learners of all ages, with pacing that respects each student.",
  },
  {
    q: "How does the first session work?",
    a: "You begin with a short guided conversation on WhatsApp. We then recommend the right teacher, format, and plan before your first lesson.",
  },
  {
    q: "Who confirms the teacher and slot?",
    a: "Final teacher, slot, fee, and booking are confirmed personally by Director Abhishek and the Musicphonetics team.",
  },
];

// ---------------------------------------------------------------------------
// Public teacher profiles — PLACEHOLDER data.
// TODO(content): replace with verified real teacher data before launch.
// ---------------------------------------------------------------------------
export const PUBLIC_TEACHERS: Teacher[] = [
  {
    id: "T-001",
    name: "Placeholder · Teacher One",
    instruments: ["Guitar", "Ukulele"],
    areas: ["South Delhi", "Gurugram"],
    maxStudents: 20,
    currentStudents: 14,
    rating: 4.9,
    active: true,
    verificationStatus: "Verified",
    experience: "8+ years",
    qualification: "Trinity-trained, performance background",
    bio: "Warm, patient teaching style focused on building strong fundamentals before repertoire.",
  },
  {
    id: "T-002",
    name: "Placeholder · Teacher Two",
    instruments: ["Piano", "Keyboard"],
    areas: ["Noida", "Online"],
    maxStudents: 18,
    currentStudents: 11,
    rating: 4.8,
    active: true,
    verificationStatus: "Verified",
    experience: "6+ years",
    qualification: "Grade 8 certified, classical foundation",
    bio: "Specialises in young learners and structured, exam-ready progress.",
  },
  {
    id: "T-003",
    name: "Placeholder · Teacher Three",
    instruments: ["Vocals (Western)", "Vocals (Hindustani)"],
    areas: ["Central Delhi", "Online"],
    maxStudents: 16,
    currentStudents: 9,
    rating: 4.9,
    active: true,
    verificationStatus: "Verified",
    experience: "10+ years",
    qualification: "Vocal performance diploma",
    bio: "Builds confident, healthy vocal technique for performers and beginners alike.",
  },
  {
    id: "T-004",
    name: "Placeholder · Teacher Four",
    instruments: ["Drums", "Cajon"],
    areas: ["Gurugram", "Faridabad"],
    maxStudents: 14,
    currentStudents: 8,
    rating: 4.7,
    active: true,
    verificationStatus: "Verified",
    experience: "7+ years",
    qualification: "Rhythm specialist, gigging musician",
    bio: "Energetic, groove-first teaching with a strong focus on timing and reading.",
  },
  {
    id: "T-005",
    name: "Placeholder · Teacher Five",
    instruments: ["Violin"],
    areas: ["South Delhi", "Online"],
    maxStudents: 12,
    currentStudents: 6,
    rating: 4.8,
    active: true,
    verificationStatus: "Verified",
    experience: "9+ years",
    qualification: "Western classical, orchestral experience",
    bio: "Precise, encouraging approach to intonation, posture, and musical phrasing.",
  },
];

export const AREAS_SERVED = [
  "South Delhi",
  "Central Delhi",
  "Gurugram",
  "Noida",
  "Faridabad",
  "Ghaziabad",
  "Online (anywhere)",
];
