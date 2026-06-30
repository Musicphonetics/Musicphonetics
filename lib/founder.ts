// ============================================================================
// Musicphonetics — Founder, Ecosystem & Vision content
// Truthful achievements only. Future initiatives are explicitly labelled as
// vision / roadmap — never presented as existing operations.
// ============================================================================

export const FOUNDER = {
  name: "Abhishek Kumar",
  role: "Founder · Musicphonetics",
  photo: "/founder.webp",
  photoAlt:
    "Abhishek Kumar, founder of Musicphonetics — guitarist, vocalist, and music educator",
};

// Truthful highlights (as provided by the founder).
export const FOUNDER_HIGHLIGHTS: string[] = [
  "Founder of Musicphonetics",
  "10+ years of teaching experience",
  "1,100+ one-on-one students taught",
  "Guitarist, vocalist, and music educator",
  "Built a structured learning methodology from years of real teaching",
  "Experience teaching children, teenagers, and adults",
  "Focused on long-term musical growth, not short-term song learning",
  "Invited as a judge at colleges across Delhi NCR",
  "Trusted by accomplished students — including ministers, IAS officers, and high-profile professionals",
];

// Cinematic story chapters — revealed one at a time on scroll.
export interface StoryChapter {
  key: string;
  label: string;
  title: string;
  body: string[];
}

export const FOUNDER_STORY: StoryChapter[] = [
  {
    key: "beginning",
    label: "2015 · The beginning",
    title: "One guitar. Three chords. One student.",
    body: [
      "It began in 2015 with one guitar, three basic chords, one student, and one dream. No office. No company. Only a desire to teach well.",
      "There was nothing impressive about the setup — just a conviction that a child given the right start could carry music for the rest of their life.",
    ],
  },
  {
    key: "faith",
    label: "The foundation",
    title: "Faith built this journey.",
    body: [
      "Every step was taken on faith long before there was proof it would work. The belief came first; the company followed.",
      "“Commit your work to the Lord, and your plans will be established.” — Proverbs 16:3",
    ],
  },
  {
    key: "realisation",
    label: "The realisation",
    title: "The problem was never the teachers.",
    body: [
      "After more than 1,100 one-on-one students — children, teenagers, and adults — one pattern became impossible to ignore. Talent was not the problem.",
      "It was the system. The same lesson could transform one student and lose another — not because of skill, but because of structure.",
    ],
  },
  {
    key: "today",
    label: "Today",
    title: "From one student to a company.",
    body: [
      "Today, Musicphonetics is a growing education company — teaching across cities, expanding globally, and built on systems, standards, and documentation.",
      "Faith first. Music second. Business third. In that order, deliberately.",
    ],
  },
  {
    key: "future",
    label: "The future",
    title: "Train up a child in the way he should go.",
    body: [
      "The mission is bigger than lessons: to give every learner a teacher, a structure, and a path — and to build a company that still serves families decades from now.",
      "“Train up a child in the way he should go; even when he is old he will not depart from it.” — Proverbs 22:6",
    ],
  },
];

// Founder social & professional links.
// TODO(content): replace placeholder URLs with the founder's real profiles.
export const FOUNDER_SOCIALS = [
  { label: "LinkedIn", href: "#", handle: "Professional profile" },
  { label: "Instagram", href: "#", handle: "@musicphonetics" },
  { label: "Email", href: "mailto:guitaristabhishek07@gmail.com", handle: "guitaristabhishek07@gmail.com" },
  { label: "Founder Website", href: "#", handle: "abhishekkumar.in" },
];

// Founder / company timeline. Future items are flagged as roadmap.
export interface TimelineItem {
  period: string;
  title: string;
  body: string;
  roadmap?: boolean;
}

