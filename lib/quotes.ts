// A small set of warm, motivating lines shown to families on the portal home,
// in place of a monthly goal the teacher may not always have time to write.
// One is picked per day so it feels fresh but stays stable through the day.

export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: Quote[] = [
  { text: "Music gives a soul to the universe, wings to the mind, and life to everything.", author: "Plato" },
  { text: "A little practice every day beats a lot of practice once in a while.", author: "Musicphonetics" },
  { text: "Where words fail, music speaks.", author: "Hans Christian Andersen" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Practice isn't the thing you do once you're good. It's the thing that makes you good.", author: "Malcolm Gladwell" },
  { text: "Every child is musical. Our job is simply to help it come out.", author: "Musicphonetics" },
  { text: "Music is the shorthand of emotion.", author: "Leo Tolstoy" },
  { text: "Small progress is still progress. Celebrate every step.", author: "Musicphonetics" },
  { text: "To play a wrong note is insignificant; to play without passion is inexcusable.", author: "Ludwig van Beethoven" },
  { text: "Patience and love turn practice into music.", author: "Musicphonetics" },
  { text: "Talent is a pursued interest. Anything you're willing to practice, you can do.", author: "Bob Ross" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "One good habit today becomes a lifelong love of music tomorrow.", author: "Musicphonetics" },
  { text: "Music washes away from the soul the dust of everyday life.", author: "Berthold Auerbach" },
  { text: "Encouragement at home is the finest teacher a child can have.", author: "Musicphonetics" },
];

// Deterministic pick for a given day, so it changes daily without flickering.
export function quoteOfTheDay(d: Date = new Date()): Quote {
  const dayNumber = Math.floor(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000,
  );
  return QUOTES[((dayNumber % QUOTES.length) + QUOTES.length) % QUOTES.length];
}
