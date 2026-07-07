// ============================================================================
// Detailed programme content — powers the /programmes/[slug] pages.
// Edit copy here without touching the page template.
// ============================================================================

export interface Journey { when: string; t: string; d: string }
export interface Step { t: string; d: string }
export interface Faq { q: string; a: string }

export interface Programme {
  slug: string;
  name: string;
  price: string | null;
  payAmount: number | null;
  cadence: string;
  badge?: string;
  heroImage: string;
  intro: string;
  whoStudents: string[];
  whoParents: string[];
  notFor: string[];
  whatLearn: string[];
  howItWorks: Step[];
  duration: string;
  format: string;
  whatToExpect: Journey[];
  faq: Faq[];
  ctaMsg: string;
}

export const PROGRAMMES: Programme[] = [
  {
    slug: "foundation",
    name: "Foundation",
    price: "₹8,000",
    payAmount: 8000,
    cadence: "8 classes / month · 1 hour each",
    heroImage: "/images/hero/slide-2.webp",
    intro:
      "A calm, correct first start on your instrument — designed for absolute beginners who want to learn properly, without pressure.",
    whoStudents: [
      "Complete beginners — children (6+) and adults",
      "Anyone who tried learning randomly and wants real structure",
      "Hobby learners exploring guitar, piano/keyboard or vocals",
      "Nervous first-timers who want a gentle, guided start",
    ],
    whoParents: [
      "Parents who want their child to try music the right way",
      "Families testing if a child truly enjoys an instrument",
      "Those who want a safe, structured, no-pressure beginning",
      "Parents who value a clear, honest starting point over hype",
    ],
    notFor: [
      "Students who want Trinity grades or exam preparation",
      "Anyone chasing fast, advanced progress",
      "Serious performance or competition goals",
    ],
    whatLearn: [
      "Correct posture, hand position and technique",
      "Your first chords, notes and simple melodies",
      "Rhythm and timing fundamentals",
      "The basics of reading music",
      "Playing your first complete simple song",
      "Building a steady daily practice habit",
    ],
    howItWorks: [
      { t: "A quick consultation", d: "We chat on WhatsApp to understand the student's age, goal and comfort level." },
      { t: "The right teacher, matched", d: "We assign a teacher who fits the learner — not whoever is free." },
      { t: "8 one-hour classes a month", d: "At home, online, or at our South Delhi centre — you choose." },
      { t: "Simple progress notes", d: "After classes, so you always know how things are going." },
    ],
    duration: "8 classes per month · 1 hour each · billed monthly.",
    format: "At home across Delhi NCR · Online anywhere · At our South Delhi centre.",
    whatToExpect: [
      { when: "Month 1", t: "Comfortable & confident", d: "Holding the instrument correctly, first notes and chords, steady hands." },
      { when: "Month 2", t: "Your first song", d: "Playing a simple piece with steady rhythm and growing confidence." },
      { when: "Month 3", t: "Ready to grow", d: "A small piece start-to-finish — and a clear decision on the Main Pathway." },
    ],
    faq: [
      { q: "Is this really for complete beginners?", a: "Yes — Foundation is built for people starting from zero, children and adults alike." },
      { q: "Does it include exams or grades?", a: "No. Trinity grades and exam preparation are part of the Main Pathway, not Foundation." },
      { q: "Home or online?", a: "Both — plus our South Delhi centre. You choose what suits you." },
      { q: "What age can start?", a: "Children from around 6 years, and adults of any age." },
      { q: "Can I move to the Main Pathway later?", a: "Yes — most serious students move up after about 4 months." },
    ],
    ctaMsg: "Hi Musicphonetics, I'd like to enrol in the Foundation plan.",
  },
  {
    slug: "main",
    name: "Main Musicphonetics Pathway",
    price: "₹12,000",
    payAmount: 12000,
    cadence: "8 classes / month · 1 hour each",
    badge: "Most Recommended",
    heroImage: "/images/hero/slide-3.webp",
    intro:
      "The full Musicphonetics system — structure, theory, performance and real, tracked progress. This is where serious students are built.",
    whoStudents: [
      "Serious learners of any age who want to genuinely get good",
      "Students preparing for Trinity or graded exams",
      "Aspiring performers who want stage confidence",
      "Anyone who has outgrown casual, song-by-song lessons",
    ],
    whoParents: [
      "Parents who want measurable progress and a clear path",
      "Families who value structure, theory and performance",
      "Those who want progress tracking and real communication",
      "Parents who see music as a long-term investment, not a dabble",
    ],
    notFor: [
      "Someone wanting only a few casual songs",
      "Learners who don't want any structure or tracking",
    ],
    whatLearn: [
      "A strong technical foundation on your instrument",
      "Music theory and notation",
      "Ear training and rhythm",
      "Improvisation and creativity",
      "Repertoire across styles",
      "Stage and performance confidence",
      "Trinity / graded-exam preparation where applicable",
    ],
    howItWorks: [
      { t: "Consultation & assessment", d: "We understand the student's level and goals, then build a personalised plan." },
      { t: "A specialist teacher, matched", d: "Chosen for the student's instrument, level and ambition." },
      { t: "8 structured one-hour classes a month", d: "Following the graded Musicphonetics curriculum and Trinity pathway." },
      { t: "Tracked, with oversight", d: "Class updates, progress notes and founder oversight — plus performance opportunities." },
    ],
    duration: "8 classes per month · 1 hour each · billed monthly, ongoing.",
    format: "At home across Delhi NCR · Online anywhere · At our South Delhi centre.",
    whatToExpect: [
      { when: "Month 1", t: "Assessed & planned", d: "A personalised plan, technique corrected, theory foundation begun." },
      { when: "Months 1–3", t: "Foundation & first performance", d: "Solid technique and theory, your first performance-ready piece." },
      { when: "Months 3–6", t: "Depth & exam-ready", d: "Ear training, improvisation and graded-exam readiness where relevant." },
      { when: "6 months +", t: "Confident & stage-ready", d: "Graded progress, real performance confidence, a clear onward path." },
    ],
    faq: [
      { q: "How is this different from Foundation?", a: "Structure, theory, exam preparation, performance and full progress tracking — it's the complete system." },
      { q: "Do you prepare students for Trinity exams?", a: "Yes, where applicable — the curriculum follows the Trinity pathway." },
      { q: "Which instruments?", a: "Guitar, Piano/Keyboard and Vocals, with more across our faculty." },
      { q: "Is online the same quality?", a: "Yes — the same structured curriculum and tracking, delivered live online." },
      { q: "How soon will I see progress?", a: "You'll have structured milestones from the very first month." },
    ],
    ctaMsg: "Hi Musicphonetics, I'd like to enrol in the Main Pathway.",
  },
  {
    slug: "directors-circle",
    name: "Director's Circle",
    price: null,
    payAmount: null,
    cadence: "By request · limited seats",
    badge: "By request only",
    heroImage: "/images/hero/slide-4.webp",
    intro:
      "Direct, founder-level mentoring for a select few. A bespoke, closely-guided path for the most committed students.",
    whoStudents: [
      "Advanced or highly committed students",
      "Performance, audition or competition level",
      "Those who want the founder's direct guidance",
      "Students ready for an intensive, personalised path",
    ],
    whoParents: [
      "Parents of highly committed students seeking the very best mentoring",
      "Families wanting a bespoke, closely-guided journey",
      "Those comfortable with a selective, waitlisted programme",
    ],
    notFor: [
      "Beginners or first-time learners",
      "Casual, exploratory students",
    ],
    whatLearn: [
      "A bespoke plan built entirely around your goals",
      "Advanced technique and artistry",
      "Performance, audition and competition preparation",
      "Deep musicianship and interpretation",
      "Direct founder-level mentorship",
    ],
    howItWorks: [
      { t: "Request access", d: "Message us on WhatsApp — a short conversation to understand your goals." },
      { t: "We assess fit", d: "The Director's Circle is selective; we make sure it's right for you." },
      { t: "Join the waitlist", d: "Limited seats — a typical wait of about a week." },
      { t: "A bespoke plan begins", d: "Designed with you directly, under founder-level oversight." },
    ],
    duration: "By arrangement · limited seats.",
    format: "Personally arranged — in person and/or online.",
    whatToExpect: [
      { when: "Step 1", t: "A personal conversation", d: "We understand exactly where you are and what you're aiming for." },
      { when: "Step 2", t: "A bespoke plan", d: "Your journey is designed around your level, goals and timeline." },
      { when: "Ongoing", t: "Founder-level mentoring", d: "Closely guided progress toward performance, audition or mastery." },
    ],
    faq: [
      { q: "How do I join?", a: "By request only — message us and we'll assess fit for the programme." },
      { q: "Is there a waitlist?", a: "Yes — seats are limited, with a typical wait of about a week." },
      { q: "Is it for beginners?", a: "No — the Director's Circle is for advanced, highly committed students." },
      { q: "What is the fee?", a: "Shared on request, based on your bespoke plan." },
    ],
    ctaMsg: "Hi Musicphonetics, I'd like to request access to the Director's Circle.",
  },
];

export function getProgramme(slug: string): Programme | undefined {
  return PROGRAMMES.find((p) => p.slug === slug);
}
