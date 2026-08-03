// The teacher platform showcase — the modern "teaching OS" a faculty member
// gets. Added so Teach With Us reflects the real product, not just the offer.

interface Feature { title: string; body: string; d: string }

const FEATURES: Feature[] = [
  {
    title: "Your teaching dashboard",
    body: "Every student, class, payment and payout in one clean place — on the web or installed as an app on your phone.",
    d: "M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9",
  },
  {
    title: "AI lesson planner",
    body: "Type a few rough words — “Bollywood beginner guitar” — and get a full month of 8 classes with real songs, in the student's name. Edit and save in seconds.",
    d: "M12 3l1.6 3.9L18 8l-3.4 2.4L15 15l-3-2.3L9 15l.4-4.6L6 8l4.4-1.1L12 3Z",
  },
  {
    title: "Students, brought to you",
    body: "Matched enquiries land in your Leads inbox with a notification and email. You don't chase students — you just teach them.",
    d: "M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 8v6M22 11h-6",
  },
  {
    title: "One-tap class updates",
    body: "Log what you taught, homework and notes after each class — parents see it instantly, so your work is always visible.",
    d: "M4 6h16M4 12h16M4 18h10",
  },
  {
    title: "Progress & monthly reports",
    body: "Attendance, the Foundation journey, repertoire and auto-built monthly reports — the credibility of a real institution, done for you.",
    d: "M7 3h7l5 5v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM14 3v5h5M9 13h6M9 17h4",
  },
  {
    title: "Transparent earnings",
    body: "See each student's fee, your share and every payout's status live. Paid on a fixed monthly cycle — no awkward follow-ups.",
    d: "M3 7h18v10H3zM3 10h18M7 14h3",
  },
  {
    title: "Your verified public profile",
    body: "Answer a short questionnaire, let AI write your bio, add a photo — and your verified faculty profile goes live on our site to attract students.",
    d: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0",
  },
  {
    title: "Coupons & referrals",
    body: "Your own discount code and referral rewards, tracked automatically — grow your own students and earn more.",
    d: "M9 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 3h6v4H9zM9 12h6M9 16h4",
  },
];

function Ic({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TeachPlatform() {
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      </div>
      <div className="container-mp relative py-20 sm:py-24">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-10 bg-gold" />
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">Your teaching platform</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Not a WhatsApp group. A real <span className="text-gold">teaching OS.</span>
          </h2>
          <p className="mt-4 text-[0.975rem] leading-relaxed text-paper/75 sm:text-lg">
            Most “teaching jobs” leave you juggling chats, spreadsheets and payment reminders. At Musicphonetics you get a
            proper platform — the students, the planning, the tracking and the payouts are all built for you, so you can
            spend your time teaching, not chasing.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-gold/40 hover:bg-white/[0.06]">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold/15 text-gold">
                <Ic d={f.d} />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-paper/65">{f.body}</p>
            </div>
          ))}
        </div>

        {/* See it in action — real portal screens */}
        <div className="mt-16">
          <h3 className="font-display text-2xl font-semibold">See it in action</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-paper/65">Real screens from the app — what you and your students&apos; families use every day.</p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {SHOTS.map((s) => (
              <figure key={s.src} className="group">
                <div className="mx-auto max-w-[240px] rounded-[2rem] border border-white/12 bg-black/60 p-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] transition-transform group-hover:-translate-y-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.src} alt={s.alt} loading="lazy" className="w-full rounded-[1.5rem]" />
                </div>
                <figcaption className="mt-4 text-center">
                  <span className="block font-display text-base font-semibold">{s.title}</span>
                  <span className="mt-0.5 block text-sm text-paper/60">{s.desc}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <p className="mt-10 text-sm text-paper/55">
          Works on any phone or laptop — install it like an app, and it even works offline.
        </p>
      </div>
    </section>
  );
}

const SHOTS = [
  { src: "/images/teach/dashboard.png", title: "Your dashboard", desc: "Students, classes and earnings in one glance.", alt: "Musicphonetics teacher dashboard" },
  { src: "/images/teach/planner.png", title: "AI lesson planner", desc: "A full month of 8 classes in seconds.", alt: "Musicphonetics AI lesson planner generating an 8-class plan" },
  { src: "/images/teach/earnings.png", title: "Live earnings", desc: "Always know exactly what you'll be paid.", alt: "Musicphonetics teacher earnings and payouts" },
  { src: "/images/teach/parent.png", title: "The parent view", desc: "Families see progress, plans and fees — so your work shines.", alt: "Musicphonetics parent portal showing a child's learning journey" },
];
