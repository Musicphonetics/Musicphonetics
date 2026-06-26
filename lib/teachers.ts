// ============================================================================
// Musicphonetics — Teachers & Regions (discovery model)
// Built to scale to many teachers across regions without UX change.
// Sample teacher details (realistic) until verified real profiles are added.
// ============================================================================

export type TeachLevel = "Beginner" | "Intermediate" | "Advanced";
export type AgeGroup = "Children" | "Teens" | "Adults";
export type TeachMode = "Home" | "Online";
export type ExamPathway = "Trinity" | "ABRSM" | "Rockschool";

export interface TeacherProfile {
  id: string;
  slug: string;
  name: string;
  instruments: string[];
  country: string;
  region: string; // region slug, e.g. "india"
  regionName: string;
  cities: string[];
  levels: TeachLevel[];
  languages: string[];
  ageGroups: AgeGroup[];
  modes: TeachMode[];
  examPathways: ExamPathway[];
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
}

export const REGIONS: Region[] = [
  { slug: "india", name: "India", country: "India", status: "active", note: "Delhi NCR & cities · home and online" },
  { slug: "dubai", name: "Dubai", country: "United Arab Emirates", status: "soon", note: "Launching soon" },
  { slug: "singapore", name: "Singapore", country: "Singapore", status: "soon", note: "Launching soon" },
  { slug: "malaysia", name: "Malaysia", country: "Malaysia", status: "soon", note: "Launching soon" },
  { slug: "united-kingdom", name: "United Kingdom", country: "United Kingdom", status: "soon", note: "Launching soon" },
  { slug: "canada", name: "Canada", country: "Canada", status: "soon", note: "Launching soon" },
  { slug: "australia", name: "Australia", country: "Australia", status: "soon", note: "Launching soon" },
];

export function getRegion(slug: string): Region | undefined {
  return REGIONS.find((r) => r.slug === slug);
}

