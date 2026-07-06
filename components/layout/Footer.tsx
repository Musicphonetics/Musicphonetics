import Link from "next/link";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import {
  BRAND,
  whatsappTrialLink,
  FOOTER_NAV,
  AREAS_SERVED,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
} from "@/lib/data";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
    </svg>
  );
}

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

            {/* Follow along */}
            <div className="mt-8">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                Follow along
              </h3>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2.5 rounded-full border border-white/15 px-4 py-2 text-sm text-paper/85 transition-colors hover:border-gold/60 hover:text-paper"
              >
                <InstagramIcon className="text-gold" />
                @{INSTAGRAM_HANDLE}
              </a>
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
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/standards/privacy-policy" className="hover:text-paper">
              Privacy
            </Link>
            <Link href="/standards/terms-conditions" className="hover:text-paper">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
