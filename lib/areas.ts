// Local SEO landing-page data. Each area page targets "music classes in <area>"
// intent with genuinely unique content (real neighbourhoods + tailored copy) so
// the pages are distinct, not thin duplicates. Truthful only — home & online
// tuition across Delhi NCR.

export interface AreaPage {
  slug: string;
  name: string;         // "South Delhi"
  inName: string;       // used in prose, e.g. "South Delhi"
  lead: string;         // one-line positioning for hero
  intro: string;        // localized opening paragraph
  neighbourhoods: string[];
  flagship?: boolean;   // the hub (Delhi Cantt) — extra weight + real address
  // Real postal address, matching the Google Business Profile exactly. Only the
  // flagship hub has this; it powers LocalBusiness schema + the local pack.
  address?: { street: string; locality: string; region: string; postalCode: string; mapUrl: string };
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
    lead: "Our home base — structured, faculty-led music classes in Delhi Cantt: at your home, online, or at our Parade Road studio.",
    intro:
      "Musicphonetics is based in Delhi Cantt. From Parade Road across the Cantonment, families learn music the way it should be taught — with a verified teacher, a structured method, and a parent portal that shows real monthly progress. Learn at your home, live online, or with us on Parade Road. This is our hub, and where we look after our own community first.",
    neighbourhoods: ["Parade Road", "Sadar Bazar (Cantt)", "Gopinath Bazar", "Brar Square", "Dhaula Kuan", "Naraina", "Naraina Vihar", "Kirby Place", "Delhi Cantonment"],
    address: {
      street: "Parade Road",
      locality: "Delhi Cantonment",
      region: "Delhi",
      postalCode: "110010",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Musicphonetics%2C+Parade+Road%2C+Delhi+Cantt",
    },
  },
  {
    slug: "south-delhi",
    name: "South Delhi",
    inName: "South Delhi",
    lead: "Structured, faculty-led music classes across South Delhi — at your home or online.",
    intro:
      "From Greater Kailash to Vasant Vihar, South Delhi families choose Musicphonetics for music education that is structured, not random. A verified teacher comes to your home — or teaches live online — following a clear, personalised pathway, with monthly progress you can actually see in the parent portal.",
    neighbourhoods: ["Greater Kailash (GK I & II)", "Vasant Vihar", "Defence Colony", "Saket", "Hauz Khas", "Green Park", "Panchsheel Park", "Safdarjung Enclave", "Chittaranjan Park", "Malviya Nagar"],
  },
  {
    slug: "central-delhi",
    name: "Central Delhi",
    inName: "Central Delhi",
    lead: "Private music tuition across Central Delhi — home visits and online, to a real standard.",
    intro:
      "For families in Lutyens' Delhi and the surrounding colonies, Musicphonetics brings a proper music education home. Hand-picked faculty, a structured method from first sound to confident performance, and a portal that keeps you in the loop after every class.",
    neighbourhoods: ["Golf Links", "Jor Bagh", "Chanakyapuri", "Civil Lines", "Karol Bagh", "Connaught Place", "Bengali Market", "Sunder Nagar"],
  },
  {
    slug: "gurugram",
    name: "Gurugram",
    inName: "Gurugram",
    lead: "Premium music classes across Gurugram — at home or online, personally guided.",
    intro:
      "Across DLF, Golf Course Road and the premium condominiums of Gurugram, Musicphonetics delivers one-to-one music education built like an institution. A verified teacher at your door or online, a personalised monthly plan, and — for families who want the very best — direct mentorship in the Director's Circle.",
    neighbourhoods: ["DLF Phase 1–5", "Golf Course Road", "The Camellias & Magnolias", "Sushant Lok", "South City I & II", "Sohna Road", "Nirvana Country", "Sector 56"],
  },
  {
    slug: "noida",
    name: "Noida",
    inName: "Noida",
    lead: "Structured music classes across Noida & Greater Noida — home and online.",
    intro:
      "Noida families get the same structured, faculty-led education that defines Musicphonetics — guitar, piano, vocals and more — taught at home or live online, with a clear pathway and monthly reports rather than an endless string of unrelated songs.",
    neighbourhoods: ["Sector 15A", "Sector 44", "Sector 50", "Sector 93 & 100", "Jaypee Greens (Greater Noida)", "Sector 18", "Sector 128", "Sector 137"],
  },
  {
    slug: "faridabad",
    name: "Faridabad",
    inName: "Faridabad",
    lead: "Faculty-led music classes across Faridabad — at home or online.",
    intro:
      "From Charmwood Village to the Greater Faridabad sectors, Musicphonetics brings structured, one-to-one music education to your home or screen — verified teachers, a personalised plan, and progress you can follow every month.",
    neighbourhoods: ["Sector 15 & 16", "Sector 21", "Charmwood Village", "Greenfield Colony", "Neelam Bata Road", "Surajkund", "Sector 46", "Greater Faridabad"],
  },
  {
    slug: "ghaziabad",
    name: "Ghaziabad",
    inName: "Ghaziabad",
    lead: "Structured music classes across Ghaziabad & Indirapuram — home and online.",
    intro:
      "In Indirapuram, Vaishali and across Ghaziabad, families choose Musicphonetics for music learning with a real method behind it — a verified teacher at home or online, a monthly goal broken into clear classes, and reports that show exactly how your child is growing.",
    neighbourhoods: ["Indirapuram", "Vaishali", "Kaushambi", "Raj Nagar Extension", "Crossings Republik", "Vasundhara", "Shipra Suncity"],
  },
];

export function getArea(slug: string): AreaPage | undefined {
  return AREA_PAGES.find((a) => a.slug === slug);
}
