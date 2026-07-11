// ============================================================================
// Musicphonetics homepage funnel - edit content here without touching components.
// ============================================================================

// WhatsApp (shared with the rest of the site via lib/data). Edit the number
// there; the prefilled messages below are funnel-specific.
export { WHATSAPP_NUMBER, whatsappLink } from "@/lib/data";

// Prefilled WhatsApp messages, varied by section so you can see what converts.
export const WA_MSG = {
  trial: "Hi Musicphonetics, I'd like to book a free trial class.",
  fees: "Hi Musicphonetics, I'd like to know about the programmes and fees for my child.",
  hero: "Hi Musicphonetics, I'd like to know more about music classes.",
  why: "Hi Musicphonetics, I'd like help finding the right path for music classes.",
  foundation: "Hi Musicphonetics, I'd like to know about the Foundation plan.",
  main: "Hi Musicphonetics, I'd like to know about the Main Pathway.",
  directors: "Hi Musicphonetics, I'd like to request access to the Director's Circle.",
  packages: "Hi Musicphonetics, I'd like help choosing the right programme.",
  reviews: "Hi Musicphonetics, I saw your reviews and I'd like to know more.",
  process: "Hi Musicphonetics, I'd like to book a free consultation.",
  events: "Hi Musicphonetics, I'd like to know about the South Delhi centre and the open mic events.",
  final: "Hi Musicphonetics, I'd like to start my music journey.",
};

export interface HomePackage {
  key: string;
  name: string;
  price: string | null;      // null → "By request", never a per-class price
  payAmount: number | null;  // ₹ for instant Cashfree enrolment; null → WhatsApp only
  cadence: string | null;    // e.g. "8 classes / month · 1 hour each"
  badge?: string;
  secondaryBadge?: string;
  tagline: string;
  bullets: string[];
  forWho: string[];          // "View details" - who it's for
  notForWho: string[];       // who it's NOT for
  note?: string;
  ctaLabel: string;
  ctaMsg: string;
  featured?: boolean;
  exclusive?: boolean;
}

export const HOME_PACKAGES: HomePackage[] = [
  {
    key: "foundation",
    name: "Foundation Journey",
    price: "₹8,000",
    payAmount: 8000,
    cadence: "32-class beginner journey · 4 chapters",
    tagline: "A 32-class beginner pathway, divided into 4 chapters.",
    bullets: [
      "Best for absolute beginners",
      "4 chapters: Starting Right → Ready for Main Pathway",
      "No Trinity grades or exam preparation in this plan",
      "After Foundation, students move to the Main Pathway",
    ],
    forWho: [
      "Absolute beginners - children or adults",
      "Anyone wanting a calm, correct first start",
      "Casual learners exploring an instrument",
      "Parents testing if their child enjoys music",
    ],
    notForWho: [
      "Students who want Trinity grades or exam prep",
      "Anyone chasing fast, advanced progress",
      "Serious performance or competition goals",
    ],
    ctaLabel: "Enquire on WhatsApp",
    ctaMsg: WA_MSG.foundation,
  },
  {
    key: "main",
    name: "Main Musicphonetics Pathway",
    price: "₹12,000",
    payAmount: 12000,
    cadence: "8 classes / month · 1 hour each",
    badge: "Most Recommended",
    secondaryBadge: "Main Pathway",
    tagline: "The full system - for real, lasting progress.",
    bullets: [
      "Serious progress with a strong foundation",
      "Stage confidence, theory, ear training & improvisation",
      "Grade-oriented / Trinity preparation where applicable",
      "Progress tracking with founder & system oversight",
    ],
    forWho: [
      "Serious learners committed to real progress",
      "Kids, teens & adults who want structure, theory & performance",
      "Students aiming for Trinity grades / exams",
      "Anyone who wants a clear long-term musical direction",
    ],
    notForWho: [
      "Someone wanting only a few casual songs",
      "Learners who don't want any structure or tracking",
    ],
    note: "Serious students typically move here after ~4 months.",
    ctaLabel: "Choose the Main Pathway",
    ctaMsg: WA_MSG.main,
    featured: true,
  },
  {
    key: "directors",
    name: "Director's Circle",
    price: null,
    payAmount: null,
    cadence: null,
    badge: "By request only",
    tagline: "Direct founder-level mentoring, for a select few.",
    bullets: [
      "By request only",
      "Limited availability",
      "~1 week waiting list",
      "An exclusive, personally guided pathway",
    ],
    forWho: [
      "Advanced or highly committed students",
      "Those wanting direct founder-level mentoring",
      "Performance, audition or competition level",
      "Students happy to wait for a limited slot",
    ],
    notForWho: [
      "Beginners or first-time learners",
      "Casual, exploratory students",
    ],
    ctaLabel: "Request Access on WhatsApp",
    ctaMsg: WA_MSG.directors,
    exclusive: true,
  },
];

