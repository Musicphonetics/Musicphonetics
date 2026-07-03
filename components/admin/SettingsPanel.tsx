"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BRAND, WHATSAPP_NUMBER, PACKAGES } from "@/lib/data";

export function SettingsPanel() {
  const rows = [
    { label: "Business name", value: BRAND.name },
    { label: "Region", value: BRAND.region },
    { label: "Founder / Director", value: BRAND.founder },
    { label: "WhatsApp number", value: WHATSAPP_NUMBER, hint: "lib/data.ts → WHATSAPP_NUMBER" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
        <h2 className="text-base font-semibold text-ink">Business details</h2>
        <dl className="mt-5 divide-y divide-hairline">
          {rows.map((r) => (
            <div key={r.label} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <dt className="text-sm text-ink/55">{r.label}</dt>
              <dd className="flex items-center gap-2 text-sm font-medium text-ink">
                {r.value}
                {r.hint && <Badge tone="muted">{r.hint}</Badge>}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
        <h2 className="text-base font-semibold text-ink">Packages & pricing</h2>
        <p className="mt-1 text-sm text-ink/55">
          Edit in <code className="rounded bg-mist px-1.5 py-0.5 text-xs">lib/data.ts → PACKAGES</code>
        </p>
        <ul className="mt-5 space-y-3">
          {PACKAGES.map((p) => (
            <li
              key={p.key}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-hairline px-4 py-3"
            >
              <span className="font-medium text-ink">
                {p.key} · {p.name}
              </span>
              <span className="text-sm text-ink/60">
                {p.priceFrom} {p.unit}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-card">
        <h2 className="text-base font-semibold text-ink">Integrations</h2>
        <div className="mt-4 space-y-3">
          {[
            { name: "Google Sheets / Apps Script (CRM data)", status: "Not connected" },
            { name: "WATI / Astra (WhatsApp automation)", status: "Documented" },
            { name: "Real authentication", status: "Demo only" },
            { name: "Invoice generation", status: "Not connected" },
          ].map((i) => (
            <div
              key={i.name}
              className="flex items-center justify-between rounded-xl border border-hairline px-4 py-3"
            >
              <span className="text-sm text-ink/75">{i.name}</span>
              <Badge tone="muted">{i.status}</Badge>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink/45">
          See README → &quot;TODO list for integrations&quot; for wiring steps.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
        <h2 className="text-base font-semibold text-ink">Security notice</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          This portal uses a demo password gate (client-side only). Replace it
          with real authentication before exposing real student or payment data.
        </p>
        <div className="mt-4">
          <Button href="/" variant="secondary">
            Back to website
          </Button>
        </div>
      </div>
    </div>
  );
}
