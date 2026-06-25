// ============================================================================
// Musicphonetics — Founder, Ecosystem & Vision content
// Truthful achievements only. Future initiatives are explicitly labelled as
// vision / roadmap — never presented as existing operations.
// ============================================================================

export const FOUNDER = {
  name: "Abhishek Kumar",
  role: "Founder · Musicphonetics",
  photo: "/founder.png",
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
    label: "The beginning",
    title: "It started at the ground level.",
    body: [
      "Abhishek Kumar didn't begin with a business plan. He began with an instrument, a handful of students, and a question that wouldn't go away: why does learning music feel so different from one student to the next?",
      "For years he taught the way most do — one student, one room, one song at a time.",
    ],
  },
  {
    key: "experience",
    label: "The experience",
    title: "A decade. Eleven hundred students.",
    body: [
      "Over ten-plus years, he taught more than 1,100 one-on-one students — children, teenagers, and adults. Beginners nervous to make their first sound, and serious learners chasing real mastery.",
      "He was invited to judge at colleges across Delhi NCR, and trusted by accomplished students from every walk of life — including ministers, IAS officers, and high-profile professionals.",
    ],
  },
  {
    key: "realisation",
    label: "The realisation",
    title: "The problem was never the teachers.",
    body: [
      "After 1,100 students, one pattern became impossible to ignore. Great music education wasn't limited by talented teachers.",
      "It was limited by inconsistent systems. The same lesson could transform one student and lose another — not because of skill, but because of structure.",
    ],
  },
  {
    key: "vision",
    label: "The vision",
    title: "So he built a better system.",
    body: [
      "Musicphonetics is that system — a structured, director-led methodology distilled from years of real teaching, designed so every student gets the same standard of clarity from day one.",
      "Education is the heart of the company. Everything else grows from it.",
    ],
  },
  {
    key: "future",
    label: "The future",
    title: "This is bigger than lessons.",
    body: [
      "The long-term vision is an ecosystem where students, teachers, artists, creators, schools, and music businesses all connect through one trusted platform.",
      "Founded in India. Designed for global growth. This is the beginning of a company that wants to shape the future of music education.",
    ],
  },
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
    period: "The early years",
    title: "Teaching, one student at a time",
    body: "Years spent teaching one-on-one across Delhi NCR — learning what actually helps a student grow.",
  },
  {
    period: "Building the method",
    title: "A structured methodology takes shape",
    body: "Patterns from real teaching are distilled into a repeatable, director-led learning system.",
  },
  {
    period: "1,100+ students",
    title: "A decade of one-on-one teaching",
    body: "Children, teenagers, and adults — including accomplished public figures and professionals.",
  },
  {
    period: "Today",
    title: "Musicphonetics launches",
    body: "The method becomes a company: structured, personal, director-led music education.",
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
