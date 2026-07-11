import Image from "next/image";
import { FOUNDER } from "@/lib/founder";

// A warm, signed note from the Director - shown inside the parent and teacher
// portals so oversight feels personal, not corporate.
const NOTES: Record<"parent" | "teacher", { eyebrow: string; body: string[] }> = {
  parent: {
    eyebrow: "A note from the Director",
    body: [
      "Namaste, and thank you for trusting us with something as personal as your child's music. I don't take that lightly.",
      "When I started Musicphonetics, I'd seen too many children lose interest - not because they lacked talent, but because the classes were random. A few songs here, no direction there, and no one to answer to. I promised myself we'd be different.",
      "So here's what I promise you. Every class your child takes is prepared, not improvised. Every week is tracked, and right here in this portal you'll see exactly what was taught, what the homework is, and what comes next. No guessing, no vague \"he's doing fine.\"",
      "And no teacher ever reaches your child without my personal sign-off. If a class ever feels off, or you simply want to talk about your child's progress, message me directly. I'm not a call centre - I'm the person whose name is on the door.",
    ],
  },
  teacher: {
    eyebrow: "A note from the Director",
    body: [
      "Welcome. If you're reading this, it's because I personally chose you - you don't get here by filling a form.",
      "You're not freelancing on the side here. You're part of a serious teaching network with a standard we hold from the very top, and a reputation that a thousand families have helped build over ten years.",
      "My ask is simple: prepare every class, update it honestly, and look after every student as if their parent were watching - because through this portal, they are. In return, your work is seen, your progress is tracked, and you are paid transparently and on time.",
      "Do that consistently, and I will back you - with better students, better pay and real growth. We rise together, or not at all.",
    ],
  },
};

export function DirectorNote({ variant, dark }: { variant: "parent" | "teacher"; dark?: boolean }) {
  const n = NOTES[variant];
  return (
    <figure className={dark
      ? "rounded-2xl border border-white/10 bg-onyx-1 p-5"
      : "rounded-2xl border border-hairline bg-white p-5 shadow-card"}>
      <div className="flex items-center gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-gold/40">
          <Image src={FOUNDER.photo} alt={FOUNDER.photoAlt} fill sizes="44px" className="object-cover object-top" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gold">{n.eyebrow}</p>
          <p className={dark ? "font-display text-sm font-semibold text-paper" : "font-display text-sm font-semibold text-ink"}>{FOUNDER.name}</p>
        </div>
      </div>
      <blockquote className={dark ? "mt-3 space-y-2 text-sm leading-relaxed text-paper/75" : "mt-3 space-y-2 text-sm leading-relaxed text-ink/80"}>
        {n.body.map((p) => <p key={p}>{p}</p>)}
      </blockquote>
      <figcaption className={dark ? "mt-3 text-xs text-paper/50" : "mt-3 text-xs text-ink/55"}>- Abhishek Kumar, Founder &amp; Director</figcaption>
    </figure>
  );
}
