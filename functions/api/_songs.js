// ============================================================================
// The Trial Studio curriculum engine. Turns a learner's "dream songs" into a
// concrete, personalised path: which chords, how many classes, and the exact
// date they can expect to play it — at the Musicphonetics pace (2 classes/week).
//
// Deterministic and instant (no network). A curated database drives the FACTS
// so they are always correct; anything not in the DB gets a sensible beginner
// default. An AI layer (Cloudflare Workers AI) can later rewrite the prose on
// top of these facts, but the numbers always come from here.
// ============================================================================

// classes → difficulty label
function tier(classes) {
  if (classes <= 8) return "Very beginner-friendly";
  if (classes <= 11) return "Beginner-friendly";
  if (classes <= 13) return "Beginner+";
  return "Intermediate";
}

// Curated beginner-guitar song database (Hindi + English). `k` are lowercase
// match keys/aliases; `classes` is the realistic count to play it confidently.
const SONGS = [
  // --- English ---
  { t: "Perfect", a: "Ed Sheeran", k: ["perfect"], chords: ["G", "Em", "C", "D"], capo: 1, classes: 8 },
  { t: "Country Roads", a: "John Denver", k: ["country roads", "take me home", "country road"], chords: ["G", "Em", "D", "C"], classes: 10 },
  { t: "Let It Be", a: "The Beatles", k: ["let it be"], chords: ["C", "G", "Am", "F"], classes: 10 },
  { t: "Riptide", a: "Vance Joy", k: ["riptide"], chords: ["Am", "G", "C", "F"], classes: 8 },
  { t: "Photograph", a: "Ed Sheeran", k: ["photograph"], chords: ["G", "D", "Em", "C"], capo: 3, classes: 8 },
  { t: "Stand By Me", a: "Ben E. King", k: ["stand by me"], chords: ["G", "Em", "C", "D"], classes: 8 },
  { t: "Knockin' on Heaven's Door", a: "Bob Dylan", k: ["knockin", "heaven's door", "heavens door"], chords: ["G", "D", "Am", "C"], classes: 8 },
  { t: "Faded", a: "Alan Walker", k: ["faded"], chords: ["Em", "C", "G", "D"], classes: 8 },
  { t: "Someone Like You", a: "Adele", k: ["someone like you"], chords: ["A", "E", "F#m", "D"], classes: 11 },
  { t: "Wonderwall", a: "Oasis", k: ["wonderwall"], chords: ["Em7", "G", "Dsus4", "Cadd9"], capo: 2, classes: 12 },
  { t: "Believer", a: "Imagine Dragons", k: ["believer"], chords: ["Bm", "A", "G", "D"], classes: 12 },
  { t: "Shape of You", a: "Ed Sheeran", k: ["shape of you"], chords: ["Am", "Dm", "G", "C"], classes: 10 },
  { t: "Hey There Delilah", a: "Plain White T's", k: ["hey there delilah", "delilah"], chords: ["D", "F#m", "Bm", "G", "A"], classes: 11 },
  { t: "Hotel California", a: "Eagles", k: ["hotel california"], chords: ["Am", "E", "G", "D", "F", "C"], classes: 14 },
  // --- Hindi ---
  { t: "Tum Hi Ho", a: "Arijit Singh", k: ["tum hi ho", "tumhi ho"], chords: ["Am", "Dm", "G", "C", "E"], capo: 1, classes: 12 },
  { t: "Kesariya", a: "Arijit Singh", k: ["kesariya"], chords: ["G", "D", "Em", "C"], capo: 4, classes: 10 },
  { t: "Channa Mereya", a: "Arijit Singh", k: ["channa mereya", "channa"], chords: ["Em", "C", "G", "D", "Am"], classes: 12 },
  { t: "Raabta", a: "Arijit Singh", k: ["raabta"], chords: ["G", "D", "Em", "C"], classes: 10 },
  { t: "Tera Ban Jaunga", a: "Akhil Sachdeva", k: ["tera ban jaunga", "ban jaunga"], chords: ["C", "G", "Am", "F"], classes: 9 },
  { t: "Shayad", a: "Arijit Singh", k: ["shayad"], chords: ["C", "G", "Am", "F"], classes: 8 },
  { t: "Pehla Nasha", a: "Udit Narayan", k: ["pehla nasha"], chords: ["G", "Em", "C", "D"], capo: 2, classes: 12 },
  { t: "Tujhe Kitna Chahne Lage", a: "Arijit Singh", k: ["tujhe kitna chahne", "kitna chahne"], chords: ["Em", "G", "D", "C"], classes: 10 },
  { t: "Chaudhary", a: "Amit Trivedi", k: ["chaudhary", "choudhary"], chords: ["Am", "G", "F"], classes: 8 },
  { t: "Galliyan", a: "Ankit Tiwari", k: ["galliyan", "galiyan"], chords: ["Am", "F", "C", "G"], classes: 10 },
  { t: "Ilahi", a: "Arijit Singh", k: ["ilahi"], chords: ["G", "D", "Em", "C"], classes: 8 },
  { t: "Iktara", a: "Kavita Seth", k: ["iktara"], chords: ["D", "A", "Bm", "G"], classes: 10 },
  { t: "Samjhawan", a: "Arijit Singh", k: ["samjhawan", "samjhawa"], chords: ["G", "D", "Em", "C"], capo: 1, classes: 10 },
  { t: "Tum Se Hi", a: "Mohit Chauhan", k: ["tum se hi", "tumse hi"], chords: ["G", "D", "Em", "C", "Am"], classes: 12 },
  { t: "Phir Le Aya Dil", a: "Arijit Singh", k: ["phir le aya", "phir le aaya"], chords: ["Am", "G", "F", "C"], classes: 11 },
];

