import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import {
  whatsappLink,
  whatsappTrialLink,
  phoneLink,
} from "@/lib/data";

const TRUST_BADGES = ["Verified Academy", "Trusted by Families", "10+ Years", "1,100+ Students"];

const QUICK_ACTIONS = [
  { label: "Call", href: phoneLink, external: false, icon: <IconPhone /> },
  { label: "WhatsApp", href: whatsappLink(), external: true, icon: <IconWa /> },
  { label: "Enquiry", href: whatsappLink("Hi Musicphonetics, I'd like to enquire about music classes."), external: true, icon: <IconChat /> },
  { label: "Areas", href: "/contact", external: false, icon: <IconPin /> },
  { label: "Reviews", href: "#reviews", external: false, icon: <IconStar /> },
];

const MEDIA = [
  "Class Photos",
  "Home Concerts",
  "Student Stories",
  "Reviews",
  "Performances",
];

/** Dense, action-first mobile listing block. Hidden on desktop (lg+). */
export function MobileHero() {
  return (
    <section className="bg-ink px-4 pb-5 pt-5 text-paper lg:hidden">
      {/* Trust badges */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TRUST_BADGES.map((b) => (
          <span key={b} className="flex shrink-0 items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold text-gold">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {b}
          </span>
        ))}
      </div>

      {/* Identity */}
      <div className="mt-4">
        <h1 className="font-display text-3xl font-semibold leading-tight">Musicphonetics</h1>
        <p className="mt-1 text-base font-semibold text-gold">Premium One-to-One Music Classes</p>
        <p className="mt-2 text-sm text-paper/80">Guitar · Piano · Keyboard · Vocals · Ukulele</p>
        <p className="mt-2 text-sm leading-relaxed text-paper/65">
          Home classes across Delhi NCR and live online classes — with trained
          teachers, structured progress, and parent updates.
        </p>
      </div>

      {/* Rating / trust row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-paper/70">
        <span className="flex items-center gap-1 font-semibold text-gold">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 16.5 7.1 18l.9-5.5-4-3.9 5.5-.8z" /></svg>
          4.8/5
        </span>
        <span className="text-paper/45">based on parent reviews</span>
        <span className="h-3 w-px bg-white/15" />
        <span>Long-term families</span>
        <span className="h-3 w-px bg-white/15" />
        <span>Verified teacher network</span>
      </div>

      {/* Quick actions */}
      <div className="-mx-4 mt-4 flex gap-2.5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {QUICK_ACTIONS.map((a) => (
          <a
            key={a.label}
            href={a.href}
            target={a.external ? "_blank" : undefined}
            rel={a.external ? "noopener noreferrer" : undefined}
            className="flex w-16 shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-white/12 bg-white/5 py-3 text-paper/85 transition-colors active:bg-white/10"
          >
            <span className="text-gold">{a.icon}</span>
            <span className="text-[11px] font-medium">{a.label}</span>
          </a>
        ))}
      </div>

      {/* Primary CTA bar */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <a href={whatsappTrialLink()} target="_blank" rel="noopener noreferrer" className="rounded-full bg-gold py-3 text-center text-sm font-semibold text-ink active:bg-deep-gold">
          Book Trial
        </a>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 py-3 text-center text-sm font-semibold text-paper active:bg-white/10">
          WhatsApp
        </a>
      </div>

      {/* Media preview */}
      <div className="-mx-4 mt-5 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MEDIA.map((m) => (
          <div key={m} className="w-32 shrink-0">
            <ImagePlaceholder label={m} aspect="square" tone="ink" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---- compact icons ---- */
function IconPhone() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 1-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>; }
function IconWa() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7L7 20.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.7.7-2.7-.2-.3A8 8 0 1 1 12 20zm4.5-5.9c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8.9-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.4c.1-.2.1-.3.2-.5s0-.3 0-.4-.5-1.3-.7-1.7-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c.6.3 1.1.4 1.5.5a3.6 3.6 0 0 0 1.6.1c.5-.1 1.4-.6 1.6-1.1s.2-1 .1-1.1-.2-.1-.4-.2z" /></svg>; }
function IconChat() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5h16v11H8l-4 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>; }
function IconPin() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" /></svg>; }
function IconStar() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 16.5 7.1 18l.9-5.5-4-3.9 5.5-.8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>; }
