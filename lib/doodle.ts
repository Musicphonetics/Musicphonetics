// ============================================================================
// Hero "doodle" themes - the Musicphonetics wordmark sits centre stage like a
// Google Doodle. To celebrate a festival or event, change ACTIVE_DOODLE below
// to one of the theme keys. Each theme swaps the greeting, the glow colour and
// the little decorations that float around the name. Add your own themes freely.
// ============================================================================

export type DoodleKey =
  | "music" | "monsoon" | "diwali" | "holi" | "christmas" | "newyear" | "independence" | "republic";

// 👉 Change this one line for a festival/event. "music" is the everyday default.
export const ACTIVE_DOODLE: DoodleKey = "monsoon";

export interface DoodleTheme {
  greeting: string | null; // small ribbon above the name (null = none)
  glow: string;            // radial background glow colour
  accents: string[];       // emoji that gently float around the wordmark
  rain?: boolean;          // falling-rain layer (monsoon)
}

export const DOODLE_THEMES: Record<DoodleKey, DoodleTheme> = {
  music:        { greeting: null,                          glow: "rgba(201,162,39,0.20)", accents: ["🎵", "🎶", "🎸", "🎹", "🎤", "🥁"] },
  monsoon:      { greeting: "Happy Monsoon 🌧️",            glow: "rgba(96,164,206,0.20)", accents: ["☔", "🌧️", "🍃", "🎶", "💧"], rain: true },
  diwali:       { greeting: "Happy Diwali ✨",              glow: "rgba(255,168,64,0.24)", accents: ["🪔", "✨", "🎇", "🌟", "🎵"] },
  holi:         { greeting: "Happy Holi 🎨",               glow: "rgba(220,110,190,0.22)", accents: ["🎨", "🌈", "💛", "💚", "🎶"] },
  christmas:    { greeting: "Merry Christmas 🎄",           glow: "rgba(120,200,160,0.20)", accents: ["🎄", "❄️", "⭐", "🎁", "🎵"] },
  newyear:      { greeting: "Happy New Year 🎉",            glow: "rgba(201,162,39,0.24)", accents: ["🎉", "✨", "🥂", "🎆", "🎶"] },
  independence: { greeting: "Happy Independence Day 🇮🇳",   glow: "rgba(255,153,51,0.20)", accents: ["🇮🇳", "🧡", "🤍", "💚", "🎵"] },
  republic:     { greeting: "Happy Republic Day 🇮🇳",       glow: "rgba(255,153,51,0.20)", accents: ["🇮🇳", "🧡", "🤍", "💚", "🎶"] },
};

export const activeDoodle = () => DOODLE_THEMES[ACTIVE_DOODLE];
