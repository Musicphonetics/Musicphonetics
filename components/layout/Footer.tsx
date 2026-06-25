import Link from "next/link";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { NAV_LINKS, BRAND, whatsappLink, AREAS_SERVED } from "@/lib/data";

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="container-mp py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Logo invert />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/70">
              Structured, personal, director-led music education across{" "}
              {BRAND.region}. Home, online, and future academy pathways.
            </p>
            <div className="mt-6">
              <Button href={whatsappLink()} external variant="light" size="md">
                Enquire on WhatsApp
              </Button>
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Footer">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Explore
            </h3>
            <ul className="mt-4 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-paper/75 transition-colors hover:text-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-paper/75 transition-colors hover:text-paper"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Areas */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Areas served
            </h3>
            <ul className="mt-4 space-y-2">
              {AREAS_SERVED.map((area) => (
                <li key={area} className="text-sm text-paper/75">
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-paper/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. Built by {BRAND.founder}.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/teach-with-us" className="hover:text-paper">
              Teach with us
            </Link>
            <Link href="/admin" className="hover:text-paper">
              Owner portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
