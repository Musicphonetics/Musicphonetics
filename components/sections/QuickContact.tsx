import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { whatsappLink, phoneLink, PHONE_DISPLAY } from "@/lib/data";

const ACTIONS = [
  { label: "Call us", sub: PHONE_DISPLAY, href: phoneLink, external: false, icon: <IconPhone /> },
  { label: "WhatsApp", sub: "Chat with our team", href: whatsappLink(), external: true, icon: <IconWa /> },
  { label: "Areas", sub: "Delhi NCR & online", href: "/contact", external: false, icon: <IconPin /> },
  { label: "Reviews", sub: "What parents say", href: "/reviews", external: false, icon: <IconStar /> },
];

export function QuickContact() {
  return (
    <Section background="white" spacing="md">
      <Reveal>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIONS.map((a) => {
            const inner = (
              <span className="group flex h-full items-center gap-3 rounded-2xl border border-hairline bg-paper p-5 transition-all hover:-translate-y-1 hover:shadow-card-hover">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-deep-gold">{a.icon}</span>
                <span>
                  <span className="block text-sm font-semibold text-ink">{a.label}</span>
                  <span className="block text-xs text-ink/55">{a.sub}</span>
                </span>
              </span>
            );
            return a.external ? (
              <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer">{inner}</a>
            ) : (
              <Link key={a.label} href={a.href}>{inner}</Link>
            );
          })}
        </div>
      </Reveal>
    </Section>
  );
}

function IconPhone() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 1-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>; }
function IconWa() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7L7 20.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.7.7-2.7-.2-.3A8 8 0 1 1 12 20z" /></svg>; }
function IconPin() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" /></svg>; }
function IconStar() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 16.5 7.1 18l.9-5.5-4-3.9 5.5-.8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>; }
