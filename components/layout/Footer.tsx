import Link from "next/link";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { BRAND, whatsappTrialLink, FOOTER_NAV, AREAS_SERVED } from "@/lib/data";

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="container-mp py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Logo invert />
            <p className="mt-4 max-w-xs font-display text-lg text-paper/90">
              {BRAND.tagline}
            </p>
            <p className="mt-2 text-sm text-paper/60">Founded in India.</p>
            <div className="mt-6">
              <Button href={whatsappTrialLink()} external variant="light" size="md">
                Book a Trial
              </Button>
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Footer">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Explore
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-paper/75 transition-colors hover:text-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Areas */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Where we teach
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
            © {new Date().getFullYear()} {BRAND.name}. {BRAND.tagline}
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
