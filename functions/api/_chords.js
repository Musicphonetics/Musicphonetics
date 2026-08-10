// Verified beginner-guitar chord database (Hindi + English). Used ONLY to state
// real facts about a learner's dream songs — never fabricated. If a song is not
// here, we say the teacher will map it in class, rather than invent chords.

const SONGS = [
  // English
  { t: "Perfect", a: "Ed Sheeran", k: ["perfect"], chords: ["G", "Em", "C", "D"], capo: 1 },
  { t: "Summer of '69", a: "Bryan Adams", k: ["summer of 69", "summer of '69", "summer of 69'"], chords: ["D", "A", "G", "Bm"] },
  { t: "Country Roads", a: "John Denver", k: ["country roads", "take me home", "country road"], chords: ["G", "Em", "D", "C"] },
  { t: "Let It Be", a: "The Beatles", k: ["let it be"], chords: ["C", "G", "Am", "F"] },
  { t: "Riptide", a: "Vance Joy", k: ["riptide"], chords: ["Am", "G", "C", "F"] },
  { t: "Photograph", a: "Ed Sheeran", k: ["photograph"], chords: ["G", "D", "Em", "C"], capo: 3 },
  { t: "Stand By Me", a: "Ben E. King", k: ["stand by me"], chords: ["G", "Em", "C", "D"] },
  { t: "Knockin' on Heaven's Door", a: "Bob Dylan", k: ["knockin", "heaven's door", "heavens door"], chords: ["G", "D", "Am", "C"] },
  { t: "Faded", a: "Alan Walker", k: ["faded"], chords: ["Em", "C", "G", "D"] },
  { t: "Someone Like You", a: "Adele", k: ["someone like you"], chords: ["A", "E", "F#m", "D"] },
  { t: "Wonderwall", a: "Oasis", k: ["wonderwall"], chords: ["Em7", "G", "Dsus4", "Cadd9"], capo: 2 },
  { t: "Believer", a: "Imagine Dragons", k: ["believer"], chords: ["Bm", "A", "G", "D"] },
  { t: "Shape of You", a: "Ed Sheeran", k: ["shape of you"], chords: ["Am", "Dm", "G", "C"] },
  { t: "Hey There Delilah", a: "Plain White T's", k: ["hey there delilah", "delilah"], chords: ["D", "F#m", "Bm", "G", "A"] },
  // Hindi
  { t: "Tum Hi Ho", a: "Arijit Singh", k: ["tum hi ho", "tumhi ho"], chords: ["Am", "Dm", "G", "C", "E"], capo: 1 },
  { t: "Kesariya", a: "Arijit Singh", k: ["kesariya"], chords: ["G", "D", "Em", "C"], capo: 4 },
  { t: "Channa Mereya", a: "Arijit Singh", k: ["channa mereya", "channa"], chords: ["Em", "C", "G", "D", "Am"] },
  { t: "Raabta", a: "Arijit Singh", k: ["raabta"], chords: ["G", "D", "Em", "C"] },
  { t: "Tera Ban Jaunga", a: "Akhil Sachdeva", k: ["tera ban jaunga", "ban jaunga"], chords: ["C", "G", "Am", "F"] },
  { t: "Shayad", a: "Arijit Singh", k: ["shayad"], chords: ["C", "G", "Am", "F"] },
  { t: "Pehla Nasha", a: "Udit Narayan", k: ["pehla nasha"], chords: ["G", "Em", "C", "D"], capo: 2 },
  { t: "Tujhe Kitna Chahne Lage", a: "Arijit Singh", k: ["tujhe kitna chahne", "kitna chahne"], chords: ["Em", "G", "D", "C"] },
  { t: "Chaudhary", a: "Amit Trivedi", k: ["chaudhary", "choudhary"], chords: ["Am", "G", "F"] },
  { t: "Galliyan", a: "Ankit Tiwari", k: ["galliyan", "galiyan"], chords: ["Am", "F", "C", "G"] },
  { t: "Ilahi", a: "Arijit Singh", k: ["ilahi"], chords: ["G", "D", "Em", "C"] },
  { t: "Iktara", a: "Kavita Seth", k: ["iktara"], chords: ["D", "A", "Bm", "G"] },
  { t: "Samjhawan", a: "Arijit Singh", k: ["samjhawan", "samjhawa"], chords: ["G", "D", "Em", "C"], capo: 1 },
  { t: "Tum Se Hi", a: "Mohit Chauhan", k: ["tum se hi", "tumse hi"], chords: ["G", "D", "Em", "C", "Am"] },
  { t: "Khairiyat", a: "Arijit Singh", k: ["khairiyat"], chords: ["C", "G", "Am", "F"] },
];

function norm(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

export function chordInfo(title) {
  const n = norm(title);
  if (!n) return { matched: false, title: "" };
  for (const s of SONGS) {
    for (const key of s.k) {
      if (n.includes(norm(key)) || norm(key).includes(n)) {
        return { matched: true, title: s.t, artist: s.a, chords: s.chords, capo: s.capo || 0 };
      }
    }
  }
  return { matched: false, title: title.trim() };
}
