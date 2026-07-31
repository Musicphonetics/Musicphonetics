// Option lists for the student admission form. Kept broad (e.g. occupation is a
// category, never a specific job title) so the data is useful for statistics
// without feeling intrusive.

export const GENDERS = ["Male", "Female", "Other"] as const;

export const RELATIONSHIPS = ["Father", "Mother", "Guardian", "Grandparent", "Sibling", "Other"] as const;

// Broad occupation categories — insight without asking for a job title.
export const OCCUPATIONS = [
  "Defence (Army / Navy / Air Force)",
  "Government Service",
  "PSU",
  "Corporate / Private Employee",
  "Business / Entrepreneur",
  "Doctor / Healthcare",
  "Lawyer",
  "Chartered Accountant / Finance",
  "Engineer / IT",
  "Teacher / Professor",
  "Artist / Musician",
  "Homemaker",
  "Self-Employed",
  "Retired",
  "Other",
] as const;

export const EXPERIENCE_LEVELS = [
  "Absolute beginner",
  "Some basics",
  "Intermediate",
  "Advanced",
] as const;

export const LEAD_SOURCES = [
  "Instagram",
  "Google",
  "Referral (friend/family)",
  "Existing student",
  "WhatsApp",
  "School",
  "Flyer / Poster",
  "Website",
  "Walk-in",
  "Other",
] as const;

// School grades — Nursery/KG through 12 and college, plus a fallback.
export const GRADES = [
  "Nursery", "LKG", "UKG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6",
  "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12",
  "College / University", "Working professional", "Not in school",
] as const;

// Age bands for statistics (inclusive lower, exclusive upper except the last).
export const AGE_BANDS: { label: string; min: number; max: number }[] = [
  { label: "Under 6", min: 0, max: 6 },
  { label: "6–9", min: 6, max: 10 },
  { label: "10–13", min: 10, max: 14 },
  { label: "14–17", min: 14, max: 18 },
  { label: "18–25", min: 18, max: 26 },
  { label: "26+", min: 26, max: 200 },
];

export function ageFromDob(dob?: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(+d)) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age >= 0 && age < 200 ? age : null;
}
