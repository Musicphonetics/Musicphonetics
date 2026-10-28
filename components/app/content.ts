// ============================================================================
// Content for the Musicphonetics app experience.
//
// NOTE FOR THE FOUNDER: the community posts, directory profiles, social
// follower/post counts and the headline statistics below are PLACEHOLDER
// content for the experience build. They are illustrative of the product and
// are meant to be replaced with real data once the app is wired to a backend
// and to the Instagram / YouTube / Spotify APIs. Nothing here reads live data.
// ============================================================================

export const HERO_STATS = [
  { n: "2,400+", l: "musicians & learners" },
  { n: "180+", l: "teachers & academies" },
  { n: "42", l: "cities" },
  { n: "19,600", l: "hours practised" },
  { n: "260+", l: "events & open mics" },
];

export type Role = {
  key: "student" | "parent" | "teacher" | "musician";
  tag: string;
  title: string;
  body: string;
  points: string[];
  img: string;
  pos?: string;
};

export const ROLES: Role[] = [
  {
    key: "student", tag: "For students",
    title: "Practice with purpose. See yourself improve.",
    body: "Your teacher sets what to work on; you log a few minutes and watch the streak build. No lesson is ever lost between classes.",
    points: ["Today's practice, always clear", "Teacher feedback in one place", "Real progress — no fake scores", "Jump into practice in one tap"],
    img: "/images/classes/ukulele.webp", pos: "50% 35%",
  },
  {
    key: "parent", tag: "For parents",
    title: "Follow the journey. Know how to help.",
    body: "See exactly what your child learned, what to practise this week and how they're progressing — without chasing anyone on WhatsApp.",
    points: ["Lesson summaries & teacher notes", "This week's practice plan", "Progress you can actually see", "One account for the whole family"],
    img: "/images/moments/05-group.webp", pos: "50% 30%",
  },
  {
    key: "teacher", tag: "For teachers",
    title: "Less admin. A profile that wins students.",
    body: "Record a lesson in seconds, keep parents updated automatically, and get a shareable public profile that brings new students to you.",
    points: ["One-tap lesson records", "Automatic parent updates", "A public teaching profile", "See the wider teaching community"],
    img: "/images/classes/keys-duet.webp", pos: "50% 40%",
  },
  {
    key: "musician", tag: "For musicians",
    title: "Your profile is your portfolio.",
    body: "One link that shows who you are — your sound, your genres, and your Instagram, YouTube and Spotify in one place. Send it instead of explaining yourself.",
    points: ["Instagram, YouTube & Spotify in one view", "Followers, posts & reach at a glance", "Share one link as your whole portfolio", "Get discovered for gigs & collaborations"],
    img: "/gallery/03-stage-guitar.jpg", pos: "50% 30%",
  },
];

export type Broadcast = {
  id: string; kind: "Competition" | "Open Mic" | "Announcement" | "Workshop";
  title: string; body: string; place: string; date: string; img: string; pinned?: boolean; reach: string;
};

// Owner-only broadcasts — only Musicphonetics posts these; every user sees them.
export const BROADCASTS: Broadcast[] = [
  {
    id: "b1", kind: "Competition", title: "Open Music Competition — Green Park, Delhi",
    body: "Open to every Musicphonetics user — students, teachers and musicians. Solo and band categories. Winners perform at the winter showcase. Register from the app.",
    place: "Green Park, New Delhi", date: "Sat 15 Nov · 5:00 PM", img: "/images/moments/08-stage.webp", pinned: true, reach: "Sent to all 2,400 members",
  },
  {
    id: "b2", kind: "Open Mic", title: "Monsoon Open Mic — Vol. 8 (Hybrid)",
    body: "Perform live in Delhi or stream in from anywhere. 20 performer slots, all levels welcome.",
    place: "Delhi + Online", date: "Sat 8 Nov · 6:30 PM", img: "/images/moments/openmic-audience.webp", reach: "Sent to all members",
  },
  {
    id: "b3", kind: "Workshop", title: "Fingerstyle Guitar Masterclass",
    body: "A 2-hour live masterclass with a guest faculty member. Recording shared with attendees.",
    place: "Online", date: "Sun 16 Nov · 11:00 AM", img: "/images/classes/jam.webp", reach: "Sent to guitar learners & teachers",
  },
];

export type Social = { followers?: string; posts?: string; subs?: string; monthly?: string; handle: string };
export type Musician = {
  slug: string; name: string; initials: string; tagline: string; location: string;
  genres: string[]; instruments: string[]; cover: string; verified: boolean; bio: string;
  instagram?: Social; youtube?: Social; spotify?: Social; fromFee?: number; pos?: string;
};

