// ============================================================================
// Faculty profiles. Each teacher gets a shareable profile page at
// /teachers/<slug> so a family can see who is coming before a trial class.
//
// The PUBLIC faculty grid on /teachers stays hidden until at least
// FACULTY_PUBLIC_THRESHOLD teachers are `published: true`. Individual profiles
// are always reachable by their direct link (that is the point), but they are
// kept out of search until the public grid goes live.
//
// HOW TO ADD A TEACHER
//   1. Copy the SAMPLE block below.
//   2. Fill in what the teacher sent. Only name, slug, role and one line of bio
//      are required; every other field is optional and simply shows more when
//      present.
//   3. Photos go in /public/images/faculty/<slug>.webp (portrait). No photo yet?
//      Leave `photo` out and a clean gold monogram is shown instead.
//   4. Videos, specialties, highlights and achievements can be added any time,
//      just append to the arrays.
//   5. Set `published: true` when the teacher is ready to appear in the grid.
// ============================================================================

export interface FacultyStat {
  value: string; // "7+", "300+", "Trinity Grade 8"
  label: string; // "Years Teaching"
}
export interface FacultyHighlight {
  title: string;
  sub?: string;
}
export interface FacultyVideo {
  url: string; // YouTube link (embedded) or any link (opens in a new tab)
  caption?: string;
}

export interface FacultyMember {
  slug: string;
  published: boolean;
  name: string;
  role?: string; // short label / eyebrow, e.g. "Guitar Instructor"
  title?: string; // longer line under the name, e.g. "Guitar Instructor | Music Educator"
  photo?: string; // /images/faculty/<slug>.webp
  introVideo?: string; // "Watch intro" link over the photo

  // Hero quick info (each shows only if present)
  rating?: number;
  reviewCount?: number;
  experienceYears?: number;
  studentsTaught?: string; // "300+"
  location?: string; // "Bangalore, India"
  areas?: string[]; // where they teach in person
  modes?: string[]; // "Home", "Online", "Centre"
  languages?: string[];
  ageGroup?: string; // "6 - 60+"

  stats?: FacultyStat[]; // the Quick facts row
  bio: string[]; // one or more paragraphs
  approach?: string; // teaching philosophy, one paragraph
  specialties?: string[]; // Teaching specialties grid
  highlights?: FacultyHighlight[]; // Experience highlights
  qualifications?: string[];
  examPrep?: string[]; // "Trinity", "ABRSM", "Rockschool"
  achievements?: string[];
  videos?: FacultyVideo[];
  gallery?: string[]; // /images/... student moments
  funFacts?: { q: string; a: string }[];
  advice?: string; // one line of advice for beginners, shown as a quote
  verified?: boolean; // passed the seven-stage selection
}

export const FACULTY_PUBLIC_THRESHOLD = 10;

