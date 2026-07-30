// Musicphonetics teaching + repertoire knowledge that grounds the monthly
// 8-class PLAN generator. India-first, graded across ~4 monthly cycles, with a
// large song bank (Indian + popular English) so a teacher's short note becomes a
// complete, sequential, name-personalised month. Owners can extend this from
// Owner → Settings → AI assistant knowledge (appended at request time).

export const PLAN_KNOWLEDGE = `
MUSICPHONETICS — TEACHING & REPERTOIRE KNOWLEDGE (for building a one-month, 8-class plan)

HOW TO USE THIS:
The teacher often types only a few rough words (e.g. "beginner keyboard bollywood",
"rhythm month", "prep recital", "exam", "bhajan for dadi's birthday"). Read the intent
GENEROUSLY and build a complete, sequential 8-class month. Always choose REAL,
level-appropriate songs from the SONG BANK below. Prefer Indian songs the family will
instantly recognise, and add a popular English number when it fits. Progress logically:
technique/warm-up early → learn a song section mid-month → a polished, confident
performance by class 8.

COMMUNICATION STYLE (VERY IMPORTANT):
- Warm, encouraging, respectful Indian-English. Simple, clear, motivating words.
- ALWAYS use the student's FIRST NAME through the plan (big goal + class titles/focus),
  e.g. "Aarav plays his first clean notes", "By class 8, Aarav performs for the family".
- Tie wins to family & culture: playing for parents/grandparents, family functions,
  festivals (Diwali, birthdays), school annual day, temple/aarti.
- Build confidence; celebrate small wins; never harsh or discouraging.

FOUR-MONTH BEGINNER ARC (each MONTH = one 8-class cycle; pick the right stage for the level):
- Month 1 — Foundations: posture & hand position, clean single notes, steady counting,
  first very-easy melody, a daily 10-minute practice habit. End with one simple song.
- Month 2 — First songs: basic chords/notes/scales, smooth changes, playing in time to a
  count, first FULL easy song, gentle ear training (high/low, Sa–Pa).
- Month 3 — Making music: two songs, correct timing start-to-finish, dynamics/expression,
  playing along to a backing track, practising independently and self-correcting.
- Month 4 — Perform: polish a performance piece, full run-throughs, a small performance
  for family/teacher, note strengths and the next step.

SONG BANK (grouped by difficulty. ✅ = guitar/ukulele/keyboard with basic chords;
🎹 = piano/keyboard melody-friendly; 🎤 = great for voice):

TIER 1 — STARTER (Month 1, simplest, 2–3 notes/chords):
  Indian: "Vande Mataram" (opening line) 🎹🎤 · "Raghupati Raghav Raja Ram" ✅🎤 ·
    "Om Jai Jagdish Hare" 🎤 · "Nani Teri Morni" (kids) 🎹 · "Lakdi Ki Kaathi" (kids) 🎤 ·
    "Sa Re Ga Ma" sargam patterns 🎤🎹.
  English: "Twinkle Twinkle" 🎹 · "Ode to Joy" (Beethoven) 🎹 · "Happy Birthday" 🎹🎤 ·
    "You Are My Sunshine" ✅🎤 · "Mary Had a Little Lamb" 🎹.

TIER 2 — EASY (Month 2, 3–4 basic chords / simple melodies):
  Indian: "Tum Hi Ho" (Aashiqui 2) ✅🎤 · "Raabta" ✅ · "Channa Mereya" ✅🎤 ·
    "Kal Ho Naa Ho" ✅🎤 · "Pehla Nasha" ✅ · "Tera Yaar Hoon Main" ✅ · "Iktara" ✅🎤 ·
    "Saare Jahan Se Accha" 🎤 (patriotic) · "Achyutam Keshavam" 🎤 (bhajan).
  English: "Perfect" (Ed Sheeran) ✅🎤 · "Let It Be" (Beatles) ✅🎹 ·
    "Count on Me" (Bruno Mars) ✅🎤 · "Stand By Me" ✅ · "I'm Yours" (Jason Mraz) ✅ ·
    "Take Me Home, Country Roads" ✅🎤.

TIER 3 — BUILDING (Month 3, rhythm, expression, two songs):
  Indian: "Kesariya" (Brahmastra) ✅🎤 · "Shayad" ✅ · "Apna Bana Le" ✅🎤 ·
    "Dil Diyan Gallan" ✅🎤 · "Galliyan" ✅🎤 · "Samjhawan" ✅ ·
    "Agar Tum Saath Ho" 🎹🎤 · "Ae Watan" (Raazi) 🎤 (patriotic).
  English: "Someone Like You" (Adele) 🎹🎤 · "Photograph" (Ed Sheeran) ✅🎤 ·
    "Riptide" (Vance Joy) ✅ · "A Thousand Years" 🎹🎤 · "Havana" 🎹 · "Believer" ✅ (rhythm/energy).

TIER 4 — PERFORMANCE (Month 4 / recital pieces):
  Indian: "Tujhe Kitna Chahne Lage" 🎤 · "Kabira" ✅🎤 · "Ae Dil Hai Mushkil" 🎤 ·
    "Maa Tujhe Salaam" 🎤 (patriotic) · "Vaishnav Jan To" 🎤 (devotional) · "Tum Se Hi" ✅🎤.
  English: "Perfect" (full) 🎤 · "River Flows in You" 🎹 (piano) · "Für Elise" (intro) 🎹 ·
    "Canon in D" (simplified) 🎹 · "Hallelujah" 🎤.

INSTRUMENT STARTING POINTS:
- Guitar / Ukulele: open chords Em, G, C, D, Am; down-strum → down-up strumming. Most
  TIER 2 songs use 3–4 of these.
- Keyboard / Piano: right-hand melody first (C-position), then simple left-hand chords
  (C, G, Am, F). Good first melodies: "Ode to Joy", "Twinkle", "Vande Mataram", "Tum Hi Ho".
- Vocals: breathing + pitch-matching sargam (Sa Re Ga Ma), simple alaap, then a bhajan or
  an easy film song in a comfortable key.
- Drums: single-stroke control, a basic 8-beat groove, then play along to a simple Bollywood beat.
- Violin: open strings, first-position notes, "Twinkle", the "Vande Mataram" line.

EXAM PATH: If the note mentions "exam", "Trinity", or "grade", structure the month around
graded technical work (scales/arpeggios), a set piece, sight-reading + aural, and a mock in
class 7–8.

INTERPRETING SHORT NOTES (examples):
- "beginner guitar" → Month 1–2 on guitar; Em-G-C-D; end with "Tum Hi Ho" or "Perfect".
- "bollywood keyboard" → keyboard melodies of "Tum Hi Ho", "Kal Ho Naa Ho", "Channa Mereya".
- "rhythm month" → strumming/timing patterns + a rhythmic song ("Believer", "Kesariya").
- "recital" / "performance" → a TIER 4 piece, run-throughs, small family performance by class 8.
- "bhajan" / "devotional" → "Raghupati Raghav", "Achyutam Keshavam", "Om Jai Jagdish Hare".
- "exam" → the EXAM PATH above.
`.trim();
