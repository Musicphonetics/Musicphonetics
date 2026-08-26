// The Musicphonetics "music journey" intake, content + logic shared by the
// concierge. Skills and the 30-day roadmap are GENERIC foundations (safe, never
// fabricated song-specific chords); the AI writes only the warm, personal
// narrative around them, and the teacher personalises everything after the trial.

export interface Motivation { key: string; icon: string; label: string; sub: string }
export const MOTIVATIONS: Motivation[] = [
  { key: "inspired", icon: "✨", label: "An artist inspired me", sub: "Someone made me want to play." },
  { key: "perform", icon: "🎤", label: "I want to perform", sub: "On stage, for people I love." },
  { key: "create", icon: "📱", label: "To create & share", sub: "Covers, content, my own sound." },
  { key: "career", icon: "🎯", label: "A career in music", sub: "I want to go all the way." },
  { key: "goal", icon: "🎁", label: "A personal dream", sub: "A bucket-list song or moment." },
  { key: "joy", icon: "🧘", label: "Joy & unwinding", sub: "For happiness and calm." },
];

export interface Level { key: string; icon: string; label: string; sub: string; beginner: boolean }
export const LEVELS: Level[] = [
  { key: "beginner", icon: "🟢", label: "Complete beginner", sub: "I've never really played.", beginner: true },
  { key: "tried", icon: "🟡", label: "I've tried before", sub: "A few things, but inconsistent.", beginner: true },
  { key: "play", icon: "🔵", label: "I already play", sub: "I play songs and want to get better.", beginner: false },
];

export interface Instrument { key: string; icon: string }
export const INSTRUMENTS: Instrument[] = [
  { key: "Guitar", icon: "🎸" },
  { key: "Piano", icon: "🎹" },
  { key: "Keyboard", icon: "🎹" },
  { key: "Vocals", icon: "🎤" },
  { key: "Ukulele", icon: "🪕" },
  { key: "Drums", icon: "🥁" },
];

const SKILLS: Record<string, string[]> = {
  Guitar: ["Finger placement & clean notes", "Your first chords", "Smooth chord transitions", "Strumming patterns", "Rhythm & timing", "Putting a song together"],
  Ukulele: ["Finger placement & clean notes", "Your first chords", "Smooth chord transitions", "Strumming patterns", "Rhythm & timing", "Putting a song together"],
  Piano: ["Hand posture & position", "Note names & finger numbers", "First chords, both hands", "Rhythm & timing", "Playing a simple melody", "Putting a song together"],
  Keyboard: ["Hand posture & position", "Note names & finger numbers", "First chords, both hands", "Rhythm & timing", "Playing a simple melody", "Putting a song together"],
  Vocals: ["Breath support", "Pitch & staying in tune", "Rhythm & timing", "Tone & clarity", "Building your range", "Performing a full song"],
  Drums: ["Grip & posture", "Your first beats", "Limb coordination", "Timing & tempo", "Simple fills", "Playing along to a song"],
};
export function skillsFor(instrument: string): string[] {
  return SKILLS[instrument] || ["Correct technique", "Rhythm & timing", "Your first chords or notes", "Reading music simply", "Ear training", "Putting a song together"];
}

export interface RoadmapWeek { title: string; items: string[] }
export function roadmapFor(instrument: string): RoadmapWeek[] {
  const chordy = /Guitar|Ukulele|Piano|Keyboard/.test(instrument);
  return [
    { title: "Week 1, Foundations", items: ["Correct posture & hold", "Your very first clean sound", "Feeling the beat", "A daily practice habit"] },
    { title: "Week 2, First progression", items: [chordy ? "Your first chords" : "Your first patterns", chordy ? "Changing between them" : "Steady control", "Timing & counting", "Playing slowly & cleanly"] },
    { title: "Week 3, Song building", items: ["The first section of your song", "Keeping tempo", chordy ? "Strumming / both hands together" : "Playing with feel", "Building confidence"] },
    { title: "Week 4, Perform", items: ["Playing your song through", "Adding expression", "A little recording", "Your first performance moment"] },
  ];
}

export interface Dna { type: string; label: string; blurb: string }
export function dnaFor(levelKey: string, motivationKey: string): Dna {
  if (motivationKey === "perform" || motivationKey === "create")
    return { type: "performer", label: "The Performer", blurb: "You learn to be heard. We'll build toward the stage from day one." };
  if (motivationKey === "career")
    return { type: "builder", label: "The Skill Builder", blurb: "You want real mastery. We'll build deep, correct technique and theory." };
  if (levelKey === "play")
    return { type: "returning", label: "The Rising Musician", blurb: "You already play, now we sharpen technique and unlock harder music." };
  if (levelKey === "tried")
    return { type: "returning", label: "The Returning Musician", blurb: "You've dabbled before, this time we make it stick, properly." };
  return { type: "song-first", label: "The Song-First Learner", blurb: "You learn best by chasing songs you love, so that's exactly how we'll teach." };
}