export const FOUNDER_TIMELINE: TimelineItem[] = [
  {
    period: "2015",
    title: "One guitar, one student",
    body: "Three chords, one dream, and a desire to teach well — with no office and no company.",
  },
  {
    period: "Building the method",
    title: "A structured methodology takes shape",
    body: "Patterns from real teaching are distilled into a repeatable, faculty-led learning system.",
  },
  {
    period: "1,100+ students",
    title: "A decade of one-on-one teaching",
    body: "Children, teenagers, and adults — including accomplished public figures and professionals.",
  },
  {
    period: "Today",
    title: "Musicphonetics launches",
    body: "The method becomes a company: structured, personal, faculty-led music education.",
  },
  {
    period: "Now growing",
    title: "Building the teacher network",
    body: "Carefully selected, verified teachers extend the same standard to more families.",
  },
  {
    period: "Roadmap",
    title: "Expanding the ecosystem",
    body: "Group academies, artist development, studios, and new regions — built step by step.",
    roadmap: true,
  },
];

// The Musicphonetics Ecosystem — interconnected divisions.
// status: "current" = real today · "growing" = forming now · "vision" = roadmap.
export interface EcoNode {
  label: string;
  status: "current" | "growing" | "vision";
}

export const ECOSYSTEM_NODES: EcoNode[] = [
  { label: "Learning", status: "current" },
  { label: "Teachers", status: "current" },
  { label: "Students", status: "current" },
  { label: "Parents", status: "current" },
  { label: "Schools", status: "growing" },
  { label: "Digital Learning", status: "growing" },
  { label: "Communities", status: "growing" },
  { label: "Content", status: "growing" },
  { label: "Artists", status: "vision" },
  { label: "Original Music", status: "vision" },
  { label: "Studios", status: "vision" },
  { label: "Events", status: "vision" },
  { label: "Competitions", status: "vision" },
  { label: "Technology", status: "vision" },
  { label: "Research", status: "vision" },
  { label: "Scholarships", status: "vision" },
  { label: "Regional Leadership", status: "vision" },
  { label: "Partnerships", status: "vision" },
  { label: "Merchandise", status: "vision" },
  { label: "Instrument Retail", status: "vision" },
  { label: "Media", status: "vision" },
];

export const ECO_LEGEND: { status: EcoNode["status"]; label: string }[] = [
  { status: "current", label: "Today" },
  { status: "growing", label: "Forming now" },
  { status: "vision", label: "Long-term vision" },
];

// Future brand architecture — examples of where the company could grow.
// Clearly examples of future divisions, not current products.
export const FUTURE_DIVISIONS: { name: string; body: string }[] = [
  { name: "Musicphonetics Learn", body: "The structured learning platform — the heart of everything." },
  { name: "Musicphonetics Artists", body: "Artist development for serious musicians and creators." },
  { name: "Musicphonetics Studios", body: "Spaces to record, practise, and produce." },
  { name: "Musicphonetics Live", body: "Performances, recitals, and events." },
  { name: "Musicphonetics Store", body: "Instruments, gear, and curated merchandise." },
  { name: "Musicphonetics Research", body: "Advancing how music is taught and learned." },
  { name: "Musicphonetics Foundation", body: "Scholarships and access for deserving talent." },
  { name: "Musicphonetics Media", body: "Stories, content, and the voice of the movement." },
];

// Global vision — founded in India, designed for global growth.
export interface VisionRegion {
  label: string;
  note: string;
  status: "current" | "vision";
  // Approximate position on the stylised map (percentages).
  x: number;
  y: number;
}

export const VISION_REGIONS: VisionRegion[] = [
  { label: "Delhi NCR", note: "Home & online classes", status: "current", x: 68, y: 40 },
  { label: "Online (anywhere)", note: "Learn from any city", status: "current", x: 50, y: 55 },
  { label: "Pan-India", note: "Regional leadership — roadmap", status: "vision", x: 70, y: 52 },
  { label: "Global", note: "International growth — roadmap", status: "vision", x: 28, y: 38 },
];
