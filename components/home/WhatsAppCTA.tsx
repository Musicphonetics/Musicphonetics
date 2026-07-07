import { whatsappLink } from "@/lib/data";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.94 1.35-.5.05-1.13.07-1.82-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.27-.29.58-.36.78-.36l.56.01c.18.01.42-.07.66.5.24.58.82 2 .89 2.14.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.35 1.45.29.15.46.12.63-.07.17-.19.72-.85.91-1.14.19-.29.39-.24.66-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.12.07.7-.17 1.38Z" />
    </svg>
  );
}

// Inline primary CTA — opens WhatsApp in a new tab.
export function WhatsAppCTA({
  label, message, variant = "primary", size = "lg", className, fullWidth,
}: {
  label: string; message: string; variant?: "primary" | "outline"; size?: "md" | "lg";
  className?: string; fullWidth?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:scale-[0.98] motion-reduce:active:scale-100";
  const sizes = size === "lg" ? "px-7 py-4 text-base" : "px-5 py-2.5 text-sm";
  const variants =
    variant === "primary"
      ? "bg-gold text-ink shadow-card hover:bg-deep-gold hover:-translate-y-0.5"
      : "border border-white/25 text-paper hover:border-white";
  return (
    <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer"
      className={cn(base, sizes, variants, fullWidth && "w-full", className)}>
      <WhatsAppIcon />{label}
    </a>
  );
}

// Sticky bottom WhatsApp bar — always reachable on mobile.
export function StickyWhatsAppBar({ label = "Enquire on WhatsApp", message }: { label?: string; message: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 p-3 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
      <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer"
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gold text-base font-semibold text-ink">
        <WhatsAppIcon />{label}
      </a>
    </div>
  );
}