export const TEACHERS: TeacherProfile[] = [
  {
    id: "T-001", slug: "aarav-mehta", name: "Aarav Mehta",
    instruments: ["Guitar"], country: "India", region: "india", regionName: "India · Delhi NCR",
    cities: ["Delhi NCR", "Online"], levels: ["Beginner", "Intermediate", "Advanced"],
    languages: ["English", "Hindi"], ageGroups: ["Children", "Adults"], modes: ["Home", "Online"],
    examPathways: ["Trinity", "Rockschool"], certification: "Trinity-trained",
    experience: "7 years", experienceYears: 7, qualification: "Trinity-trained, performance background",
    bio: "Builds strong fundamentals first, with a warm, patient style for kids and adults alike.",
    rating: 4.9, verified: true,
  },
  {
    id: "T-002", slug: "rhea-kapoor", name: "Rhea Kapoor",
    instruments: ["Piano", "Keyboard"], country: "India", region: "india", regionName: "India · Mumbai",
    cities: ["Mumbai", "Online"], levels: ["Beginner", "Intermediate"],
    languages: ["English", "Hindi"], ageGroups: ["Children", "Teens", "Adults"], modes: ["Home", "Online"],
    examPathways: ["ABRSM", "Trinity"], certification: "ABRSM Grade 8",
    experience: "6 years", experienceYears: 6, qualification: "ABRSM Grade 8, grade-prep specialist",
    bio: "Specialises in confident beginners and structured graded-exam preparation.",
    rating: 4.8, verified: true,
  },
  {
    id: "T-003", slug: "daniel-thomas", name: "Daniel Thomas",
    instruments: ["Vocals"], country: "India", region: "india", regionName: "India · Bengaluru",
    cities: ["Bengaluru", "Online"], levels: ["Beginner", "Intermediate", "Advanced"],
    languages: ["English"], ageGroups: ["Teens", "Adults"], modes: ["Home", "Online"],
    examPathways: ["Rockschool", "Trinity"], certification: "Vocal diploma",
    experience: "8 years", experienceYears: 8, qualification: "Contemporary & worship vocal training",
    bio: "Healthy, expressive vocal technique across contemporary and worship styles.",
    rating: 4.9, verified: true,
  },
  {
    id: "T-004", slug: "nisha-verma", name: "Nisha Verma",
    instruments: ["Piano"], country: "India", region: "india", regionName: "India · Gurgaon",
    cities: ["Gurgaon"], levels: ["Beginner", "Intermediate", "Advanced"],
    languages: ["English", "Hindi"], ageGroups: ["Children"], modes: ["Home"],
    examPathways: ["Trinity"], certification: "Trinity diploma",
    experience: "9 years", experienceYears: 9, qualification: "Trinity diploma, children's pedagogy",
    bio: "Gentle, structured teaching for children, with a clear Trinity graded pathway.",
    rating: 4.9, verified: true,
  },
  {
    id: "T-005", slug: "kabir-anand", name: "Kabir Anand",
    instruments: ["Guitar", "Ukulele"], country: "India", region: "india", regionName: "India · Pune",
    cities: ["Pune", "Online"], levels: ["Beginner", "Intermediate"],
    languages: ["English", "Hindi"], ageGroups: ["Children", "Teens", "Adults"], modes: ["Home", "Online"],
    examPathways: ["Trinity", "Rockschool"], certification: "Rockschool-trained",
    experience: "5 years", experienceYears: 5, qualification: "Rockschool-trained, beginner specialist",
    bio: "Makes the first months joyful and momentum-building for complete beginners.",
    rating: 4.7, verified: true,
  },
  {
    id: "T-006", slug: "sarah-mathew", name: "Sarah Mathew",
    instruments: ["Vocals", "Piano"], country: "United Arab Emirates", region: "dubai", regionName: "UAE · Dubai",
    cities: ["Dubai", "Online"], levels: ["Beginner", "Intermediate", "Advanced"],
    languages: ["English"], ageGroups: ["Children", "Teens", "Adults"], modes: ["Online"],
    examPathways: ["ABRSM", "Trinity"], certification: "ABRSM certified",
    experience: "7 years", experienceYears: 7, qualification: "ABRSM certified, online specialist",
    bio: "Experienced with NRI students learning online, across vocals and piano.",
    rating: 4.8, verified: true,
  },
  {
    id: "T-007", slug: "aditya-rao", name: "Aditya Rao",
    instruments: ["Keyboard"], country: "India", region: "india", regionName: "India · Hyderabad",
    cities: ["Hyderabad", "Online"], levels: ["Beginner"],
    languages: ["English", "Hindi", "Telugu"], ageGroups: ["Children"], modes: ["Home", "Online"],
    examPathways: ["Trinity"], certification: "Grade 6 certified",
    experience: "6 years", experienceYears: 6, qualification: "Kids foundation specialist",
    bio: "Playful, structured first steps on keyboard for young children.",
    rating: 4.7, verified: true,
  },
  {
    id: "T-008", slug: "meera-iyer", name: "Meera Iyer",
    instruments: ["Music Theory"], country: "India", region: "india", regionName: "India · Chennai",
    cities: ["Chennai", "Online"], levels: ["Beginner", "Intermediate", "Advanced"],
    languages: ["English", "Tamil"], ageGroups: ["Teens", "Adults"], modes: ["Home", "Online"],
    examPathways: ["ABRSM", "Trinity", "Rockschool"], certification: "Music theory specialist",
    experience: "10 years", experienceYears: 10, qualification: "Graded theory & exam preparation",
    bio: "Connects theory to real musicianship and prepares students for graded exams.",
    rating: 4.9, verified: true,
  },
];

export function getTeacher(idOrSlug: string): TeacherProfile | undefined {
  return TEACHERS.find((t) => t.id === idOrSlug || t.slug === idOrSlug);
}

export function teachersInRegion(regionSlug: string): TeacherProfile[] {
  return TEACHERS.filter((t) => t.region === regionSlug);
}

const flatUnique = (arr: string[]): string[] => [...new Set(arr)].sort();

export const TEACHER_FACETS = {
  instruments: flatUnique(TEACHERS.flatMap((t) => t.instruments)),
  cities: flatUnique(TEACHERS.flatMap((t) => t.cities)),
  countries: flatUnique(TEACHERS.map((t) => t.country)),
  modes: ["Home", "Online"] as TeachMode[],
  ageGroups: ["Children", "Teens", "Adults"] as AgeGroup[],
  examPathways: ["Trinity", "ABRSM", "Rockschool"] as ExamPathway[],
};
