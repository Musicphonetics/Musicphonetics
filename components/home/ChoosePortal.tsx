import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

const PORTALS = [
  {
    href: "/parent/login",
    title: "Parent / Student Portal",
    desc: "Track classes, homework, progress and your child's learning journey after every class.",
    icon: "M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.5 20v-1a4 4 0 0 0-3-3.87",
    cta: "Parent login",
  },
  {
    href: "/teacher/login",
    title: "Teacher Portal",
    desc: "Manage your students, record class updates and track your teaching, all in one place.",
    icon: "M12 14l9-5-9-5-9 5 9 5ZM12 14v7M6 10.5V16c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5.5",
    cta: "Teacher login",
  },
  {
    href: "/owner/login",
    title: "Owner Dashboard",
    desc: "Operations, payments, teachers, renewals and reports, the whole command centre.",
    icon: "M4 5h16M4 12h16M4 19h10",
    cta: "Owner login",
  },
];

export function ChoosePortal() {
  return (
    <section className="bg-paper py-20 text-ink sm:py-32">
      <div className="container-mp">
        <Reveal>
          <p className="eyebrow text-center">One organised system</p>
          <h2 className="mx-auto mt-2 max-w-2xl text-center font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Choose your portal.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-base leading-relaxed text-ink/65">
            Musicphonetics isn&apos;t a random teacher. It&apos;s a managed journey with a place for every parent,
            teacher and student.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PORTALS.map((p, i) => (
            <Reveal key={p.href} delay={(i % 3) * 90}>
              <Link href={p.href}
                className="group flex h-full flex-col rounded-3xl border border-hairline bg-white p-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover sm:p-8">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#C9A227]/12 text-[#7A5E0F]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={p.icon} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-ink">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">{p.desc}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#7A5E0F]">
                  {p.cta} <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