export const MUSICIANS: Musician[] = [
  {
    slug: "kabir-rao", name: "Kabir Rao", initials: "KR", tagline: "Acoustic sets that read the room.",
    location: "New Delhi", genres: ["Acoustic", "Bollywood Unplugged", "Pop"], instruments: ["Guitar", "Vocals"],
    cover: "/gallery/03-stage-guitar.jpg", pos: "50% 30%", verified: true,
    bio: "Delhi-based singer-guitarist. Weddings, cafés and private events — unplugged, warm, and always tuned to the crowd.",
    instagram: { handle: "@kabir.plays", followers: "48.2k", posts: "312" },
    youtube: { handle: "Kabir Rao Music", subs: "12.6k" },
    spotify: { handle: "Kabir Rao", monthly: "9,400" }, fromFee: 12000,
  },
  {
    slug: "the-indigo-trio", name: "The Indigo Trio", initials: "IT", tagline: "A tight three-piece for the big nights.",
    location: "Gurugram", genres: ["Jazz", "Funk", "Retro"], instruments: ["Guitar", "Bass", "Cajón"],
    cover: "/gallery/08-stage.jpg", pos: "50% 45%", verified: true,
    bio: "Corporate stages, venue residencies and festival slots. Three players, one very tight groove.",
    instagram: { handle: "@indigotrio", followers: "76.9k", posts: "540" },
    youtube: { handle: "The Indigo Trio", subs: "31.2k" },
    spotify: { handle: "The Indigo Trio", monthly: "41,800" }, fromFee: 35000,
  },
  {
    slug: "meera-nair", name: "Meera Nair", initials: "MN", tagline: "Lounge piano & remote sessions.",
    location: "Bengaluru · Online", genres: ["Jazz", "Lounge", "Film"], instruments: ["Piano", "Keys"],
    cover: "/images/classes/keys-duet.webp", pos: "50% 40%", verified: false,
    bio: "Session pianist for film and indie artists. Lounge sets in person, session work from anywhere.",
    instagram: { handle: "@meeraonkeys", followers: "22.4k", posts: "198" },
    spotify: { handle: "Meera Nair", monthly: "6,100" }, fromFee: 8000,
  },
  {
    slug: "arjun-sethi", name: "Arjun Sethi", initials: "AS", tagline: "Tabla–percussion fusion. Open to collabs.",
    location: "New Delhi", genres: ["Fusion", "World", "Electronic"], instruments: ["Tabla", "Percussion"],
    cover: "/images/moments/08-stage.webp", pos: "50% 40%", verified: true,
    bio: "Fusion percussionist blending tabla with electronic textures. Studio sessions and cross-genre collaborations.",
    instagram: { handle: "@arjun.rhythm", followers: "33.1k", posts: "274" },
    youtube: { handle: "Arjun Sethi", subs: "18.9k" },
    spotify: { handle: "Arjun Sethi", monthly: "15,300" }, fromFee: 10000,
  },
];

export type Teacher = {
  slug: string; name: string; initials: string; subjects: string[]; students: number;
  location: string; years: number; mode: string; activity: string; verified: boolean;
};

export const TEACHERS: Teacher[] = [
  { slug: "rohan-mehta", name: "Rohan Mehta", initials: "RM", subjects: ["Guitar", "Ukulele"], students: 24, location: "Delhi NCR", years: 8, mode: "Home & Online", activity: "Logged 46 lessons this month", verified: true },
  { slug: "sana-qureshi", name: "Sana Qureshi", initials: "SQ", subjects: ["Piano", "Keyboard"], students: 31, location: "Online", years: 12, mode: "Online", activity: "Logged 58 lessons this month", verified: true },
  { slug: "david-lobo", name: "David Lobo", initials: "DL", subjects: ["Vocals"], students: 17, location: "Mumbai · Online", years: 6, mode: "Home & Online", activity: "Logged 29 lessons this month", verified: false },
  { slug: "nisha-verma", name: "Nisha Verma", initials: "NV", subjects: ["Violin", "Theory"], students: 13, location: "Pune", years: 9, mode: "Home", activity: "Logged 22 lessons this month", verified: true },
];

export const TESTIMONIALS = [
  { quote: "I send my Musicphonetics link instead of a CV now. Got two wedding gigs from it.", who: "Kabir R.", role: "Musician · Delhi" },
  { quote: "I finally see what my daughter is actually learning each week.", who: "Anjali S.", role: "Parent · Gurugram" },
  { quote: "Recording a lesson takes me 20 seconds. Parents love the updates.", who: "Rohan M.", role: "Guitar teacher" },
];

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
