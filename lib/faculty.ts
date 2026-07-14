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
//   2. Fill in what the teacher sent. Only name, slug, tagline, instruments and
//      one line of bio are required; everything else is optional and simply
//      shows more when present.
//   3. Photos go in /public/images/faculty/<slug>.webp (portrait). No photo yet?
//      Leave `photo` out and a clean gold monogram is shown instead.
//   4. Videos and achievements can be added any time, just append to the arrays.
//   5. Set `published: true` when the teacher is ready to appear in the grid.
// ============================================================================

export interface FacultyVideo {
  url: string; // YouTube link (embedded) or any link (opens in a new tab)
  caption?: string;
}

export interface FacultyMember {
  slug: string;
  published: boolean;
  name: string;
  role?: string; // e.g. "Guitar & Ukulele Faculty"
  photo?: string; // /images/faculty/<slug>.webp
  tagline: string; // one strong line
  instruments: string[];
  experienceYears?: number;
  areas?: string[]; // where they teach in person
  modes?: string[]; // "Home", "Online", "Centre"
  languages?: string[];
  bio: string[]; // one or more paragraphs
  approach?: string; // teaching philosophy, one paragraph
  qualifications?: string[];
  examPrep?: string[]; // "Trinity", "ABRSM", "Rockschool"
  achievements?: string[];
  videos?: FacultyVideo[];
  gallery?: string[]; // /images/... student moments
  verified?: boolean; // passed the seven-stage selection
}

export const FACULTY_PUBLIC_THRESHOLD = 10;

export const FACULTY: FacultyMember[] = [
  // --------------------------------------------------------------------------
  // SAMPLE — this shows the layout. Replace it with a real teacher, or delete
  // it once you add real profiles. It is `published: false`, so it never shows
  // in the public grid; you can still preview it at /teachers/sample.
  // --------------------------------------------------------------------------
  {
    slug: "sample",
    published: false,
    name: "Sample Teacher",
    role: "Guitar & Ukulele Faculty",
    tagline: "Patient, structured, and genuinely fun to learn from.",
    instruments: ["Guitar", "Ukulele"],
    experienceYears: 8,
    areas: ["South Delhi", "Gurugram"],
    modes: ["Home", "Online", "Centre"],
    languages: ["English", "Hindi"],
    bio: [
      "This is where the teacher's story goes, in their own words. Where they trained, who they have played with, and what they love about teaching.",
      "Keep it warm and real. Two short paragraphs is plenty to make a family feel they already know who is coming.",
    ],
    approach:
      "I build strong fundamentals first, then bring in the songs a student actually wants to play, so progress feels quick without skipping the basics.",
    qualifications: ["Trinity-trained, performance background", "Grade 8, classical foundation"],
    examPrep: ["Trinity", "Rockschool"],
    achievements: ["Prepared 30+ students through graded exams", "Performs regularly across Delhi NCR"],
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
