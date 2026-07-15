"use client";

import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { whatsappLink } from "@/lib/data";

const FAQS: { q: string; a: string }[] = [
  { q: "How do I pay or renew fees?", a: "Open Fees in the menu, choose your plan and pay securely online. You'll get a receipt instantly." },
  { q: "Where do I see my child's progress?", a: "Home shows the current progress and this month's goal; Reports has published monthly reports; Classes shows every class update." },
  { q: "A class needs to be rescheduled — what do I do?", a: "Message us on WhatsApp. Cancelled or rescheduled classes are tracked, and a make-up is arranged where needed." },
  { q: "How do I get my login again?", a: "Use the same login id and password you set at activation. From the sign-in page you can reset your password any time." },
];

export default function ParentSupport() {
  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Support">
      <div className="space-y-4">
        <a href={whatsappLink("Hi Musicphonetics, I need some help.")} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-hairline bg-white p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#25D366] text-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .3-3.4-.7-2.9-1.2-4.7-4.2-4.9-4.4-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.1.3.7 1.1 1.4 1.8.9.8 1.7 1 2 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.5.3.1.3.1.7-.1 1.3Z" /></svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-ink">Chat with us on WhatsApp</span>
            <span className="block text-xs text-ink/70">We reply quickly, every day.</span>
          </span>
          <span className="shrink-0 text-sm font-semibold text-[#7A5E0F]">Chat →</span>
        </a>

        <div className="rounded-2xl border border-hairline bg-white p-5">
          <p className="mb-3 text-sm font-semibold text-ink">Common questions</p>
          <div className="divide-y divide-hairline">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-ink">
                  {f.q}
                  <span className="text-ink/40 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <Link href="/support" className="flex items-center justify-center gap-2 rounded-full border border-hairline bg-white py-3 text-sm font-semibold text-ink/80 hover:border-ink/40">
          Visit the full help centre
        </Link>
      </div>
    </PortalShell>
  );
}
