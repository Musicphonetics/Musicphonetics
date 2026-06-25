// ============================================================================
// Musicphonetics — Teachers & Regions (discovery model)
// Built to scale to thousands of teachers across many regions without UX change.
//
// PLACEHOLDER teacher data. Regions reflect the real position: India is active,
// other regions are clearly "Launching soon" — we never fake expansion.
// TODO(content): replace placeholder teachers with verified real profiles.
// ============================================================================

export type TeachLevel = "Beginner" | "Intermediate" | "Advanced";
export type AgeGroup = "Children" | "Teens" | "Adults";
export type TeachMode = "Home" | "Online";

export interface TeacherProfile {
  id: string;
  slug: string;
  name: string;
  instruments: string[];
  country: string;
  region: string; // region slug, e.g. "india"
  regionName: string; // display, e.g. "India · Delhi NCR"
  cities: string[];
  levels: TeachLevel[];
  languages: string[];
  ageGroups: AgeGroup[];
  modes: TeachMode[];
  certification: string;
  experience: string;
  experienceYears: number;
  qualification: string;
  bio: string;
  rating: number;
  verified: boolean;
}

export interface Region {
  slug: string;
  name: string;
  country: string;
  status: "active" | "soon";
  note: string;
  // Stylised map coordinates (percentages).
  x: number;
  y: number;
}

export const REGIONS: Region[] = [
  { slug: "india", name: "India", country: "India", status: "active", note: "Delhi NCR · Home & online", x: 67, y: 46 },
  { slug: "united-kingdom", name: "United Kingdom", country: "United Kingdom", status: "soon", note: "Launching soon", x: 46, y: 30 },
  { slug: "canada", name: "Canada", country: "Canada", status: "soon", note: "Launching soon", x: 22, y: 30 },
  { slug: "dubai", name: "Dubai", country: "United Arab Emirates", status: "soon", note: "Launching soon", x: 59, y: 48 },
  { slug: "singapore", name: "Singapore", country: "Singapore", status: "soon", note: "Launching soon", x: 77, y: 60 },
];

export function getRegion(slug: string): Region | undefined {
  return REGIONS.find((r) => r.slug === slug);
}

export const TEACHERS: TeacherProfile[] = [
  {
    id: "T-001",
    slug: "teacher-one",
    name: "Placeholder · Teacher One",
    instruments: ["Guitar", "Ukulele"],
    country: "India",
    region: "india",
    regionName: "India · Delhi NCR",
    cities: ["South Delhi", "Gurugram"],
    levels: ["Beginner", "Intermediate", "Advanced"],
    languages: ["English", "Hindi"],
    ageGroups: ["Children", "Teens", "Adults"],
    modes: ["Home", "Online"],
    certification: "Trinity-trained",
    experience: "8+ years",
    experienceYears: 8,
    qualification: "Trinity-trained, performance background",
    bio: "Warm, patient teaching style focused on building strong fundamentals before repertoire.",
    rating: 4.9,
    verified: true,
  },
  {
    id: "T-002",
    slug: "teacher-two",
    name: "Placeholder · Teacher Two",
    instruments: ["Piano", "Keyboard"],
    country: "India",
    region: "india",
    regionName: "India · Delhi NCR",
    cities: ["Noida"],
    levels: ["Beginner", "Intermediate"],
    languages: ["English", "Hindi"],
    ageGroups: ["Children", "Teens"],
    modes: ["Home", "Online"],
    certification: "Grade 8 certified",
    experience: "6+ years",
    experienceYears: 6,
    qualification: "Grade 8 certified, classical foundation",
    bio: "Specialises in young learners and structured, exam-ready progress.",
    rating: 4.8,
    verified: true,
  },
  {
    id: "T-003",
    slug: "teacher-three",
    name: "Placeholder · Teacher Three",
    instruments: ["Vocals (Western)", "Vocals (Hindustani)"],
    country: "India",
    region: "india",
    regionName: "India · Delhi NCR",
    cities: ["Central Delhi"],
    levels: ["Beginner", "Intermediate", "Advanced"],
    languages: ["English", "Hindi"],
    ageGroups: ["Teens", "Adults"],
    modes: ["Online"],
    certification: "Vocal diploma",
    experience: "10+ years",
    experienceYears: 10,
    qualification: "Vocal performance diploma",
    bio: "Builds confident, healthy vocal technique for performers and beginners alike.",
    rating: 4.9,
    verified: true,
  },
  {
    id: "T-004",
    slug: "teacher-four",
    name: "Placeholder · Teacher Four",
    instruments: ["Drums", "Cajon"],
    country: "India",
    region: "india",
    regionName: "India · Delhi NCR",
    cities: ["Gurugram", "Faridabad"],
    levels: ["Beginner", "Intermediate"],
    languages: ["English", "Hindi"],
    ageGroups: ["Children", "Teens", "Adults"],
    modes: ["Home"],
    certification: "Rhythm specialist",
    experience: "7+ years",
    experienceYears: 7,
    qualification: "Rhythm specialist, gigging musician",
    bio: "Energetic, groove-first teaching with a strong focus on timing and reading.",
    rating: 4.7,
    verified: true,
  },
  {
    id: "T-005",
    slug: "teacher-five",
    name: "Placeholder · Teacher Five",
    instruments: ["Violin"],
    country: "India",
    region: "india",
    regionName: "India · Delhi NCR",
    cities: ["South Delhi"],
    levels: ["Intermediate", "Advanced"],
    languages: ["English"],
    ageGroups: ["Teens", "Adults"],
    modes: ["Home", "Online"],
    certification: "Western classical",
    experience: "9+ years",
    experienceYears: 9,
    qualification: "Western classical, orchestral experience",
    bio: "Precise, encouraging approach to intonation, posture, and musical phrasing.",
    rating: 4.8,
    verified: true,
  },
  {
    id: "T-006",
    slug: "teacher-six",
    name: "Placeholder · Teacher Six",
    instruments: ["Guitar", "Music Theory"],
    country: "India",
    region: "india",
    regionName: "India · Delhi NCR",
    cities: ["Online (anywhere)"],
    levels: ["Beginner", "Intermediate", "Advanced"],
    languages: ["English", "Hindi"],
    ageGroups: ["Teens", "Adults"],
    modes: ["Online"],
    certification: "Trinity-trained",
    experience: "5+ years",
    experienceYears: 5,
    bio: "Theory-forward teaching that connects technique to real musical understanding.",
    qualification: "Trinity-trained, theory specialist",
    rating: 4.8,
    verified: true,
  },
];

export function getTeacher(idOrSlug: string): TeacherProfile | undefined {
  return TEACHERS.find((t) => t.id === idOrSlug || t.slug === idOrSlug);
}

export function teachersInRegion(regionSlug: string): TeacherProfile[] {
  return TEACHERS.filter((t) => t.region === regionSlug);
}

// Facet builders for the directory filters.
const flatUnique = (arr: string[]): string[] => [...new Set(arr)].sort();

export const TEACHER_FACETS = {
  instruments: flatUnique(TEACHERS.flatMap((t) => t.instruments)),
  cities: flatUnique(TEACHERS.flatMap((t) => t.cities)),
  levels: ["Beginner", "Intermediate", "Advanced"] as TeachLevel[],
  languages: flatUnique(TEACHERS.flatMap((t) => t.languages)),
  ageGroups: ["Children", "Teens", "Adults"] as AgeGroup[],
  modes: ["Home", "Online"] as TeachMode[],
};