export const FACULTY: FacultyMember[] = [
  {
    slug: "isaac-timothy",
    published: true,
    name: "Isaac Timothy",
    role: "Guitar Instructor",
    title: "Guitar Instructor | Music Educator | Worship Musician & Director",
    photo: "/images/faculty/isaac-timothy.webp",
    experienceYears: 3,
    studentsTaught: "600+",
    modes: ["Online", "In person"],
    ageGroup: "6 - 40",
    stats: [
      { value: "3+", label: "Years Teaching" },
      { value: "600+", label: "Students Taught" },
      { value: "200+", label: "Live Performances" },
      { value: "6 - 40", label: "Age Group" },
      { value: "Trinity", label: "Exam Prep" },
    ],
    bio: [
      "I'm a passionate guitar instructor dedicated to helping students of all ages build confidence and enjoy making music. Whether you're picking up a guitar for the first time or looking to improve your skills, my lessons are tailored to your goals and learning style.",
      "With experience teaching in schools, private lessons, and serving as a worship musician and music director, I focus on practical learning that develops strong technique, musicality and creativity. I teach acoustic and electric guitar, covering chords, rhythm, lead guitar, fingerstyle, scales, improvisation, music theory and playing by ear.",
      "My goal is to make learning fun, engaging and easy to understand, helping every student grow into a confident musician.",
    ],
    approach:
      "My lessons are personalised, practical and enjoyable. I focus on helping students understand music rather than just memorising songs, teaching the songs they love, setting achievable goals and celebrating every milestone. My strength is simplifying complex ideas so students actually enjoy consistent practice.",
    specialties: [
      "Acoustic & Electric Guitar",
      "Lead Guitar & Soloing",
      "Rhythm & Chord Techniques",
      "Fingerstyle Guitar",
      "Bass Guitar",
      "Worship Guitar",
      "Music Theory Made Simple",
      "Song Learning & Performance",
      "Band Playing",
    ],
    highlights: [
      { title: "Music Director & Worship Leader", sub: "3+ years, Kingdomcity Church" },
      { title: "200+ Live Performances", sub: "Churches, events, competitions & bands" },
      { title: "School Music Teacher", sub: "St Xavier's & Bethesda Christian Academy" },
      { title: "600+ Students Taught", sub: "Ages 6 to 40, all levels" },
    ],
    qualifications: [
      "Music Teacher at St Xavier's Senior High School and Bethesda Christian Academy",
      "Music Director and Worship Musician at Kingdomcity Church",
      "Experience with the Trinity College London syllabus",
      "Ongoing worship music and band training",
    ],
    examPrep: ["Trinity College London"],
    achievements: [
      "Students perform at school functions, church services and special events",
      "Students learn to play complete songs confidently, with strong rhythm and timing",
      "Several students have gone on to serve in church worship teams",
      "Students have prepared for graded music examinations",
    ],
    funFacts: [
      { q: "Favourite guitarists", a: "John Mayer and Slash" },
      { q: "Favourite genres", a: "Worship, rock, blues and contemporary pop" },
      { q: "Favourite song to teach", a: "Love Yourself, Justin Bieber" },
      { q: "Favourite guitar brand", a: "PRS" },
    ],
    advice:
      "Don't rush to play fast. Build a strong foundation, practise 20 to 30 minutes every day, and enjoy the journey. Great guitarists are made through consistency, not speed.",
    videos: [],
    gallery: [],
    verified: true,
  },
  // --------------------------------------------------------------------------
  // SAMPLE — shows the layout. Copy this block for a new teacher. It is
  // `published: false`, so it never shows in the public grid; preview it at
  // /teachers/sample.
  // --------------------------------------------------------------------------
  {
    slug: "sample",
    published: false,
    name: "Sample Teacher",
    role: "Guitar Instructor",
    title: "Guitar Instructor | Music Educator | Performer",
    rating: 4.9,
    reviewCount: 120,
    experienceYears: 7,
    studentsTaught: "300+",
    location: "Delhi NCR, India",
    areas: ["South Delhi", "Gurugram"],
    modes: ["Home", "Online", "Centre"],
    languages: ["English", "Hindi"],
    ageGroup: "6 - 60+",
    stats: [
      { value: "7+", label: "Years Teaching" },
      { value: "300+", label: "Students" },
      { value: "500+", label: "Live Performances" },
      { value: "Trinity Grade 8", label: "Certified" },
      { value: "6 - 60+", label: "Age Group" },
    ],
    bio: [
      "This is where the teacher's story goes, in their own words. Where they trained, who they have played with, and what they love about teaching.",
      "Keep it warm and real. Two short paragraphs is plenty to make a family feel they already know who is coming.",
    ],
    approach:
      "I build strong fundamentals first, then bring in the songs a student actually wants to play, so progress feels quick without skipping the basics.",
    specialties: [
      "Acoustic & Electric Guitar",
      "Lead Guitar & Soloing",
      "Rhythm & Chord Techniques",
      "Fingerstyle Guitar",
      "Music Theory Made Simple",
      "Song Learning & Performance",
      "Improvisation & Scales",
      "Ear Training & Playing by Ear",
    ],
    highlights: [
      { title: "Music Director", sub: "5+ years" },
      { title: "500+ Live Shows", sub: "Events, concerts & more" },
      { title: "Worked with schools & academies", sub: "Across Delhi NCR" },
      { title: "Students aged 6 to 60+", sub: "Every level" },
    ],
    qualifications: ["Trinity-trained, performance background", "Grade 8, classical foundation"],
    examPrep: ["Trinity", "Rockschool"],
    achievements: [],
    videos: [],
    gallery: [],
    verified: true,
  },
];

export function getFacultyMember(slug: string): FacultyMember | undefined {
  return FACULTY.find((f) => f.slug === slug);
}

export function publishedFaculty(): FacultyMember[] {
  return FACULTY.filter((f) => f.published);
}

/** The public faculty grid only appears once enough teachers are ready. */
export function isFacultyPublic(): boolean {
  return publishedFaculty().length >= FACULTY_PUBLIC_THRESHOLD;
}

/** YouTube video id from common URL shapes, or null if not a YouTube link. */
export function youTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : null;
}
