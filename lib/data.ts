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

/** Prefilled "Book a Trial" WhatsApp link — used by the primary CTA. */
export const WHATSAPP_TRIAL_TEXT =
  "Hi Musicphonetics, I'd like to book a trial class.";
export function whatsappTrialLink(): string {
  return whatsappLink(WHATSAPP_TRIAL_TEXT);
}

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------
export const BRAND = {
  name: "Musicphonetics",
  tagline: "Teaching across cities. Expanding globally.",
  positioning:
    "An education-first music company founded in India, built for structured music learning across cities — and eventually across countries.",
  region: "Delhi NCR",
  founder: "Abhishek Kumar",
  yearsExperience: "10+",
  studentsTaught: "1,100+",
};

// ---------------------------------------------------------------------------
// Primary navigation
// ---------------------------------------------------------------------------
export const NAV_LINKS = [
  { label: "Founder", href: "/founder" },
  { label: "Method", href: "/method" },
  { label: "Programs", href: "/programs" },
  { label: "Teachers", href: "/teachers" },
  { label: "Reviews", href: "/reviews" },
  { label: "Teach with us", href: "/teach-with-us" },
];

// Trust line shown under the hero and elsewhere.
export const TRUST_LINE = `${BRAND.yearsExperience} years · ${BRAND.studentsTaught} students taught · Home, online, and future academy pathways`;

// Simplified footer navigation per go-live spec.
export const FOOTER_NAV = [
  { label: "Home", href: "/" },
  { label: "Method", href: "/method" },
  { label: "Programs", href: "/programs" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact", href: "/contact" },
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
      "We had tried two teachers before this. The difference here was the structure. My daughter finally started practising without us pushing her every day.",
    author: "Parent, Gurgaon",
    sample: true,
  },
  {
    quote:
      "Initially we only booked the trial class. Three months later, even I joined keyboard classes along with my son.",
    author: "Working Parent, Mumbai",
    sample: true,
  },
  {
    quote:
      "The teacher was punctual, polite, and gave proper feedback after every class. That professionalism made us continue.",
    author: "Parent, Delhi NCR",
    sample: true,
  },
  {
    quote:
      "We wanted online guitar classes but did not want random YouTube-style teaching. Musicphonetics gave us a proper path.",
    author: "NRI Parent, Dubai",
    sample: true,
  },
  {
    quote:
      "My son was shy in the first class. Now he plays in front of family without hesitation.",
    author: "Parent, Bengaluru",
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

// Short, punchy lines for the floating hero review cards.
// SAMPLE placeholders — clearly disclosed in the hero and Reviews section.
// TODO(content): replace with verified parent testimonials before launch.
export const HERO_REVIEWS: { quote: string; author: string }[] = [
  { quote: "My daughter finally practises without us pushing her.", author: "Parent, Gurgaon" },
  { quote: "Three months later, even I joined keyboard classes.", author: "Working Parent, Mumbai" },
  { quote: "Punctual, polite, and proper feedback after every class.", author: "Parent, Delhi NCR" },
  { quote: "A proper path — not random YouTube-style teaching.", author: "NRI Parent, Dubai" },
  { quote: "Now he plays in front of family without hesitation.", author: "Parent, Bengaluru" },
];

export const PACKAGES_NOTE =
  "Every student follows a personalised pathway. Final teacher, slot, and confirmation are handled personally by the Musicphonetics team.";

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------
export const FAQS: FaqItem[] = [
  {
    q: "How does the trial class work?",
    a: "You begin with a short guided conversation on WhatsApp so we understand the learner. We then arrange a trial class with a matched teacher — no long commitment to start. After the trial, we recommend a clear learning path.",
  },
  {
    q: "Do you offer online music classes?",
    a: "Yes. Live one-to-one online classes follow the same structured method, so students can learn from any city or country with the same standard.",
  },
  {
    q: "Do you offer home music classes?",
    a: "Yes. Home classes are available across Delhi NCR, delivered by carefully selected, verified teachers — with more cities opening as we expand.",
  },
  {
    q: "Which cities do you serve?",
    a: "We are live in Delhi NCR and online today, with Mumbai, Bengaluru, Hyderabad, Chennai, Pune, and Kolkata next, followed by international locations. Availability may vary by city.",
  },
  {
    q: "Can adults join?",
    a: "Absolutely. We teach complete beginners and serious learners of all ages, with pacing that respects each student. Many parents start alongside their children.",
  },
  {
    q: "Can children prepare for graded music exams?",
    a: "Yes. We offer structured preparation aligned to recognised graded pathways such as Trinity College London, ABRSM, and Rockschool, where applicable.",
  },
  {
    q: "How are teachers selected?",
    a: "Every teacher passes a seven-stage quality pipeline — application, interview, skill assessment, teaching evaluation, background verification, founder approval — before they teach a single class.",
  },
  {
    q: "How many classes are included in one cycle?",
    a: "A standard learning cycle is eight classes, giving students a steady monthly rhythm that builds real momentum.",
  },
  {
    q: "How do parents track progress?",
    a: "Learning follows a clear, staged path with feedback after classes, so parents always know what their child is working on and what comes next.",
  },
  {
    q: "Can NRI students join?",
    a: "Yes. NRI students learn through our live online classes, following the same structured method as students in India.",
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