function norm(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function matchSong(title) {
  const n = norm(title);
  if (!n) return null;
  for (const s of SONGS) {
    for (const key of s.k) {
      if (n.includes(key) || key.includes(n)) return s;
    }
  }
  return null;
}

// next Monday (a clean "start this week" anchor)
function nextMonday(from) {
  const d = new Date(from);
  const day = d.getUTCDay(); // 0 Sun..6 Sat
  const add = ((8 - day) % 7) || 7; // days until next Monday (never today)
  d.setUTCDate(d.getUTCDate() + add);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function fmtDate(d) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

// classes → weeks at 2 classes/week
function weeksFor(classes) { return Math.ceil(classes / 2); }

function analyseSong(input) {
  const title = (input && input.title) || "";
  const lang = (input && input.lang) || "";
  const m = matchSong(title);
  if (m) {
    return {
      title: m.t, artist: m.a, matched: true, lang,
      chords: m.chords, capo: m.capo || 0, chordCount: m.chords.length,
      classes: m.classes, difficulty: tier(m.classes),
    };
  }
  // Unknown song → honest beginner default (most pop songs are 4 open chords).
  return {
    title: title.trim() || "your song", artist: "", matched: false, lang,
    chords: ["G", "D", "Em", "C"], capo: 0, chordCount: 4,
    classes: 10, difficulty: tier(10),
  };
}

// Build a class-by-class roadmap for the primary (fastest-win) song.
function roadmap(primary) {
  const c = primary.chords;
  const first = c.slice(0, 2).join(" & ");
  const rest = c.slice(2).join(", ");
  const half = Math.max(2, Math.round(primary.classes / 2));
  return [
    { when: "Class 1–2", t: "Hold, tune & your first chords", d: `Correct posture, tuning, and your first chords: ${first}. Clean, buzz-free notes.` },
    { when: "Class 3–4", t: "All the chords for the song", d: `Add ${rest || "the remaining chords"}. Smooth, confident finger placement.` },
    { when: `Class 5–${half}`, t: "Changing chords in time", d: "Chord changes to a steady count, then your first strumming pattern." },
    { when: `Class ${half + 1}–${primary.classes - 1}`, t: "Playing along", d: `Strumming through the full progression of "${primary.title}" with the original track.` },
    { when: `Class ${primary.classes}`, t: `Play "${primary.title}" 🎉`, d: "The full song, start to finish, ready to perform for family." },
  ];
}

function guitarReco(experience) {
  const beginner = !/interm|advanc|some|play/i.test(String(experience || ""));
  return {
    type: beginner ? "Acoustic guitar (dreadnought or 40\")" : "Acoustic or electro-acoustic",
    forWhom: beginner ? "Perfect first guitar for a beginner." : "Suited to your level and goals.",
    budget: "₹4,000 – ₹8,000 to start",
    note: "We help you pick the right size and brand. Our partner music store gives Musicphonetics families a special price, or borrow one for your first classes.",
    partner: "Music-AL partner store",
  };
}

// Main entry: input = { instrument, songs:[{title,lang}], experienceLevel, startDateISO }
export function buildPlan(input) {
  const instrument = (input && input.instrument) || "Guitar";
  const rawSongs = (input && Array.isArray(input.songs) ? input.songs : []).filter((s) => s && (s.title || "").trim()).slice(0, 2);
  const start = input && input.startDateISO ? new Date(input.startDateISO) : nextMonday(new Date());
  const startDate = isNaN(start.getTime()) ? nextMonday(new Date()) : start;

  const analysed = (rawSongs.length ? rawSongs : [{ title: "", lang: "" }]).map(analyseSong).map((s) => {
    const weeks = weeksFor(s.classes);
    const playBy = new Date(startDate); playBy.setUTCDate(playBy.getUTCDate() + weeks * 7);
    return { ...s, weeks, playByISO: playBy.toISOString(), playBy: fmtDate(playBy) };
  });

  // The headline milestone = the fastest song to a first win.
  const primary = analysed.slice().sort((a, b) => a.classes - b.classes)[0];
  const allChords = Array.from(new Set(analysed.flatMap((s) => s.chords)));

  return {
    instrument,
    generatedAt: new Date().toISOString(),
    startDate: fmtDate(startDate),
    startDateISO: startDate.toISOString(),
    pace: "2 classes a week, 1 hour each",
    songs: analysed,
    primary,
    uniqueChords: allChords,
    headline: `Start on ${fmtDate(startDate)} and you can be playing "${primary.title}" by ${primary.playBy}.`,
    roadmap: roadmap(primary),
    guitar: guitarReco(input && input.experienceLevel),
    // A ready-to-use narration the AI layer can replace with warmer prose later.
    narration:
      `"${primary.title}" is built on ${primary.chordCount} ${primary.chordCount <= 4 ? "beginner-friendly " : ""}chords` +
      `${primary.chords.length ? " (" + primary.chords.join(", ") + ")" : ""}` +
      `${primary.capo ? `, capo ${primary.capo}` : ""}. ` +
      `At the Musicphonetics pace that is about ${primary.classes} classes. ` +
      `Begin this week and "${primary.title}" is yours by ${primary.playBy}.`,
  };
}