// Hero slideshow - real student & performance photos, text overlaid.
export const HERO_SLIDES: string[] = [
  "/images/hero/slide-1.webp",
  "/images/hero/slide-2.webp",
  "/images/hero/slide-3.webp",
  "/images/hero/slide-4.webp",
  "/images/hero/slide-5.webp",
];

// Real, unstaged moments from our classes, recitals and student wins across
// Delhi NCR. No stock photos - these are our people.
export interface Moment { src: string; alt: string; caption: string }
export const REAL_MOMENTS: Moment[] = [
  { src: "/images/moments/02-openmic.webp", alt: "A student singing and playing guitar at an Open Mic and Chai evening", caption: "Open Mic & Chai - our students take the mic." },
  { src: "/images/moments/03-stage-guitar.webp", alt: "A Musicphonetics student performing guitar on a large stage", caption: "On the big stage, where months of practice pay off." },
  { src: "/images/moments/05-group.webp", alt: "Musicphonetics students celebrating an award together", caption: "Student of the term, celebrated together." },
  { src: "/images/moments/09-mentor.webp", alt: "A Musicphonetics teacher performing on electric guitar", caption: "Taught by musicians who still perform." },
  { src: "/images/moments/04-award.webp", alt: "Founder Abhishek Kumar giving a student an award", caption: "Recognising our students' progress." },
  { src: "/images/moments/openmic-audience.webp", alt: "A full-house audience at a Musicphonetics Open Mic and Chai evening", caption: "A full house at Open Mic & Chai." },
  { src: "/images/moments/01-celeb.webp", alt: "Founder Abhishek Kumar with a well-known musician", caption: "Rubbing shoulders with the artists who inspire us." },
  { src: "/images/moments/08-stage.webp", alt: "Musicphonetics students and teacher backstage at an event", caption: "Backstage, together." },
];

// "How it works" - a swipeable, app-like flow. Warm, clear copy, each with a
// real photo.
export interface HowStep { img: string; kicker: string; title: string; body: string }
export const HOW_STEPS: HowStep[] = [
  {
    img: "/images/moments/07-office.webp",
    kicker: "The right fit",
    title: "A teacher matched to your child",
    body: "We personally pair a teacher to your child's age, instrument and goal - not whoever happens to be free that day.",
  },
  {
    img: "/images/moments/03-stage-guitar.webp",
    kicker: "A real method",
    title: "Structure, not a pile of songs",
    body: "Technique, theory, rhythm and ear training - taught step by step, the way music is actually meant to be learnt.",
  },
  {
    img: "/images/portal-preview.webp",
    kicker: "Tracked for you",
    title: "Every class, written up",
    body: "After each class you see what was taught, the homework and what's next - right inside your own parent portal.",
  },
  {
    img: "/images/moments/02-openmic.webp",
    kicker: "On to the stage",
    title: "All the way to a real stage",
    body: "Open mics and student showcases every few months, so all that practice turns into real confidence.",
  },
];

// Short, punchy "what you'll achieve" cards - image with text over it. Replaces
// the long Foundation section on the homepage.
export interface Achievement { img: string; title: string; sub: string }
export const ACHIEVEMENTS: Achievement[] = [
  { img: "/images/moments/03-stage-guitar.webp", title: "Play your first song", sub: "In your early weeks, not someday." },
  { img: "/images/moments/02-openmic.webp", title: "Perform on a real stage", sub: "Open mics every few months." },
  { img: "/images/moments/05-group.webp", title: "Earn real recognition", sub: "Student-of-the-term & showcases." },
  { img: "/images/moments/09-mentor.webp", title: "Grow with a mentor", sub: "One teacher who knows you." },
];

// Foundation curriculum roadmap - what the student LEARNS in each chapter. This
// is a public overview, so it shows the path, never fake progress numbers (live
// progress lives in the parent portal, where it is real).
export interface RoadmapChapter { n: number; name: string; learn: string }
export const FOUNDATION_ROADMAP: RoadmapChapter[] = [
  { n: 1, name: "Starting Right", learn: "Getting comfortable with the instrument - posture, first clean sounds, basic rhythm and a daily practice habit." },
  { n: 2, name: "Building Basics", learn: "First real notes, chords and scales - moving from just comfortable to actually in control." },
  { n: 3, name: "Musical Confidence", learn: "Playing real songs and exercises with steady timing, and starting to practise independently." },
  { n: 4, name: "Ready for the Next Level", learn: "A simple performance piece, a review of strengths and gaps, and a clear plan into the Main Pathway." },
];

// Google review screenshots in public/reviews/. Reorder / swap freely.
// Homepage shows HOME_REVIEW_COUNT of these; /reviews shows all.
export const REVIEWS: string[] = [
  "review-01.webp", "review-02.webp", "review-03.webp", "review-04.webp",
  "review-05.webp", "review-06.webp", "review-07.webp", "review-08.webp",
  "review-09.webp", "review-10.webp", "review-11.webp", "review-12.webp",
  "review-13.webp",
];
export const HOME_REVIEW_COUNT = 8;
