// Local SEO landing-page data. Each area page targets "music classes in <area>"
// intent with genuinely unique, plainly written content. Truthful only: home and
// online tuition across Delhi NCR, with our hub in Delhi Cantt.

export interface AreaPage {
  slug: string;
  name: string;
  inName: string;
  lead: string;
  intro: string;
  neighbourhoods: string[];
  flagship?: boolean;
  // Real postal address, matching the Google Business Profile exactly. Only the
  // flagship hub has this; it powers LocalBusiness schema + the local pack.
  address?: { street: string; locality: string; region: string; postalCode: string; mapUrl: string };
  // Optional flagship extras.
  whyPoints?: [string, string][];
  founderNote?: string;
}

export const AREA_INSTRUMENTS = [
  "Guitar", "Piano", "Keyboard", "Vocals", "Drums", "Violin", "Ukulele", "Bass", "Music Production", "Music Theory",
];

export const AREA_PAGES: AreaPage[] = [
  {
    slug: "delhi-cantt",
    name: "Delhi Cantt",
    inName: "Delhi Cantt",
    flagship: true,
    lead: "Music classes for defence families in Delhi Cantt, taught at your home in the Cantonment, online, or at our Parade Road studio.",
    intro:
      "Musicphonetics is based right here in Delhi Cantt. For more than ten years we have taught officers and their children across the Cantonment, so we understand how a services family actually lives. Postings, transfers, busy parents, and children who do their best when there is real structure. Our teaching is built around exactly that. A verified teacher comes to your home in Shankar Vihar, Manekshaw, Arjan Vihar, Mall Road or anywhere else officers stay, follows a clear monthly plan, and keeps you updated after every class. And when you get posted out, the same teacher simply continues online, so your child never loses their progress.",
    neighbourhoods: ["Shankar Vihar", "Manekshaw Centre", "Arjan Vihar", "Mall Road", "Dhaula Kuan", "Parade Road", "Brar Square", "Gopinath Bazar", "Sadar Bazar (Cantt)", "Cantonment urban villages"],
    address: {
      street: "Parade Road",
      locality: "Delhi Cantonment",
      region: "Delhi",
      postalCode: "110010",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Musicphonetics%2C+Parade+Road%2C+Delhi+Cantt",
    },
    founderNote:
      "Musicphonetics is led by Abhishek, who grew up in a forces family. His father serves in the armed forces, so teaching officers and their children is not a market to him, it is home. That is who has taught families across the Cantonment for the last ten years.",
    whyPoints: [
      ["Taught by a forces family", "Led by a teacher who grew up in the services and has spent over ten years teaching officers and their children across Delhi Cantt."],
      ["Made for postings and transfers", "When your family moves, the classes move with you. The same teacher and the same plan continue live online, so no grade or momentum is lost."],
      ["Structure that suits your world", "A clear method with a monthly goal, steady practice and honest reports. The kind of order and follow through a services family already lives by."],
      ["Verified, punctual and safe", "Every teacher clears a seven stage selection. A vetted professional at your quarter or online, on time, every time."],
    ],
  },
  {
    slug: "south-delhi",
    name: "South Delhi",
    inName: "South Delhi",
    lead: "Structured, faculty-led music classes across South Delhi, at your home or online.",
    intro:
      "From Greater Kailash to Vasant Vihar, families in South Delhi come to us for music teaching that follows a real plan instead of a random list of songs. A verified teacher comes to your home, or teaches live online, and you can follow your child's progress every month in the parent portal.",
    neighbourhoods: ["Greater Kailash (GK I & II)", "Vasant Vihar", "Defence Colony", "Saket", "Hauz Khas", "Green Park", "Panchsheel Park", "Safdarjung Enclave", "Chittaranjan Park", "Malviya Nagar"],
  },
  {
    slug: "central-delhi",
    name: "Central Delhi",
    inName: "Central Delhi",
    lead: "Private music tuition across Central Delhi, at home and online, to a real standard.",
    intro:
      "For families in Lutyens' Delhi and the colonies around it, we bring a proper music education home. Hand-picked teachers, a clear method that takes a learner from first sound to confident performance, and a portal that keeps you in the loop after every class.",
    neighbourhoods: ["Golf Links", "Jor Bagh", "Chanakyapuri", "Civil Lines", "Karol Bagh", "Connaught Place", "Bengali Market", "Sunder Nagar"],
  },
  {
    slug: "gurugram",
    name: "Gurugram",
    inName: "Gurugram",
    lead: "Premium music classes across Gurugram, at home or online, personally guided.",
    intro:
      "Across DLF, Golf Course Road and the condominiums of Gurugram, we teach one to one to a genuinely high standard. A verified teacher at your door or online, a personalised monthly plan, and for families who want the very best, direct mentorship in the Director's Circle.",
    neighbourhoods: ["DLF Phase 1 to 5", "Golf Course Road", "The Camellias & Magnolias", "Sushant Lok", "South City I & II", "Sohna Road", "Nirvana Country", "Sector 56"],
  },
  {
    slug: "noida",
    name: "Noida",
    inName: "Noida",
    lead: "Structured music classes across Noida and Greater Noida, home and online.",
    intro:
      "Noida families get the same structured, faculty-led teaching that defines us. Guitar, piano, vocals and more, taught at home or live online, with a clear pathway and monthly reports rather than an endless string of unrelated songs.",
    neighbourhoods: ["Sector 15A", "Sector 44", "Sector 50", "Sector 93 & 100", "Jaypee Greens (Greater Noida)", "Sector 18", "Sector 128", "Sector 137"],
  },
  {
    slug: "faridabad",
    name: "Faridabad",
    inName: "Faridabad",
    lead: "Faculty-led music classes across Faridabad, at home or online.",
    intro:
      "From Charmwood Village to the Greater Faridabad sectors, we bring structured, one to one music teaching to your home or your screen. Verified teachers, a personalised plan, and progress you can follow every month.",
    neighbourhoods: ["Sector 15 & 16", "Sector 21", "Charmwood Village", "Greenfield Colony", "Neelam Bata Road", "Surajkund", "Sector 46", "Greater Faridabad"],
  },
  {
    slug: "ghaziabad",
    name: "Ghaziabad",
    inName: "Ghaziabad",
    lead: "Structured music classes across Ghaziabad and Indirapuram, home and online.",
    intro:
      "In Indirapuram, Vaishali and across Ghaziabad, families choose us for music learning that has a real method behind it. A verified teacher at home or online, a monthly goal broken into clear classes, and reports that show exactly how your child is growing.",
    neighbourhoods: ["Indirapuram", "Vaishali", "Kaushambi", "Raj Nagar Extension", "Crossings Republik", "Vasundhara", "Shipra Suncity"],
  },
];

export function getArea(slug: string): AreaPage | undefined {
  return AREA_PAGES.find((a) => a.slug === slug);
}
