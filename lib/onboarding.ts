// ============================================================================
// Musicphonetics — Conversational onboarding (lead funnel) configuration
// ============================================================================

export interface Option {
  value: string;
  label: string;
  hint?: string;
}

export const INSTRUMENTS: Option[] = [
  { value: "Guitar", label: "Guitar" },
  { value: "Piano", label: "Piano" },
  { value: "Vocals", label: "Vocals" },
  { value: "Keyboard", label: "Keyboard" },
  { value: "Ukulele", label: "Ukulele" },
];

export const WHO: Option[] = [
  { value: "Myself", label: "Myself" },
  { value: "My Child", label: "My Child" },
];

export const AGES: Option[] = [
  { value: "4–7", label: "4–7" },
  { value: "8–12", label: "8–12" },
  { value: "13–17", label: "13–17" },
  { value: "18+", label: "18+" },
];

export const MODES: Option[] = [
  { value: "Home", label: "Home", hint: "Teacher comes to you" },
  { value: "Online", label: "Online", hint: "Learn from anywhere" },
  { value: "Either", label: "Either", hint: "Whatever fits best" },
];

export const EXPERIENCE: Option[] = [
  { value: "Never played", label: "Never played" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

export const GOALS: Option[] = [
  { value: "Hobby", label: "Hobby" },
  { value: "School", label: "School" },
  { value: "Trinity", label: "Trinity / Graded exams" },
  { value: "Performance", label: "Performance" },
  { value: "Professional", label: "Professional" },
];

export const TIMINGS: Option[] = [
  { value: "Morning", label: "Morning" },
  { value: "Afternoon", label: "Afternoon" },
  { value: "Evening", label: "Evening" },
  { value: "Weekend", label: "Weekend" },
];

export const BEGIN: Option[] = [
  { value: "Immediately", label: "Immediately" },
  { value: "This Week", label: "This Week" },
  { value: "This Month", label: "This Month" },
  { value: "Exploring", label: "Just exploring" },
];

// Delhi NCR areas for the location suggestion list.
export const AREAS = [
  "South Delhi", "Central Delhi", "Dwarka", "Rohini", "Gurgaon", "Noida",
  "Greater Noida", "Faridabad", "Ghaziabad", "Vasant Kunj", "Saket",
  "Online (anywhere)",
];

// Subtle, rotating social proof shown alongside the funnel.
export const SOCIAL_PROOF = [
  "Someone from Dwarka just booked Piano",
  "New teacher available in Gurgaon",
  "126 teachers currently active",
  "Parents rate us 4.9 ★",
  "A family in Noida started Guitar this week",
  "Trial booked in South Delhi · Vocals",
];

export interface LeadData {
  instrument?: string;
  who?: string;
  childAge?: string;
  mode?: string;
  location?: string;
  experience?: string;
  goal?: string;
  timing?: string;
  begin?: string;
  name?: string;
  phone?: string;
  email?: string;
}

/** Build a WhatsApp summary message from collected answers. */
export function leadSummary(d: LeadData): string {
  const lines = [
    "Hi Musicphonetics, I'd like to book a trial class.",
    "",
    d.instrument && `Instrument: ${d.instrument}`,
    d.who && `For: ${d.who}${d.childAge ? ` (age ${d.childAge})` : ""}`,
    d.mode && `Mode: ${d.mode}`,
    d.location && `Location: ${d.location}`,
    d.experience && `Experience: ${d.experience}`,
    d.goal && `Goal: ${d.goal}`,
    d.timing && `Preferred timing: ${d.timing}`,
    d.begin && `Start: ${d.begin}`,
    d.name && `Name: ${d.name}`,
    d.phone && `Phone: ${d.phone}`,
  ].filter(Boolean);
  return lines.join("\n");
}
