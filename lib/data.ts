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

/** Phone (same number as WhatsApp) for the "Call" quick action. */
export const PHONE_DISPLAY = "+91 87961 99188";
export const phoneLink = `tel:+${WHATSAPP_NUMBER}`;

/** Social — Instagram. */
export const INSTAGRAM_HANDLE = "abhisheksessions";
export const INSTAGRAM_URL = "https://instagram.com/abhisheksessions";

/**
 * Google Business Profile — fill these once the profile exists and the section
 * appears automatically (renders nothing while `profileUrl` is empty).
 *  - profileUrl:   your public GBP page (share link)
 *  - reviewUrl:    the "write a review" / reviews link (g.page/…/review or the
 *                  Place-ID review link)
 *  - mapEmbedSrc:  Google Maps "Embed a map" iframe src (optional)
 */
export const GOOGLE_BUSINESS = {
  profileUrl: "",
  reviewUrl: "",
  mapEmbedSrc: "",
};

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------
export const BRAND = {
  name: "Musicphonetics",
  tagline: "Across Delhi NCR & online.",
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
  { label: "Programs", href: "/#programs" },
  { label: "Faculty", href: "/teachers" },
  { label: "Standards", href: "/standards" },
  { label: "Centre", href: "/centre" },
  { label: "Reviews", href: "/reviews" },
  { label: "Founder", href: "/founder" },
];

// Trust line shown under the hero and elsewhere.
export const TRUST_LINE = `${BRAND.yearsExperience} years · ${BRAND.studentsTaught} students taught · Home, online, and future academy pathways`;

// Simplified footer navigation per go-live spec.
export const FOOTER_NAV = [
  { label: "Home", href: "/" },
  { label: "Programs", href: "/#programs" },
  { label: "Curriculum", href: "/curriculum" },
  { label: "Standards", href: "/standards" },
  { label: "South Delhi Centre", href: "/centre" },
  { label: "Trust Centre", href: "/trust" },
  { label: "Reviews", href: "/reviews" },
  { label: "Teach With Us", href: "/teach-with-us" },
  { label: "Contact", href: "/contact" },
  { label: "Support", href: "/support" },
];

// ---------------------------------------------------------------------------
// Trust strip stats
// ---------------------------------------------------------------------------
export const TRUST_STATS = [
  { value: "10+", label: "Years" },
  { value: "1,000+", label: "Students" },
  { value: "Faculty-led", label: "Method" },
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
    title: "Faculty-led philosophy",
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
  "Faculty-led standard",
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
// Reviews — REAL, verified reviews collected after real classes.
// Privacy (child safety): for under-18 students we publish first name + last
// initial + age + broad area only — never building names. Keep written
// consent on file for every published review.
// ---------------------------------------------------------------------------
export const REVIEWS: Review[] = [
  {
    name: "Priya Sharma",
    role: "Parent",
    area: "Dwarka",
    rating: 5,
    onFees: true,
    quote:
      "Initially, we felt the fees were slightly higher than other tutors we explored. But after seeing our daughter's progress, we realised the value goes far beyond the lessons. The regular updates, personal attention and genuine care make every rupee worthwhile.",
  },
  {
    name: "Rajesh Verma",
    role: "Parent",
    area: "Vasant Kunj",
    rating: 5,
    onFees: true,
    quote:
      "The classes are always well-structured, punctual and engaging. Our son genuinely looks forward to every session. While the fees are premium, the quality of teaching, professionalism and communication fully justify the investment.",
  },
  {
    name: "Neha Kapoor",
    role: "Parent",
    area: "Green Park",
    rating: 5,
    quote:
      "The relationship built with both students and parents is something we truly appreciate. We receive regular progress updates, and the improvement in our child's confidence and musical ability has been remarkable. Highly recommended.",
  },
  {
    name: "Aarav M.",
    role: "Student",
    age: 13,
    area: "Gurugram",
    rating: 5,
    quote:
      "Every class is exciting and I never feel bored. My teacher is patient, encouraging and explains everything clearly. I can now play songs I never imagined learning just a few months ago.",
  },
  {
    name: "Ananya K.",
    role: "Student",
    age: 11,
    area: "Gurugram",
    rating: 5,
    quote:
      "I love my music classes. Everything is explained step by step, and I'm always encouraged to practise. Every week I feel more confident, and learning has become something I genuinely look forward to.",
  },
  {
    name: "Rohan K.",
    role: "Student",
    age: 15,
    area: "South Delhi",
    rating: 5,
    quote:
      "The home classes are convenient and every lesson is enjoyable. My technique, confidence and understanding of music have improved significantly. I always look forward to the next class.",
  },
  {
    name: "Lt Col.",
    role: "Parent",
    area: "Delhi Cantonment",
    defence: true,
    rating: 5,
    onFees: true,
    quote:
      "As parents, we value discipline, punctuality and professionalism — and that is exactly what we have experienced. The fees may be higher than average, but the personalised coaching, structured approach and consistent communication make them completely worthwhile.",
  },
  {
    name: "Col.",
    role: "Parent",
    area: "Delhi Cantonment",
    defence: true,
    rating: 5,
    quote:
      "The teacher has developed an excellent rapport with our child while keeping us informed throughout. The attention to detail, regular feedback and premium experience make Musicphonetics stand apart.",
  },
  {
    name: "Brigadier",
    role: "Parent",
    area: "Delhi Cantonment",
    defence: true,
    rating: 5,
    onFees: true,
    quote:
      "Within a few months, we noticed a remarkable improvement in our child's confidence and musical ability. The personalised home coaching and commitment shown in every lesson easily justify the premium fees.",
  },
  {
    name: "Major General",
    role: "Parent",
    area: "Delhi Cantonment",
    defence: true,
    rating: 5,
    onFees: true,
    quote:
      "Exceptional professionalism from the very first interaction. Classes are punctual, communication with parents is excellent, and the environment is both disciplined and encouraging. A premium coaching experience that is absolutely worth the investment.",
  },
];

// ---------------------------------------------------------------------------
// Packages / Learning Paths — exact copy per spec.
// TODO(pricing): update prices here when packages change.
// ---------------------------------------------------------------------------
export const PACKAGES: Package[] = [
  {
    key: "Foundation",
    name: "Foundation",
    tagline: "Structured, one-to-one music education to a real standard.",
    priceFrom: "from ₹12,000",
    unit: "/month · 8 classes (₹1,500/class)",
    bullets: [
      "Verified faculty (7-stage selection)",
      "Structured one-to-one method",
      "Monthly progress reports",
      "Home, online, or South Delhi centre",
      "Exam-pathway access (Trinity-recognised)",
    ],
  },
  {
    key: "Signature",
    name: "Signature",
    tagline: "Our most-chosen path — senior faculty and dedicated exam prep.",
    priceFrom: "from ₹18,000",
    unit: "/month · 8 classes (₹2,250/class)",
    featured: true,
    badge: "Most chosen",
    bullets: [
      "Everything in Foundation, plus:",
      "Hand-picked senior faculty",
      "Priority scheduling",
      "Detailed reports + lesson recordings",
      "Dedicated exam prep & featured performances",
    ],
  },
  {
    key: "Director's Circle",
    name: "Director's Circle",
    tagline: "Personally with the Director — full artist development.",
    priceFrom: "By application",
    unit: "limited seats · from ₹28,000/mo",
    premium: true,
    application: true,
    badge: "By application · limited seats",
    bullets: [
      "Personally with the Director (Abhishek)",
      "Concierge scheduling",
      "Full artist development",
      "Showcase performances",
      "A direct line to the Director",
    ],
  },
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
