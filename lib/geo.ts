// ============================================================================
// Musicphonetics — Geography (hero map + India→world roadmap)
// Coordinates are stylised percentages on the hero's map stage (not exact
// cartography). North cities sit higher, southern cities lower, roughly
// echoing India's shape, then a wider field for the global phase.
// ============================================================================

export interface City {
  name: string;
  x: number;
  y: number;
}

// Indian cities — golden light points that rise in the hero.
export const INDIA_CITIES: City[] = [
  { name: "Chandigarh", x: 50, y: 18 },
  { name: "Delhi", x: 51, y: 28 },
  { name: "Gurgaon", x: 48, y: 30 },
  { name: "Noida", x: 54, y: 29 },
  { name: "Jaipur", x: 42, y: 35 },
  { name: "Lucknow", x: 60, y: 34 },
  { name: "Ahmedabad", x: 36, y: 46 },
  { name: "Kolkata", x: 72, y: 47 },
  { name: "Mumbai", x: 38, y: 58 },
  { name: "Pune", x: 42, y: 61 },
  { name: "Hyderabad", x: 52, y: 59 },
  { name: "Bengaluru", x: 49, y: 72 },
  { name: "Chennai", x: 57, y: 73 },
  { name: "Kochi", x: 47, y: 84 },
];

// Global cities — lights that appear as the camera zooms out.
export const GLOBAL_CITIES: City[] = [
  { name: "Toronto", x: 16, y: 34 },
  { name: "London", x: 44, y: 28 },
  { name: "Dubai", x: 56, y: 48 },
  { name: "Kuala Lumpur", x: 74, y: 60 },
  { name: "Singapore", x: 75, y: 64 },
  { name: "Sydney", x: 86, y: 82 },
];

// Roadmap status groups for the "From India to the world" section.
export interface RoadmapGroup {
  key: string;
  label: string;
  tone: "live" | "soon" | "future";
  cities: string[];
}

export const ROADMAP: RoadmapGroup[] = [
  {
    key: "live",
    label: "Live / starting",
    tone: "live",
    cities: ["Delhi NCR", "Online"],
  },
  {
    key: "soon",
    label: "Next 30 days",
    tone: "soon",
    cities: ["Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata"],
  },
  {
    key: "future",
    label: "Next phase",
    tone: "future",
    cities: ["Dubai", "Singapore", "Malaysia", "United Kingdom", "Canada", "Australia"],
  },
];

export const ROADMAP_DISCLAIMER =
  "Roadmap represents planned expansion and vision. Availability may vary by city.";
